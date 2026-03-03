from pathlib import Path

from fastapi.testclient import TestClient

from main import app


def test_dashboard_response_uses_snake_case() -> None:
    client = TestClient(app)
    resp = client.get('/api/v1/countdown/active')
    assert resp.status_code == 200

    payload = resp.json()
    assert 'target_date' in payload
    assert 'targetDate' not in payload


def test_api_contract_doc_exists_and_contains_mapping_notes() -> None:
    doc = Path(__file__).resolve().parents[1] / 'docs' / 'api-contracts.md'
    assert doc.exists()

    content = doc.read_text(encoding='utf-8')
    assert 'snake_case' in content
    assert 'camelCase' in content
