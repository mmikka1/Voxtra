from datetime import datetime
import uuid

import pytz
from sqlalchemy import (
    TIMESTAMP,
    UUID,
    Boolean,
    Column,
    Date,
    Enum,
    ForeignKey,
    Integer,
    SmallInteger,
    String,
    Text,
)
from sqlalchemy.orm import relationship
from voxtra.models.audio import Genre, MusicPartyType, Tempo, Mood
from voxtra.persistence.db.database import Model
import enum


class Account(Model):
    __tablename__ = "accounts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)


class Project(Model):
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    account_id = Column(UUID(as_uuid=True), ForeignKey("accounts.id"))

    created_at = Column(TIMESTAMP(timezone=True), default=lambda: datetime.now(pytz.timezone("Europe/Moscow")))

    musicparties = relationship("MusicParty", back_populates="project", order_by="MusicParty.created_at.desc()")


class MusicParty(Model):
    __tablename__ = "musicparties"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"))
    project = relationship("Project", back_populates="musicparties")

    audio_path = Column(String, nullable=False)
    
    created_at = Column(TIMESTAMP(timezone=True), default=lambda: datetime.now(pytz.timezone("Europe/Moscow")))

    description = Column(String, nullable=False)

    type = Column(
        Enum(MusicPartyType, name="project_type_enum"),
        nullable=False
    )

    genre = Column(
        Enum(Genre, name="genre_enum"),
        nullable=True
    )
    
    mood = Column(
        Enum(Mood, name="mood_enum"), nullable=True
    )
    
    tempo = Column(
        Enum(Tempo, name="tempo_enum"), nullable=True
    )
