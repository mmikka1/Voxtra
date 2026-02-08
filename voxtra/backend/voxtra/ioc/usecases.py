from dishka import Provider, Scope, provide

from voxtra.persistence.data_mappers.project_dm import ProjectDataMapper
from voxtra.usecases.projects.create import CreateProject
from voxtra.persistence.data_mappers.account_dm import AccountDataMapper
from voxtra.usecases.get_or_create_account import GetOrCreateAccount
from voxtra.usecases.projects.delete import DeleteProject
from voxtra.usecases.projects.my import GetMyProjects
from voxtra.usecases.music_parties.create import CreateMusicParty
from voxtra.usecases.music_parties.delete import DeleteMusicParty
from voxtra.usecases.music_parties.edit import EditMusicParty
from voxtra.usecases.music_parties.get import GetMusicParty
from voxtra.persistence.data_mappers.music_party_dm import MusicPartyDataMapper
from voxtra.services.file_service.service import FileService
from voxtra.services.infrastructure.stable_audio.api_client import StableAudioGenerator


class UsecasesProvider(Provider):
    @provide(scope=Scope.REQUEST)
    def get_or_create_account(self, account_data_mapper: AccountDataMapper) -> GetOrCreateAccount:
        return GetOrCreateAccount(
            data_mapper=account_data_mapper
        )
    
    @provide(scope=Scope.REQUEST)
    def create_project(
        self,
        get_or_create_account: GetOrCreateAccount,
        project_data_mapper: ProjectDataMapper
    ) -> CreateProject:
        return CreateProject(
            get_or_create_account=get_or_create_account,
            data_mapper=project_data_mapper
        )
    
    @provide(scope=Scope.REQUEST)
    def delete_project(
        self,
        data_mapper: ProjectDataMapper
    ) -> DeleteProject:
        return DeleteProject(
            data_mapper=data_mapper
        )
    
    @provide(scope=Scope.REQUEST)
    def get_my_projects(
        self,
        data_mapper: ProjectDataMapper
    ) -> GetMyProjects:
        return GetMyProjects(
            data_mapper=data_mapper
        )
    
    @provide(scope=Scope.REQUEST)
    def create_music_party(
        self,
        project_data_mapper: ProjectDataMapper,
        music_party_data_mapper: MusicPartyDataMapper,
        file_service: FileService,
        audio_generator: StableAudioGenerator
    ) -> CreateMusicParty:
        return CreateMusicParty(
            project_data_mapper=project_data_mapper,
            music_party_data_mapper=music_party_data_mapper,
            file_service=file_service,
            audio_generator=audio_generator
        )
    
    @provide(scope=Scope.REQUEST)
    def delete_music_party(
        self,
        data_mapper: MusicPartyDataMapper
    ) -> DeleteMusicParty:
        return DeleteMusicParty(
            data_mapper=data_mapper
        )
    
    @provide(scope=Scope.REQUEST)
    def edit_music_party(
        self,
        music_party_data_mapper: MusicPartyDataMapper,
        file_service: FileService,
        audio_generator: StableAudioGenerator
    ) -> EditMusicParty:
        return EditMusicParty(
            music_party_data_mapper=music_party_data_mapper,
            file_service=file_service,
            audio_generator=audio_generator
        )
    
    @provide(scope=Scope.REQUEST)
    def get_music_party(
        self,
        data_mapper: MusicPartyDataMapper
    ) -> GetMusicParty:
        return GetMusicParty(
            data_mapper=data_mapper
        )
