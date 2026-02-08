from typing import List
from uuid import UUID
from pydantic import BaseModel
from voxtra.web.schemas.music_party import MusicPartySchema


class ProjectSchema(BaseModel):
    id: UUID
    musicparties: List[MusicPartySchema]


class MyProjectsPageSchema(BaseModel):
    total_projects: int
    last_week_projects: int
    projects: list[ProjectSchema]