from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Volunteer Co-Pilot AI"
    API_V1_STR: str = "/api"
    FRONTEND_URL: str = "http://localhost:5173"
    GEMINI_API_KEY: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
