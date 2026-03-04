# Question Drawer Persistence Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Connect `/banks` “新建题目” and “抽屉编辑” to real database persistence using existing question APIs while preserving the current Dark glass design language.

**Architecture:** Keep list-first page orchestration in `BanksPage`, move all create/edit form logic into a shared `QuestionForm` component, and let `QuestionDrawer` host mode-specific behavior (`create` / `edit`). Reuse existing APIs (`POST /api/questions`, `GET/PATCH /api/questions/:id`) and add only thin frontend transformation for `materialText <-> materials[]`.

**Tech Stack:** Next.js App Router + React hooks + TypeScript, existing Prisma-backed APIs, Vitest + Testing Library + Playwright.

---

### Task 1: Add Material Text Conversion Utility

**Files:**
- Create: `src/app/banks/utils/material-transform.ts`
- Test: `tests/ui/material-transform.test.ts`

**Step 1: Write the failing test**

```ts
test("split material text by blank lines into sequenced materials", () => {
  const text = "材料一\\n\\n材料二\\n\\n\\n材料三";
  const result = splitMaterialText(text);
  expect(result).toHaveLength(3);
  expect(result[0].seq).toBe(1);
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/ui/material-transform.test.ts`  
Expected: FAIL with missing module/function.

**Step 3: Write minimal implementation**

```ts
export function splitMaterialText(text: string) {
  return text
    .replaceAll("\\r\\n", "\\n")
    .split(/\\n\\s*\\n+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((content, idx) => ({ seq: idx + 1, content }));
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- tests/ui/material-transform.test.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/banks/utils/material-transform.ts tests/ui/material-transform.test.ts
git commit -m "feat(banks): add material text split/join utility"
```

### Task 2: Build Shared QuestionForm Component

**Files:**
- Create: `src/app/banks/components/question-form.tsx`
- Modify: `src/app/banks/components/question-drawer.tsx`
- Test: `tests/ui/question-form.test.tsx`

**Step 1: Write the failing test**

```tsx
test("question form validates required fields before submit", async () => {
  render(<QuestionForm mode="create" onSubmit={vi.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: "保存" }));
  expect(await screen.findByText("题目摘要不能为空")).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/ui/question-form.test.tsx`  
Expected: FAIL because component does not exist.

**Step 3: Write minimal implementation**

```tsx
if (!summary.trim()) setError("题目摘要不能为空");
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- tests/ui/question-form.test.tsx`  
Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/banks/components/question-form.tsx src/app/banks/components/question-drawer.tsx tests/ui/question-form.test.tsx
git commit -m "feat(banks): add shared question form with base validation"
```

### Task 3: Wire Create Mode to POST /api/questions

**Files:**
- Modify: `src/app/banks/page.tsx`
- Modify: `src/app/banks/components/question-drawer.tsx`
- Test: `tests/ui/banks-create-flow.test.tsx`

**Step 1: Write the failing test**

```tsx
test("create mode submits to question create api and updates list", async () => {
  global.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify(mockCreated), { status: 201 }));
  render(<BanksPage />);
  fireEvent.click(screen.getByRole("button", { name: "新建题目" }));
  // fill + submit
  expect(await screen.findByText("已保存，可继续编辑")).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/ui/banks-create-flow.test.tsx`  
Expected: FAIL because create submit is not wired.

**Step 3: Write minimal implementation**

```ts
await fetch("/api/questions", { method: "POST", body: JSON.stringify(payload) });
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- tests/ui/banks-create-flow.test.tsx`  
Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/banks/page.tsx src/app/banks/components/question-drawer.tsx tests/ui/banks-create-flow.test.tsx
git commit -m "feat(banks): wire create drawer mode to real question create api"
```

### Task 4: Wire Edit Mode to GET/PATCH /api/questions/:id

**Files:**
- Modify: `src/app/banks/page.tsx`
- Modify: `src/app/banks/components/question-drawer.tsx`
- Test: `tests/ui/banks-edit-flow.test.tsx`

**Step 1: Write the failing test**

```tsx
test("edit mode loads detail and persists updates", async () => {
  global.fetch = vi.fn()
    .mockResolvedValueOnce(new Response(JSON.stringify(mockDetail), { status: 200 }))
    .mockResolvedValueOnce(new Response(JSON.stringify(mockUpdated), { status: 200 }));
  render(<BanksPage />);
  fireEvent.click(screen.getByRole("button", { name: "编辑" }));
  expect(await screen.findByDisplayValue(mockDetail.summary)).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/ui/banks-edit-flow.test.tsx`  
