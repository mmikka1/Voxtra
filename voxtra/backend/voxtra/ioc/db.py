from collections.abc import AsyncIterable

from dishka import Provider, Scope, provide
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from voxtra.persistence.data_mappers.project_dm import ProjectDataMapper
from voxtra.persistence.data_mappers.account_dm import AccountDataMapper
from voxtra.persistence.db.db_config import DbConfig
from voxtra.persistence.data_mappers.music_party_dm import MusicPartyDataMapper


class DbProvider(Provider):
    @provide(scope=Scope.APP)
    def get_db_config(self) -> DbConfig:
        return DbConfig()

    @provide(scope=Scope.APP)
    def get_engine(self, db_config: DbConfig) -> AsyncEngine:
        return create_async_engine(db_config.DATABASE_URL, pool_size=15, max_overflow=50, pool_timeout=30)

    @provide(scope=Scope.APP)
    async def get_session_maker(self, engine: AsyncEngine) -> async_sessionmaker:
        return async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

    @provide(scope=Scope.REQUEST)
    async def get_session(self, session_maker: async_sessionmaker[AsyncSession]) -> AsyncIterable[AsyncSession]:
        async with session_maker() as session:
            yield session

    @provide(scope=Scope.REQUEST)
    async def project_data_mapper(self, session: AsyncSession) -> ProjectDataMapper:
        return ProjectDataMapper(session=session)

    @provide(scope=Scope.REQUEST)
    async def account_data_mapper(self, session: AsyncSession) -> AccountDataMapper:
        return AccountDataMapper(session=session)
    
    @provide(scope=Scope.REQUEST)
    async def music_party_data_mapper(self, session: AsyncSession) -> MusicPartyDataMapper:
        return MusicPartyDataMapper(session=session)
