import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import QuestionForm from "@/app/banks/components/question-form";

test("question form validates required fields before submit", async () => {
  const onSubmit = vi.fn();
  render(<QuestionForm mode="create" onSubmit={onSubmit} />);

  fireEvent.click(screen.getByRole("button", { name: "保存" }));

  expect(await screen.findByText("题目摘要不能为空")).toBeInTheDocument();
  expect(onSubmit).not.toHaveBeenCalled();
});

test("question form submits with mapped payload", async () => {
  const onSubmit = vi.fn();
  render(<QuestionForm mode="create" onSubmit={onSubmit} />);

  fireEvent.change(screen.getByLabelText("题目摘要"), { target: { value: "摘要A" } });
  fireEvent.change(screen.getByLabelText("题目问题"), { target: { value: "问题A" } });
  fireEvent.change(screen.getByLabelText("题目分值"), { target: { value: "20" } });
  fireEvent.change(screen.getByLabelText("字数要求"), { target: { value: "800-1000" } });
  fireEvent.change(screen.getByLabelText("题目类型"), { target: { value: "策论文" } });
  fireEvent.change(screen.getByLabelText("题目材料"), { target: { value: "材料1\n\n材料2" } });

  fireEvent.click(screen.getByRole("button", { name: "保存" }));

  await waitFor(() => {
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
  expect(onSubmit.mock.calls[0][0].materials).toHaveLength(2);
});
