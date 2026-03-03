# Backend API Contracts (MVP)

## 1. Naming Convention

- Backend responses use `snake_case` field names.
- Frontend repository adapters map backend `snake_case` into UI-facing `camelCase`.

Example mappings:

- `target_date` -> `targetDate`
- `days_left` -> `daysLeft`
- `word_limit` -> `wordLimit`
- `total_time_minutes` -> `totalTimeMinutes`
- `time_spent_seconds` -> `timeSpentSeconds`

## 2. Nullability Rules

- Optional IDs (`exam_id`, `exam_session_id`) may be `null`.
- Optional text fields (`sub_type`, `material_text`, `reflection`) may be `null`.
- Optional score fields (`self_score`) may be `null`.

Frontend should not assume optional fields are non-empty strings.

## 3. Error Envelope

All handled API errors return:

```json
{
  "code": "HTTP_404",
  "message": "Not found",
  "details": null
}
```

## 4. Date/Time

- Date-only fields: `YYYY-MM-DD` (e.g. `target_date`).
- Datetime fields: ISO 8601 UTC (e.g. `2026-03-03T16:00:00Z`).

## 5. Pagination (Current MVP)

- Current endpoints return full lists.
- Next phase will standardize either:
  - `page` + `page_size`, or
  - cursor-based pagination.
