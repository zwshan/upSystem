from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from core.errors import (
    http_exception_handler,
    unhandled_exception_handler,
    validation_exception_handler,
)
from database import Base, engine
from routers import countdown, questions, review

app = FastAPI(title='upSystem Backend')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:5173', 'http://127.0.0.1:5173'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)

Base.metadata.create_all(bind=engine)

app.include_router(countdown.router)
app.include_router(review.router)
app.include_router(questions.router)


@app.get('/api/v1/health')
def health() -> dict[str, str]:
    return {'status': 'ok'}
