import { afterAll, beforeEach, expect, test } from "vitest";

import { POST } from "@/app/api/questions/route";
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
      name: "默认题库",
      description: "测试用题库"
    }
  });
  bankId = bank.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

test("create question stores multiple materials", async () => {
  const req = new Request("http://localhost/api/questions", {
    method: "POST",
    body: JSON.stringify({
      bankId,
      summary: "摘要",
      prompt: "问题",
      scoreValue: 20,
      wordLimit: "800-1000字",
      questionType: "策论文",
      materials: [
        { seq: 1, content: "材料一" },
        { seq: 2, content: "材料二" }
      ]
    })
  });

  const res = await POST(req);
  const body = await res.json();

  expect(res.status).toBe(201);
  expect(body.materials).toHaveLength(2);
});
