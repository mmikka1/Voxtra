from uuid import UUID
from voxtra.persistence.data_mappers.project_dm import ProjectDataMapper
from voxtra.models.exceptions import RecordNotFoundError, AccessDeniedError


class DeleteProject:
    def __init__(self, data_mapper: ProjectDataMapper) -> None:
        self.dm = data_mapper

    async def __call__(self, project_id: UUID, account_id: UUID) -> None:
        project = await self.dm.get(project_id)
        if project is None:
            raise RecordNotFoundError("project not found")
        
        if project.account_id != account_id:
            raise AccessDeniedError("can delete only your projects")

        await self.dm.delete(project)