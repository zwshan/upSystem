import prisma from "@/server/db/client";

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const userId = (url.searchParams.get("userId") ?? "").trim();

  if (!userId) {
    return Response.json({ message: "userId is required" }, { status: 400 });
  }

  const items = await prisma.reviewCard.findMany({
    where: {
      userId,
      dueAt: {
        lte: new Date()
      }
    },
    orderBy: [{ dueAt: "asc" }, { lastScore: "asc" }],
    include: {
      question: {
        include: {
          materials: {
            orderBy: {
              seq: "asc"
            }
          }
        }
      }
    }
  });

  return Response.json({ items });
}
