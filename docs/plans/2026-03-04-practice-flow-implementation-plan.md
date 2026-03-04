# 刷题入口与真格子纸练习页 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在现有项目中落地“筛选后单题刷题”闭环，并实现左题右纸的真格子输入体验（25 列 * 24 行，可翻页、可自动分页、可本地草稿恢复）。

**Architecture:** 保持单体架构，新增一个 `next question` API 和一个本地单用户解析服务；前端在 `/practice` 构建简洁状态机（filter/solving/submitting）并拆分为筛选面板、题目面板、格子纸编辑器三个组件。提交仍复用既有 `practice/submit` 领域逻辑，避免重复实现排期规则。

**Tech Stack:** Next.js App Router, React 19, TypeScript, Prisma + SQLite, Vitest + Testing Library, Playwright。

---

## 执行前约束
- 先执行 `@superpowers/test-driven-development`：每个行为先写失败测试，再写最小实现。
- 任务执行阶段采用 `@superpowers/subagent-driven-development`（同会话）或 `@superpowers/executing-plans`（新会话）。
- 完成前执行 `@superpowers/verification-before-completion`。

### Task 1: 接通首页“刷题/复习”跳转

**Files:**
- Modify: `src/app/page.tsx`
- Test: `tests/ui/homepage.test.tsx`

**Step 1: Write the failing test**

```tsx
it("刷题和复习主按钮可跳转", async () => {
  render(<HomePage />);
  expect(screen.getByRole("link", { name: "刷题" })).toHaveAttribute("href", "/practice");
  expect(screen.getByRole("link", { name: "复习" })).toHaveAttribute("href", "/review");
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/ui/homepage.test.tsx`
Expected: FAIL（当前为 button，不是 link）。

**Step 3: Write minimal implementation**

```tsx
<Link className={styles.primaryBtn} href="/practice" aria-label="刷题">...</Link>
<Link className={styles.primaryBtn} href="/review" aria-label="复习">...</Link>
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- tests/ui/homepage.test.tsx`
Expected: PASS。

**Step 5: Commit**

```bash
git add src/app/page.tsx tests/ui/homepage.test.tsx
git commit -m "feat(home): wire primary actions to practice and review routes"
```

### Task 2: 新增自动单用户解析服务

**Files:**
- Create: `src/server/domain/user/resolve-local-user.ts`
- Test: `tests/domain/resolve-local-user.test.ts`

**Step 1: Write the failing test**

```ts
it("不存在本地用户时自动创建，存在时复用", async () => {
  const first = await resolveLocalUser();
  const second = await resolveLocalUser();
  expect(first.id).toBe(second.id);
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/domain/resolve-local-user.test.ts`
Expected: FAIL（文件/函数不存在）。

**Step 3: Write minimal implementation**

```ts
export async function resolveLocalUser() {
  const email = (process.env.LOCAL_USER_EMAIL ?? "local@tuanyuan.app").trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;
  return prisma.user.create({ data: { email, passwordHash: "local-user-disabled-password" } });
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- tests/domain/resolve-local-user.test.ts`
Expected: PASS。

**Step 5: Commit**

```bash
git add src/server/domain/user/resolve-local-user.ts tests/domain/resolve-local-user.test.ts
git commit -m "feat(practice): add local single-user resolver"
```

### Task 3: 新增取下一题 API（/api/practice/next）

**Files:**
- Create: `src/app/api/practice/next/route.ts`
- Test: `tests/api/practice-next.test.ts`

**Step 1: Write the failing test**

```ts
it("bankId 缺失返回 400", async () => {
  const req = new Request("http://localhost/api/practice/next");
  const res = await GET(req);
  expect(res.status).toBe(400);
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/api/practice-next.test.ts`
Expected: FAIL。

**Step 3: Write minimal implementation**

