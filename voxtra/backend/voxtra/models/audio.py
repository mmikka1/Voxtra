from dataclasses import dataclass
import enum
from typing import Dict
from enum import StrEnum


class AudioFormatEnum(StrEnum):
    mp3 = "mp3"
    wav = "wav"


@dataclass
class GeneratedAudio:
    content: bytes
    format: AudioFormatEnum
    duration: int


class MusicPartyType(enum.Enum):
    DRUMS = "drums"
    VOCALS = "vocal"
    GUITAR = "guitar"
    BASS = "bass"
    KEYS = "keyboard part"
    STRINGS = "strings"

    @property
    def ru(self) -> str:
        return {
            MusicPartyType.DRUMS: "ударные",
            MusicPartyType.VOCALS: "вокал",
            MusicPartyType.GUITAR: "гитара",
            MusicPartyType.BASS: "бас",
            MusicPartyType.KEYS: "клавишные",
            MusicPartyType.STRINGS: "струнные",
        }[self]


class Genre(enum.Enum):
    ROCK = "rock"
    POP = "pop"
    JAZZ = "jazz"
    ELECTRONIC = "electronic"
    HIPHOP = "hiphop"
    CLASSICAL = "classical"

    @property
    def ru(self) -> str:
        return {
            Genre.ROCK: "рок",
            Genre.POP: "поп",
            Genre.JAZZ: "джаз",
            Genre.ELECTRONIC: "электронная музыка",
            Genre.HIPHOP: "хип-хоп",
            Genre.CLASSICAL: "классическая музыка",
        }[self]
    

class Mood(enum.Enum):
    HAPPY = "happy"
    ENERGETIC = "energetic"
    CALM = "calm"
    SAD = "sad"
    EPIC = "epic"

    @property
    def ru(self) -> str:
        return {
            Mood.HAPPY: "весёлое",
            Mood.ENERGETIC: "энергичное",
            Mood.CALM: "спокойное",
            Mood.SAD: "грустное",
            Mood.EPIC: "эпическое",
        }[self]


class Tempo(enum.Enum):
    SLOW = "slow"
    MEDIUM = "medium"
    FAST = "fast"
    VERY_FAST = "very-fast"

    @property
    def ru(self) -> str:
        return {
            Tempo.SLOW: "медленный",
            Tempo.MEDIUM: "средний",
            Tempo.FAST: "быстрый",
            Tempo.VERY_FAST: "очень быстрый",
        }[self]

    @property
    def bpm(self) -> str:
        return {
            Tempo.SLOW: "60-90 BPM",
            Tempo.MEDIUM: "90-120 BPM",
            Tempo.FAST: "120-150 BPM",
            Tempo.VERY_FAST: "150+ BPM",
        }[self]