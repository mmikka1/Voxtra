from uuid import UUID
from voxtra.persistence.data_mappers.music_party_dm import MusicPartyDataMapper
from voxtra.models.exceptions import RecordNotFoundError


class DeleteMusicParty:
    def __init__(self, data_mapper: MusicPartyDataMapper) -> None:
        self.dm = data_mapper

    async def __call__(self, party_id: UUID) -> None:
        party = await self.dm.get(party_id)
        if party is None:
            raise RecordNotFoundError("party not found")

        await self.dm.delete(party)