```ts
// 1) 校验 bankId
// 2) resolveLocalUser()
// 3) prisma.question.findMany(where: { bankId, questionType?: type }, include materials)
// 4) 随机返回 1 题；空列表返回 404
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- tests/api/practice-next.test.ts`
Expected: PASS（覆盖 400/404/200）。

**Step 5: Commit**

```bash
git add src/app/api/practice/next/route.ts tests/api/practice-next.test.ts
git commit -m "feat(practice-api): add next-question endpoint with local user"
```

### Task 4: 搭建 /practice 页面状态机与筛选面板

**Files:**
- Modify: `src/app/practice/page.tsx`
- Create: `src/app/practice/components/practice-filter-panel.tsx`
- Create: `src/app/practice/practice.module.css`
- Test: `tests/ui/practice-page-filter.test.tsx`

**Step 1: Write the failing test**

```tsx
it("默认显示筛选面板并可加载题库/题型", async () => {
  render(<PracticePage />);
  expect(screen.getByRole("button", { name: "开始刷题" })).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/ui/practice-page-filter.test.tsx`
Expected: FAIL（当前是占位页）。

**Step 3: Write minimal implementation**

```tsx
// page.tsx:
// - load /api/banks and /api/question-types
// - filter 状态：bankId/type
// - click 开始刷题 => GET /api/practice/next
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- tests/ui/practice-page-filter.test.tsx`
Expected: PASS。

**Step 5: Commit**

```bash
git add src/app/practice/page.tsx src/app/practice/components/practice-filter-panel.tsx src/app/practice/practice.module.css tests/ui/practice-page-filter.test.tsx
git commit -m "feat(practice-ui): add filter-first practice page skeleton"
```

### Task 5: 实现左侧题目区（参考答案 + 自评提交）

**Files:**
- Create: `src/app/practice/components/practice-question-pane.tsx`
- Modify: `src/app/practice/page.tsx`
- Test: `tests/ui/practice-question-pane.test.tsx`

**Step 1: Write the failing test**

```tsx
it("先隐藏参考答案，点击后显示；可选择0-5分并提交", async () => {
  // render pane with fake question
  // click "显示参考答案" then expect answer visible
  // choose score and submit callback called
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/ui/practice-question-pane.test.tsx`
Expected: FAIL。

**Step 3: Write minimal implementation**

```tsx
// 题干信息 + 材料列表
// show/hide referenceAnswer
// score buttons 0..5
// submit disabled when score not selected
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- tests/ui/practice-question-pane.test.tsx`
Expected: PASS。

**Step 5: Commit**

```bash
git add src/app/practice/components/practice-question-pane.tsx src/app/practice/page.tsx tests/ui/practice-question-pane.test.tsx
git commit -m "feat(practice-ui): add question pane with answer reveal and self-score"
```

### Task 6: 实现右侧真格子纸编辑器（25x24 + 自动分页 + 粘贴）

**Files:**
- Create: `src/app/practice/components/grid-paper-editor.tsx`
- Modify: `src/app/practice/practice.module.css`
- Test: `tests/ui/grid-paper-editor.test.tsx`

**Step 1: Write the failing test**

```tsx
it("输入超过600字自动新增下一页", async () => {
  // render editor
  // simulate long paste > 600 chars
  // expect page indicator to move to page 2
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/ui/grid-paper-editor.test.tsx`
Expected: FAIL。

**Step 3: Write minimal implementation**

```tsx
// constants: COLS=25, ROWS=24, CAPACITY=600
// state: pages[], pageIndex
// input handler: char-by-char fill
// paste handler: stream fill + auto append page
// pager: prev/next/add
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- tests/ui/grid-paper-editor.test.tsx`
Expected: PASS（至少覆盖输入、粘贴、自动分页、手动翻页）。

**Step 5: Commit**

```bash
git add src/app/practice/components/grid-paper-editor.tsx src/app/practice/practice.module.css tests/ui/grid-paper-editor.test.tsx
git commit -m "feat(practice-ui): implement real grid-paper editor with pagination"
```

