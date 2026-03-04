import prisma from "@/server/db/client";
import { questionListQuerySchema } from "@/server/domain/questions/list-query-schema";

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const parsed = questionListQuerySchema.safeParse({
    bankId: url.searchParams.get("bankId") ?? undefined,
    type: url.searchParams.get("type") ?? undefined,
    keyword: url.searchParams.get("keyword") ?? undefined,
    page: url.searchParams.get("page") ?? undefined,
    pageSize: url.searchParams.get("pageSize") ?? undefined
  });

  if (!parsed.success) {
    return Response.json(
      { message: "Invalid query", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { bankId, type, keyword, page, pageSize } = parsed.data;
  const where = {
    bankId,
    questionType: type,
    OR: keyword
      ? [
          { summary: { contains: keyword } },
          { prompt: { contains: keyword } }
        ]
      : undefined
  };

  const [items, total] = await Promise.all([
    prisma.question.findMany({
      where,
      include: {
        materials: {
          orderBy: { seq: "asc" }
        }
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.question.count({ where })
  ]);

  return Response.json({ items, total, page, pageSize });
}
