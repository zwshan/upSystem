import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

import QuestionEditorPage from "@/app/banks/components/question-editor-page";

const router = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn()
};

vi.mock("next/navigation", () => ({
  useRouter: () => router
}));

afterEach(() => {
  vi.restoreAllMocks();
  router.push.mockReset();
  router.replace.mockReset();
  router.back.mockReset();
});

test("edit page loads detail and persists updates", async () => {
  const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
    const url = String(input);
    const method = init?.method ?? "GET";

    if (url.includes("/api/question-types") && method === "GET") {
      return new Response(
        JSON.stringify({
          items: [{ id: "t1", name: "策论文", isBuiltin: true }]
        }),
        { status: 200 }
      );
    }

    if (url.endsWith("/api/questions/q1") && method === "GET") {
      return new Response(
        JSON.stringify({
          id: "q1",
          summary: "原始摘要",
          prompt: "原始问题",
          scoreValue: 20,
          wordLimit: "800",
          questionType: "策论文",
          referenceAnswer: "",
          materials: [{ seq: 1, content: "原始材料" }]
        }),
        { status: 200 }
      );
    }

    if (url.endsWith("/api/questions/q1") && method === "PATCH") {
      return new Response(
        JSON.stringify({
          id: "q1",
          summary: "更新后的摘要",
          prompt: "更新后的问题",
          questionType: "公文",
          scoreValue: 25,
          wordLimit: "1200",
          referenceAnswer: "",
          materials: [{ seq: 1, content: "更新材料" }]
        }),
        { status: 200 }
      );
    }

    return new Response("not-found", { status: 404 });
  });

  render(<QuestionEditorPage initialMode="edit" initialQuestionId="q1" />);

  expect(await screen.findByDisplayValue("原始摘要")).toBeInTheDocument();

  fireEvent.change(screen.getByLabelText("题目摘要"), { target: { value: "更新后的摘要" } });
  fireEvent.change(screen.getByLabelText("题目问题"), { target: { value: "更新后的问题" } });
  fireEvent.change(screen.getByLabelText("题目分值"), { target: { value: "25" } });
  fireEvent.change(screen.getByLabelText("字数要求"), { target: { value: "1200" } });
  fireEvent.change(screen.getByLabelText("题目类型"), { target: { value: "公文" } });
  fireEvent.change(screen.getByLabelText("题目材料"), { target: { value: "更新材料" } });
  fireEvent.click(screen.getByRole("button", { name: "保存" }));

  await waitFor(() => {
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/questions/q1",
      expect.objectContaining({ method: "PATCH" })
    );
  });

  expect(await screen.findByText("已保存")).toBeInTheDocument();
});
