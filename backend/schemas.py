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


class ExamQuestionRead(BaseModel):
    id: int
    category: str
    sub_type: str | None
    prompt: str
    word_limit: int
    score: int
    order_num: int


class ExamListItem(BaseModel):
    id: int
    title: str
    year: int
    source: str
    total_time_minutes: int
    question_count: int


class ExamDetail(BaseModel):
    id: int
    title: str
    year: int
    source: str
    total_time_minutes: int
    material_text: str
    questions: list[ExamQuestionRead]


class ExamSessionCreate(BaseModel):
    exam_id: int


class ExamSessionRead(BaseModel):
    id: int
    exam_id: int
    total_time_spent: int
    status: str


class AnswerCreate(BaseModel):
    question_id: int
    exam_session_id: int | None = None
    content: str
    time_spent_seconds: int
    mode: str
    self_score: float | None = None
    reflection: str | None = None


class AnswerRead(BaseModel):
    id: int
    question_id: int
    exam_session_id: int | None
    content: str
    time_spent_seconds: int
    mode: str
    self_score: float | None
    reflection: str | None


class ReviewItemRead(BaseModel):
    id: int
    type: str
    reference_id: int
    next_review_at: datetime
    review_count: int
    ease_factor: float
    last_reviewed_at: datetime | None


class ReviewGradeRequest(BaseModel):
    grade: int


class NoteCreate(BaseModel):
    title: str
    content: str
    tags: list[str] = []


class NoteUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    tags: list[str] | None = None


class NoteRead(BaseModel):
    id: int
    title: str
    content: str
    tags: list[str]
    created_at: datetime
    updated_at: datetime


class CountdownCreate(BaseModel):
    name: str
    target_date: str
    is_active: bool = False


class CountdownRead(BaseModel):
    id: int
    name: str
    target_date: str
    is_active: bool
