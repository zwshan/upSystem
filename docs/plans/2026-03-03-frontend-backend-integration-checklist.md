# Frontend-Backend Integration Checklist

## 1. Global

- [x] CORS allowlist includes frontend dev origins (`http://localhost:5173`, `http://127.0.0.1:5173`)
- [ ] Unified API prefix (`/api/v1` or current project standard)
- [x] Error envelope format agreed (`code`, `message`, `details`)
- [x] Date/time fields use ISO 8601 in UTC

## 2. Dashboard

- [x] `GET /countdown/active` returns `{ id, name, target_date, days_left }`
- [x] `GET /review/summary` returns `{ due_today, overdue }`

## 3. Questions

- [x] `GET /questions` supports filters: `year`, `source`, `category`, `sub_type`
- [x] `POST /questions` creates question with `word_limit`, `score`, `prompt`, `material_text`
- [x] `PUT /questions/{id}` updates question fields
- [x] `DELETE /questions/{id}` soft delete or hard delete behavior clarified

## 4. Exam Simulation / Targeted Practice

- [x] `GET /exams` returns papers with question summaries
- [x] `GET /exams/{id}` returns full material + ordered questions
- [x] `POST /exam-sessions` creates simulation session
- [x] `POST /answers` saves answer content, mode, and time spent

## 5. Review Center

- [x] `GET /review/items?due=today|overdue`
- [x] `POST /review/items/{id}/grade` accepts self-grade (1-5) and updates schedule

## 6. Notes

- [x] `GET /notes` list endpoint
- [x] `POST /notes` create endpoint
- [x] `PUT /notes/{id}` update endpoint
- [x] `DELETE /notes/{id}` delete endpoint

## 7. Statistics

- [x] `GET /stats/overview` returns totals used by cards
- [x] `GET /stats/weekly-trend` returns weekly points array

## 8. Settings / Backup

- [x] `GET /countdown` and `POST /countdown` for countdown management
- [x] `POST /backup/manual` triggers backup and returns status

## 9. Contract Mapping

- [x] Backend snake_case fields mapped to frontend camelCase in repository adapters
- [x] Nullability for optional fields documented and handled in UI
- [ ] Pagination strategy agreed (`page` + `page_size` or cursor)

## 10. Integration Validation Commands

```bash
cd frontend
npm run test:unit
npm run build
npm run test:e2e -- --project=chromium
```
