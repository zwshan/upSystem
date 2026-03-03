from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, ConfigDict


class ApiError(BaseModel):
    code: str
    message: str
    details: Any = None


class UTCModel(BaseModel):
    model_config = ConfigDict(
        json_encoders={
            datetime: lambda value: value.astimezone(timezone.utc).isoformat().replace('+00:00', 'Z')
        }
    )


class QuestionCreate(BaseModel):
    exam_id: int | None = None
    category: str
    sub_type: str | None = None
    prompt: str
    word_limit: int
    score: int
    material_text: str | None = None
    order_num: int = 1


class QuestionUpdate(BaseModel):
    exam_id: int | None = None
    category: str | None = None
    sub_type: str | None = None
    prompt: str | None = None
    word_limit: int | None = None
    score: int | None = None
    material_text: str | None = None
    order_num: int | None = None


class QuestionRead(BaseModel):
    id: int
    exam_id: int | None
    year: int | None = None
    source: str | None = None
    category: str
    sub_type: str | None
    prompt: str
    word_limit: int
    score: int
    material_text: str | None
    order_num: int
