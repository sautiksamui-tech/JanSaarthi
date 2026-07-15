import uuid
from datetime import datetime
from . import db

class Journey(db.Model):
    __tablename__ = 'journeys'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    goal_text = db.Column(db.String(500), nullable=False)
    status = db.Column(db.String(50), nullable=False, default='PLANNING') # PLANNING, READY, IN_PROGRESS, COMPLETED
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    metadata_json = db.Column(db.JSON, nullable=True)

    # Relationships
    steps = db.relationship('JourneyStep', backref='journey', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'goal_text': self.goal_text,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'metadata': self.metadata_json or {},
            'steps': [step.to_dict() for step in sorted(self.steps, key=lambda s: s.sequence_order)]
        }


class JourneyStep(db.Model):
    __tablename__ = 'journey_steps'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    journey_id = db.Column(db.String(36), db.ForeignKey('journeys.id'), nullable=False)
    template_step_id = db.Column(db.String(100), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    department = db.Column(db.String(100), nullable=True)
    authority = db.Column(db.String(100), nullable=True)
    estimated_time = db.Column(db.Integer, default=1)
    status = db.Column(db.String(50), nullable=False, default='LOCKED') # LOCKED, PENDING, IN_PROGRESS, COMPLETED
    sequence_order = db.Column(db.Integer, nullable=False, default=0)
    
    # Required documents stored as JSON list
    documents = db.Column(db.JSON, nullable=True)
    
    # Metadata for custom forms / user data
    metadata_json = db.Column(db.JSON, nullable=True)

    def to_dict(self):
        # We need to know dependencies for rendering the graph on frontend
        # Get dependencies IDs that this step depends on
        dependencies = [dep.depends_on_step_id for dep in StepDependency.query.filter_by(step_id=self.id).all()]
        return {
            'id': self.id,
            'journey_id': self.journey_id,
            'template_step_id': self.template_step_id,
            'title': self.title,
            'description': self.description,
            'department': self.department,
            'authority': self.authority,
            'estimated_time': self.estimated_time,
            'status': self.status,
            'sequence_order': self.sequence_order,
            'documents': self.documents or [],
            'dependencies': dependencies,
            'metadata': self.metadata_json
        }


class StepDependency(db.Model):
    __tablename__ = 'step_dependencies'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # The step that is blocked
    step_id = db.Column(db.String(36), db.ForeignKey('journey_steps.id', ondelete='CASCADE'), nullable=False)
    
    # The step that blocks it (must be completed first)
    depends_on_step_id = db.Column(db.String(36), db.ForeignKey('journey_steps.id', ondelete='CASCADE'), nullable=False)
