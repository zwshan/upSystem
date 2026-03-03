from fastapi.testclient import TestClient
from sqlalchemy import delete

from database import SessionLocal
from main import app
from models import Exam, Question


def seed_questions() -> None:
    db = SessionLocal()
    try:
        db.execute(delete(Question))
        db.execute(delete(Exam))
        exam_a = Exam(
            title='2025 省直卷',
            year=2025,
            source='四川省直',
            total_time_minutes=150,
            material_text='材料',
        )
        exam_b = Exam(
            title='2024 市属卷',
            year=2024,
            source='成都市属',
            total_time_minutes=150,
            material_text='材料',
        )
        db.add_all([exam_a, exam_b])
        db.flush()
        db.add_all(
            [
                Question(
                    exam_id=exam_a.id,
                    category='案例分析',
                    sub_type='归纳概括',
                    prompt='题目 A',
                    word_limit=300,
                    score=20,
                    material_text='材料 A',
                    order_num=1,
                ),
                Question(
                    exam_id=exam_b.id,
                    category='公文写作',
                    sub_type='讲话稿',
                    prompt='题目 B',
                    word_limit=800,
                    score=40,
                    material_text='材料 B',
                    order_num=1,
                ),
            ]
        )
        db.commit()
    finally:
        db.close()


def test_questions_support_filters() -> None:
    seed_questions()
    client = TestClient(app)

    resp = client.get('/api/v1/questions', params={'category': '案例分析', 'year': 2025})
    assert resp.status_code == 200
    payload = resp.json()
    assert isinstance(payload, list)
    assert len(payload) == 1
    assert payload[0]['category'] == '案例分析'


def test_create_question_contract() -> None:
    client = TestClient(app)
    payload = {
        'category': '案例分析',
        'sub_type': '归纳概括',
        'prompt': '概括做法',
        'word_limit': 300,
        'score': 20,
        'material_text': '材料',
    }
    resp = client.post('/api/v1/questions', json=payload)
    assert resp.status_code == 201
    assert resp.json()['word_limit'] == 300
