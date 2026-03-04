# upSystem Backend MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 交付可与现有前端完成联调的 FastAPI + SQLite 后端 MVP，覆盖 Dashboard、Questions、Exam/Answer、Review、Notes、Stats、Countdown、Backup 的核心接口。

**Architecture:** 后端采用分层结构：`routers` 负责 HTTP 契约，`models`/`database` 负责持久化，`services` 处理复习排期与备份逻辑，统一通过 `/api/v1` 暴露接口。先实现最小可用契约与集成测试，再按前端联调清单扩展字段和行为，避免过度设计。错误返回统一为 `{ code, message, details }`，时间字段统一 ISO 8601 UTC。

**Tech Stack:** Python 3.10+, FastAPI, SQLAlchemy 2.x, SQLite, Pydantic v2, pytest, httpx, pytest-asyncio

---

## Implementation Guardrails

- 严格按 `@superpowers/test-driven-development`：先写失败测试，再最小实现。
- 测试失败时按 `@superpowers/systematic-debugging` 定位，不直接猜改。
- 完成每个任务后按 `@superpowers/verification-before-completion` 运行验证命令。
- 每个任务独立提交，保持小步快跑。

### Task 1: 后端工程初始化与测试基线

**Files:**
- Create: `backend/main.py`
- Create: `backend/database.py`
- Create: `backend/models.py`
- Create: `backend/schemas.py`
- Create: `backend/routers/__init__.py`
- Create: `backend/tests/conftest.py`
- Create: `backend/tests/test_health.py`
- Create: `backend/requirements.txt`
- Create: `backend/requirements-dev.txt`
- Create: `backend/pytest.ini`

**Step 1: Write the failing test**

```python
# backend/tests/test_health.py
from fastapi.testclient import TestClient

from main import app


def test_health_check() -> None:
    client = TestClient(app)
    resp = client.get("/api/v1/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}
```

**Step 2: Run test to verify it fails**

Run: `cd backend && pytest tests/test_health.py -q`
Expected: FAIL（`main.py` 或 health 路由不存在）

**Step 3: Write minimal implementation**

实现：
- FastAPI app 启动入口
- `/api/v1/health` 路由
- pytest 基础配置与依赖文件

**Step 4: Run test to verify it passes**

Run: `cd backend && pytest tests/test_health.py -q`
Expected: PASS

**Step 5: Commit**

```bash
git add backend
git commit -m "feat(backend): bootstrap fastapi project with health endpoint"
```

### Task 2: 数据库模型与会话管理

**Files:**
- Modify: `backend/database.py`
- Modify: `backend/models.py`
- Create: `backend/tests/test_models_schema.py`

**Step 1: Write the failing test**

```python
# backend/tests/test_models_schema.py
from sqlalchemy import inspect

from database import Base, engine


def test_tables_created() -> None:
    Base.metadata.create_all(bind=engine)
    inspector = inspect(engine)
    names = set(inspector.get_table_names())
    assert {"exams", "questions", "answers", "exam_sessions", "review_items", "notes", "exam_countdowns"}.issubset(names)
```

**Step 2: Run test to verify it fails**

Run: `cd backend && pytest tests/test_models_schema.py -q`
Expected: FAIL（模型或 metadata 未定义完整）

**Step 3: Write minimal implementation**

实现：
- SQLAlchemy `Base/engine/SessionLocal`
- 7 个核心模型与关键字段（按系统设计文档）
- `created_at/updated_at` 的默认值策略

**Step 4: Run test to verify it passes**

Run: `cd backend && pytest tests/test_models_schema.py -q`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/database.py backend/models.py backend/tests/test_models_schema.py
git commit -m "feat(backend): add core sqlite models and session setup"
```

### Task 3: 全局配置（CORS + 错误信封 + UTC 时间）

**Files:**
- Modify: `backend/main.py`
- Modify: `backend/schemas.py`
- Create: `backend/core/errors.py`
- Create: `backend/tests/test_global_contract.py`

**Step 1: Write the failing test**

```python
# backend/tests/test_global_contract.py
from fastapi.testclient import TestClient

from main import app


def test_404_uses_error_envelope() -> None:
    client = TestClient(app)
    resp = client.get("/api/v1/not-found")
    assert resp.status_code == 404
    body = resp.json()
    assert set(body.keys()) == {"code", "message", "details"}
```

**Step 2: Run test to verify it fails**

Run: `cd backend && pytest tests/test_global_contract.py -q`
Expected: FAIL（默认 FastAPI 404 格式不匹配）

**Step 3: Write minimal implementation**

实现：
- CORS 白名单：`http://localhost:5173`、`http://127.0.0.1:5173`
- 统一异常处理器，返回 `{code,message,details}`
- 所有 datetime 序列化为 ISO 8601 UTC（含 `Z`）

**Step 4: Run test to verify it passes**