Expected: FAIL because edit mode does not call GET/PATCH.

**Step 3: Write minimal implementation**

```ts
await fetch(`/api/questions/${id}`);
await fetch(`/api/questions/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- tests/ui/banks-edit-flow.test.tsx`  
Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/banks/page.tsx src/app/banks/components/question-drawer.tsx tests/ui/banks-edit-flow.test.tsx
git commit -m "feat(banks): wire edit drawer mode to real detail and update apis"
```

### Task 5: Implement Dirty Guard on Drawer Close

**Files:**
- Modify: `src/app/banks/components/question-drawer.tsx`
- Test: `tests/ui/question-drawer-dirty-guard.test.tsx`

**Step 1: Write the failing test**

```tsx
test("closing drawer with unsaved changes asks for confirmation", () => {
  const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
  render(<QuestionDrawer open ... />);
  // mutate form then close
  expect(confirmSpy).toHaveBeenCalled();
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/ui/question-drawer-dirty-guard.test.tsx`  
Expected: FAIL because no dirty guard exists.

**Step 3: Write minimal implementation**

```ts
if (dirty && !window.confirm("有未保存更改，是否放弃？")) return;
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- tests/ui/question-drawer-dirty-guard.test.tsx`  
Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/banks/components/question-drawer.tsx tests/ui/question-drawer-dirty-guard.test.tsx
git commit -m "feat(banks): add dirty-state confirmation before closing drawer"
```

### Task 6: Add Question Type Select + Custom Type Creation

**Files:**
- Modify: `src/app/banks/components/question-form.tsx`
- Test: `tests/ui/question-form-type-selector.test.tsx`

**Step 1: Write the failing test**

```tsx
test("custom question type can be created and selected", async () => {
  global.fetch = vi.fn()
    .mockResolvedValueOnce(new Response(JSON.stringify({ items: [] }), { status: 200 }))
    .mockResolvedValueOnce(new Response(JSON.stringify({ name: "自定义类型", isBuiltin: false }), { status: 201 }));
  render(<QuestionForm ... />);
  // create type
  expect(await screen.findByText("自定义类型")).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/ui/question-form-type-selector.test.tsx`  
Expected: FAIL because selector integration missing.

**Step 3: Write minimal implementation**

```ts
await fetch("/api/question-types");
await fetch("/api/question-types", { method: "POST", body: JSON.stringify({ name }) });
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- tests/ui/question-form-type-selector.test.tsx`  
Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/banks/components/question-form.tsx tests/ui/question-form-type-selector.test.tsx
git commit -m "feat(banks): support builtin and custom question types in form"
```

### Task 7: Extend E2E for Real Create/Edit Persistence

**Files:**
- Modify: `tests/e2e/question-management-flow.spec.ts`
- Modify: `docs/runbooks/local-start-and-backup.md`
- Modify: `README.md`

**Step 1: Write the failing e2e assertions**

```ts
await expect(page.getByText("已保存，可继续编辑")).toBeVisible();
await expect(page.getByRole("cell", { name: "新建后的摘要" })).toBeVisible();
```

**Step 2: Run test to verify it fails**

Run: `npm run e2e -- tests/e2e/question-management-flow.spec.ts`  
Expected: FAIL until create/edit persistence is fully wired.

**Step 3: Write minimal implementation/doc updates**

```md
Document create/edit drawer behavior and material blank-line splitting rule.
```

**Step 4: Run full verification**

Run: `npm run typecheck && npm run test && npm run e2e -- tests/e2e/happy-path.spec.ts tests/e2e/question-management-flow.spec.ts`  
Expected: All PASS.

**Step 5: Commit**

```bash
git add tests/e2e/question-management-flow.spec.ts docs/runbooks/local-start-and-backup.md README.md
git commit -m "test(docs): verify and document real create/edit drawer persistence flow"
```

## Global Verification Checklist
- Run: `npm run typecheck` -> expected no TS errors.
- Run: `npm run test` -> expected all unit/integration tests pass.
- Run: `npm run e2e -- tests/e2e/happy-path.spec.ts tests/e2e/question-management-flow.spec.ts` -> expected all e2e pass.

## Milestones
- Milestone A: Task 1-2 (shared form base + material transform)
- Milestone B: Task 3-4 (create/edit real API persistence)
- Milestone C: Task 5-6 (dirty guard + type selector enhancement)
- Milestone D: Task 7 (e2e + docs)
