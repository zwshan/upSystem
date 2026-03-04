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

test("leaving editor with unsaved changes asks for confirmation", async () => {
  vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
    const url = String(input);
    const method = init?.method ?? "GET";

    if (url.includes("/api/question-types") && method === "GET") {
      return new Response(JSON.stringify({ items: [{ id: "t1", name: "策论文", isBuiltin: true }] }), {
        status: 200
      });
    }

    return new Response("not-found", { status: 404 });
  });

  const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);

  render(<QuestionEditorPage initialMode="create" bankId="b1" />);

  await screen.findByLabelText("题目摘要");
  fireEvent.change(screen.getByLabelText("题目摘要"), { target: { value: "有修改" } });
  fireEvent.click(screen.getByRole("button", { name: "返回题库" }));

  expect(confirmSpy).toHaveBeenCalledWith("有未保存更改，是否离开？");
  expect(router.push).not.toHaveBeenCalled();

  confirmSpy.mockReturnValue(true);
  fireEvent.click(screen.getByRole("button", { name: "返回题库" }));
  await waitFor(() => {
    expect(router.push).toHaveBeenCalledWith("/banks");
  });
});
