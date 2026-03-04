import { Prisma } from "@prisma/client";
import { z } from "zod";

import prisma from "@/server/db/client";
import { materialSchema } from "@/server/domain/questions/question-schema";

const updateQuestionSchema = z.object({
  summary: z.string().trim().min(1),
  prompt: z.string().trim().min(1),
  referenceAnswer: z.string().trim().optional(),
  scoreValue: z.number().int().positive(),
  wordLimit: z.string().trim().min(1),
  questionType: z.string().trim().min(1),
  tags: z.record(z.unknown()).optional(),
  materials: z.array(materialSchema).min(1)
});

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_req: Request, context: RouteContext): Promise<Response> {
  const { id } = await context.params;
  const question = await prisma.question.findUnique({
    where: { id },
    include: {
      materials: {
        orderBy: { seq: "asc" }
      }
    }
  });

  if (!question) {
    return Response.json({ message: "Question not found" }, { status: 404 });
  }

  return Response.json(question);
}

export async function PATCH(req: Request, context: RouteContext): Promise<Response> {
  const { id } = await context.params;
  const payload = await req.json();
  const parsed = updateQuestionSchema.safeParse(payload);

  if (!parsed.success) {
    return Response.json(
      { message: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const updated = await prisma.$transaction(async (tx) => {
    const exists = await tx.question.findUnique({ where: { id } });
    if (!exists) {
      return null;
    }

    await tx.questionMaterial.deleteMany({
      where: { questionId: id }
    });

    await tx.questionMaterial.createMany({
      data: parsed.data.materials.map((material) => ({
        questionId: id,
        seq: material.seq,
        content: material.content
      }))
    });

    return tx.question.update({
      where: { id },
      data: {
        summary: parsed.data.summary,
        prompt: parsed.data.prompt,
        referenceAnswer: parsed.data.referenceAnswer,
        scoreValue: parsed.data.scoreValue,
        wordLimit: parsed.data.wordLimit,
        questionType: parsed.data.questionType,
        tags:
          parsed.data.tags === undefined
            ? undefined
            : (parsed.data.tags as Prisma.InputJsonValue)
      },
      include: {
        materials: {
          orderBy: { seq: "asc" }
        }
      }
    });
  });

  if (!updated) {
    return Response.json({ message: "Question not found" }, { status: 404 });
  }

  return Response.json(updated);
}

export async function DELETE(_req: Request, context: RouteContext): Promise<Response> {
  const { id } = await context.params;
  const exists = await prisma.question.findUnique({
    where: { id },
    select: { id: true }
  });

  if (!exists) {
    return Response.json({ message: "Question not found" }, { status: 404 });
  }

  await prisma.question.delete({
    where: { id }
  });

  return new Response(null, { status: 204 });
}
