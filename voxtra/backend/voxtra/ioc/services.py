from typing import AsyncIterable
from dishka import Provider, Scope, provide
import httpx

from voxtra.services.infrastructure.stable_audio.api_client import StableAudioGenerator, TranslateService
from voxtra.services.infrastructure.stable_audio.config import StableAudioConfig
from voxtra.services.file_service.service import FileService
from voxtra.services.file_service.config import FileServiceConfig


class ServicesProvider(Provider):
    @provide(scope=Scope.REQUEST)
    async def get_https_session(self) -> AsyncIterable[httpx.AsyncClient]:
        async with httpx.AsyncClient(timeout=60) as session:
            yield session

    @provide(scope=Scope.APP)
    def stable_audio_config(self) -> StableAudioConfig:
        return StableAudioConfig()
    
    @provide(scope=Scope.APP)
    def translate_service(self) -> TranslateService:
        return TranslateService()
    
    @provide(scope=Scope.REQUEST)
    def audio_generator(
        self,
        config: StableAudioConfig,
        session: httpx.AsyncClient,
        translate_service: TranslateService
    ) -> StableAudioGenerator:
        return StableAudioGenerator(
            config=config,
            session=session,
            translate_service=translate_service
        )

    @provide(scope=Scope.APP)
    def file_service_config(self) -> FileServiceConfig:
        return FileServiceConfig()

    @provide(scope=Scope.REQUEST)
    def file_service(
        self,
        config: FileServiceConfig
    ) -> FileService:
        return FileService(
            config=config
        )