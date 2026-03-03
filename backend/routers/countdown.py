from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from database import get_db
from models import ExamCountdown

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
