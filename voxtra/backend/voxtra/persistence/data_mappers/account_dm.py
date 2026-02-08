from uuid import UUID
from voxtra.persistence.models import Account
from voxtra.persistence.data_mappers.base import BaseDataMapper


class AccountDataMapper(BaseDataMapper):
    async def create(self, id: UUID) -> Account:
        account = Account(id=id)

        self._session.add(account)
        await self._session.commit()
        return account

    async def get(self, id: UUID) -> Account | None:
        return await self._session.get(Account, id)