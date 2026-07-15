import os
from dotenv import load_dotenv

# Load env variables from .env file
load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-jansaarthi')
    
    # Fetch database URL, default to pg8000 SQLite or Postgres
    db_url = os.environ.get('DATABASE_URL', 'postgresql+pg8000://user:password@localhost:5432/jansaarthi')
    # If it starts with postgresql://, replace it to use pg8000 for python 3.14 compatibility
    if db_url.startswith("postgresql://"):
        db_url = db_url.replace("postgresql://", "postgresql+pg8000://", 1)
        
    SQLALCHEMY_DATABASE_URI = db_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # GEMINI API Configuration (For later tasks)
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')
