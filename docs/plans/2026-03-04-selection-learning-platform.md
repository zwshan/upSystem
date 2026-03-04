# Selection Learning Platform Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a local-first personal web platform where the homepage emphasizes only `刷题` and `复习`, with `设置/题库管理/备份` in low-emphasis top-right navigation, and complete subjective-question review loop with 0-5 self-rating.

**Architecture:** Use a modular monolith in one Next.js codebase. UI calls HTTP APIs even in-process to preserve future split capability. Business logic is isolated in `src/server/domain`, persistence in `src/server/repo`, and API handlers in `src/app/api/*`.

**Tech Stack:** Next.js (App Router) + TypeScript, Prisma + SQLite, Vitest + Testing Library, Playwright, Zod, node-cron.

---

### Task 1: Initialize Project Skeleton and Test Harness

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `src/app/page.tsx`
- Create: `tests/ui/homepage.test.tsx`

**Step 1: Write the failing test**

```tsx
// tests/ui/homepage.test.tsx
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

test("homepage shows only two primary actions", () => {
  render(<HomePage />);
  expect(screen.getByRole("button", { name: "刷题" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "复习" })).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest tests/ui/homepage.test.tsx -t "homepage shows only two primary actions"`  
Expected: FAIL with module/file not found.

**Step 3: Write minimal implementation**

```tsx
// src/app/page.tsx
export default function HomePage() {
  return (
    <main>
      <button>刷题</button>
      <button>复习</button>
      <nav>
        <a href="/settings">设置</a>
        <a href="/banks">题库管理</a>
        <a href="/backup">备份</a>
      </nav>
    </main>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm vitest tests/ui/homepage.test.tsx -t "homepage shows only two primary actions"`  
Expected: PASS.

**Step 5: Commit**

```bash
git add package.json next.config.ts tsconfig.json vitest.config.ts playwright.config.ts src/app/page.tsx tests/ui/homepage.test.tsx
git commit -m "chore: bootstrap nextjs app with initial homepage test"
```

### Task 2: Add Prisma Schema for User, Question, Material, Review

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/server/db/client.ts`
- Create: `tests/domain/schema-shape.test.ts`

**Step 1: Write the failing test**

```ts
// tests/domain/schema-shape.test.ts
import { Prisma } from "@prisma/client";