### Task 7: 实现按题目ID自动草稿暂存与恢复

**Files:**
- Modify: `src/app/practice/components/grid-paper-editor.tsx`
- Modify: `src/app/practice/page.tsx`
- Test: `tests/ui/practice-draft-persistence.test.tsx`

**Step 1: Write the failing test**

```tsx
it("同题目重新进入时自动恢复草稿，提交成功后清理", async () => {
  // mock localStorage + submit success
  // assert draft restored and then removed after submit
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/ui/practice-draft-persistence.test.tsx`
Expected: FAIL。

**Step 3: Write minimal implementation**

```tsx
// key: draft:{questionId}
// debounce save (500ms)
// on question change -> load
// on submit success -> removeItem
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- tests/ui/practice-draft-persistence.test.tsx`
Expected: PASS。

**Step 5: Commit**

```bash
git add src/app/practice/components/grid-paper-editor.tsx src/app/practice/page.tsx tests/ui/practice-draft-persistence.test.tsx
git commit -m "feat(practice-ui): add local draft persistence by question id"
```

### Task 8: 打通提交流程与回流筛选态（保留筛选）

**Files:**
- Modify: `src/app/practice/page.tsx`
- Modify: `src/app/practice/practice.module.css`
- Test: `tests/ui/practice-submit-flow.test.tsx`

**Step 1: Write the failing test**

```tsx
it("提交成功后回到筛选态并保留已选 bank/type", async () => {
  // start -> solving -> submit success
  // expect filter visible and selected values unchanged
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/ui/practice-submit-flow.test.tsx`
Expected: FAIL。

**Step 3: Write minimal implementation**

```tsx
// submit success:
// - clear current question + editor state
// - show center toast (1.2s)
// - set mode back to filter
// - keep filter state
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- tests/ui/practice-submit-flow.test.tsx`
Expected: PASS。

**Step 5: Commit**

```bash
git add src/app/practice/page.tsx src/app/practice/practice.module.css tests/ui/practice-submit-flow.test.tsx
git commit -m "feat(practice-flow): return to filter after submit while keeping selection"
```

### Task 9: E2E 覆盖刷题主链路

**Files:**
- Modify: `tests/e2e/happy-path.spec.ts`
- Create: `tests/e2e/practice-flow.spec.ts`

**Step 1: Write the failing e2e test**

```ts
// 首页点刷题 -> 选题库题型 -> 开始 -> 左右分栏可见
// 右侧输入 -> 显示参考答案 -> 自评提交 -> 回筛选
```

**Step 2: Run test to verify it fails**

Run: `npm run e2e -- tests/e2e/practice-flow.spec.ts`
Expected: FAIL。

**Step 3: Write minimal implementation adjustments**

```ts
// 给关键节点补 data-testid/稳定可访问名称
```

**Step 4: Run test to verify it passes**

Run: `npm run e2e -- tests/e2e/practice-flow.spec.ts`
Expected: PASS。

**Step 5: Commit**

```bash
git add tests/e2e/happy-path.spec.ts tests/e2e/practice-flow.spec.ts
git commit -m "test(e2e): cover practice filter-to-submit flow"
```

### Task 10: 文档更新与总体验证

**Files:**
- Modify: `README.md`
- Modify: `docs/runbooks/local-start-and-backup.md`

**Step 1: Update docs**

```md
- 新增刷题模式说明：筛选后单题、左题右纸、0-5 自评
- 草稿机制：按题目ID本地自动保存与恢复
```

**Step 2: Run verification suite**

Run:
- `npm run typecheck`
- `npm run test`
- `npm run e2e -- tests/e2e/happy-path.spec.ts tests/e2e/question-management-flow.spec.ts tests/e2e/practice-flow.spec.ts`

Expected: 全部 PASS。

**Step 3: Commit**

```bash
git add README.md docs/runbooks/local-start-and-backup.md
git commit -m "docs(practice): add practice flow and grid-paper usage guide"
```
