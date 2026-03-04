import { Prisma } from "@prisma/client";
import { z } from "zod";

import prisma from "@/server/db/client";

const batchUpdateSchema = z.object({
  ids: z.array(z.string().trim().min(1)).min(1),
  updates: z
    .object({
      questionType: z.string().trim().min(1).optional(),
      scoreValue: z.number().int().positive().optional(),
      wordLimit: z.string().trim().min(1).optional(),
      tags: z.record(z.unknown()).optional()
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one update field is required"
    })
});

export async function POST(req: Request): Promise<Response> {
  const payload = await req.json();
  const parsed = batchUpdateSchema.safeParse(payload);

  if (!parsed.success) {
    return Response.json(
      { message: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { ids, updates } = parsed.data;
  const data: Prisma.QuestionUpdateManyMutationInput = {};

  if (updates.questionType !== undefined) data.questionType = updates.questionType;
  if (updates.scoreValue !== undefined) data.scoreValue = updates.scoreValue;
  if (updates.wordLimit !== undefined) data.wordLimit = updates.wordLimit;
  if (updates.tags !== undefined) data.tags = updates.tags as Prisma.InputJsonValue;

  const result = await prisma.question.updateMany({
    where: { id: { in: ids } },
    data
  });

  return Response.json({ affectedCount: result.count });
}
