from pydantic import Field
from pydantic_settings import BaseSettings


class FileServiceConfig(BaseSettings):
    audio_path: str = Field(alias="AUDIO_PATH")

    class Config:
        env_file = ".env"
        extra = "allow"
