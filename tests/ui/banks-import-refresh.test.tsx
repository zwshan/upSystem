import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

import BanksPage from "@/app/banks/page";

afterEach(() => {
  vi.restoreAllMocks();
});

test("import success refreshes bank list and renders imported row", async () => {
  let listCallCount = 0;

  vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
    const url = String(input);
    const method = init?.method ?? "GET";

    if (url.includes("/api/banks") && method === "GET") {
      return new Response(JSON.stringify({ items: [{ id: "b1", name: "默认题库" }] }), { status: 200 });
    }

    if (url.includes("/api/questions/list") && method === "GET") {
      listCallCount += 1;
      if (listCallCount === 1) {
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

      return new Response(
        JSON.stringify({
          items: [{ id: "q-imported", summary: "导入后的题目", questionType: "案例", scoreValue: 10 }],
          total: 1,
          page: 1,
          pageSize: 20
        }),
        { status: 200 }
      );
    }

    if (url.includes("/api/questions/import") && method === "POST") {
      const body = JSON.parse(String(init?.body ?? "{}")) as { dryRun?: boolean };

      if (body.dryRun) {
        return new Response(
          JSON.stringify({
            dryRun: true,
            importedCount: 0,
            validCount: 1,
            skippedCount: 0,
            errorCount: 0,
            errors: []
          }),
          { status: 200 }
        );
      }

      return new Response(
        JSON.stringify({
          dryRun: false,
          importedCount: 1,
          validCount: 1,
          skippedCount: 0,
          errorCount: 0,
          importedIds: ["q-imported"],
          errors: []
        }),
        { status: 200 }
      );
    }

    return new Response("not-found", { status: 404 });
  });

  render(<BanksPage />);

  fireEvent.click(await screen.findByRole("button", { name: "导入 JSON" }));

  const fileInput = await screen.findByLabelText("JSON 文件");
  const file = new File(
    [
      JSON.stringify([
        {
          题目摘要: "导入后的题目",
          题目材料: ["材料1"],
          题目问题: "问题1",
          题目分值: 10,
          题目字数要求: "800",
          题目类型: "案例"
        }
      ])
    ],
    "import.json",
    { type: "application/json" }
  );

  fireEvent.change(fileInput, { target: { files: [file] } });
  fireEvent.click(screen.getByRole("button", { name: "开始预检" }));
  await screen.findByText("总数：1");

  fireEvent.click(screen.getByRole("button", { name: "确认导入" }));

  await waitFor(() => {
    expect(screen.queryByRole("dialog", { name: "导入 JSON" })).not.toBeInTheDocument();
  });

  expect(await screen.findByText("已导入 1 条，跳过 0 条")).toBeInTheDocument();
  expect(await screen.findByText("导入后的题目")).toBeInTheDocument();
});
