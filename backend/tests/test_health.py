from fastapi.testclient import TestClient

from main import app


def test_health_check() -> None:
    client = TestClient(app)
    resp = client.get('/api/v1/health')
    assert resp.status_code == 200
    assert resp.json() == {'status': 'ok'}
