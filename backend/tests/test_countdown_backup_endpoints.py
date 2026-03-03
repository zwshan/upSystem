from pathlib import Path

from fastapi.testclient import TestClient
from sqlalchemy import delete

from database import SessionLocal
from main import app
from models import ExamCountdown


def reset_countdowns() -> None:
    db = SessionLocal()
    try:
        db.execute(delete(ExamCountdown))
        db.commit()
    finally:
        db.close()


def test_countdown_list_and_create() -> None:
    reset_countdowns()
    client = TestClient(app)

    r = client.get('/api/v1/countdown')
    assert r.status_code == 200
    assert isinstance(r.json(), list)

    c = client.post(
        '/api/v1/countdown',
        json={'name': '2026 省直', 'target_date': '2026-09-26', 'is_active': True},
    )
    assert c.status_code == 201
    created = c.json()
    assert created['name'] == '2026 省直'
    assert created['is_active'] is True


def test_manual_backup_endpoint() -> None:
    client = TestClient(app)
    resp = client.post('/api/v1/backup/manual')
    assert resp.status_code == 200

    payload = resp.json()
    assert {'status', 'backup_path'}.issubset(payload.keys())
    assert payload['status'] == 'success'
    assert Path(payload['backup_path']).exists()
