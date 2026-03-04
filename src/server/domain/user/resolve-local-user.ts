import prisma from "@/server/db/client";

const DEFAULT_LOCAL_EMAIL = "local@tuanyuan.app";

function normalizeLocalUserEmail(value: string | undefined): string {
  const normalized = (value ?? "").trim().toLowerCase();
  return normalized || DEFAULT_LOCAL_EMAIL;
}

export async function resolveLocalUser() {
  const email = normalizeLocalUserEmail(process.env.LOCAL_USER_EMAIL);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash: "local-user-disabled-password"
    }
  });

  return user;
}
