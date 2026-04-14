from pymongo import MongoClient, ASCENDING
from app.core.config import settings

client = MongoClient(settings.MONGO_URI)
db = client[settings.DB_NAME]

users_col = db["users"]
models_col = db["models"]
history_col = db["history"]


def ensure_indexes():
    """Call once on app startup when MongoDB is confirmed reachable."""
    users_col.create_index([("email", ASCENDING)], unique=True)
    models_col.create_index([("id", ASCENDING)], unique=True)
    history_col.create_index([("user_email", ASCENDING)])
