from fastapi.testclient import TestClient

from main import app


def test_get_active_countdown_contract() -> None:
    client = TestClient(app)
    resp = client.get('/api/v1/countdown/active')
    assert resp.status_code == 200
    data = resp.json()
    assert {'id', 'name', 'target_date', 'days_left'}.issubset(data.keys())


def test_get_review_summary_contract() -> None:
    client = TestClient(app)
    resp = client.get('/api/v1/review/summary')
    assert resp.status_code == 200
    assert set(resp.json().keys()) == {'due_today', 'overdue'}
