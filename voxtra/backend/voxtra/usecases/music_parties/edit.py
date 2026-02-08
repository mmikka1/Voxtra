from uuid import UUID
from voxtra.models.audio import GeneratedAudio, Genre, Mood, MusicPartyType, Tempo
from voxtra.models.exceptions import RecordNotFoundError
from voxtra.services.audio_generator import AudioGenerator
from voxtra.persistence.data_mappers.music_party_dm import MusicPartyDataMapper
from voxtra.services.file_service.service import FileService


class EditMusicParty:
    def __init__(
        self,
        music_party_data_mapper: MusicPartyDataMapper,
        file_service: FileService,
        audio_generator: AudioGenerator
    ) -> None:
        self.file_service = file_service
        self.audio_generator = audio_generator
        self.dm = music_party_data_mapper

    async def __call__(
        self,
        music_party_id: UUID,
        description: str,
        type: MusicPartyType,
        genre: Genre,
        mood: Mood,
        tempo: Tempo
    ) -> GeneratedAudio:
        party = await self.dm.get(music_party_id)

        if party is None:
            raise RecordNotFoundError("party not found")

        generated_audio = await self.audio_generator.generate(
            description=description,
            type=type,
            genre=genre,
            mood=mood,
            tempo=tempo,
        )

        party.audio_path = self.file_service.save(
            filename=f"{music_party_id}.mp3",
            content=generated_audio.content
        )

        party.genre = genre
        party.tempo = tempo
        party.type = type
        party.mood = mood
        party.description = description

        return await self.dm.edit(party)
