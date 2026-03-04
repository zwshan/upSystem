import { randomUUID } from "node:crypto";

import { verifyPlainPassword } from "@/server/domain/auth/password";

type LoginBody = {
  email?: string;
  password?: string;
};

function createAccessToken(email: string): string {
  const payload = {
    sub: email,
    exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60
  };

  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

export async function POST(req: Request): Promise<Response> {
  const expectedEmail = process.env.APP_EMAIL;
  const expectedPassword = process.env.APP_PASSWORD;

  if (!expectedEmail || !expectedPassword) {
    return Response.json(
      { message: "Server auth config missing." },
      { status: 500 }
    );
  }

  const body = (await req.json()) as LoginBody;
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  if (!email || !password) {
    return Response.json({ message: "Email and password are required." }, { status: 400 });
  }

  if (email !== expectedEmail.toLowerCase() || !verifyPlainPassword(password, expectedPassword)) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  return Response.json({
    accessToken: createAccessToken(expectedEmail),
    refreshToken: randomUUID()
  });
}
