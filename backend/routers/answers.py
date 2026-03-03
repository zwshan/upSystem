from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import Answer, Question
from schemas import AnswerCreate, AnswerRead

router = APIRouter(prefix='/api/v1/answers', tags=['answers'])


@router.post('', status_code=status.HTTP_201_CREATED, response_model=AnswerRead)
def create_answer(payload: AnswerCreate, db: Session = Depends(get_db)) -> AnswerRead:
    question = db.get(Question, payload.question_id)
    if question is None:
        raise HTTPException(status_code=404, detail='Question not found')

    answer = Answer(**payload.model_dump())
    db.add(answer)
    db.commit()
    db.refresh(answer)

    return AnswerRead(
        id=answer.id,
        question_id=answer.question_id,
        exam_session_id=answer.exam_session_id,
        content=answer.content,
        time_spent_seconds=answer.time_spent_seconds,
        mode=answer.mode,
        self_score=answer.self_score,
        reflection=answer.reflection,
    )
