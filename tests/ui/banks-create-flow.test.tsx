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

test("create page submits to question create api and shows centered toast", async () => {
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

    if (url.includes("/api/questions") && method === "POST") {
      return new Response(
        JSON.stringify({
          id: "q-new",
          summary: "新建后的摘要",
          prompt: "问题A",
          questionType: "策论文",
          scoreValue: 20,
          wordLimit: "800-1000",
          referenceAnswer: "",
          materials: [{ seq: 1, content: "材料1" }]
        }),
        { status: 201 }
      );
    }

    if (url.endsWith("/api/questions/q-new") && method === "GET") {
      return new Response(
        JSON.stringify({
          id: "q-new",
          summary: "新建后的摘要",
          prompt: "问题A",
          questionType: "策论文",
          scoreValue: 20,
          wordLimit: "800-1000",
          referenceAnswer: "",
          materials: [{ seq: 1, content: "材料1" }]
        }),
        { status: 200 }
      );
    }

    return new Response("not-found", { status: 404 });
  });

  render(<QuestionEditorPage initialMode="create" bankId="b1" />);

  await screen.findByLabelText("题目摘要");
  fireEvent.change(screen.getByLabelText("题目摘要"), { target: { value: "新建后的摘要" } });
  fireEvent.change(screen.getByLabelText("题目问题"), { target: { value: "问题A" } });
  fireEvent.change(screen.getByLabelText("题目分值"), { target: { value: "20" } });
  fireEvent.change(screen.getByLabelText("字数要求"), { target: { value: "800-1000" } });
  fireEvent.change(screen.getByLabelText("题目类型"), { target: { value: "策论文" } });
  fireEvent.change(screen.getByLabelText("题目材料"), { target: { value: "材料1" } });
  fireEvent.click(screen.getByRole("button", { name: "保存" }));

  await waitFor(() => {
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/questions",
      expect.objectContaining({ method: "POST" })
    );
  });

  expect(await screen.findByText("已保存")).toBeInTheDocument();
  expect(router.replace).not.toHaveBeenCalled();
});
