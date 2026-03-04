import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import PracticeQuestionPane from "@/app/practice/components/practice-question-pane";

test("question pane reveals reference answer and submits selected score", async () => {
  const onSubmitScore = vi.fn();

  render(
    <PracticeQuestionPane
      question={{
        id: "q1",
        summary: "摘要A",
        prompt: "问题A",
        questionType: "策论文",
        scoreValue: 20,
        wordLimit: "1200",
        referenceAnswer: "参考答案A",
        materials: [{ seq: 1, content: "材料A" }]
      }}
      submitting={false}
      onSubmitScore={onSubmitScore}
    />
  );

  expect(screen.queryByText("参考答案A")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "显示参考答案" }));
  expect(await screen.findByText("参考答案A")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "4分" }));
  fireEvent.click(screen.getByRole("button", { name: "提交自评并完成本题" }));

  expect(onSubmitScore).toHaveBeenCalledWith(4);
});
