import { expect, test } from "vitest";

import { parseImportFile } from "@/app/banks/utils/import-file";

test("parseImportFile rejects non-json extension", async () => {
  const file = new File(["{}"], "questions.txt", { type: "text/plain" });

  await expect(parseImportFile(file)).rejects.toThrow("仅支持 JSON 文件");
});

test("parseImportFile rejects invalid json", async () => {
  const file = new File(["{"], "questions.json", { type: "application/json" });

  await expect(parseImportFile(file)).rejects.toThrow("JSON 解析失败");
});

test("parseImportFile requires root array", async () => {
  const file = new File([JSON.stringify({ a: 1 })], "questions.json", {
    type: "application/json"
  });

  await expect(parseImportFile(file)).rejects.toThrow("导入文件必须是题目数组");
});

test("parseImportFile returns parsed array", async () => {
  const file = new File([JSON.stringify([{ 题目摘要: "A" }])], "questions.json", {
    type: "application/json"
  });

  const items = await parseImportFile(file);

  expect(items).toHaveLength(1);
  expect(items[0]).toMatchObject({ 题目摘要: "A" });
});