Run: `cd backend && pytest tests/test_global_contract.py -q`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/main.py backend/schemas.py backend/core/errors.py backend/tests/test_global_contract.py
git commit -m "feat(backend): add cors and unified error envelope"
```

### Task 4: Dashboard 契约接口

**Files:**
- Create: `backend/routers/countdown.py`
- Create: `backend/routers/review.py`
- Modify: `backend/main.py`
- Create: `backend/tests/test_dashboard_endpoints.py`

**Step 1: Write the failing test**

```python
# backend/tests/test_dashboard_endpoints.py
from fastapi.testclient import TestClient

from main import app


def test_get_active_countdown_contract() -> None:
    client = TestClient(app)
    resp = client.get("/api/v1/countdown/active")
    assert resp.status_code == 200
    data = resp.json()
    assert {"id", "name", "target_date", "days_left"}.issubset(data.keys())


def test_get_review_summary_contract() -> None:
    client = TestClient(app)
    resp = client.get("/api/v1/review/summary")
    assert resp.status_code == 200
    assert set(resp.json().keys()) == {"due_today", "overdue"}
```

**Step 2: Run test to verify it fails**

Run: `cd backend && pytest tests/test_dashboard_endpoints.py -q`
Expected: FAIL（接口未注册）

**Step 3: Write minimal implementation**

实现：
- `GET /api/v1/countdown/active`
- `GET /api/v1/review/summary`
- 基于数据库查询并计算 `days_left`

**Step 4: Run test to verify it passes**

Run: `cd backend && pytest tests/test_dashboard_endpoints.py -q`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/routers/countdown.py backend/routers/review.py backend/main.py backend/tests/test_dashboard_endpoints.py
git commit -m "feat(backend): implement dashboard countdown and review summary endpoints"
```

### Task 5: Questions 查询与 CRUD

**Files:**
- Create: `backend/routers/questions.py`
- Modify: `backend/schemas.py`
- Modify: `backend/main.py`
- Create: `backend/tests/test_questions_endpoints.py`

**Step 1: Write the failing test**

```python
# backend/tests/test_questions_endpoints.py
from fastapi.testclient import TestClient

from main import app


def test_questions_support_filters() -> None:
    client = TestClient(app)
    resp = client.get("/api/v1/questions", params={"category": "案例分析", "year": 2025})
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_create_question_contract() -> None:
    client = TestClient(app)
    payload = {
        "category": "案例分析",
        "sub_type": "归纳概括",
        "prompt": "概括做法",
        "word_limit": 300,
        "score": 20,
        "material_text": "材料",
    }
    resp = client.post("/api/v1/questions", json=payload)
    assert resp.status_code == 201
    assert resp.json()["word_limit"] == 300
```

**Step 2: Run test to verify it fails**

Run: `cd backend && pytest tests/test_questions_endpoints.py -q`
Expected: FAIL

**Step 3: Write minimal implementation**

实现：
- `GET /api/v1/questions` 支持 `year/source/category/sub_type`
- `POST /api/v1/questions`
- `PUT /api/v1/questions/{id}`
- `DELETE /api/v1/questions/{id}`（先硬删除，文档注明）

**Step 4: Run test to verify it passes**

Run: `cd backend && pytest tests/test_questions_endpoints.py -q`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/routers/questions.py backend/schemas.py backend/main.py backend/tests/test_questions_endpoints.py
git commit -m "feat(backend): add questions crud with filter query support"
```

### Task 6: Exams / Exam Sessions / Answers

**Files:**
- Create: `backend/routers/exams.py`
- Create: `backend/routers/answers.py`
- Modify: `backend/schemas.py`
- Modify: `backend/main.py`
- Create: `backend/tests/test_exam_flow_endpoints.py`

**Step 1: Write the failing test**

```python
# backend/tests/test_exam_flow_endpoints.py
from fastapi.testclient import TestClient

from main import app


def test_get_exams_and_detail() -> None:
    client = TestClient(app)
    list_resp = client.get("/api/v1/exams")
    assert list_resp.status_code == 200
    detail_resp = client.get("/api/v1/exams/1")
    assert detail_resp.status_code in {200, 404}


def test_create_exam_session_and_answer() -> None:
    client = TestClient(app)
    s = client.post("/api/v1/exam-sessions", json={"exam_id": 1})
    assert s.status_code in {201, 404}
```

**Step 2: Run test to verify it fails**

Run: `cd backend && pytest tests/test_exam_flow_endpoints.py -q`
Expected: FAIL

**Step 3: Write minimal implementation**

实现：
- `GET /api/v1/exams`
- `GET /api/v1/exams/{id}`（含有序 questions）
- `POST /api/v1/exam-sessions`
- `POST /api/v1/answers`（保存 `mode`、`time_spent_seconds`）

**Step 4: Run test to verify it passes**

Run: `cd backend && pytest tests/test_exam_flow_endpoints.py -q`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/routers/exams.py backend/routers/answers.py backend/schemas.py backend/main.py backend/tests/test_exam_flow_endpoints.py
git commit -m "feat(backend): implement exam list detail session and answer endpoints"
```

