from fastapi.testclient import TestClient

from main import app


def test_404_uses_error_envelope() -> None:
    client = TestClient(app)
    resp = client.get('/api/v1/not-found')
    assert resp.status_code == 404
    body = resp.json()
    assert set(body.keys()) == {'code', 'message', 'details'}
