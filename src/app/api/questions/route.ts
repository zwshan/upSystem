import { Prisma } from "@prisma/client";

import { createQuestionSchema } from "@/server/domain/questions/question-schema";
import { createQuestion } from "@/server/repo/question-repo";

export async function POST(req: Request): Promise<Response> {
  const body = await req.json();
  const parsed = createQuestionSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { message: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const question = await createQuestion(parsed.data);
    return Response.json(question, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return Response.json({ message: "Invalid bankId" }, { status: 400 });
    }

    return Response.json({ message: "Failed to create question" }, { status: 500 });
  }
}