### Task 7: Review 队列与评分排期

**Files:**
- Modify: `backend/routers/review.py`
- Create: `backend/services/review_scheduler.py`
- Modify: `backend/schemas.py`
- Create: `backend/tests/test_review_scheduler.py`
- Create: `backend/tests/test_review_endpoints.py`

**Step 1: Write the failing test**

```python
# backend/tests/test_review_scheduler.py
from services.review_scheduler import next_schedule


def test_grade_5_moves_forward() -> None:
    days, ef = next_schedule(review_count=2, ease_factor=2.5, grade=5)
    assert days >= 7
    assert ef > 2.5
```

**Step 2: Run test to verify it fails**

Run: `cd backend && pytest tests/test_review_scheduler.py tests/test_review_endpoints.py -q`
Expected: FAIL

**Step 3: Write minimal implementation**

实现：
- `GET /api/v1/review/items?due=today|overdue`
- `POST /api/v1/review/items/{id}/grade`
- 简化 SM-2 排期策略（1/3/7/15/30 + ease_factor）

**Step 4: Run test to verify it passes**

Run: `cd backend && pytest tests/test_review_scheduler.py tests/test_review_endpoints.py -q`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/routers/review.py backend/services/review_scheduler.py backend/schemas.py backend/tests/test_review_scheduler.py backend/tests/test_review_endpoints.py
git commit -m "feat(backend): add review queue and grading scheduler endpoints"
```

### Task 8: Notes CRUD

**Files:**
- Create: `backend/routers/notes.py`
- Modify: `backend/schemas.py`
- Modify: `backend/main.py`
- Create: `backend/tests/test_notes_endpoints.py`

**Step 1: Write the failing test**

```python
# backend/tests/test_notes_endpoints.py
from fastapi.testclient import TestClient

from main import app


def test_notes_crud() -> None:
    client = TestClient(app)
    c = client.post("/api/v1/notes", json={"title": "t", "content": "c", "tags": ["a"]})
    assert c.status_code == 201
    note_id = c.json()["id"]
    u = client.put(f"/api/v1/notes/{note_id}", json={"title": "t2", "content": "c2", "tags": ["b"]})
    assert u.status_code == 200
    d = client.delete(f"/api/v1/notes/{note_id}")
    assert d.status_code == 204
```

**Step 2: Run test to verify it fails**

Run: `cd backend && pytest tests/test_notes_endpoints.py -q`
Expected: FAIL

**Step 3: Write minimal implementation**

实现：
- `GET /api/v1/notes`
- `POST /api/v1/notes`
- `PUT /api/v1/notes/{id}`
- `DELETE /api/v1/notes/{id}`

**Step 4: Run test to verify it passes**

Run: `cd backend && pytest tests/test_notes_endpoints.py -q`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/routers/notes.py backend/schemas.py backend/main.py backend/tests/test_notes_endpoints.py
git commit -m "feat(backend): implement notes crud endpoints"
```

### Task 9: Statistics 接口

**Files:**
- Create: `backend/routers/stats.py`
- Modify: `backend/main.py`
- Create: `backend/tests/test_stats_endpoints.py`

**Step 1: Write the failing test**

```python
# backend/tests/test_stats_endpoints.py
from fastapi.testclient import TestClient

from main import app


def test_stats_contracts() -> None:
    client = TestClient(app)
    o = client.get("/api/v1/stats/overview")
    assert o.status_code == 200
    assert {"practiced_questions", "practiced_hours", "monthly_count", "avg_self_score"}.issubset(o.json().keys())

    t = client.get("/api/v1/stats/weekly-trend")
    assert t.status_code == 200
    assert isinstance(t.json(), list)
```

**Step 2: Run test to verify it fails**

Run: `cd backend && pytest tests/test_stats_endpoints.py -q`
Expected: FAIL

**Step 3: Write minimal implementation**

实现：
- `GET /api/v1/stats/overview`
- `GET /api/v1/stats/weekly-trend`
- 先基于答案与会话表聚合出前端所需字段

**Step 4: Run test to verify it passes**

Run: `cd backend && pytest tests/test_stats_endpoints.py -q`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/routers/stats.py backend/main.py backend/tests/test_stats_endpoints.py
git commit -m "feat(backend): add stats overview and weekly trend endpoints"
```

### Task 10: Countdown 管理与手动备份

**Files:**
- Modify: `backend/routers/countdown.py`
- Create: `backend/routers/backup.py`
- Create: `backend/services/backup_service.py`
- Modify: `backend/main.py`
- Create: `backend/tests/test_countdown_backup_endpoints.py`

**Step 1: Write the failing test**

```python
# backend/tests/test_countdown_backup_endpoints.py
from fastapi.testclient import TestClient

