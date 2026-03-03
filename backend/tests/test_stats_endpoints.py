from datetime import datetime, timedelta

from fastapi.testclient import TestClient
from sqlalchemy import delete

from database import SessionLocal
from main import app
from models import Answer, Exam, Question


def seed_stats_data() -> None:
    db = SessionLocal()
    try:
        db.execute(delete(Answer))
        db.execute(delete(Question))
        db.execute(delete(Exam))

        exam = Exam(
            title='统计测试卷',
            year=2026,
            source='四川省直',
            total_time_minutes=150,
            material_text='材料',
        )
        db.add(exam)
        db.flush()

        question = Question(
            exam_id=exam.id,
            category='案例分析',
            sub_type='归纳概括',
            prompt='测试题',
            word_limit=300,
            score=20,
            material_text='题目材料',
            order_num=1,
        )
        db.add(question)
        db.flush()

        now = datetime.utcnow()
        db.add_all(
            [
                Answer(
                    question_id=question.id,
                    content='答案1',
                    time_spent_seconds=3600,
                    mode='simulation',
                    self_score=80,
                    created_at=now,
                ),
                Answer(
                    question_id=question.id,
                    content='答案2',
                    time_spent_seconds=1800,
                    mode='targeted',
                    self_score=70,
                    created_at=now - timedelta(days=7),
                ),
            ]
        )
        db.commit()
    finally:
        db.close()


def test_stats_contracts() -> None:
    seed_stats_data()
    client = TestClient(app)

    o = client.get('/api/v1/stats/overview')
    assert o.status_code == 200
    assert {
        'practiced_questions',
        'practiced_hours',
        'monthly_count',
        'avg_self_score',
    }.issubset(o.json().keys())

    t = client.get('/api/v1/stats/weekly-trend')
    assert t.status_code == 200
    payload = t.json()
    assert isinstance(payload, list)
    assert all({'week', 'value'}.issubset(item.keys()) for item in payload)
