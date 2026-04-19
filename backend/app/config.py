from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://user:pass@localhost/veda"
    redis_url: str = "redis://localhost:6379"
    anthropic_api_key: str = ""
    google_application_credentials: str = "./gcp-key.json"
    debug: bool = False

    class Config:
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    return Settings()
