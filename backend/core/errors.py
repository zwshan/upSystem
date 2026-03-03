from typing import Any

from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException


def error_payload(code: str, message: str, details: Any = None) -> dict[str, Any]:
    return {
        'code': code,
        'message': message,
        'details': details,
    }


async def http_exception_handler(_: Request, exc: StarletteHTTPException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content=error_payload(code=f'HTTP_{exc.status_code}', message=str(exc.detail), details=None),
    )


async def validation_exception_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content=error_payload(code='VALIDATION_ERROR', message='Request validation failed', details=exc.errors()),
    )


async def unhandled_exception_handler(_: Request, __: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content=error_payload(code='INTERNAL_ERROR', message='Internal server error', details=None),
    )
