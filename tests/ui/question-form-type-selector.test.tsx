import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import QuestionForm from "@/app/banks/components/question-form";

test("custom question type can be created and selected", async () => {
  const onCreateQuestionType = vi.fn(async () => undefined);
  const onSubmit = vi.fn(async () => undefined);

  render(
    <QuestionForm
      mode="create"
      questionTypeOptions={["策论文"]}
      onCreateQuestionType={onCreateQuestionType}
      onSubmit={onSubmit}
    />
  );

  fireEvent.change(screen.getByLabelText("新增题型"), { target: { value: "案例分析" } });
  fireEvent.click(screen.getByRole("button", { name: "新增题型" }));

  await waitFor(() => {
    expect(onCreateQuestionType).toHaveBeenCalledWith("案例分析");
  });
  expect(screen.getByLabelText("题目类型")).toHaveValue("案例分析");
});
