import { afterAll, beforeEach, expect, test } from "vitest";

import { POST } from "@/app/api/practice/submit/route";
import prisma from "@/server/db/client";

let userId = "";
let questionId = "";

beforeEach(async () => {
  await prisma.practiceItemLog.deleteMany();
  await prisma.practiceSession.deleteMany();
  await prisma.reviewLog.deleteMany();
  await prisma.reviewCard.deleteMany();
  await prisma.questionMaterial.deleteMany();
  await prisma.question.deleteMany();
  await prisma.questionBank.deleteMany();
  await prisma.user.deleteMany();

  const user = await prisma.user.create({
    data: {
      email: "you@example.com",
      passwordHash: "plain"
    }
  });

  const bank = await prisma.questionBank.create({
    data: {
      name: "练习题库"
    }
  });

  const question = await prisma.question.create({
    data: {
      bankId: bank.id,
      summary: "测试摘要",
      prompt: "测试问题",
      scoreValue: 10,
      wordLimit: "800",
      questionType: "申论",
      materials: {
        create: [{ seq: 1, content: "材料一" }]
      }
    }
  });

  userId = user.id;
  questionId = question.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

test("practice submit stores score and updates review card", async () => {
  const req = new Request("http://localhost/api/practice/submit", {
    method: "POST",
    body: JSON.stringify({ questionId, userId, selfScore: 4, spentSec: 900 })
  });

  const res = await POST(req);
  const body = await res.json();

  const card = await prisma.reviewCard.findFirst({
    where: { questionId, userId }
  });

  expect(res.status).toBe(200);
  expect(typeof body.sessionId).toBe("string");
  expect(card?.lastScore).toBe(4);
  expect(card?.reviewCount).toBe(1);
});
