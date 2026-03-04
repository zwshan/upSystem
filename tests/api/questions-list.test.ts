import { afterAll, beforeEach, expect, test } from "vitest";

import { GET } from "@/app/api/questions/list/route";
import prisma from "@/server/db/client";

beforeEach(async () => {
  await prisma.practiceItemLog.deleteMany();
  await prisma.reviewCard.deleteMany();
  await prisma.questionMaterial.deleteMany();
  await prisma.question.deleteMany();
  await prisma.questionBank.deleteMany();

  const bank = await prisma.questionBank.create({
    data: { name: "列表题库" }
  });

  await prisma.question.create({
    data: {
      bankId: bank.id,
      summary: "这是策论文摘要",
      prompt: "这是策论文问题",
      scoreValue: 20,
      wordLimit: "1200",
      questionType: "策论文",
      materials: {
        create: [{ seq: 1, content: "材料1" }]
      }
    }
  });

  await prisma.question.create({
    data: {
      bankId: bank.id,
      summary: "这是公文摘要",
      prompt: "这是公文问题",
      scoreValue: 15,
      wordLimit: "800",
      questionType: "公文",
      materials: {
        create: [{ seq: 1, content: "材料2" }]
      }
    }
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

test("list api returns filtered questions by type and keyword", async () => {
  const req = new Request("http://localhost/api/questions/list?type=策论文&keyword=摘要", {
    method: "GET"
  });

  const res = await GET(req);
  const body = await res.json();

  expect(res.status).toBe(200);
  expect(body.items).toHaveLength(1);
  expect(body.items[0].questionType).toBe("策论文");
});
