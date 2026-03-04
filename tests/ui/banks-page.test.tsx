import { render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

import BanksPage from "@/app/banks/page";

afterEach(() => {
  vi.restoreAllMocks();
});

test("banks page renders list-first controls", async () => {
  vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const url = String(input);

    if (url.includes("/api/banks")) {
      return new Response(
        JSON.stringify({
          items: [{ id: "b1", name: "默认题库" }]
        }),
        { status: 200 }
      );
    }

    if (url.includes("/api/questions/list")) {
      return new Response(
        JSON.stringify({
          items: [],
          total: 0,
          page: 1,
          pageSize: 20
        }),
        { status: 200 }
      );
    }

    return new Response("not-found", { status: 404 });
  });

  render(<BanksPage />);

  expect(screen.getByRole("heading", { name: "题库管理" })).toBeInTheDocument();
  expect(screen.getByPlaceholderText("搜索摘要或问题")).toBeInTheDocument();
  await screen.findByRole("combobox", { name: "当前题库" });
  expect(screen.getByRole("link", { name: "新建题目" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "导入 JSON" })).toBeInTheDocument();
  expect(screen.getByText("批量操作")).toBeInTheDocument();
});
