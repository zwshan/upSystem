from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, status
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from database import get_db
from models import ExamCountdown
from schemas import CountdownCreate, CountdownRead

router = APIRouter(prefix='/api/v1/countdown', tags=['countdown'])


@router.get('/active')
def get_active_countdown(db: Session = Depends(get_db)) -> dict[str, int | str]:
    active = db.execute(
        select(ExamCountdown).where(ExamCountdown.is_active.is_(True)).order_by(ExamCountdown.id.desc())
    ).scalar_one_or_none()

    if not active:
        return {
            'id': 0,
            'name': '未配置倒计时',
            'target_date': '1970-01-01',
            'days_left': 0,
        }

    today = datetime.now(timezone.utc).date()
    days_left = (active.target_date - today).days
    return {
        'id': active.id,
        'name': active.name,
        'target_date': active.target_date.isoformat(),
        'days_left': days_left,
    }


@router.get('', response_model=list[CountdownRead])
def list_countdowns(db: Session = Depends(get_db)) -> list[CountdownRead]:
    items = db.execute(select(ExamCountdown).order_by(ExamCountdown.target_date.asc())).scalars().all()
    return [
        CountdownRead(
            id=item.id,
            name=item.name,
            target_date=item.target_date.isoformat(),
            is_active=item.is_active,
        )
        for item in items
    ]


@router.post('', status_code=status.HTTP_201_CREATED, response_model=CountdownRead)
def create_countdown(payload: CountdownCreate, db: Session = Depends(get_db)) -> CountdownRead:
    target_date = date.fromisoformat(payload.target_date)

    if payload.is_active:
        db.execute(update(ExamCountdown).values(is_active=False))

    item = ExamCountdown(name=payload.name, target_date=target_date, is_active=payload.is_active)
    db.add(item)
    db.commit()
    db.refresh(item)

    return CountdownRead(
        id=item.id,
        name=item.name,
        target_date=item.target_date.isoformat(),
        is_active=item.is_active,
    )
