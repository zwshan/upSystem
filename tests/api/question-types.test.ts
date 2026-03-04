import { afterAll, beforeEach, expect, test } from "vitest";

import { GET, POST } from "@/app/api/question-types/route";
import prisma from "@/server/db/client";

beforeEach(async () => {
  await prisma.questionTypeDict.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

test("get question types returns items", async () => {
  await prisma.questionTypeDict.createMany({
    data: [
      { name: "策论文", isBuiltin: true },
      { name: "公文", isBuiltin: true }
    ]
  });

  const res = await GET();
  const body = await res.json();

  expect(res.status).toBe(200);
  expect(body.items.length).toBeGreaterThanOrEqual(2);
});

test("post question type creates custom type", async () => {
  const res = await POST(
    new Request("http://localhost/api/question-types", {
      method: "POST",
      body: JSON.stringify({ name: "自定义类型" })
    })
  );
  const body = await res.json();

  expect(res.status).toBe(201);
  expect(body.name).toBe("自定义类型");
  expect(body.isBuiltin).toBe(false);
});
