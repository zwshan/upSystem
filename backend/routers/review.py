from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from database import get_db
from models import ReviewItem
from schemas import ReviewGradeRequest, ReviewItemRead
from services.review_scheduler import next_schedule

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


@router.get('/items', response_model=list[ReviewItemRead])
def get_review_items(due: str | None = None, db: Session = Depends(get_db)) -> list[ReviewItemRead]:
    items = db.execute(select(ReviewItem).order_by(ReviewItem.next_review_at.asc())).scalars().all()
    today = datetime.now(timezone.utc).date()

    def include(item: ReviewItem) -> bool:
        review_date = item.next_review_at.date()
        if due == 'today':
            return review_date == today
        if due == 'overdue':
            return review_date < today
        return True

    return [
        ReviewItemRead(
            id=item.id,
            type=item.type,
            reference_id=item.reference_id,
            next_review_at=item.next_review_at,
            review_count=item.review_count,
            ease_factor=item.ease_factor,
            last_reviewed_at=item.last_reviewed_at,
        )
        for item in items
        if include(item)
    ]


@router.post('/items/{item_id}/grade', response_model=ReviewItemRead)
def grade_review_item(item_id: int, payload: ReviewGradeRequest, db: Session = Depends(get_db)) -> ReviewItemRead:
    item = db.get(ReviewItem, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail='Review item not found')

    now = datetime.now(timezone.utc)
    days, new_ef, new_count = next_schedule(
        review_count=item.review_count,
        ease_factor=item.ease_factor,
        grade=payload.grade,
    )

    item.review_count = new_count
    item.ease_factor = new_ef
    item.last_reviewed_at = now
    item.next_review_at = now + timedelta(days=days)

    db.add(item)
    db.commit()
    db.refresh(item)

    return ReviewItemRead(
        id=item.id,
        type=item.type,
        reference_id=item.reference_id,
        next_review_at=item.next_review_at,
        review_count=item.review_count,
        ease_factor=item.ease_factor,
        last_reviewed_at=item.last_reviewed_at,
    )