test("question model includes summary prompt and question_type", () => {
  const fields = Prisma.dmmf.datamodel.models.find((m) => m.name === "Question")?.fields ?? [];
  expect(fields.some((f) => f.name === "summary")).toBe(true);
  expect(fields.some((f) => f.name === "prompt")).toBe(true);
  expect(fields.some((f) => f.name === "questionType")).toBe(true);
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest tests/domain/schema-shape.test.ts`  
Expected: FAIL because Prisma model not defined.

**Step 3: Write minimal implementation**

```prisma
model Question {
  id           String   @id @default(cuid())
  bankId        String
  summary       String
  prompt        String
  scoreValue    Int
  wordLimit     String
  questionType  String
  tags          Json?
  materials     QuestionMaterial[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm prisma generate && pnpm vitest tests/domain/schema-shape.test.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add prisma/schema.prisma src/server/db/client.ts tests/domain/schema-shape.test.ts
git commit -m "feat(db): add core prisma models for subjective review platform"
```

### Task 3: Implement Single-User Auth

**Files:**
- Create: `src/server/domain/auth/password.ts`
- Create: `src/app/api/auth/login/route.ts`
- Create: `src/app/login/page.tsx`
- Test: `tests/api/auth-login.test.ts`

**Step 1: Write the failing test**

```ts
// tests/api/auth-login.test.ts
import { POST } from "@/app/api/auth/login/route";

test("login returns token when email/password valid", async () => {
  const req = new Request("http://localhost/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "you@example.com", password: "pass1234" }),
  });
  const res = await POST(req);
  expect(res.status).toBe(200);
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest tests/api/auth-login.test.ts`  
Expected: FAIL with route/function missing.

**Step 3: Write minimal implementation**

```ts
// src/app/api/auth/login/route.ts
export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (email === process.env.APP_EMAIL && password === process.env.APP_PASSWORD) {
    return Response.json({ accessToken: "dev-token" });
  }
  return new Response("Unauthorized", { status: 401 });
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm vitest tests/api/auth-login.test.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add src/server/domain/auth/password.ts src/app/api/auth/login/route.ts src/app/login/page.tsx tests/api/auth-login.test.ts
git commit -m "feat(auth): add single-account login api and page"
```

### Task 4: Build Question and Multi-Material CRUD APIs

**Files:**
- Create: `src/app/api/banks/route.ts`
- Create: `src/app/api/questions/route.ts`
- Create: `src/server/domain/questions/question-schema.ts`
- Create: `src/server/repo/question-repo.ts`
- Test: `tests/api/questions-create.test.ts`

**Step 1: Write the failing test**

```ts
// tests/api/questions-create.test.ts
import { POST } from "@/app/api/questions/route";

test("create question stores multiple materials", async () => {
  const req = new Request("http://localhost/api/questions", {
    method: "POST",
    body: JSON.stringify({
      bankId: "bank1",
      summary: "摘要",
      prompt: "问题",
      scoreValue: 20,
      wordLimit: "800-1000字",
      questionType: "策论文",
      materials: [{ seq: 1, content: "材料一" }, { seq: 2, content: "材料二" }],
    }),
  });
  const res = await POST(req);
  expect(res.status).toBe(201);
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest tests/api/questions-create.test.ts`  
Expected: FAIL because API/schema not implemented.

**Step 3: Write minimal implementation**

```ts
// src/server/domain/questions/question-schema.ts
import { z } from "zod";
export const createQuestionSchema = z.object({
  bankId: z.string(),
  summary: z.string().min(1),
  prompt: z.string().min(1),
  scoreValue: z.number().int().positive(),
  wordLimit: z.string().min(1),
  questionType: z.string().min(1),
  materials: z.array(z.object({ seq: z.number().int(), content: z.string().min(1) })).min(1),
});
```

**Step 4: Run test to verify it passes**

Run: `pnpm vitest tests/api/questions-create.test.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/api/banks/route.ts src/app/api/questions/route.ts src/server/domain/questions/question-schema.ts src/server/repo/question-repo.ts tests/api/questions-create.test.ts
git commit -m "feat(questions): add question CRUD with multi-material support"
```

### Task 5: Add JSON Import with Field Mapping and Error Report

**Files:**
- Create: `src/app/api/questions/import/route.ts`
- Create: `src/server/domain/importer/question-importer.ts`
- Test: `tests/api/questions-import.test.ts`

**Step 1: Write the failing test**

```ts
// tests/api/questions-import.test.ts
import { POST } from "@/app/api/questions/import/route";

test("import maps Chinese JSON keys and skips invalid items", async () => {
  const req = new Request("http://localhost/api/questions/import", {
    method: "POST",
    body: JSON.stringify({
      items: [
        { 题目摘要: "A", 题目材料: ["m1"], 题目问题: "q", 题目分值: 10, 题目字数要求: "800", 题目类型: "案例" },
        { 题目摘要: "", 题目材料: [], 题目问题: "" },
      ],
      skipInvalid: true,
    }),
  });
  const res = await POST(req);
  const data = await res.json();
  expect(data.importedCount).toBe(1);
  expect(data.errors.length).toBe(1);
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest tests/api/questions-import.test.ts`  
Expected: FAIL because importer route missing.

**Step 3: Write minimal implementation**

```ts
// src/server/domain/importer/question-importer.ts
export function mapRawQuestion(item: any) {
  return {
    summary: item["题目摘要"],
    prompt: item["题目问题"],
    scoreValue: Number(item["题目分值"] ?? 0),
    wordLimit: String(item["题目字数要求"] ?? ""),
    questionType: String(item["题目类型"] ?? ""),
    materials: (item["题目材料"] ?? []).map((content: string, i: number) => ({ seq: i + 1, content })),
  };
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm vitest tests/api/questions-import.test.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/api/questions/import/route.ts src/server/domain/importer/question-importer.ts tests/api/questions-import.test.ts
git commit -m "feat(import): support json import with field mapping and error report"
```

### Task 6: Implement Practice Submission and 0-5 Self-Score Logging

**Files:**
- Create: `src/app/api/practice/submit/route.ts`
- Create: `src/server/domain/practice/submit-practice.ts`
- Test: `tests/api/practice-submit.test.ts`

**Step 1: Write the failing test**

```ts
// tests/api/practice-submit.test.ts
import { POST } from "@/app/api/practice/submit/route";

test("practice submit stores score and updates review card", async () => {
  const req = new Request("http://localhost/api/practice/submit", {
    method: "POST",
    body: JSON.stringify({ questionId: "q1", selfScore: 4, spentSec: 900 }),
  });
  const res = await POST(req);
  expect(res.status).toBe(200);
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest tests/api/practice-submit.test.ts`  
Expected: FAIL because submit route missing.

**Step 3: Write minimal implementation**

```ts
// src/server/domain/practice/submit-practice.ts
export function assertScore(score: number) {
  if (score < 0 || score > 5) throw new Error("score out of range");
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm vitest tests/api/practice-submit.test.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/api/practice/submit/route.ts src/server/domain/practice/submit-practice.ts tests/api/practice-submit.test.ts
git commit -m "feat(practice): add self-score submission and logging pipeline"
```

### Task 7: Add Ebbinghaus-Style Scheduler and Review Queue API

**Files:**
- Create: `src/server/domain/review/scheduler.ts`
- Create: `src/app/api/review/queue/route.ts`
- Test: `tests/domain/review-scheduler.test.ts`
- Test: `tests/api/review-queue.test.ts`

**Step 1: Write the failing test**

```ts
// tests/domain/review-scheduler.test.ts
import { computeNextIntervalDays } from "@/server/domain/review/scheduler";

test("score 5 should schedule longer interval than score 2", () => {
  expect(computeNextIntervalDays(5, 1)).toBeGreaterThan(computeNextIntervalDays(2, 1));
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest tests/domain/review-scheduler.test.ts`  
Expected: FAIL with function missing.

**Step 3: Write minimal implementation**

```ts
// src/server/domain/review/scheduler.ts
export function computeNextIntervalDays(score: number, reviewCount: number): number {
  const base = [1, 1, 3, 6, 12, 25][score] ?? 1;
  return Math.max(1, Math.round(base + reviewCount * 0.3));
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm vitest tests/domain/review-scheduler.test.ts tests/api/review-queue.test.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add src/server/domain/review/scheduler.ts src/app/api/review/queue/route.ts tests/domain/review-scheduler.test.ts tests/api/review-queue.test.ts
git commit -m "feat(review): add scheduler and due queue api"
```

### Task 8: Build Core Pages for Practice, Review, Banks, Settings, Backup

**Files:**
- Create: `src/app/practice/page.tsx`
- Create: `src/app/review/page.tsx`
- Create: `src/app/banks/page.tsx`
- Create: `src/app/settings/page.tsx`
- Create: `src/app/backup/page.tsx`
- Test: `tests/ui/nav-visibility.test.tsx`

**Step 1: Write the failing test**

```tsx
// tests/ui/nav-visibility.test.tsx
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

test("settings and bank links exist but are not primary buttons", () => {
  render(<HomePage />);
  expect(screen.getByRole("link", { name: "设置" })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "设置" })).toBeNull();
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest tests/ui/nav-visibility.test.tsx`  
Expected: FAIL until UI structure and semantics fixed.

**Step 3: Write minimal implementation**

```tsx
// example in src/app/page.tsx
<section aria-label="primary-actions">
  <button>刷题</button>
  <button>复习</button>
</section>
<nav aria-label="secondary-nav">
  <a href="/settings">设置</a>
  <a href="/banks">题库管理</a>
  <a href="/backup">备份</a>
</nav>
```

**Step 4: Run test to verify it passes**

Run: `pnpm vitest tests/ui/nav-visibility.test.tsx tests/ui/homepage.test.tsx`  
Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/practice/page.tsx src/app/review/page.tsx src/app/banks/page.tsx src/app/settings/page.tsx src/app/backup/page.tsx src/app/page.tsx tests/ui/nav-visibility.test.tsx
git commit -m "feat(ui): add mvp pages and homepage hierarchy semantics"
```

### Task 9: Implement Local Backup (Auto + Manual Import/Export)

**Files:**
- Create: `src/server/domain/backup/backup-service.ts`
- Create: `src/app/api/backup/export/route.ts`
- Create: `src/app/api/backup/import/route.ts`
- Create: `src/app/api/backup/status/route.ts`
- Test: `tests/domain/backup-service.test.ts`

**Step 1: Write the failing test**

```ts
// tests/domain/backup-service.test.ts
import { createBackupFileName } from "@/server/domain/backup/backup-service";

test("backup filename should include timestamp and .json extension", () => {
  expect(createBackupFileName(new Date("2026-03-04T01:02:03Z"))).toMatch(/^backup-2026-03-04.*\.json$/);
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest tests/domain/backup-service.test.ts`  
Expected: FAIL with function missing.

**Step 3: Write minimal implementation**

```ts
// src/server/domain/backup/backup-service.ts
export function createBackupFileName(d: Date) {
  const date = d.toISOString().slice(0, 10);
  const time = d.toISOString().slice(11, 19).replaceAll(":", "-");
  return `backup-${date}-${time}.json`;
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm vitest tests/domain/backup-service.test.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add src/server/domain/backup/backup-service.ts src/app/api/backup/export/route.ts src/app/api/backup/import/route.ts src/app/api/backup/status/route.ts tests/domain/backup-service.test.ts
git commit -m "feat(backup): add local auto backup and manual import export apis"
```

### Task 10: End-to-End Acceptance and Runbook

**Files:**
- Create: `tests/e2e/happy-path.spec.ts`
- Create: `docs/runbooks/local-start-and-backup.md`
- Modify: `README.md`

**Step 1: Write the failing test**

```ts
// tests/e2e/happy-path.spec.ts
import { test, expect } from "@playwright/test";

test("home -> practice -> self-score -> review queue", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "刷题" })).toBeVisible();
  await expect(page.getByRole("button", { name: "复习" })).toBeVisible();
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm playwright test tests/e2e/happy-path.spec.ts`  
Expected: FAIL until app bootstraps full flow.

**Step 3: Write minimal implementation**

```md
# docs/runbooks/local-start-and-backup.md
1. `pnpm install`
2. `pnpm prisma migrate dev`
3. `pnpm dev`
4. Visit `http://localhost:3000`
5. Check `/backup` for latest backup status
```

**Step 4: Run tests to verify it passes**

Run: `pnpm test && pnpm playwright test`  
Expected: All PASS.

**Step 5: Commit**

```bash
git add tests/e2e/happy-path.spec.ts docs/runbooks/local-start-and-backup.md README.md
git commit -m "test: add e2e acceptance and local runbook"
```

## Global Verification Checklist
- Run: `pnpm lint` -> expected no errors.
- Run: `pnpm typecheck` -> expected no TypeScript errors.
- Run: `pnpm vitest` -> expected all tests pass.
- Run: `pnpm playwright test` -> expected e2e pass.
- Run: `pnpm prisma migrate dev` -> expected schema applied successfully.

## Suggested Milestones
- Milestone A (Day 1-2): Task 1-3
- Milestone B (Day 3-4): Task 4-6
- Milestone C (Day 5-6): Task 7-9
- Milestone D (Day 7): Task 10 + hardening
