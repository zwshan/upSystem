# upSystem Backend

## 1. Environment (Conda)

From project root (`upSystem/.worktrees/feature-backend-mvp` in this branch):

```bash
conda env create -p ./.conda/upsystem -f environment.yml
```

Run backend commands with:

```bash
cd backend
conda run -p ../.conda/upsystem <command>
```

## 2. Run API

```bash
cd backend
conda run -p ../.conda/upsystem uvicorn main:app --reload --port 8000
```

OpenAPI:

- http://127.0.0.1:8000/docs

## 3. Run Tests

```bash
cd backend
conda run -p ../.conda/upsystem pytest -q
```

Run a single test file:

```bash
cd backend
conda run -p ../.conda/upsystem pytest tests/test_questions_endpoints.py -q
```

## 4. Core API Prefix

- `/api/v1`

## 5. Frontend Integration Notes

- Backend returns `snake_case` fields.
- Frontend repository adapters map to `camelCase`.
- See `backend/docs/api-contracts.md` and `docs/plans/2026-03-03-frontend-backend-integration-checklist.md`.
