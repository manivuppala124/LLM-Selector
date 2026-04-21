from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    MONGO_URI: str = "mongodb://localhost:27017"
    DB_NAME: str = "llm_selector"
    JWT_SECRET: str = "super-secret-jwt-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440
    AA_API_KEY: str = ""
    OPENROUTER_API_KEY: str = ""
    PROMPTLAB_MAX_MODELS_PER_RUN: int = 5
    PROMPTLAB_MAX_PROMPT_CHARS: int = 8000
    PROMPTLAB_MODEL_TIMEOUT_SEC: int = 45

    model_config = {"env_file": ".env"}


settings = Settings()
