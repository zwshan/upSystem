# Question Management Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a production-ready question management module with list-first editing, robust JSON import workflow, batch operations, and fully consistent Dark glass UI with the existing homepage.

**Architecture:** Extend existing modular monolith boundaries: API routes under `src/app/api`, domain logic under `src/server/domain`, data access via Prisma. Frontend uses Next.js App Router pages and shared CSS token strategy so management pages inherit the same visual language as homepage.

**Tech Stack:** Next.js (App Router) + TypeScript, Prisma + SQLite, Zod, Vitest + Testing Library, Playwright.

---

### Task 1: Establish Shared Theme Tokens for Visual Consistency

**Files:**
- Modify: `src/app/globals.css`
- Create: `src/app/theme.css`
- Modify: `src/app/page.tsx`
- Test: `tests/ui/homepage.test.tsx`

**Step 1: Write the failing test**

```tsx
test("homepage uses shared theme class", () => {
  render(<HomePage />);
  expect(document.querySelector("[data-theme='glass-dark']")).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/ui/homepage.test.tsx`  
Expected: FAIL with missing `data-theme='glass-dark'`.

**Step 3: Write minimal implementation**

```tsx
<main data-theme="glass-dark" className={styles.page}>
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- tests/ui/homepage.test.tsx`  
Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/globals.css src/app/theme.css src/app/page.tsx tests/ui/homepage.test.tsx
git commit -m "feat(ui): introduce shared dark glass theme token"
```

### Task 2: Add Question Type Dictionary Model and Migration

**Files:**
- Modify: `prisma/schema.prisma`
- Test: `tests/domain/schema-shape.test.ts`

**Step 1: Write the failing test**

```ts
test("schema includes question type dictionary model", () => {
  const schema = readFileSync(resolve(process.cwd(), "prisma/schema.prisma"), "utf8");
  expect(schema).toContain("model QuestionTypeDict");
  expect(schema).toContain("isBuiltin");
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/domain/schema-shape.test.ts`  
Expected: FAIL because model missing.

**Step 3: Write minimal implementation**

```prisma
model QuestionTypeDict {
  id        String   @id @default(cuid())
  name      String   @unique
  isBuiltin Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

**Step 4: Run test to verify it passes**

Run: `npm run prisma:push && npm run test -- tests/domain/schema-shape.test.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add prisma/schema.prisma tests/domain/schema-shape.test.ts
git commit -m "feat(db): add question type dictionary model"
```

### Task 3: Build Question List Query API with Filters

**Files:**
- Create: `src/app/api/questions/list/route.ts`
- Create: `src/server/domain/questions/list-query-schema.ts`
- Test: `tests/api/questions-list.test.ts`

**Step 1: Write the failing test**

```ts
test("list api returns filtered questions by type and keyword", async () => {
  const req = new Request("http://localhost/api/questions/list?type=策论文&keyword=摘要");
  const res = await GET(req);
  expect(res.status).toBe(200);
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/api/questions-list.test.ts`  
Expected: FAIL because route not found.

**Step 3: Write minimal implementation**

```ts
const items = await prisma.question.findMany({ where, orderBy: { updatedAt: "desc" } });
return Response.json({ items, total: items.length });
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- tests/api/questions-list.test.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/api/questions/list/route.ts src/server/domain/questions/list-query-schema.ts tests/api/questions-list.test.ts
git commit -m "feat(questions): add list api with filters and search"
```

### Task 4: Implement Question Detail/Update/Delete APIs

**Files:**
- Create: `src/app/api/questions/[id]/route.ts`
- Test: `tests/api/question-detail-update-delete.test.ts`

**Step 1: Write the failing test**

```ts
test("patch question updates summary and materials", async () => {
  const res = await PATCH(new Request("http://localhost/api/questions/id", { method: "PATCH", body: JSON.stringify(payload) }), { params: { id }});
  expect(res.status).toBe(200);
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/api/question-detail-update-delete.test.ts`  
Expected: FAIL because dynamic route missing.

**Step 3: Write minimal implementation**

```ts
await prisma.question.update({ where: { id }, data: { summary, ... } });
await prisma.questionMaterial.deleteMany({ where: { questionId: id } });
await prisma.questionMaterial.createMany({ data: materials });
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- tests/api/question-detail-update-delete.test.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/api/questions/[id]/route.ts tests/api/question-detail-update-delete.test.ts
git commit -m "feat(questions): add detail update and permanent delete api"
```

### Task 5: Add Batch Update and Batch Delete APIs

**Files:**
- Create: `src/app/api/questions/batch-update/route.ts`
- Create: `src/app/api/questions/batch-delete/route.ts`
- Test: `tests/api/questions-batch.test.ts`

**Step 1: Write the failing test**

```ts
test("batch update changes type and tags for selected ids", async () => {
  const res = await POST(req);
  expect(res.status).toBe(200);
  expect(data.affectedCount).toBe(2);
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/api/questions-batch.test.ts`  
Expected: FAIL because routes missing.

**Step 3: Write minimal implementation**

```ts
await prisma.question.updateMany({ where: { id: { in: ids } }, data });
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- tests/api/questions-batch.test.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/api/questions/batch-update/route.ts src/app/api/questions/batch-delete/route.ts tests/api/questions-batch.test.ts
git commit -m "feat(questions): add batch update and delete apis"
```

### Task 6: Enhance Import API with Dry-Run and Rich Report

**Files:**
- Modify: `src/app/api/questions/import/route.ts`
- Modify: `src/server/domain/importer/question-importer.ts`
- Test: `tests/api/questions-import.test.ts`

**Step 1: Write the failing test**

```ts
test("import dryRun returns counts without writing database", async () => {
  const res = await POST(reqWithDryRun);
  expect(data.importedCount).toBe(0);
  expect(data.validCount).toBe(1);
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/api/questions-import.test.ts`  
Expected: FAIL because `dryRun` not handled.

**Step 3: Write minimal implementation**

```ts
if (dryRun) return Response.json({ validCount, errorCount, errors, importedCount: 0 });
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- tests/api/questions-import.test.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/api/questions/import/route.ts src/server/domain/importer/question-importer.ts tests/api/questions-import.test.ts
git commit -m "feat(import): add dry-run and enriched import report"
```

### Task 7: Add Question Type Dictionary APIs

**Files:**
- Create: `src/app/api/question-types/route.ts`
- Test: `tests/api/question-types.test.ts`

**Step 1: Write the failing test**

```ts
test("post question type creates custom type", async () => {
  const res = await POST(new Request(url, { method: "POST", body: JSON.stringify({ name: "自定义类型" }) }));
  expect(res.status).toBe(201);
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/api/question-types.test.ts`  
Expected: FAIL because route missing.

**Step 3: Write minimal implementation**

```ts
const item = await prisma.questionTypeDict.create({ data: { name, isBuiltin: false } });
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- tests/api/question-types.test.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/api/question-types/route.ts tests/api/question-types.test.ts
git commit -m "feat(question-types): add dictionary list/create apis"
```

### Task 8: Build List-First Banks Page with Drawer Editor

**Files:**
- Modify: `src/app/banks/page.tsx`
- Create: `src/app/banks/banks.module.css`
- Create: `src/app/banks/components/question-drawer.tsx`
- Test: `tests/ui/banks-page.test.tsx`

**Step 1: Write the failing test**

```tsx
test("banks page renders list, filters, and drawer trigger", async () => {
  render(<BanksPage />);
  expect(screen.getByPlaceholderText("搜索摘要或问题")).toBeInTheDocument();
  expect(screen.getByText("新建题目")).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/ui/banks-page.test.tsx`  
Expected: FAIL because page is placeholder.

**Step 3: Write minimal implementation**

```tsx
<input placeholder="搜索摘要或问题" />
<button>新建题目</button>
<button>导入 JSON</button>
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- tests/ui/banks-page.test.tsx`  
Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/banks/page.tsx src/app/banks/banks.module.css src/app/banks/components/question-drawer.tsx tests/ui/banks-page.test.tsx
git commit -m "feat(banks-ui): add list-first management page and drawer editor shell"
```

### Task 9: Implement Batch Toolbar and Import Modal UX

**Files:**
- Modify: `src/app/banks/page.tsx`
- Create: `src/app/banks/components/import-modal.tsx`
- Create: `src/app/banks/components/batch-toolbar.tsx`
- Test: `tests/ui/banks-batch-and-import.test.tsx`

**Step 1: Write the failing test**

```tsx
test("selecting rows enables batch toolbar actions", async () => {
  render(<BanksPage />);
  // simulate selection
  expect(screen.getByText("批量操作")).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/ui/banks-batch-and-import.test.tsx`  
Expected: FAIL because toolbar/modal not implemented.

**Step 3: Write minimal implementation**

```tsx
{selectedIds.length > 0 && <BatchToolbar ... />}
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- tests/ui/banks-batch-and-import.test.tsx`  
Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/banks/page.tsx src/app/banks/components/import-modal.tsx src/app/banks/components/batch-toolbar.tsx tests/ui/banks-batch-and-import.test.tsx
git commit -m "feat(banks-ui): add import modal and batch toolbar interactions"
```

### Task 10: End-to-End Flow and Documentation

**Files:**
- Create: `tests/e2e/question-management-flow.spec.ts`
- Modify: `docs/runbooks/local-start-and-backup.md`
- Modify: `README.md`

**Step 1: Write the failing test**

```ts
test("import -> edit -> batch update -> delete flow works", async ({ page }) => {
  await page.goto("/banks");
  await expect(page.getByRole("heading", { name: "题库管理" })).toBeVisible();
});
```

**Step 2: Run test to verify it fails**

Run: `npm run e2e -- tests/e2e/question-management-flow.spec.ts`  
Expected: FAIL until flow implemented.

**Step 3: Write minimal implementation**

```md
Update runbook with question management operations and troubleshooting.
```

**Step 4: Run tests to verify it passes**

Run: `npm run typecheck && npm run test && npm run e2e -- tests/e2e/question-management-flow.spec.ts`  
Expected: All PASS.

**Step 5: Commit**

```bash
git add tests/e2e/question-management-flow.spec.ts docs/runbooks/local-start-and-backup.md README.md
git commit -m "test(docs): add question management e2e and runbook"
```

## Global Verification Checklist
- Run: `npm run prisma:push` -> expected schema synced.
- Run: `npm run typecheck` -> expected no TypeScript errors.
- Run: `npm run test` -> expected all vitest suites pass.
- Run: `npm run e2e -- tests/e2e/happy-path.spec.ts tests/e2e/question-management-flow.spec.ts` -> expected all e2e pass.

## Milestones
- Milestone A: Task 1-3 (theme + schema + list API)
- Milestone B: Task 4-7 (CRUD, batch, import dry-run, question-type API)
- Milestone C: Task 8-9 (banks page full interactions)
- Milestone D: Task 10 (e2e + docs)
