import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

import ImportModal from "@/app/banks/components/import-modal";

afterEach(() => {
  vi.restoreAllMocks();
});

test("import modal previews then imports and triggers callback", async () => {
  const onImported = vi.fn();

  const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (_input, init) => {
    const body = JSON.parse(String(init?.body ?? "{}")) as {
      dryRun?: boolean;
      items?: unknown[];
      bankId?: string;
    };

    if (!body.bankId || !Array.isArray(body.items)) {
      return new Response(JSON.stringify({ message: "bad request" }), { status: 400 });
    }

    if (body.dryRun) {
      return new Response(
        JSON.stringify({
          dryRun: true,
          importedCount: 0,
          validCount: 2,
          skippedCount: 1,
          errorCount: 1,
          errors: [{ index: 1, message: "题目摘要不能为空" }]
        }),
        { status: 200 }
      );
    }

    return new Response(
      JSON.stringify({
        dryRun: false,
        importedCount: 2,
        validCount: 2,
        skippedCount: 1,
        errorCount: 1,
        importedIds: ["q1", "q2"],
        errors: [{ index: 1, message: "题目摘要不能为空" }]
      }),
      { status: 200 }
    );
  });

  render(<ImportModal open bankId="b1" onClose={vi.fn()} onImported={onImported} />);

  const fileInput = screen.getByLabelText("JSON 文件") as HTMLInputElement;
  const file = new File(
    [
      JSON.stringify([
        { 题目摘要: "A", 题目材料: ["m"], 题目问题: "q", 题目分值: 10, 题目字数要求: "800", 题目类型: "案例" },
        { 题目摘要: "", 题目材料: [], 题目问题: "" }
      ])
    ],
    "import.json",
    { type: "application/json" }
  );

  fireEvent.change(fileInput, { target: { files: [file] } });
  fireEvent.click(screen.getByRole("button", { name: "开始预检" }));

  expect(await screen.findByText("总数：2")).toBeInTheDocument();
  expect(await screen.findByText("可导入：2")).toBeInTheDocument();
  expect(await screen.findByText("错误：1")).toBeInTheDocument();
  expect(await screen.findByText("#2 题目摘要不能为空")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "确认导入" }));

  await waitFor(() => {
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  await waitFor(() => {
    expect(onImported).toHaveBeenCalledWith(
      expect.objectContaining({ importedCount: 2, skippedCount: 1, errorCount: 1 })
    );
  });
});
