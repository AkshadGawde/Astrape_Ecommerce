import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
    MONGO_URI = os.environ.get("MONGO_URI")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY")