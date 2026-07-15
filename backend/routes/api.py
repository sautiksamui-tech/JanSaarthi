from flask import Blueprint, jsonify, request
from services.planner_service import PlannerService

api_bp = Blueprint('api', __name__)

@api_bp.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'service': 'JanSaarthi Backend API'
    }), 200

@api_bp.route('/journeys', methods=['POST'])
def create_journey():
    """Create a new journey from a citizen's goal and initialize the DAG."""
    data = request.get_json() or {}
    goal = data.get('goal')
    
    if not goal or not isinstance(goal, str) or not goal.strip():
        return jsonify({
            'code': 400,
            'name': 'Bad Request',
            'description': 'A non-empty "goal" string is required.'
        }), 400
        
    try:
        # Use PlannerService to instantiate the complete DAG workflow
        journey = PlannerService.plan_journey(goal.strip())
        
        # Return analysis of the newly planned journey
        analysis = PlannerService.get_journey_analysis(journey.id)
        return jsonify(analysis), 201
    except Exception as e:
        return jsonify({
            'code': 500,
            'name': 'Internal Server Error',
            'description': f'Failed to create journey: {str(e)}'
        }), 500

@api_bp.route('/journeys/<journey_id>', methods=['GET'])
def get_journey(journey_id):
    """Retrieve the details and current DAG state of a journey."""
    try:
        analysis = PlannerService.get_journey_analysis(journey_id)
        if not analysis:
            return jsonify({
                'code': 404,
                'name': 'Not Found',
                'description': f'Journey with ID {journey_id} not found.'
            }), 404
            
        return jsonify(analysis), 200
    except Exception as e:
        return jsonify({
            'code': 500,
            'name': 'Internal Server Error',
            'description': f'Failed to fetch journey: {str(e)}'
        }), 500

@api_bp.route('/journeys/<journey_id>/steps/<step_id>', methods=['PATCH'])
def update_step_status(journey_id, step_id):
    """Mark a step as completed and unlock dependent steps in the DAG."""
    data = request.get_json() or {}
    status = data.get('status')
    
    if status != 'COMPLETED':
        return jsonify({
            'code': 400,
            'name': 'Bad Request',
            'description': 'Only transitioning "status" to "COMPLETED" is supported.'
        }), 400
        
    try:
        # Complete step and trigger graph propagation
        PlannerService.complete_step(journey_id, step_id)
        
        # Return the updated journey state analysis
        analysis = PlannerService.get_journey_analysis(journey_id)
        return jsonify(analysis), 200
    except ValueError as ve:
        return jsonify({
            'code': 404,
            'name': 'Not Found',
            'description': str(ve)
        }), 404
    except Exception as e:
        return jsonify({
            'code': 500,
            'name': 'Internal Server Error',
            'description': f'Failed to update step status: {str(e)}'
        }), 500

@api_bp.route('/journeys/<journey_id>/chat', methods=['POST'])
def journey_chat(journey_id):
    """Answer a user compliance query about a specific step in the journey."""
    from models import Journey, JourneyStep
    data = request.get_json() or {}
    message = data.get('message')
    step_id = data.get('step_id')
    
    if not message or not isinstance(message, str) or not message.strip():
        return jsonify({
            'code': 400,
            'name': 'Bad Request',
            'description': 'A non-empty "message" string is required.'
        }), 400
        
    try:
        journey = Journey.query.get(journey_id)
        if not journey:
            return jsonify({
                'code': 404,
                'name': 'Not Found',
                'description': f'Journey with ID {journey_id} not found.'
            }), 404
            
        step_title = "General Compliance"
        step_description = "General business startup checklist."
        
        if step_id:
            step = JourneyStep.query.filter_by(journey_id=journey_id, id=step_id).first()
            if step:
                step_title = step.title
                step_description = step.description
                
        # Call LLMService to answer user query
        from services.llm_service import LLMService
        reply = LLMService.answer_question(
            goal_text=journey.goal_text,
            step_title=step_title,
            step_description=step_description,
            question=message.strip()
        )
        
        return jsonify({
            'reply': reply
        }), 200
    except Exception as e:
        return jsonify({
            'code': 500,
            'name': 'Internal Server Error',
            'description': f'Chat error: {str(e)}'
        }), 500
