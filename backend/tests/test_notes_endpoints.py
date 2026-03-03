from fastapi.testclient import TestClient
from sqlalchemy import delete

from database import SessionLocal
from main import app
from models import Note


def reset_notes() -> None:
    db = SessionLocal()
    try:
        db.execute(delete(Note))
        db.commit()
    finally:
        db.close()


def test_notes_crud() -> None:
    reset_notes()
    client = TestClient(app)

    c = client.post('/api/v1/notes', json={'title': 't', 'content': 'c', 'tags': ['a']})
    assert c.status_code == 201
    note_id = c.json()['id']

    l = client.get('/api/v1/notes')
    assert l.status_code == 200
    assert isinstance(l.json(), list)
    assert any(item['id'] == note_id for item in l.json())

    u = client.put(f'/api/v1/notes/{note_id}', json={'title': 't2', 'content': 'c2', 'tags': ['b']})
    assert u.status_code == 200
    assert u.json()['title'] == 't2'

    d = client.delete(f'/api/v1/notes/{note_id}')
    assert d.status_code == 204
