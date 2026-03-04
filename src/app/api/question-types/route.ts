import { z } from "zod";

import prisma from "@/server/db/client";

const createQuestionTypeSchema = z.object({
  name: z.string().trim().min(1)
});

export async function GET(): Promise<Response> {
  const items = await prisma.questionTypeDict.findMany({
    orderBy: [{ isBuiltin: "desc" }, { createdAt: "asc" }]
  });

  return Response.json({ items });
}

export async function POST(req: Request): Promise<Response> {
  const payload = await req.json();
  const parsed = createQuestionTypeSchema.safeParse(payload);

  if (!parsed.success) {
    return Response.json(
      { message: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const name = parsed.data.name;
  const existing = await prisma.questionTypeDict.findUnique({ where: { name } });
  if (existing) {
    return Response.json(existing, { status: 200 });
  }

  const item = await prisma.questionTypeDict.create({
    data: {
      name,
      isBuiltin: false
    }
  });

  return Response.json(item, { status: 201 });
}
