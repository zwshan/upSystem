from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from database import get_db
from models import Answer

router = APIRouter(prefix='/api/v1/stats', tags=['stats'])


@router.get('/overview')
def get_stats_overview(db: Session = Depends(get_db)) -> dict[str, float | int]:
    practiced_questions = db.scalar(select(func.count(Answer.id))) or 0
    total_seconds = db.scalar(select(func.coalesce(func.sum(Answer.time_spent_seconds), 0))) or 0

    month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    monthly_count = db.scalar(
        select(func.count(Answer.id)).where(Answer.created_at >= month_start)
    ) or 0

    avg_self_score = db.scalar(
        select(func.avg(Answer.self_score)).where(Answer.self_score.is_not(None))
    )

    return {
        'practiced_questions': int(practiced_questions),
        'practiced_hours': round(float(total_seconds) / 3600, 2),
        'monthly_count': int(monthly_count),
        'avg_self_score': round(float(avg_self_score), 2) if avg_self_score is not None else 0,
    }


@router.get('/weekly-trend')
def get_weekly_trend(db: Session = Depends(get_db)) -> list[dict[str, int | str]]:
    now = datetime.utcnow()
    current_week_start = now - timedelta(days=now.weekday())
    current_week_start = current_week_start.replace(hour=0, minute=0, second=0, microsecond=0)

    week_starts = [current_week_start - timedelta(days=7 * i) for i in range(7, -1, -1)]
    week_counts: dict[datetime, int] = {week: 0 for week in week_starts}

    floor = week_starts[0]
    answers = db.execute(select(Answer.created_at).where(Answer.created_at >= floor)).all()

    for (created_at,) in answers:
        if created_at is None:
            continue
        week_start = created_at - timedelta(days=created_at.weekday())
        week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
        if week_start in week_counts:
            week_counts[week_start] += 1

    return [
        {
            'week': f"{week_start.isocalendar().year}-W{week_start.isocalendar().week:02d}",
            'value': week_counts[week_start],
        }
        for week_start in week_starts
    ]
