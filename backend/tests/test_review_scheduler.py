from services.review_scheduler import next_schedule


def test_grade_5_moves_forward() -> None:
    days, ef, count = next_schedule(review_count=2, ease_factor=2.5, grade=5)
    assert days >= 7
    assert ef > 2.5
    assert count > 2
