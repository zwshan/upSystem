# upSystem Frontend-First Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 先交付可用的前端复习系统（含仿真答题核心交互），后续仅替换数据源即可接入 FastAPI 后端。  
**Architecture:** 采用 Vue 3 + Pinia + Vue Router 的前端单体架构。第一阶段使用 `MockRepository` 驱动页面与状态流，第二阶段通过 `ApiRepository` 对接后端；两者共享同一套 TypeScript domain types，保证“前端先行”不返工。  
**Tech Stack:** Vue 3, Vite, TypeScript, Pinia, Vue Router, TailwindCSS, ECharts, Vitest, Vue Test Utils, Playwright

---

### Task 1: 前端工程初始化与测试基线

**Files:**
- Create: `frontend/`（通过 Vite 脚手架生成）
- Create: `frontend/src/tests/smoke/app-shell.spec.ts`
- Create: `frontend/src/tests/setup.ts`
- Modify: `frontend/package.json`
- Modify: `frontend/vite.config.ts`
- Test: `frontend/src/tests/smoke/app-shell.spec.ts`

**Step 1: Write the failing test**

```ts
// frontend/src/tests/smoke/app-shell.spec.ts
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import AppShell from "@/components/layout/AppShell.vue";

describe("AppShell", () => {
  it("renders 9 primary nav entries", () => {
    const wrapper = mount(AppShell);
    expect(wrapper.findAll("[data-testid='primary-nav-item']")).toHaveLength(9);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd frontend && npm run test:unit -- app-shell.spec.ts`  
Expected: FAIL（缺少 `AppShell.vue` 或导入路径未配置）

**Step 3: Write minimal implementation**

```bash
npm create vite@latest frontend -- --template vue-ts
cd frontend
npm i
npm i -D vitest @vue/test-utils jsdom @testing-library/vue
npm i pinia vue-router tailwindcss postcss autoprefixer echarts vue-echarts
```

并创建最小 `AppShell.vue` + `@` 别名 + `test:unit` 脚本，让测试可运行。

**Step 4: Run test to verify it passes**

Run: `cd frontend && npm run test:unit -- app-shell.spec.ts`  
Expected: PASS

**Step 5: Commit**

```bash
git add frontend
git commit -m "feat(frontend): bootstrap vue app with vitest baseline"
```

### Task 2: 全局主题、布局骨架与路由

**Files:**
- Create: `frontend/src/components/layout/AppShell.vue`
- Create: `frontend/src/components/layout/TopBar.vue`
- Create: `frontend/src/router/index.ts`
- Create: `frontend/src/styles/apple-theme.css`
- Modify: `frontend/src/App.vue`
- Modify: `frontend/src/main.ts`
- Test: `frontend/src/tests/smoke/router-shell.spec.ts`

**Step 1: Write the failing test**

```ts
// frontend/src/tests/smoke/router-shell.spec.ts
import { describe, expect, it } from "vitest";
import { createRouter, createWebHistory } from "vue-router";
import { mount } from "@vue/test-utils";
import App from "@/App.vue";

describe("router shell", () => {
  it("shows dashboard nav by default", async () => {
    const router = createRouter({
      history: createWebHistory(),
      routes: [{ path: "/", component: { template: "<div>Dashboard</div>" } }],
    });
    router.push("/");
    await router.isReady();
    const wrapper = mount(App, { global: { plugins: [router] } });
    expect(wrapper.text()).toContain("Dashboard");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd frontend && npm run test:unit -- router-shell.spec.ts`  
Expected: FAIL（`App.vue` 未包含 RouterView 或布局容器）

**Step 3: Write minimal implementation**

实现：
- `AppShell` 左侧导航（9 个入口）+ 顶部栏
- `router/index.ts` 注册 9 个视图路由
- `apple-theme.css` 主题变量（圆角、阴影、蓝色主色、浅灰背景）
- `App.vue` 使用 `<AppShell><RouterView /></AppShell>`

**Step 4: Run test to verify it passes**

Run: `cd frontend && npm run test:unit -- router-shell.spec.ts`  
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/src/components/layout/AppShell.vue frontend/src/components/layout/TopBar.vue frontend/src/router/index.ts frontend/src/styles/apple-theme.css frontend/src/App.vue frontend/src/main.ts frontend/src/tests/smoke/router-shell.spec.ts
git commit -m "feat(frontend): add app shell, theme tokens and router skeleton"
```

### Task 3: Dashboard（倒计时 + 今日复习 + 快捷入口）

**Files:**
- Create: `frontend/src/views/Dashboard.vue`
- Create: `frontend/src/components/dashboard/CountdownCard.vue`
- Create: `frontend/src/components/dashboard/ReviewCard.vue`
- Create: `frontend/src/stores/dashboard.ts`
- Create: `frontend/src/repositories/mock/dashboard.mock.ts`
- Test: `frontend/src/tests/views/dashboard.spec.ts`

**Step 1: Write the failing test**

```ts
// frontend/src/tests/views/dashboard.spec.ts
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import Dashboard from "@/views/Dashboard.vue";

