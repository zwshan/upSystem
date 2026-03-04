import { z } from "zod";

import { submitPractice } from "@/server/domain/practice/submit-practice";

const submitPracticeSchema = z.object({
  userId: z.string().trim().min(1),
  questionId: z.string().trim().min(1),
  selfScore: z.number().int(),
  spentSec: z.number().int().positive().optional()
});

export async function POST(req: Request): Promise<Response> {
  const payload = await req.json();
  const parsed = submitPracticeSchema.safeParse(payload);

  if (!parsed.success) {
    return Response.json(
      { message: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const result = await submitPractice(parsed.data);
    return Response.json(result);
  } catch (error) {
    if (error instanceof Error && (error.message === "user not found" || error.message === "question not found")) {
      return Response.json({ message: error.message }, { status: 404 });
    }
    if (error instanceof Error && error.message === "score out of range") {
      return Response.json({ message: error.message }, { status: 400 });
    }
    return Response.json({ message: "Practice submit failed" }, { status: 500 });
  }
}
