import { z } from "zod";

import prisma from "@/server/db/client";

const batchDeleteSchema = z.object({
  ids: z.array(z.string().trim().min(1)).min(1)
});

export async function POST(req: Request): Promise<Response> {
  const payload = await req.json();
  const parsed = batchDeleteSchema.safeParse(payload);

  if (!parsed.success) {
    return Response.json(
      { message: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const result = await prisma.question.deleteMany({
    where: {
      id: { in: parsed.data.ids }
    }
  });

  return Response.json({ deletedCount: result.count });
}
