import { afterAll, beforeEach, expect, test } from "vitest";

import { GET } from "@/app/api/review/queue/route";
import prisma from "@/server/db/client";

let userId = "";
let dueQuestionId = "";

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
      email: "review@example.com",
      passwordHash: "plain"
    }
  });
  userId = user.id;

  const bank = await prisma.questionBank.create({
    data: { name: "复习题库" }
  });

  const dueQuestion = await prisma.question.create({
    data: {
      bankId: bank.id,
      summary: "到期题",
      prompt: "题目1",
      scoreValue: 10,
      wordLimit: "800",
      questionType: "申论",
      materials: {
        create: [{ seq: 1, content: "材料1" }]
      }
    }
  });

  const futureQuestion = await prisma.question.create({
    data: {
      bankId: bank.id,
      summary: "未到期题",
      prompt: "题目2",
      scoreValue: 10,
      wordLimit: "800",
      questionType: "申论",
      materials: {
        create: [{ seq: 1, content: "材料2" }]
      }
    }
  });

  dueQuestionId = dueQuestion.id;

  await prisma.reviewCard.create({
    data: {
      userId,
      questionId: dueQuestion.id,
      dueAt: new Date(Date.now() - 60_000),
      lastScore: 2
    }
  });

  await prisma.reviewCard.create({
    data: {
      userId,
      questionId: futureQuestion.id,
      dueAt: new Date(Date.now() + 86_400_000),
      lastScore: 4
    }
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

test("review queue returns due cards only", async () => {
  const req = new Request(`http://localhost/api/review/queue?userId=${userId}`, {
    method: "GET"
  });

  const res = await GET(req);
  const body = await res.json();

  expect(res.status).toBe(200);
  expect(body.items).toHaveLength(1);
  expect(body.items[0].questionId).toBe(dueQuestionId);
});
