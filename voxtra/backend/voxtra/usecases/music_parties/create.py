from uuid import UUID
import uuid
from voxtra.models.audio import GeneratedAudio, Genre, Mood, MusicPartyType, Tempo
from voxtra.persistence.data_mappers.project_dm import ProjectDataMapper
from voxtra.models.exceptions import RecordNotFoundError
from voxtra.services.audio_generator import AudioGenerator
from voxtra.persistence.data_mappers.music_party_dm import MusicPartyDataMapper
from voxtra.services.file_service.service import FileService


class CreateMusicParty:
    def __init__(
        self,
        project_data_mapper: ProjectDataMapper,
        music_party_data_mapper: MusicPartyDataMapper,
        file_service: FileService,
        audio_generator: AudioGenerator
    ) -> None:
        self.file_service = file_service
        self.project_dm = project_data_mapper
        self.audio_generator = audio_generator
        self.dm = music_party_data_mapper

    async def __call__(
        self,
        description: str,
        project_id: UUID,
        type: MusicPartyType,
        genre: Genre,
        mood: Mood,
        tempo: Tempo
    ) -> GeneratedAudio:
        project = await self.project_dm.get(project_id)

        if project is None:
            raise RecordNotFoundError("project not found")

        generated_audio = await self.audio_generator.generate(
            description=description,
            type=type,
            genre=genre,
            mood=mood,
            tempo=tempo,
        )

        music_party_id = uuid.uuid4()

        audio_path = self.file_service.save(
            filename=f"{music_party_id}.mp3",
            content=generated_audio.content
        )

        return await self.dm.create(
            id=music_party_id,
            audio_path=audio_path,
            project_id=project_id,
            description=description,
            type=type,
            genre=genre,
            mood=mood,
            tempo=tempo
        )
