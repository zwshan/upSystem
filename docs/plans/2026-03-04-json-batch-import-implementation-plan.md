# JSON 批量导入（两步预检）Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在 `/banks` 上线可用的 JSON 批量导入闭环：上传文件、预检报告、确认导入、结果提示与列表刷新。

**Architecture:** 复用既有 `POST /api/questions/import` 接口，不新增后端 API。前端在 `ImportModal` 内实现文件读取与两步状态机，并通过 `onImported` 回调通知 `BanksPage` 刷新列表。错误提示与按钮禁用状态由弹窗本地状态统一控制。

**Tech Stack:** Next.js App Router + React hooks + TypeScript，既有导入 API，Vitest + Testing Library + Playwright。

---

### Task 1: 建立导入文件解析工具（仅 `.json`）

**Files:**
- Create: `src/app/banks/utils/import-file.ts`
- Test: `tests/ui/import-file.test.ts`

**Step 1: Write the failing test**

```ts
test("parseImportFile rejects non-json extension", async () => {
  const file = new File(["{}"], "questions.txt", { type: "text/plain" });
  await expect(parseImportFile(file)).rejects.toThrow("仅支持 JSON 文件");
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/ui/import-file.test.ts`
Expected: FAIL with missing module/function.

**Step 3: Write minimal implementation**

```ts
export async function parseImportFile(file: File): Promise<unknown[]> {
  if (!file.name.toLowerCase().endsWith(".json")) throw new Error("仅支持 JSON 文件");
  const text = await file.text();
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed)) throw new Error("导入文件必须是题目数组");
  return parsed;
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- tests/ui/import-file.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/banks/utils/import-file.ts tests/ui/import-file.test.ts
git commit -m "feat(import): add json file parser for question import"
```

### Task 2: 重构 ImportModal 为两步导入弹窗 UI

**Files:**
- Modify: `src/app/banks/components/import-modal.tsx`
- Modify: `src/app/banks/banks.module.css`
- Test: `tests/ui/import-modal-workflow.test.tsx`

**Step 1: Write the failing test**

```tsx
test("import modal shows preview and enables confirm import", async () => {
  render(<ImportModal open bankId="b1" onClose={vi.fn()} onImported={vi.fn()} />);
  // 上传文件 -> 预检后出现统计，并且确认导入按钮可用
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/ui/import-modal-workflow.test.tsx`
Expected: FAIL because modal has no workflow UI.

**Step 3: Write minimal implementation**

```tsx
// 增加：文件选择、开始预检按钮、预检报告区、确认导入按钮
// 仅渲染与状态切换先打通，不接真实请求
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- tests/ui/import-modal-workflow.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/banks/components/import-modal.tsx src/app/banks/banks.module.css tests/ui/import-modal-workflow.test.tsx
git commit -m "feat(import-ui): build two-step import modal workflow shell"
```

### Task 3: 接入预检请求（dryRun=true）并展示报告

**Files:**
- Modify: `src/app/banks/components/import-modal.tsx`
- Test: `tests/ui/import-modal-preview.test.tsx`

**Step 1: Write the failing test**

```tsx
test("preview calls import api with dryRun and renders report", async () => {
  global.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({
    dryRun: true,
    validCount: 3,
    errorCount: 1,
    skippedCount: 1,
    errors: [{ index: 2, message: "题目摘要不能为空" }]
  }), { status: 200 }));

  // 上传并点开始预检，断言 fetch body 含 dryRun:true，且页面展示统计与错误
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/ui/import-modal-preview.test.tsx`
Expected: FAIL because preview API wiring missing.

**Step 3: Write minimal implementation**

```tsx
await fetch("/api/questions/import", {
  method: "POST",
  body: JSON.stringify({ bankId, items, dryRun: true, skipInvalid: true })
});
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- tests/ui/import-modal-preview.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/banks/components/import-modal.tsx tests/ui/import-modal-preview.test.tsx
git commit -m "feat(import-ui): wire dry-run preview report"
```

### Task 4: 接入正式导入并回调刷新列表

**Files:**
- Modify: `src/app/banks/components/import-modal.tsx`
- Modify: `src/app/banks/page.tsx`
- Test: `tests/ui/banks-import-refresh.test.tsx`

**Step 1: Write the failing test**

```tsx
test("confirm import calls api and triggers list refresh callback", async () => {
  // mock preview + import responses
  // expect onImported called once after import success
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/ui/banks-import-refresh.test.tsx`
Expected: FAIL because onImported not wired.

**Step 3: Write minimal implementation**

```tsx
// ImportModal success:
await fetch("/api/questions/import", { dryRun:false, skipInvalid:true ... });
onImported?.();
onClose();

// BanksPage:
<ImportModal onImported={() => activeBankId && void loadQuestions(activeBankId)} ... />
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- tests/ui/banks-import-refresh.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/banks/components/import-modal.tsx src/app/banks/page.tsx tests/ui/banks-import-refresh.test.tsx
git commit -m "feat(import-ui): confirm import and refresh question list"
```

### Task 5: 完善错误处理与禁用状态

**Files:**
- Modify: `src/app/banks/components/import-modal.tsx`
- Test: `tests/ui/import-modal-errors-and-disabled.test.tsx`

**Step 1: Write the failing test**

```tsx
test("buttons disabled correctly and parse/api errors are shown", async () => {
  // 非 json、json 结构错误、接口失败 分别断言错误文案
  // previewing/importing 时按钮禁用
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/ui/import-modal-errors-and-disabled.test.tsx`
Expected: FAIL.

**Step 3: Write minimal implementation**

```tsx
// 统一 error 状态与 isPreviewing/isImporting
// 显示 message 优先，否则 fallback
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- tests/ui/import-modal-errors-and-disabled.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/banks/components/import-modal.tsx tests/ui/import-modal-errors-and-disabled.test.tsx
git commit -m "feat(import-ui): add robust error handling and button state guards"
```

### Task 6: 更新 e2e 导入流程

**Files:**
- Modify: `tests/e2e/question-management-flow.spec.ts`

**Step 1: Write the failing test update**

```ts
// 在题库管理流程中新增：上传 json -> 预检 -> 确认导入 -> 返回列表可见新题
```

**Step 2: Run test to verify it fails**

Run: `npm run e2e -- tests/e2e/question-management-flow.spec.ts`
Expected: FAIL before import UI is complete.

**Step 3: Write minimal implementation (if any gap remains)**

```ts
// 修正 data-testid/可访问名称，确保 e2e 可稳定定位元素
```

**Step 4: Run test to verify it passes**

Run: `npm run e2e -- tests/e2e/question-management-flow.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add tests/e2e/question-management-flow.spec.ts
git commit -m "test(e2e): cover two-step json import flow"
```

### Task 7: 文档更新与最终验证

**Files:**
- Modify: `README.md`
- Modify: `docs/runbooks/local-start-and-backup.md`

**Step 1: Write/update docs**

```md
- 导入流程：上传 json -> 开始预检 -> 确认导入 -> 自动刷新列表
- 错误策略：skipInvalid=true，错误项跳过并展示明细
```

**Step 2: Run verification suite**

Run:
- `npm run typecheck`
- `npm run test`
- `npm run e2e -- tests/e2e/happy-path.spec.ts tests/e2e/question-management-flow.spec.ts`

Expected: 全部 PASS。

**Step 3: Commit**

```bash
git add README.md docs/runbooks/local-start-and-backup.md
git commit -m "docs(import): document two-step json import workflow"
```
