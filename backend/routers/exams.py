from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from database import get_db
from models import Exam, ExamSession, Question
from schemas import (
    ExamDetail,
    ExamListItem,
    ExamQuestionRead,
    ExamSessionCreate,
    ExamSessionRead,
)

router = APIRouter(tags=['exams'])


@router.get('/api/v1/exams', response_model=list[ExamListItem])
def get_exams(db: Session = Depends(get_db)) -> list[ExamListItem]:
    rows = db.execute(
        select(Exam, func.count(Question.id))
        .outerjoin(Question, Question.exam_id == Exam.id)
        .group_by(Exam.id)
        .order_by(Exam.year.desc(), Exam.id.desc())
    ).all()

    return [
        ExamListItem(
            id=exam.id,
            title=exam.title,
            year=exam.year,
            source=exam.source,
            total_time_minutes=exam.total_time_minutes,
            question_count=question_count,
        )
        for exam, question_count in rows
    ]


@router.get('/api/v1/exams/{exam_id}', response_model=ExamDetail)
def get_exam_detail(exam_id: int, db: Session = Depends(get_db)) -> ExamDetail:
    exam = db.get(Exam, exam_id)
    if exam is None:
        raise HTTPException(status_code=404, detail='Exam not found')

    questions = db.execute(
        select(Question)
        .where(Question.exam_id == exam_id)
        .order_by(Question.order_num.asc(), Question.id.asc())
    ).scalars().all()

    return ExamDetail(
        id=exam.id,
        title=exam.title,
        year=exam.year,
        source=exam.source,
        total_time_minutes=exam.total_time_minutes,
        material_text=exam.material_text,
        questions=[
            ExamQuestionRead(
                id=item.id,
                category=item.category,
                sub_type=item.sub_type,
                prompt=item.prompt,
                word_limit=item.word_limit,
                score=item.score,
                order_num=item.order_num,
            )
            for item in questions
        ],
    )


@router.post('/api/v1/exam-sessions', status_code=status.HTTP_201_CREATED, response_model=ExamSessionRead)
def create_exam_session(payload: ExamSessionCreate, db: Session = Depends(get_db)) -> ExamSessionRead:
    exam = db.get(Exam, payload.exam_id)
    if exam is None:
        raise HTTPException(status_code=404, detail='Exam not found')

    session = ExamSession(exam_id=payload.exam_id, total_time_spent=0, status='in_progress')
    db.add(session)
    db.commit()
    db.refresh(session)

    return ExamSessionRead(
        id=session.id,
        exam_id=session.exam_id,
        total_time_spent=session.total_time_spent,
        status=session.status,
    )
