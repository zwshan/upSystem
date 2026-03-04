import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "vitest";

test("question model includes summary prompt and questionType", () => {
  const schemaPath = resolve(process.cwd(), "prisma/schema.prisma");
  const schema = readFileSync(schemaPath, "utf8");
  const questionBlockMatch = schema.match(/model\s+Question\s+\{([\s\S]*?)\}/);
  const questionBlock = questionBlockMatch?.[1] ?? "";

  expect(questionBlock).toContain("summary");
  expect(questionBlock).toContain("prompt");
  expect(questionBlock).toContain("questionType");
});

test("schema includes question type dictionary model", () => {
  const schemaPath = resolve(process.cwd(), "prisma/schema.prisma");
  const schema = readFileSync(schemaPath, "utf8");

  expect(schema).toContain("model QuestionTypeDict");
  expect(schema).toContain("isBuiltin");
});
