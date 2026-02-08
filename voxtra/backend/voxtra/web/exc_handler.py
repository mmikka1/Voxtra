from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from voxtra.models.exceptions import (
    AccessDeniedError,
    NoGenerateCredits,
    RecordNotFoundError,
)


async def access_denied_exc_handler(request: Request, exc: AccessDeniedError) -> JSONResponse:
    return JSONResponse(status_code=403, content={"error": str(exc)})


async def record_not_found_exc_handler(request: Request, exc: RecordNotFoundError) -> JSONResponse:
    return JSONResponse(status_code=404, content={"error": str(exc)})


async def no_generate_credits_exc_handler(request: Request, exc: NoGenerateCredits) -> JSONResponse:
    return JSONResponse(status_code=403, content={"error": str(exc)})


def init_exc_handlers(app: FastAPI) -> None:
    app.add_exception_handler(AccessDeniedError, access_denied_exc_handler)
    app.add_exception_handler(RecordNotFoundError, record_not_found_exc_handler)
    app.add_exception_handler(NoGenerateCredits, no_generate_credits_exc_handler)
