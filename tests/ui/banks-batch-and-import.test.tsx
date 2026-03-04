import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

import BanksPage from "@/app/banks/page";

afterEach(() => {
  vi.restoreAllMocks();
});

test("selecting rows enables batch action and import modal can open", async () => {
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
          items: [{ id: "q1", summary: "测试摘要", questionType: "策论文", scoreValue: 20 }],
          total: 1,
          page: 1,
          pageSize: 20
        }),
        { status: 200 }
      );
    }

    return new Response("not-found", { status: 404 });
  });

  render(<BanksPage />);

  const batchDeleteButton = screen.getByRole("button", { name: "批量删除" });
  expect(batchDeleteButton).toBeDisabled();

  fireEvent.click((await screen.findAllByRole("checkbox"))[0]);
  expect(batchDeleteButton).toBeEnabled();

  fireEvent.click(screen.getByRole("button", { name: "导入 JSON" }));
  expect(screen.getByRole("dialog", { name: "导入 JSON" })).toBeInTheDocument();
});

test("batch delete submits selected ids and updates list", async () => {
  const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
    const url = String(input);
    const method = init?.method ?? "GET";

    if (url.includes("/api/banks") && method === "GET") {
      return new Response(
        JSON.stringify({
          items: [{ id: "b1", name: "默认题库" }]
        }),
        { status: 200 }
      );
    }

    if (url.includes("/api/questions/list") && method === "GET") {
      return new Response(
        JSON.stringify({
          items: [
            { id: "q1", summary: "测试摘要A", questionType: "策论文", scoreValue: 20 },
            { id: "q2", summary: "测试摘要B", questionType: "公文", scoreValue: 15 }
          ],
          total: 2,
          page: 1,
          pageSize: 20
        }),
        { status: 200 }
      );
    }

    if (url.includes("/api/questions/batch-delete") && method === "POST") {
      return new Response(JSON.stringify({ deletedCount: 1 }), { status: 200 });
    }

    return new Response("not-found", { status: 404 });
  });

  render(<BanksPage />);

  expect(await screen.findByText("测试摘要A")).toBeInTheDocument();
  expect(await screen.findByText("测试摘要B")).toBeInTheDocument();

  fireEvent.click((await screen.findAllByRole("checkbox"))[0]);
  fireEvent.click(screen.getByRole("button", { name: "批量删除" }));

  await waitFor(() => {
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/questions/batch-delete",
      expect.objectContaining({ method: "POST" })
    );
  });
  await waitFor(() => {
    expect(screen.queryByText("测试摘要A")).not.toBeInTheDocument();
  });
  expect(await screen.findByText("测试摘要B")).toBeInTheDocument();
});
