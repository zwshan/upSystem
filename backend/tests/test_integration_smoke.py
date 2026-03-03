from fastapi.testclient import TestClient

from main import app


def test_backend_smoke_flow() -> None:
    client = TestClient(app)
    assert client.get('/api/v1/health').status_code == 200
    assert client.get('/api/v1/questions').status_code == 200
    assert client.get('/api/v1/stats/overview').status_code == 200
