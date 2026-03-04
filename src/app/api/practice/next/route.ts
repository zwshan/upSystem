import prisma from "@/server/db/client";
import { resolveLocalUser } from "@/server/domain/user/resolve-local-user";

type NextQuestionItem = {
  id: string;
  summary: string;
  prompt: string;
  referenceAnswer: string | null;
  scoreValue: number;
  wordLimit: string;
  questionType: string;
  materials: Array<{ seq: number; content: string }>;
};

function pickRandomItem<T>(items: T[]): T {
  const randomIndex = Math.floor(Math.random() * items.length);
  return items[randomIndex];
}

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const bankId = (url.searchParams.get("bankId") ?? "").trim();
  const type = (url.searchParams.get("type") ?? "").trim();

  if (!bankId) {
    return Response.json({ message: "bankId is required" }, { status: 400 });
  }

  const user = await resolveLocalUser();

  const items = await prisma.question.findMany({
    where: {
      bankId,
      questionType: type || undefined
    },
    include: {
      materials: {
        orderBy: {
          seq: "asc"
        }
      }
    },
    orderBy: {
      updatedAt: "desc"
    },
    take: 200
  });

  if (items.length === 0) {
    return Response.json({ message: "当前筛选下暂无题目" }, { status: 404 });
  }

  const picked = pickRandomItem(items) as NextQuestionItem;
  return Response.json({
    userId: user.id,
    question: picked
  });
}
