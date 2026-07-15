import os
# Force pure-Python implementation of Protobuf to prevent Python 3.14 C-extension crash
os.environ["PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION"] = "python"

import logging
from flask import Flask, jsonify
from flask_cors import CORS
from werkzeug.exceptions import HTTPException
from sqlalchemy import create_engine

from config import Config
from models import db
from routes.api import api_bp

# Set up logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Check Database Connection and Fallback to SQLite if Postgres is unavailable
    db_url = app.config.get('SQLALCHEMY_DATABASE_URI', '')
    if db_url.startswith('postgresql'):
        try:
            logger.info("Attempting connection to PostgreSQL database...")
            # Use a quick connection check using pg8000 direct driver
            engine = create_engine(db_url, connect_args={'timeout': 3} if 'pg8000' in db_url else {})
            connection = engine.connect()
            connection.close()
            logger.info("PostgreSQL database connection verified.")
        except Exception as e:
            logger.warning(f"PostgreSQL connection failed ({e}). Falling back to local SQLite database.")
            app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///jansaarthi.db'
    
    # Initialize Database
    db.init_app(app)
    
    # Auto-create tables in context
    with app.app_context():
        try:
            db.create_all()
            logger.info("Database tables initialized.")
        except Exception as e:
            logger.error(f"Failed to create database tables: {e}")
    
    # Register Blueprints
    app.register_blueprint(api_bp, url_prefix='/api')
    
    # Register Error Handlers
    @app.errorhandler(HTTPException)
    def handle_http_exception(e):
        """Return JSON instead of HTML for HTTP errors."""
        response = e.get_response()
        response.data = jsonify({
            "code": e.code,
            "name": e.name,
            "description": e.description,
        }).data
        response.content_type = "application/json"
        return response

    @app.errorhandler(Exception)
    def handle_generic_exception(e):
        """Return JSON for unhandled server exceptions."""
        logger.exception("An unhandled exception occurred")
        return jsonify({
            "code": 500,
            "name": "Internal Server Error",
            "description": "An unexpected error occurred on the server."
        }), 500

    logger.info("JanSaarthi backend app created successfully.")
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
