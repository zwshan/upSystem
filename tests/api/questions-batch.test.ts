import { afterAll, beforeEach, expect, test } from "vitest";

import { POST as batchDeletePOST } from "@/app/api/questions/batch-delete/route";
import { POST as batchUpdatePOST } from "@/app/api/questions/batch-update/route";
import prisma from "@/server/db/client";

let questionIds: string[] = [];

beforeEach(async () => {
  await prisma.practiceItemLog.deleteMany();
  await prisma.reviewCard.deleteMany();
  await prisma.questionMaterial.deleteMany();
  await prisma.question.deleteMany();
  await prisma.questionBank.deleteMany();

  const bank = await prisma.questionBank.create({
    data: { name: "批量题库" }
  });

  const created = await Promise.all(
    ["题1", "题2", "题3"].map((summary, index) =>
      prisma.question.create({
        data: {
          bankId: bank.id,
          summary,
          prompt: `${summary}问题`,
          scoreValue: 10 + index,
          wordLimit: "800",
          questionType: "策论文",
          tags: { stage: "raw" },
          materials: {
            create: [{ seq: 1, content: `${summary}材料` }]
          }
        }
      })
    )
  );

  questionIds = created.map((item) => item.id);
});

afterAll(async () => {
  await prisma.$disconnect();
});

test("batch update changes type and tags for selected ids", async () => {
  const res = await batchUpdatePOST(
    new Request("http://localhost/api/questions/batch-update", {
      method: "POST",
      body: JSON.stringify({
        ids: questionIds.slice(0, 2),
        updates: {
          questionType: "公文",
          tags: { stage: "edited" }
        }
      })
    })
  );
  const body = await res.json();

  const changed = await prisma.question.findMany({
    where: { id: { in: questionIds.slice(0, 2) } }
  });

  expect(res.status).toBe(200);
  expect(body.affectedCount).toBe(2);
  expect(changed.every((item) => item.questionType === "公文")).toBe(true);
});

test("batch delete removes selected ids", async () => {
  const target = questionIds.slice(1);
  const res = await batchDeletePOST(
    new Request("http://localhost/api/questions/batch-delete", {
      method: "POST",
      body: JSON.stringify({ ids: target })
    })
  );
  const body = await res.json();

  const remained = await prisma.question.findMany();

  expect(res.status).toBe(200);
  expect(body.deletedCount).toBe(2);
  expect(remained).toHaveLength(1);
});
