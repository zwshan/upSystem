from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient
from sqlalchemy import delete

from database import SessionLocal
from main import app
from models import ReviewItem


def seed_review_items() -> int:
    db = SessionLocal()
    try:
        db.execute(delete(ReviewItem))
        now = datetime.now(timezone.utc)
        due_today = ReviewItem(
            type='question',
            reference_id=1,
            next_review_at=now,
            review_count=1,
            ease_factor=2.5,
        )
        overdue = ReviewItem(
            type='note',
            reference_id=2,
            next_review_at=now - timedelta(days=1),
            review_count=2,
            ease_factor=2.5,
        )
        db.add_all([due_today, overdue])
        db.commit()
        db.refresh(overdue)
        return overdue.id
    finally:
        db.close()


def test_get_review_items_by_due() -> None:
    seed_review_items()
    client = TestClient(app)

    due_resp = client.get('/api/v1/review/items', params={'due': 'today'})
    assert due_resp.status_code == 200
    assert isinstance(due_resp.json(), list)

    overdue_resp = client.get('/api/v1/review/items', params={'due': 'overdue'})
    assert overdue_resp.status_code == 200
    assert isinstance(overdue_resp.json(), list)


def test_grade_review_item_updates_schedule() -> None:
    item_id = seed_review_items()
    client = TestClient(app)

    resp = client.post(f'/api/v1/review/items/{item_id}/grade', json={'grade': 5})
    assert resp.status_code == 200
    payload = resp.json()
    assert payload['id'] == item_id
    assert payload['review_count'] >= 3
