from sqlalchemy import UUID

from voxtra.persistence.models import Project
from voxtra.persistence.data_mappers.project_dm import ProjectDataMapper
from voxtra.usecases.get_or_create_account import GetOrCreateAccount


class CreateProject:
    def __init__(
        self,
        get_or_create_account: GetOrCreateAccount,
        data_mapper: ProjectDataMapper
    ) -> None:
        self.get_or_create_account = get_or_create_account
        self.dm = data_mapper

    async def __call__(self, account_id: UUID) -> Project:
        account = await self.get_or_create_account(account_id)

        return await self.dm.create(
            account_id=account.id
        )

