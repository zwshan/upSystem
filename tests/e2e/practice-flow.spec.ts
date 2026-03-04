import { expect, test } from "@playwright/test";

test("practice flow from home to submit", async ({ page, request }) => {
  const unique = Date.now();
  const bankName = `E2E 刷题题库 ${unique}`;
  const summary = `E2E 刷题摘要 ${unique}`;

  const bankRes = await request.post("/api/banks", {
    data: {
      name: bankName,
      description: "e2e-practice"
    }
  });
  expect(bankRes.ok()).toBeTruthy();
  const bank = (await bankRes.json()) as { id: string };

  const questionTypeRes = await request.post("/api/question-types", {
    data: {
      name: "策论文"
    }
  });
  expect(questionTypeRes.ok()).toBeTruthy();

  const questionRes = await request.post("/api/questions", {
    data: {
      bankId: bank.id,
      summary,
      prompt: "请结合材料作答。",
      referenceAnswer: "参考答案示例",
      scoreValue: 20,
      wordLimit: "1200",
      questionType: "策论文",
      materials: [{ seq: 1, content: "材料一：示例材料" }]
    }
  });
  expect(questionRes.ok()).toBeTruthy();

  await page.goto("/");
  await page.getByRole("link", { name: "刷题" }).click();
  await expect(page).toHaveURL(/\/practice$/);

  await page.getByRole("combobox", { name: "题库" }).selectOption({ label: bankName });
  await page.getByRole("combobox", { name: "题型" }).selectOption("策论文");
  await page.getByRole("button", { name: "开始刷题" }).click();

  await expect(page.getByText(summary)).toBeVisible();
  await page.getByLabel("第1行第1格").fill("答");
  await page.getByRole("button", { name: "显示参考答案" }).click();
  await expect(page.getByText("参考答案示例")).toBeVisible();

  await page.getByRole("button", { name: "4分" }).click();
  await page.getByRole("button", { name: "提交自评并完成本题" }).click();

  await expect(page.getByRole("button", { name: "开始刷题" })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "题库" })).toHaveValue(bank.id);
  await expect(page.getByRole("combobox", { name: "题型" })).toHaveValue("策论文");
});
