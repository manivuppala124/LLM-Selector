from pymongo import MongoClient, ASCENDING
from app.core.config import settings

client = MongoClient(settings.MONGO_URI)
db = client[settings.DB_NAME]

users_col = db["users"]
models_col = db["models"]
history_col = db["history"]
prompt_tests_col = db["prompt_tests"]


def ensure_indexes():
    """Call once on app startup when MongoDB is confirmed reachable."""
    users_col.create_index([("email", ASCENDING)], unique=True)
    models_col.create_index([("id", ASCENDING)], unique=True)
    models_col.create_index([("provider", ASCENDING)])
    models_col.create_index([("blended_price", ASCENDING)])
    models_col.create_index([("context_length", ASCENDING)])
    models_col.create_index([("supports_function_calling", ASCENDING)])
    models_col.create_index([("supports_json_mode", ASCENDING)])
    models_col.create_index([("is_multimodal", ASCENDING)])
    models_col.create_index([("is_open_source", ASCENDING)])
    models_col.create_index([("supports_fine_tuning", ASCENDING)])
    models_col.create_index([("reliability_score", ASCENDING)])
    models_col.create_index([("last_updated", ASCENDING)])
    history_col.create_index([("user_email", ASCENDING)])
    prompt_tests_col.create_index([("user_email", ASCENDING)])
    prompt_tests_col.create_index([("session_id", ASCENDING)], unique=True)
    prompt_tests_col.create_index([("created_at", ASCENDING)])
