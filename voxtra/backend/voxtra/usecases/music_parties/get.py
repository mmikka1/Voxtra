from uuid import UUID
from voxtra.persistence.data_mappers.music_party_dm import MusicPartyDataMapper
from voxtra.models.exceptions import RecordNotFoundError
from voxtra.persistence.models import MusicParty


class GetMusicParty:
    def __init__(self, data_mapper: MusicPartyDataMapper) -> None:
        self.dm = data_mapper

    async def __call__(self, musicparty_id: UUID) -> MusicParty:
        mp = await self.dm.get(musicparty_id)
        if mp is None:
            raise RecordNotFoundError("music party not found")

        return mp
