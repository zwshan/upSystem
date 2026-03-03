from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from database import get_db
from models import ReviewItem

router = APIRouter(prefix='/api/v1/review', tags=['review'])


@router.get('/summary')
def get_review_summary(db: Session = Depends(get_db)) -> dict[str, int]:
    items = db.execute(select(ReviewItem)).scalars().all()
    today = datetime.now(timezone.utc).date()

    due_today = 0
    overdue = 0
    for item in items:
        review_date = item.next_review_at.date()
        if review_date == today:
            due_today += 1
        elif review_date < today:
            overdue += 1

    return {'due_today': due_today, 'overdue': overdue}
