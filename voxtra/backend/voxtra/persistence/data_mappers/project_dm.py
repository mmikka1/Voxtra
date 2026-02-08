from datetime import datetime
from typing import Optional
from uuid import UUID

from sqlalchemy import and_, func, select
from voxtra.persistence.models import Project
from voxtra.persistence.data_mappers.base import BaseDataMapper
from sqlalchemy.orm import joinedload


class ProjectDataMapper(BaseDataMapper):
    async def get(self, id: UUID) -> Project | None:
        print(id)
        return await self._session.get(Project, id)
    
    async def delete(self, project: Project) -> None:
        await self._session.delete(project)
        await self._session.commit()

    async def create(
        self,
        account_id: UUID,
    ) -> Project:
        project = Project(
            account_id=account_id,
        )

        self._session.add(project)
        await self._session.commit()
        return project

    async def filter_with_parties(self, account_id: UUID) -> list[Project]:
        results = await self._session.execute(
            select(Project)
            .join(Project.musicparties)
            .options(joinedload(Project.musicparties))
            .where(Project.account_id == account_id)
            .order_by(Project.created_at.desc())
            .distinct()
        )
        return results.scalars().unique().all()

    async def count(self, account_id: UUID, created_at_gte: Optional[datetime] = None) -> int:
        query = and_(Project.account_id==account_id)
        if created_at_gte is not None:
            query &= and_(Project.created_at > created_at_gte)

        result = await self._session.execute(select(func.count(Project.id)).join(Project.musicparties).where(query))
        return result.scalar()