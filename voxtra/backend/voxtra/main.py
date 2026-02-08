from dishka.integrations import fastapi as fastapi_integration
from fastapi import FastAPI
from voxtra.web.routers.music_parties import router as music_parties_router
from voxtra.web.routers.project_router import router as project_router
from voxtra.web.routers.templates import router as template_router
from voxtra.web.exc_handler import init_exc_handlers
from voxtra.di import get_container
from fastapi.staticfiles import StaticFiles


app = FastAPI()

app.mount("/static", StaticFiles(directory="../public"), name="static")

app.include_router(router=music_parties_router)
app.include_router(router=project_router)
app.include_router(router=template_router)

init_exc_handlers(app)

container = get_container()
fastapi_integration.setup_dishka(container, app)
