"use client";

import { FormEvent, useState } from "react";

type LoginState =
  | { kind: "idle" }
  | { kind: "success"; tokenPreview: string }
  | { kind: "error"; message: string };

export default function LoginPage() {
  const [state, setState] = useState<LoginState>({ kind: "idle" });
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setState({ kind: "idle" });

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => ({ message: "登录失败" }))) as {
        message?: string;
      };
      setState({ kind: "error", message: body.message ?? "登录失败" });
      setLoading(false);
      return;
    }

    const body = (await response.json()) as { accessToken: string };
    setState({ kind: "success", tokenPreview: body.accessToken.slice(0, 24) });
    setLoading(false);
  }

  return (
    <main>
      <h1>登录</h1>
      <form onSubmit={onSubmit}>
        <label htmlFor="email">邮箱</label>
        <input id="email" name="email" type="email" required />

        <label htmlFor="password">密码</label>
        <input id="password" name="password" type="password" required />

        <button type="submit" disabled={loading}>
          {loading ? "登录中..." : "登录"}
        </button>
      </form>

      {state.kind === "success" ? <p>登录成功，令牌前缀：{state.tokenPreview}</p> : null}
      {state.kind === "error" ? <p>{state.message}</p> : null}
    </main>
  );
}
