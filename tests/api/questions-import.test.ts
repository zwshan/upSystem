import { afterAll, beforeEach, expect, test } from "vitest";

import { POST } from "@/app/api/questions/import/route";
import prisma from "@/server/db/client";

let bankId = "";

beforeEach(async () => {
  await prisma.practiceItemLog.deleteMany();
  await prisma.reviewCard.deleteMany();
  await prisma.questionMaterial.deleteMany();
  await prisma.question.deleteMany();
  await prisma.questionBank.deleteMany();

  const bank = await prisma.questionBank.create({
    data: {
      name: "导入题库",
      description: "JSON导入测试"
    }
  });
  bankId = bank.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

test("import maps Chinese JSON keys and skips invalid items", async () => {
  const req = new Request("http://localhost/api/questions/import", {
    method: "POST",
    body: JSON.stringify({
      bankId,
      items: [
        {
          题目摘要: "A",
          题目材料: ["m1"],
          题目问题: "q",
          题目分值: 10,
          题目字数要求: "800",
          题目类型: "案例"
        },
        {
          题目摘要: "",
          题目材料: [],
          题目问题: ""
        }
      ],
      skipInvalid: true
    })
  });

  const res = await POST(req);
  const data = await res.json();

  expect(res.status).toBe(200);
  expect(data.importedCount).toBe(1);
  expect(data.errors.length).toBe(1);
});

test("import dryRun returns counts without writing database", async () => {
  const req = new Request("http://localhost/api/questions/import", {
    method: "POST",
    body: JSON.stringify({
      bankId,
      dryRun: true,
      items: [
        {
          题目摘要: "有效题",
          题目材料: ["材料1"],
          题目问题: "问题1",
          题目分值: 10,
          题目字数要求: "800",
          题目类型: "案例"
        },
        {
          题目摘要: "",
          题目材料: [],
          题目问题: ""
        }
      ]
    })
  });

  const res = await POST(req);
  const data = await res.json();

  const count = await prisma.question.count();
  expect(res.status).toBe(200);
  expect(data.importedCount).toBe(0);
  expect(data.validCount).toBe(1);
  expect(data.errorCount).toBe(1);
  expect(count).toBe(0);
});
