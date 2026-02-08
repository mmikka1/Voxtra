from abc import ABC, abstractmethod
from voxtra.models.audio import Genre, Mood, Tempo, MusicPartyType, GeneratedAudio


class AudioGenerator(ABC):
    @abstractmethod
    async def generate(
        self,
        description: str,
        type: MusicPartyType,
        genre: Genre,
        mood: Mood,
        tempo: Tempo,
    ) -> GeneratedAudio:
       pass
