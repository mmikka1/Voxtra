from uuid import UUID
from dishka import FromDishka
from dishka.integrations.fastapi import inject
from fastapi import APIRouter

from voxtra.usecases.projects.my import GetMyProjects, MyProjectsResponse
from voxtra.web.schemas.projects import MyProjectsPageSchema, ProjectSchema
from voxtra.usecases.projects.create import CreateProject
from voxtra.usecases.projects.delete import DeleteProject
from voxtra.web.routers.music_parties import party_to_schema


router = APIRouter(prefix="/projects", tags=["projects"])

@router.post("/", status_code=201)
@inject
async def create_project_habdler(
    usecase: FromDishka[CreateProject],
    account_id: UUID
):
    return await usecase(account_id)


@router.delete("/", status_code=204)
@inject
async def delete_project_handler(
    usecase: FromDishka[DeleteProject],
    account_id: UUID,
    project_id: UUID
):
    return await usecase(account_id=account_id, project_id=project_id)


def my_projects_to_schema(data: MyProjectsResponse) -> MyProjectsPageSchema:
    return MyProjectsPageSchema(
        total_projects=data.total_count,
        last_week_projects=data.last_week_count,
        projects=[
            ProjectSchema(
                id=project.id,
                musicparties=[
                    party_to_schema(party) for party in project.musicparties
                ]
            ) for project in data.projects
        ]
    )


@router.get("/my", status_code=200, response_model=MyProjectsPageSchema)
@inject
async def my_projects_handler(
    usecase: FromDishka[GetMyProjects],
    account_id: UUID
) -> MyProjectsPageSchema:
    return my_projects_to_schema(await usecase(account_id))
