import { expect, test } from "vitest";

import { POST } from "@/app/api/auth/login/route";

test("login returns token when email/password valid", async () => {
  process.env.APP_EMAIL = "you@example.com";
  process.env.APP_PASSWORD = "pass1234";

  const req = new Request("http://localhost/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "you@example.com", password: "pass1234" })
  });

  const res = await POST(req);
  const body = await res.json();

  expect(res.status).toBe(200);
  expect(typeof body.accessToken).toBe("string");
});
