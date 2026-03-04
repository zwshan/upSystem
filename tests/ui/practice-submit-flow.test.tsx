import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

import PracticePage from "@/app/practice/page";
import { getPracticeDraftKey } from "@/app/practice/components/grid-paper-editor";

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

test("submit success returns to filter and keeps selected filters", async () => {
  localStorage.setItem(getPracticeDraftKey("q-submit"), JSON.stringify({ pages: ["旧草稿"] }));

  vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
    const url = String(input);
    const method = init?.method ?? "GET";

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
            id: "q-submit",
            summary: "提交题摘要",
            prompt: "提交题问题",
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

    if (url.includes("/api/practice/submit") && method === "POST") {
      return new Response(JSON.stringify({ sessionId: "s1", reviewCardId: "r1" }), { status: 200 });
    }

    return new Response("not-found", { status: 404 });
  });

  render(<PracticePage />);

  await screen.findByRole("combobox", { name: "题库" });
  fireEvent.change(screen.getByRole("combobox", { name: "题型" }), { target: { value: "策论文" } });
  fireEvent.click(screen.getByRole("button", { name: "开始刷题" }));

  await screen.findByText("提交题摘要");
  fireEvent.click(screen.getByRole("button", { name: "3分" }));
  fireEvent.click(screen.getByRole("button", { name: "提交自评并完成本题" }));

  await screen.findByRole("button", { name: "开始刷题" });
  expect(screen.getByRole("combobox", { name: "题型" })).toHaveValue("策论文");
  expect(localStorage.getItem(getPracticeDraftKey("q-submit"))).toBeNull();
});
