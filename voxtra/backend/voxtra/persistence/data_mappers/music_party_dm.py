from uuid import UUID

from voxtra.persistence.models import MusicParty
from voxtra.persistence.data_mappers.base import BaseDataMapper
from voxtra.models.audio import Genre, Mood, MusicPartyType, Tempo


class MusicPartyDataMapper(BaseDataMapper):
    async def get(self, music_party_id: UUID) -> MusicParty | None:
        return await self._session.get(MusicParty, music_party_id)

    async def delete(self, party: MusicParty) -> None:
        await self._session.delete(party)
        await self._session.commit()

    async def edit(
        self, party: MusicParty
    ) -> MusicParty:
        await self._session.commit()
        await self._session.refresh(party)
        return party

    async def create(
        self,
        id: UUID,
        audio_path: str,
        project_id: UUID,
        type: MusicPartyType,
        description: str,
        genre: Genre,
        mood: Mood,
        tempo: Tempo
    ) -> MusicParty:
        party = MusicParty(
            id=id,
            description=description,
            project_id=project_id,
            audio_path=audio_path,
            type=type,
            genre=genre,
            mood=mood,
            tempo=tempo
        )

        self._session.add(party)
        await self._session.commit()
        return party
