import { afterAll, beforeEach, expect, test } from "vitest";

import prisma from "@/server/db/client";
import { resolveLocalUser } from "@/server/domain/user/resolve-local-user";

beforeEach(async () => {
  await prisma.user.deleteMany();
  delete process.env.LOCAL_USER_EMAIL;
});

afterAll(async () => {
  await prisma.$disconnect();
});

test("resolveLocalUser creates then reuses default local user", async () => {
  const first = await resolveLocalUser();
  const second = await resolveLocalUser();

  expect(first.id).toBe(second.id);
  expect(first.email).toBe("local@tuanyuan.app");
});

test("resolveLocalUser respects configured LOCAL_USER_EMAIL", async () => {
  process.env.LOCAL_USER_EMAIL = "  Me@Example.com  ";

  const user = await resolveLocalUser();

  expect(user.email).toBe("me@example.com");
});
