import { expect, test } from "@playwright/test";

test("question management basic flow", async ({ page }) => {
  const unique = Date.now();
  const importedSummary = `E2E 导入摘要 ${unique}`;
  const createdSummary = `E2E 新建摘要 ${unique}`;
  const updatedSummary = `E2E 更新摘要 ${unique}`;

  await page.goto("/banks");

  await expect(page.getByRole("heading", { name: "题库管理" })).toBeVisible();
  await expect(page.getByPlaceholder("搜索摘要或问题")).toBeVisible();

  await page.getByRole("button", { name: "导入 JSON" }).click();
  await expect(page.getByRole("dialog", { name: "导入 JSON" })).toBeVisible();
  await page.getByLabel("JSON 文件").setInputFiles({
    name: "import.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify([
        {
          题目摘要: importedSummary,
          题目材料: ["材料1"],
          题目问题: "问题1",
          题目分值: 10,
          题目字数要求: "800",
          题目类型: "案例"
        }
      ])
    )
  });
  await page.getByRole("button", { name: "开始预检" }).click();
  await expect(page.getByText("总数：1")).toBeVisible();
  await page.getByRole("button", { name: "确认导入" }).click();
  await expect(page.getByText("已导入 1 条，跳过 0 条")).toBeVisible();
  await expect(page.getByRole("cell", { name: importedSummary })).toBeVisible();

  await page.getByRole("link", { name: "新建题目" }).click();
  await expect(page.getByRole("heading", { name: "新建题目" })).toBeVisible();

  await page.getByLabel("题目摘要").fill(createdSummary);
  await page.getByLabel("题目问题").fill("E2E 新建问题");
  await page.getByLabel("题目分值").fill("20");
  await page.getByLabel("字数要求").fill("800-1000");
  await page.getByLabel("题目类型").fill("策论文");
  await page.getByLabel("题目材料").fill("材料一");
  await page.getByRole("button", { name: "保存" }).click();

  await expect(page.getByText("已保存")).toBeVisible();
  await page.waitForTimeout(1400);
  await expect(page.getByText("已保存")).toHaveCount(0);

  await page.getByLabel("题目摘要").fill(updatedSummary);
  await page.getByRole("button", { name: "保存" }).click();
  await expect(page.getByText("已保存")).toBeVisible();

  await page.getByRole("button", { name: "返回题库" }).click();
  await expect(page).toHaveURL(/\/banks$/);

  const batchDelete = page.getByRole("button", { name: "批量删除" });
  await expect(batchDelete).toBeDisabled();
  await page
    .locator("tbody tr", { hasText: updatedSummary })
    .locator("input[type='checkbox']")
    .first()
    .click();
  await expect(batchDelete).toBeEnabled();
  await batchDelete.click();
  await expect(page.getByText(updatedSummary)).toHaveCount(0);
});
