import { afterAll, beforeEach, expect, test } from "vitest";

import { GET } from "@/app/api/practice/next/route";
import prisma from "@/server/db/client";

let bankId = "";

beforeEach(async () => {
  await prisma.practiceItemLog.deleteMany();
  await prisma.practiceSession.deleteMany();
  await prisma.reviewLog.deleteMany();
  await prisma.reviewCard.deleteMany();
  await prisma.questionMaterial.deleteMany();
  await prisma.question.deleteMany();
  await prisma.questionBank.deleteMany();
  await prisma.user.deleteMany();

  const bank = await prisma.questionBank.create({
    data: {
      name: "刷题题库"
    }
  });
  bankId = bank.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

test("practice next returns 400 when bankId is missing", async () => {
  const res = await GET(new Request("http://localhost/api/practice/next"));
  const body = await res.json();

  expect(res.status).toBe(400);
  expect(body.message).toBe("bankId is required");
});

test("practice next returns 404 when no questions match filters", async () => {
  const res = await GET(new Request(`http://localhost/api/practice/next?bankId=${bankId}&type=策论文`));
  const body = await res.json();

  expect(res.status).toBe(404);
  expect(body.message).toBe("当前筛选下暂无题目");
});

test("practice next returns one random question and auto user", async () => {
  await prisma.question.create({
    data: {
      bankId,
      summary: "策论文摘要",
      prompt: "策论文问题",
      scoreValue: 20,
      wordLimit: "1200",
      questionType: "策论文",
      referenceAnswer: "参考答案",
      materials: {
        create: [{ seq: 1, content: "材料1" }]
      }
    }
  });

  await prisma.question.create({
    data: {
      bankId,
      summary: "公文摘要",
      prompt: "公文问题",
      scoreValue: 10,
      wordLimit: "600",
      questionType: "公文",
      materials: {
        create: [{ seq: 1, content: "材料2" }]
      }
    }
  });

  const res = await GET(new Request(`http://localhost/api/practice/next?bankId=${bankId}&type=策论文`));
  const body = await res.json();

  expect(res.status).toBe(200);
  expect(typeof body.userId).toBe("string");
  expect(body.question.summary).toBe("策论文摘要");
  expect(body.question.materials).toHaveLength(1);
  expect(body.question.questionType).toBe("策论文");
});