from main import app


def test_countdown_list_and_create() -> None:
    client = TestClient(app)
    r = client.get("/api/v1/countdown")
    assert r.status_code == 200
    c = client.post("/api/v1/countdown", json={"name": "2026 省直", "target_date": "2026-09-26", "is_active": True})
    assert c.status_code == 201


def test_manual_backup_endpoint() -> None:
    client = TestClient(app)
    resp = client.post("/api/v1/backup/manual")
    assert resp.status_code == 200
    assert {"status", "backup_path"}.issubset(resp.json().keys())
```

**Step 2: Run test to verify it fails**

Run: `cd backend && pytest tests/test_countdown_backup_endpoints.py -q`
Expected: FAIL

**Step 3: Write minimal implementation**

实现：
- `GET /api/v1/countdown`
- `POST /api/v1/countdown`
- `POST /api/v1/backup/manual`（先实现 sqlite 文件快照 + JSON 导出，不做 push）

**Step 4: Run test to verify it passes**

Run: `cd backend && pytest tests/test_countdown_backup_endpoints.py -q`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/routers/countdown.py backend/routers/backup.py backend/services/backup_service.py backend/main.py backend/tests/test_countdown_backup_endpoints.py
git commit -m "feat(backend): add countdown management and manual backup endpoint"
```

### Task 11: 前后端契约映射与联调样例

**Files:**
- Create: `backend/docs/api-contracts.md`
- Create: `backend/tests/test_contract_field_names.py`
- Modify: `docs/plans/2026-03-03-frontend-backend-integration-checklist.md`

**Step 1: Write the failing test**

```python
# backend/tests/test_contract_field_names.py
from fastapi.testclient import TestClient

from main import app


def test_dashboard_response_uses_snake_case() -> None:
    client = TestClient(app)
    resp = client.get("/api/v1/countdown/active")
    assert resp.status_code == 200
    assert "target_date" in resp.json()
    assert "targetDate" not in resp.json()
```

**Step 2: Run test to verify it fails**

Run: `cd backend && pytest tests/test_contract_field_names.py -q`
Expected: FAIL（若 schema alias 或序列化策略不一致）

**Step 3: Write minimal implementation**

实现：
- 补齐字段命名与可空约定文档
- 在联调清单里逐项打勾/备注当前状态
- 提供前端仓储映射示例（snake_case -> camelCase）

**Step 4: Run test to verify it passes**

Run: `cd backend && pytest tests/test_contract_field_names.py -q`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/docs/api-contracts.md backend/tests/test_contract_field_names.py docs/plans/2026-03-03-frontend-backend-integration-checklist.md
git commit -m "docs(backend): document api contracts and field mapping rules"
```

### Task 12: 端到端后端验证与启动文档

**Files:**
- Create: `backend/tests/test_integration_smoke.py`
- Create: `backend/README.md`
- Modify: `README.md`

**Step 1: Write the failing test**

```python
# backend/tests/test_integration_smoke.py
from fastapi.testclient import TestClient

from main import app


def test_backend_smoke_flow() -> None:
    client = TestClient(app)
    assert client.get("/api/v1/health").status_code == 200
    assert client.get("/api/v1/questions").status_code == 200
    assert client.get("/api/v1/stats/overview").status_code == 200
```

**Step 2: Run test to verify it fails**

Run: `cd backend && pytest tests/test_integration_smoke.py -q`
Expected: FAIL（若路由注册或依赖初始化不完整）

**Step 3: Write minimal implementation**

实现：
- 后端启动说明（conda + pip）
- 全量测试/指定测试命令
- 本地联调启动方式（前端 + 后端）

**Step 4: Run test to verify it passes**

Run: `cd backend && pytest -q`
Expected: PASS（全部后端测试通过）

**Step 5: Commit**

```bash
git add backend/tests/test_integration_smoke.py backend/README.md README.md
git commit -m "test(backend): add smoke integration test and backend runbook"
```

## Final Verification Gate

```bash
cd backend
pytest -q

# 可选：本地启动
uvicorn main:app --reload --port 8000
```

Expected:
- 所有后端测试通过
- OpenAPI 在 `http://127.0.0.1:8000/docs` 可访问
- 核心接口可满足 `docs/plans/2026-03-03-frontend-backend-integration-checklist.md`

Plan complete and saved to `docs/plans/2026-03-03-backend-mvp-implementation-plan.md`. Two execution options:

**1. Subagent-Driven (this session)** - 我在当前会话逐任务执行并在每步后给你验收点

**2. Parallel Session (separate)** - 你开一个新会话，按 `superpowers:executing-plans` 批量执行

请选择一种执行方式。
