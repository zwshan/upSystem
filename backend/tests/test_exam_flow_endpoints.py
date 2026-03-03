from fastapi.testclient import TestClient
from sqlalchemy import delete

from database import SessionLocal
from main import app
from models import Answer, Exam, ExamSession, Question


def seed_exam_flow_data() -> int:
    db = SessionLocal()
    try:
        db.execute(delete(Answer))
        db.execute(delete(ExamSession))
        db.execute(delete(Question))
        db.execute(delete(Exam))

        exam = Exam(
            title='2025 四川省直遴选模拟卷',
            year=2025,
            source='四川省直',
            total_time_minutes=150,
            material_text='套卷材料全文',
        )
        db.add(exam)
        db.flush()

        db.add_all(
            [
                Question(
                    exam_id=exam.id,
                    category='案例分析',
                    sub_type='归纳概括',
                    prompt='概括核心问题并提出建议。',
                    word_limit=300,
                    score=20,
                    material_text='题目1材料',
                    order_num=1,
                ),
                Question(
                    exam_id=exam.id,
                    category='公文写作',
                    sub_type='讲话稿',
                    prompt='撰写工作推进会发言提纲。',
                    word_limit=800,
                    score=40,
                    material_text='题目2材料',
                    order_num=2,
                ),
            ]
        )
        db.commit()
        return exam.id
    finally:
        db.close()


def test_get_exams_and_detail() -> None:
    exam_id = seed_exam_flow_data()
    client = TestClient(app)

    list_resp = client.get('/api/v1/exams')
    assert list_resp.status_code == 200
    list_payload = list_resp.json()
    assert isinstance(list_payload, list)
    assert len(list_payload) >= 1

    detail_resp = client.get(f'/api/v1/exams/{exam_id}')
    assert detail_resp.status_code == 200
    detail = detail_resp.json()
    assert detail['id'] == exam_id
    assert isinstance(detail['questions'], list)
    assert len(detail['questions']) == 2


def test_create_exam_session_and_answer() -> None:
    exam_id = seed_exam_flow_data()
    client = TestClient(app)

    s = client.post('/api/v1/exam-sessions', json={'exam_id': exam_id})
    assert s.status_code == 201
    session_id = s.json()['id']

    exam_detail = client.get(f'/api/v1/exams/{exam_id}').json()
    question_id = exam_detail['questions'][0]['id']

    a = client.post(
        '/api/v1/answers',
        json={
            'question_id': question_id,
            'exam_session_id': session_id,
            'content': '我的答案',
            'time_spent_seconds': 120,
            'mode': 'simulation',
        },
    )
    assert a.status_code == 201
    assert a.json()['time_spent_seconds'] == 120
