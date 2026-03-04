import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

import PracticePage from "@/app/practice/page";

afterEach(() => {
  vi.restoreAllMocks();
});

test("practice page starts with filter panel and enters solving mode after start", async () => {
  const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const url = String(input);

    if (url.includes("/api/banks")) {
      return new Response(JSON.stringify({ items: [{ id: "b1", name: "默认题库" }] }), { status: 200 });
    }

    if (url.includes("/api/question-types")) {
      return new Response(JSON.stringify({ items: [{ name: "策论文" }, { name: "公文" }] }), { status: 200 });
    }

    if (url.includes("/api/practice/next")) {
      return new Response(
        JSON.stringify({
          userId: "u1",
          question: {
            id: "q1",
            summary: "测试题摘要",
            prompt: "测试题问题",
            questionType: "策论文",
            scoreValue: 20,
            wordLimit: "1200",
            referenceAnswer: "参考答案A",
            materials: [{ seq: 1, content: "材料A" }]
          }
        }),
        { status: 200 }
      );
    }

    return new Response("not-found", { status: 404 });
  });

  render(<PracticePage />);

  await screen.findByRole("heading", { name: "刷题" });
  expect(screen.getByRole("combobox", { name: "题库" })).toBeInTheDocument();
  expect(screen.getByRole("combobox", { name: "题型" })).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "开始刷题" }));

  await screen.findByText("测试题摘要");
  await waitFor(() => {
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/api/practice/next"));
  });
});