describe("Dashboard", () => {
  it("renders countdown and today review blocks", () => {
    const wrapper = mount(Dashboard);
    expect(wrapper.find("[data-testid='countdown-card']").exists()).toBe(true);
    expect(wrapper.find("[data-testid='today-review-card']").exists()).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd frontend && npm run test:unit -- dashboard.spec.ts`  
Expected: FAIL

**Step 3: Write minimal implementation**

实现 `dashboard` store + mock 仓储，页面展示：
- 激活考试倒计时（名称、剩余天数、目标日期）
- 今日待复习数量、逾期数量
- 到 `ExamSimulation` / `ReviewCenter` / `QuestionManager` 的快捷按钮

**Step 4: Run test to verify it passes**

Run: `cd frontend && npm run test:unit -- dashboard.spec.ts`  
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/src/views/Dashboard.vue frontend/src/components/dashboard frontend/src/stores/dashboard.ts frontend/src/repositories/mock/dashboard.mock.ts frontend/src/tests/views/dashboard.spec.ts
git commit -m "feat(frontend): implement dashboard with countdown and review summary"
```

### Task 4: 题目管理页（列表、筛选、编辑抽屉）

**Files:**
- Create: `frontend/src/views/QuestionManager.vue`
- Create: `frontend/src/components/questions/QuestionTable.vue`
- Create: `frontend/src/components/questions/QuestionEditorDrawer.vue`
- Create: `frontend/src/stores/questions.ts`
- Create: `frontend/src/repositories/mock/questions.mock.ts`
- Test: `frontend/src/tests/views/question-manager.spec.ts`

**Step 1: Write the failing test**

```ts
// frontend/src/tests/views/question-manager.spec.ts
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import QuestionManager from "@/views/QuestionManager.vue";

describe("QuestionManager", () => {
  it("filters by category", async () => {
    const wrapper = mount(QuestionManager);
    await wrapper.find("[data-testid='category-filter']").setValue("案例分析");
    expect(wrapper.findAll("[data-testid='question-row']").length).toBeGreaterThan(0);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd frontend && npm run test:unit -- question-manager.spec.ts`  
Expected: FAIL

**Step 3: Write minimal implementation**

实现：
- 题目表格（年份、来源、题型、字数、分值）
- 分类/年份筛选
- 新建和编辑抽屉（仅前端状态，不调用后端）

**Step 4: Run test to verify it passes**

Run: `cd frontend && npm run test:unit -- question-manager.spec.ts`  
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/src/views/QuestionManager.vue frontend/src/components/questions frontend/src/stores/questions.ts frontend/src/repositories/mock/questions.mock.ts frontend/src/tests/views/question-manager.spec.ts
git commit -m "feat(frontend): add question manager with filtering and editor drawer"
```

### Task 5: 答题核心组件（GridPaper + Timer + AnswerSheet）

**Files:**
- Create: `frontend/src/components/exam/GridPaper.vue`
- Create: `frontend/src/components/exam/Timer.vue`
- Create: `frontend/src/views/AnswerSheet.vue`
- Create: `frontend/src/stores/exam.ts`
- Test: `frontend/src/tests/components/grid-paper.spec.ts`
- Test: `frontend/src/tests/views/answer-sheet.spec.ts`

**Step 1: Write the failing test**

```ts
// frontend/src/tests/components/grid-paper.spec.ts
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import GridPaper from "@/components/exam/GridPaper.vue";

describe("GridPaper", () => {
  it("renders 25 x 24 cells", () => {
    const wrapper = mount(GridPaper, { props: { modelValue: "", wordLimit: 600 } });
    expect(wrapper.findAll("[data-testid='grid-cell']")).toHaveLength(600);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd frontend && npm run test:unit -- grid-paper.spec.ts`  
Expected: FAIL

**Step 3: Write minimal implementation**

实现：
- `GridPaper` 25x24 格子渲染、字符输入、字数统计
- `Timer` 支持开始/暂停/重置
- `AnswerSheet` 左材料右格子布局（40/60）

**Step 4: Run test to verify it passes**

Run: `cd frontend && npm run test:unit -- grid-paper.spec.ts answer-sheet.spec.ts`  
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/src/components/exam frontend/src/views/AnswerSheet.vue frontend/src/stores/exam.ts frontend/src/tests/components/grid-paper.spec.ts frontend/src/tests/views/answer-sheet.spec.ts
git commit -m "feat(frontend): implement answer sheet with grid paper and timer"
```

### Task 6: 仿真答题流程页（ExamSimulation + TargetedPractice）

**Files:**
- Create: `frontend/src/views/ExamSimulation.vue`
- Create: `frontend/src/views/TargetedPractice.vue`
- Modify: `frontend/src/stores/exam.ts`
- Create: `frontend/src/repositories/mock/exam.mock.ts`
- Test: `frontend/src/tests/views/exam-simulation.spec.ts`

**Step 1: Write the failing test**

```ts
// frontend/src/tests/views/exam-simulation.spec.ts
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import ExamSimulation from "@/views/ExamSimulation.vue";

describe("ExamSimulation", () => {
  it("starts a session and enters first question", async () => {
    const wrapper = mount(ExamSimulation);
    await wrapper.find("[data-testid='start-exam-btn']").trigger("click");
    expect(wrapper.find("[data-testid='answer-sheet-entry']").exists()).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd frontend && npm run test:unit -- exam-simulation.spec.ts`  
Expected: FAIL

**Step 3: Write minimal implementation**

实现：
- 套卷选择 -> 开始仿真 -> 进入 `AnswerSheet`
- 上下题切换、交卷按钮状态流
- 专项练习按一级/二级题型筛题进入作答

**Step 4: Run test to verify it passes**

Run: `cd frontend && npm run test:unit -- exam-simulation.spec.ts`  
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/src/views/ExamSimulation.vue frontend/src/views/TargetedPractice.vue frontend/src/stores/exam.ts frontend/src/repositories/mock/exam.mock.ts frontend/src/tests/views/exam-simulation.spec.ts
git commit -m "feat(frontend): add exam simulation and targeted practice flows"
```

### Task 7: 复习中心、笔记、统计、设置页面（前端可用版本）

**Files:**
- Create: `frontend/src/views/ReviewCenter.vue`
- Create: `frontend/src/views/NoteManager.vue`
- Create: `frontend/src/views/Statistics.vue`
- Create: `frontend/src/views/Settings.vue`
- Create: `frontend/src/components/stats/PracticeTrendChart.vue`
- Create: `frontend/src/stores/review.ts`
- Create: `frontend/src/stores/notes.ts`
- Create: `frontend/src/stores/stats.ts`
- Test: `frontend/src/tests/views/review-center.spec.ts`
- Test: `frontend/src/tests/views/statistics.spec.ts`

**Step 1: Write the failing test**

```ts
// frontend/src/tests/views/statistics.spec.ts
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import Statistics from "@/views/Statistics.vue";

describe("Statistics", () => {
  it("renders weekly trend chart container", () => {
    const wrapper = mount(Statistics);
    expect(wrapper.find("[data-testid='weekly-trend-chart']").exists()).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd frontend && npm run test:unit -- review-center.spec.ts statistics.spec.ts`  
Expected: FAIL

**Step 3: Write minimal implementation**

实现：
- `ReviewCenter`：今日待复习、逾期、复习卡片自评入口
- `NoteManager`：笔记列表 + Markdown 编辑区
- `Statistics`：总览卡片 + 周趋势图容器（ECharts）
- `Settings`：倒计时管理与“手动备份”按钮（先占位）

**Step 4: Run test to verify it passes**

Run: `cd frontend && npm run test:unit -- review-center.spec.ts statistics.spec.ts`  
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/src/views/ReviewCenter.vue frontend/src/views/NoteManager.vue frontend/src/views/Statistics.vue frontend/src/views/Settings.vue frontend/src/components/stats/PracticeTrendChart.vue frontend/src/stores/review.ts frontend/src/stores/notes.ts frontend/src/stores/stats.ts frontend/src/tests/views/review-center.spec.ts frontend/src/tests/views/statistics.spec.ts
git commit -m "feat(frontend): implement review notes statistics and settings pages"
```

### Task 8: 数据访问层抽象（Mock -> API 可切换）与联调准备

**Files:**
- Create: `frontend/src/domain/types.ts`
- Create: `frontend/src/repositories/contracts.ts`
- Create: `frontend/src/repositories/mock/index.ts`
- Create: `frontend/src/repositories/api/index.ts`
- Create: `frontend/src/repositories/factory.ts`
- Create: `frontend/.env.example`
- Modify: `frontend/src/stores/dashboard.ts`
- Modify: `frontend/src/stores/questions.ts`
- Modify: `frontend/src/stores/exam.ts`
- Modify: `frontend/src/stores/review.ts`
- Modify: `frontend/src/stores/notes.ts`
- Modify: `frontend/src/stores/stats.ts`
- Test: `frontend/src/tests/repositories/factory.spec.ts`

**Step 1: Write the failing test**

```ts
// frontend/src/tests/repositories/factory.spec.ts
import { describe, expect, it } from "vitest";
import { createRepositories } from "@/repositories/factory";

describe("repository factory", () => {
  it("returns mock repos when VITE_DATA_MODE=mock", () => {
    const repos = createRepositories("mock");
    expect(repos.kind).toBe("mock");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd frontend && npm run test:unit -- factory.spec.ts`  
Expected: FAIL

**Step 3: Write minimal implementation**

实现：
- 定义领域类型与仓储接口（考试、题目、复习、统计、倒计时）
- 实现 `mock` 与 `api` 两套仓储入口
- 用 `VITE_DATA_MODE` 决定运行数据源，默认 `mock`

**Step 4: Run test to verify it passes**

Run: `cd frontend && npm run test:unit -- factory.spec.ts`  
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/src/domain/types.ts frontend/src/repositories/contracts.ts frontend/src/repositories/mock/index.ts frontend/src/repositories/api/index.ts frontend/src/repositories/factory.ts frontend/.env.example frontend/src/stores/dashboard.ts frontend/src/stores/questions.ts frontend/src/stores/exam.ts frontend/src/stores/review.ts frontend/src/stores/notes.ts frontend/src/stores/stats.ts frontend/src/tests/repositories/factory.spec.ts
git commit -m "refactor(frontend): add repository abstraction for mock and api modes"
```

### Task 9: 端到端冒烟与开发文档

**Files:**
- Create: `frontend/playwright.config.ts`
- Create: `frontend/tests-e2e/smoke.spec.ts`
- Modify: `frontend/package.json`
- Create: `docs/frontend-dev-guide.md`
- Modify: `frontend/src/components/layout/AppShell.vue`
- Modify: `frontend/src/views/Dashboard.vue`
- Modify: `frontend/src/views/QuestionManager.vue`
- Test: `frontend/tests-e2e/smoke.spec.ts`

**Step 1: Write the failing test**

```ts
// frontend/tests-e2e/smoke.spec.ts
import { test, expect } from "@playwright/test";

test("dashboard opens and nav works", async ({ page }) => {
  await page.goto("http://localhost:5173");
  await expect(page.getByTestId("countdown-card")).toBeVisible();
  await page.getByRole("link", { name: "题目管理" }).click();
  await expect(page.getByTestId("question-table")).toBeVisible();
});
```

**Step 2: Run test to verify it fails**

Run: `cd frontend && npm run test:e2e -- --project=chromium`  
Expected: FAIL（Playwright 未配置或页面 testid 不完整）

**Step 3: Write minimal implementation**

实现：
- 安装并配置 Playwright
- 补齐关键节点 `data-testid`
- 补充 `docs/frontend-dev-guide.md`（启动、测试、mock/api 切换）

**Step 4: Run test to verify it passes**

Run: `cd frontend && npm run test:e2e -- --project=chromium`  
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/package.json frontend/playwright.config.ts frontend/tests-e2e/smoke.spec.ts docs/frontend-dev-guide.md frontend/src/components/layout/AppShell.vue frontend/src/views/Dashboard.vue frontend/src/views/QuestionManager.vue
git commit -m "test(frontend): add e2e smoke coverage and frontend dev guide"
```

### Task 10: 前端阶段收口（验收脚本 + 后端联调清单）

**Files:**
- Create: `docs/plans/2026-03-03-frontend-backend-integration-checklist.md`
- Modify: `docs/plans/2026-03-03-exam-prep-system-design.md`

**Step 1: Write the failing test**

```md
检查清单初稿为空，无法覆盖 API 契约核对、CORS、分页、错误码。
```

**Step 2: Run test to verify it fails**

Run: `cd frontend && npm run lint && npm run test:unit`  
Expected: FAIL（若仍有未使用变量、类型不匹配、测试不稳定）

**Step 3: Write minimal implementation**

完成：
- 联调 checklist（按模块列出接口、字段、样例 payload）
- 在系统设计文档补充“前端已完成范围”和“后端待对接范围”

**Step 4: Run test to verify it passes**

Run: `cd frontend && npm run lint && npm run test:unit && npm run build`  
Expected: PASS

**Step 5: Commit**

```bash
git add docs/plans/2026-03-03-frontend-backend-integration-checklist.md docs/plans/2026-03-03-exam-prep-system-design.md
git commit -m "docs: add frontend completion status and backend integration checklist"
```
