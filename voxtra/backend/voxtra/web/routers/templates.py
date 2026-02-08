from fastapi import APIRouter
from fastapi.responses import FileResponse


router = APIRouter(prefix="", tags=["templates"])

@router.get("/")
async def index():
    return FileResponse("../public/index.html")
