import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import GridPaperEditor, { getPracticeDraftKey } from "@/app/practice/components/grid-paper-editor";

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

test("grid editor saves and restores draft by question id", async () => {
  const questionId = "q-draft-1";

  const { unmount } = render(<GridPaperEditor questionId={questionId} disabled={false} />);

  const firstCell = screen.getByLabelText("第1行第1格");
  fireEvent.change(firstCell, { target: { value: "中" } });
  vi.advanceTimersByTime(600);

  const saved = localStorage.getItem(getPracticeDraftKey(questionId));
  expect(saved).toContain("中");

  unmount();
  render(<GridPaperEditor questionId={questionId} disabled={false} />);
  expect(screen.getByDisplayValue("中")).toBeInTheDocument();
});
