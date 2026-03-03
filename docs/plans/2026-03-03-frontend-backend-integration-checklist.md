# Frontend-Backend Integration Checklist

## 1. Global

- [ ] CORS allowlist includes frontend dev origins (`http://localhost:5173`, `http://127.0.0.1:5173`)
- [ ] Unified API prefix (`/api/v1` or current project standard)
- [ ] Error envelope format agreed (`code`, `message`, `details`)
- [ ] Date/time fields use ISO 8601 in UTC

## 2. Dashboard

- [ ] `GET /countdown/active` returns `{ id, name, target_date, days_left }`
- [ ] `GET /review/summary` returns `{ due_today, overdue }`

## 3. Questions

- [ ] `GET /questions` supports filters: `year`, `source`, `category`, `sub_type`
- [ ] `POST /questions` creates question with `word_limit`, `score`, `prompt`, `material_text`
- [ ] `PUT /questions/{id}` updates question fields
- [ ] `DELETE /questions/{id}` soft delete or hard delete behavior clarified

## 4. Exam Simulation / Targeted Practice

- [ ] `GET /exams` returns papers with question summaries
- [ ] `GET /exams/{id}` returns full material + ordered questions
- [ ] `POST /exam-sessions` creates simulation session
- [ ] `POST /answers` saves answer content, mode, and time spent

## 5. Review Center

- [ ] `GET /review/items?due=today|overdue`
- [ ] `POST /review/items/{id}/grade` accepts self-grade (1-5) and updates schedule

## 6. Notes

- [ ] `GET /notes` list endpoint
- [ ] `POST /notes` create endpoint
- [ ] `PUT /notes/{id}` update endpoint
- [ ] `DELETE /notes/{id}` delete endpoint

## 7. Statistics

- [ ] `GET /stats/overview` returns totals used by cards
- [ ] `GET /stats/weekly-trend` returns weekly points array

## 8. Settings / Backup

- [ ] `GET /countdown` and `POST /countdown` for countdown management
- [ ] `POST /backup/manual` triggers backup and returns status

## 9. Contract Mapping

- [ ] Backend snake_case fields mapped to frontend camelCase in repository adapters
- [ ] Nullability for optional fields documented and handled in UI
- [ ] Pagination strategy agreed (`page` + `page_size` or cursor)

## 10. Integration Validation Commands

```bash
cd frontend
npm run test:unit
npm run build
npm run test:e2e -- --project=chromium
```
