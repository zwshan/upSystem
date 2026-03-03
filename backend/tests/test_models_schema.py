from sqlalchemy import inspect

from database import Base, engine


def test_tables_created() -> None:
    Base.metadata.create_all(bind=engine)
    inspector = inspect(engine)
    names = set(inspector.get_table_names())
    assert {
        'exams',
        'questions',
        'answers',
        'exam_sessions',
        'review_items',
        'notes',
        'exam_countdowns',
    }.issubset(names)
