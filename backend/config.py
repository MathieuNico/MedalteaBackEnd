"""
RAG system configuration settings.
"""

import logging
import os
from typing import Optional

from dotenv import load_dotenv
from pydantic import Field, ValidationError
from pydantic_settings import BaseSettings

# Load .env file
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)


class RAGConfig(BaseSettings):
    """Configuration for RAG system."""

    # Optional fields for external services
    groq_api_key: Optional[str] = Field(None, description="Groq API key")
    connection_string_pgvector: Optional[str] = Field(None, description="PostgreSQL connection string")

    # Model settings
    chat_model: str = Field(default="openai/gpt-oss-120b", description="Groq chat model")
    embedding_model: str = Field(default="text-embedding-3-large", description="Embedding model")
    collection_name: str = Field(default="my_docs", description="Vector collection name")

    # Service URLs
    vector_db_api_url: str = Field(default="http://localhost:8001", description="Vector DB API URL")

    class Config:
        env_file = ".env"
        env_prefix = ""
        case_sensitive = False
        extra = "ignore"  # Ignore extra environment variables

    def __repr__(self):
        """String representation of config."""
        return f"RAGConfig(chat_model={self.chat_model}, embedding_model={self.embedding_model}, collection={self.collection_name})"


# Load configuration
try:
    config = RAGConfig()  # type: ignore[call-arg]
    if config.groq_api_key:
        os.environ["GROQ_API_KEY"] = config.groq_api_key
    else:
        logger.warning("GROQ_API_KEY not configured")

    if not config.connection_string_pgvector:
        logger.warning("PGVector connection not configured")

    logger.info(f"Configuration loaded: {config}")

except ValidationError as e:
    logger.error("Configuration validation error")
    for error in e.errors():
        logger.error(f"  - {error['loc'][0]}: {error['msg']}")
    config = RAGConfig.construct()
