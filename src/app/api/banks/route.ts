import prisma from "@/server/db/client";

export async function GET(): Promise<Response> {
  const banks = await prisma.questionBank.findMany({
    orderBy: {
      createdAt: "desc"
    }
  });

  return Response.json({ items: banks });
}

export async function POST(req: Request): Promise<Response> {
  const body = (await req.json()) as { name?: string; description?: string };
  const name = body.name?.trim() ?? "";
  const description = body.description?.trim() || null;

  if (!name) {
    return Response.json({ message: "Bank name is required" }, { status: 400 });
  }

  const bank = await prisma.questionBank.create({
    data: {
      name,
      description
    }
  });

  return Response.json(bank, { status: 201 });
}
