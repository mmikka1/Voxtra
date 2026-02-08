from dataclasses import dataclass
from datetime import datetime, timedelta
from uuid import UUID

import pytz
from voxtra.persistence.data_mappers.project_dm import ProjectDataMapper
from voxtra.persistence.models import Project


@dataclass
class MyProjectsResponse:
    total_count: int
    last_week_count: int
    projects: list[Project]


class GetMyProjects:
    def __init__(self, data_mapper: ProjectDataMapper) -> None:
        self.dm = data_mapper

    async def __call__(self, account_id: UUID) -> MyProjectsResponse:
        projects = await self.dm.filter_with_parties(account_id=account_id)
        total_count = await self.dm.count(account_id=account_id)
        week_ago = datetime.now(pytz.timezone("Europe/Moscow")) - timedelta(days=7)
        last_week_count = await self.dm.count(account_id=account_id, created_at_gte=week_ago)

        return MyProjectsResponse(
            total_count=total_count,
            last_week_count=last_week_count,
            projects=projects
        )
