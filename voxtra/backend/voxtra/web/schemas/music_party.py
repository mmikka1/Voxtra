from datetime import datetime
from uuid import UUID

from pydantic import BaseModel
from voxtra.models.audio import MusicPartyType, Genre, Mood, Tempo


class CreateMusicPartySchema(BaseModel):
    description: str
    project_id: UUID
    type: MusicPartyType
    genre: Genre
    mood: Mood
    tempo: Tempo


class EditMusicPartySchema(CreateMusicPartySchema):
    party_id: UUID


class MusicPartySchema(BaseModel):
    id: UUID
    audio_path: str
    description: str
    type: str
    genre: str
    mood: str
    tempo: str
    created_at: datetime
