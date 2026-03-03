INTERVALS = [1, 3, 7, 15, 30]
MIN_EASE_FACTOR = 1.3


def _interval_for_count(review_count: int, ease_factor: float) -> int:
    if review_count <= 0:
        return INTERVALS[0]
    if review_count <= len(INTERVALS):
        return INTERVALS[review_count - 1]

    extra_steps = review_count - len(INTERVALS)
    interval = float(INTERVALS[-1])
    for _ in range(extra_steps):
        interval *= ease_factor
    return max(1, int(round(interval)))


def next_schedule(review_count: int, ease_factor: float, grade: int) -> tuple[int, float, int]:
    grade = max(1, min(5, grade))

    if grade <= 2:
        new_count = 1
        new_ef = max(MIN_EASE_FACTOR, ease_factor - 0.2)
    elif grade == 3:
        new_count = max(1, review_count)
        new_ef = ease_factor
    else:
        new_count = max(1, review_count + 1)
        new_ef = ease_factor + (0.1 if grade == 4 else 0.15)

    days = _interval_for_count(new_count, new_ef)
    return days, round(new_ef, 2), new_count
