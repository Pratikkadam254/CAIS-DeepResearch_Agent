from pydantic_settings import BaseSettings
from typing import Optional
from loguru import logger
import sys

class Settings(BaseSettings):
    # API Keys
    FIRECRAWL_KEY: str
    OPENAI_KEY: str
    
    # Auth Settings
    SECRET_KEY: str
    API_TOKEN: str  # Token for API authentication
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Optional configs
    FIRECRAWL_BASE_URL: Optional[str] = None
    OPENAI_ENDPOINT: Optional[str] = "https://api.openai.com/v1"
    OPENAI_MODEL: Optional[str] = "o3-mini"
    
    # API Settings
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    
    # Research Parameters
    CONTEXT_SIZE: int = 128000

    class Config:
        env_file = ".env.local"

# Initialize settings
settings = Settings()

# Configure logging
logger.remove()
logger.add(
    sys.stdout,
    colorize=True,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
    level="INFO"
)
logger.add(
    "logs/api.log",
    rotation="500 MB",
    retention="10 days",
    level="INFO"
)