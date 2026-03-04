import { afterAll, beforeEach, expect, test } from "vitest";

import { DELETE, GET, PATCH } from "@/app/api/questions/[id]/route";
import prisma from "@/server/db/client";

let questionId = "";

beforeEach(async () => {
  await prisma.practiceItemLog.deleteMany();
  await prisma.reviewCard.deleteMany();
  await prisma.questionMaterial.deleteMany();
  await prisma.question.deleteMany();
  await prisma.questionBank.deleteMany();

  const bank = await prisma.questionBank.create({
    data: { name: "详情题库" }
  });

  const question = await prisma.question.create({
    data: {
      bankId: bank.id,
      summary: "原始摘要",
      prompt: "原始问题",
      scoreValue: 10,
      wordLimit: "800",
      questionType: "策论文",
      materials: {
        create: [{ seq: 1, content: "原始材料" }]
      }
    }
  });

  questionId = question.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

test("get question detail by id", async () => {
  const res = await GET(new Request(`http://localhost/api/questions/${questionId}`), {
    params: Promise.resolve({ id: questionId })
  });
  const body = await res.json();

  expect(res.status).toBe(200);
  expect(body.id).toBe(questionId);
});

test("patch question updates summary and materials", async () => {
  const res = await PATCH(
    new Request(`http://localhost/api/questions/${questionId}`, {
      method: "PATCH",
      body: JSON.stringify({
        summary: "更新后的摘要",
        prompt: "更新后的问题",
        scoreValue: 25,
        wordLimit: "1200",
        questionType: "公文",
        materials: [{ seq: 1, content: "更新材料" }]
      })
    }),
    { params: Promise.resolve({ id: questionId }) }
  );

  const body = await res.json();
  expect(res.status).toBe(200);
  expect(body.summary).toBe("更新后的摘要");
  expect(body.materials).toHaveLength(1);
  expect(body.materials[0].content).toBe("更新材料");
});

test("delete question removes data permanently", async () => {
  const res = await DELETE(new Request(`http://localhost/api/questions/${questionId}`), {
    params: Promise.resolve({ id: questionId })
  });

  const remained = await prisma.question.findUnique({ where: { id: questionId } });

  expect(res.status).toBe(204);
  expect(remained).toBeNull();
});
