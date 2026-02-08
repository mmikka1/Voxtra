from uuid import UUID
from voxtra.persistence.data_mappers.account_dm import AccountDataMapper
from voxtra.persistence.models import Account


class GetOrCreateAccount:
    def __init__(self, data_mapper: AccountDataMapper) -> None:
        self.dm = data_mapper

    async def __call__(self, id: UUID) -> Account:
        account = await self.dm.get(id)
        if account is None:
            return await self.dm.create(id)

        return account