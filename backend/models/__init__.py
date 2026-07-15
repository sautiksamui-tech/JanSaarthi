from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Import models here to register them with the SQLAlchemy metadata
from .journey import Journey, JourneyStep, StepDependency
