from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from database import get_db
from models import Exam, Question
from schemas import QuestionCreate, QuestionRead, QuestionUpdate

router = APIRouter(prefix='/api/v1/questions', tags=['questions'])


def to_question_read(question: Question, exam: Exam | None) -> QuestionRead:
    return QuestionRead(
        id=question.id,
        exam_id=question.exam_id,
        year=exam.year if exam else None,
        source=exam.source if exam else None,
        category=question.category,
        sub_type=question.sub_type,
        prompt=question.prompt,
        word_limit=question.word_limit,
        score=question.score,
        material_text=question.material_text,
        order_num=question.order_num,
    )


@router.get('', response_model=list[QuestionRead])
def get_questions(
    year: int | None = None,
    source: str | None = None,
    category: str | None = None,
    sub_type: str | None = None,
    db: Session = Depends(get_db),
) -> list[QuestionRead]:
    stmt = select(Question, Exam).outerjoin(Exam, Question.exam_id == Exam.id)

    if year is not None:
        stmt = stmt.where(Exam.year == year)
    if source is not None:
        stmt = stmt.where(Exam.source == source)
    if category is not None:
        stmt = stmt.where(Question.category == category)
    if sub_type is not None:
        stmt = stmt.where(Question.sub_type == sub_type)

    rows = db.execute(stmt.order_by(Question.id.asc())).all()
    return [to_question_read(question, exam) for question, exam in rows]


@router.post('', status_code=status.HTTP_201_CREATED, response_model=QuestionRead)
def create_question(payload: QuestionCreate, db: Session = Depends(get_db)) -> QuestionRead:
    question = Question(**payload.model_dump())
    db.add(question)
    db.commit()
    db.refresh(question)

    exam = None
    if question.exam_id is not None:
        exam = db.get(Exam, question.exam_id)

    return to_question_read(question, exam)


@router.put('/{question_id}', response_model=QuestionRead)
def update_question(question_id: int, payload: QuestionUpdate, db: Session = Depends(get_db)) -> QuestionRead:
    question = db.get(Question, question_id)
    if question is None:
        raise HTTPException(status_code=404, detail='Question not found')

    updates = payload.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(question, key, value)

    db.add(question)
    db.commit()
    db.refresh(question)

    exam = None
    if question.exam_id is not None:
        exam = db.get(Exam, question.exam_id)

    return to_question_read(question, exam)


@router.delete('/{question_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_question(question_id: int, db: Session = Depends(get_db)) -> Response:
    question = db.get(Question, question_id)
    if question is None:
        raise HTTPException(status_code=404, detail='Question not found')

    db.delete(question)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
