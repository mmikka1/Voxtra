from pydantic import Field
from pydantic_settings import BaseSettings


class StableAudioConfig(BaseSettings):
    api_url: str = Field(alias="STABLE_AUDIO_API_URL")
    api_key: str = Field(alias="STABLE_AUDIO_API_KEY")
    model: str = Field(alias="STABLE_AUDIO_MODEL")

    class Config:
        extra = "allow"
        env_file = ".env"
