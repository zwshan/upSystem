import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import GridPaperEditor from "@/app/practice/components/grid-paper-editor";

test("grid editor auto appends new page when pasted content exceeds one page", async () => {
  render(<GridPaperEditor questionId="q1" disabled={false} />);

  const firstCell = await screen.findByLabelText("第1行第1格");
  fireEvent.paste(firstCell, {
    clipboardData: {
      getData: () => "a".repeat(601)
    }
  });

  expect(await screen.findByText(/第\s*2\s*页\s*\/\s*2/)).toBeInTheDocument();
});

test("grid editor supports manual pagination", async () => {
  render(<GridPaperEditor questionId="q2" disabled={false} />);

  fireEvent.click(screen.getByRole("button", { name: "新增页" }));
  expect(screen.getByText(/第\s*2\s*页\s*\/\s*2/)).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "上一页" }));
  expect(screen.getByText(/第\s*1\s*页\s*\/\s*2/)).toBeInTheDocument();
});

test("grid editor ignores ime composing text and commits final character only", async () => {
  render(<GridPaperEditor questionId="q-ime" disabled={false} />);

  const firstCell = await screen.findByLabelText("第1行第1格");

  fireEvent.compositionStart(firstCell);
  fireEvent.change(firstCell, { target: { value: "n" } });
  fireEvent.change(firstCell, { target: { value: "ni" } });
  expect(screen.getByLabelText("第1行第1格")).toHaveValue("ni");
  expect(screen.getByLabelText("第1行第2格")).toHaveValue("");

  fireEvent.compositionEnd(firstCell, { data: "你", target: { value: "你" } });
  fireEvent.change(firstCell, { target: { value: "你" } });

  expect(screen.getByLabelText("第1行第1格")).toHaveValue("你");
  expect(screen.getByLabelText("第1行第2格")).toHaveValue("");
});

test("grid editor keeps first pinyin letter when composing next chinese character", async () => {
  render(<GridPaperEditor questionId="q-ime-next" disabled={false} />);

  const firstCell = await screen.findByLabelText("第1行第1格");
  fireEvent.compositionStart(firstCell);
  fireEvent.change(firstCell, { target: { value: "ni" } });
  fireEvent.compositionEnd(firstCell, { data: "你", target: { value: "你" } });

  const secondCell = screen.getByLabelText("第1行第2格");
  fireEvent.compositionStart(secondCell);
  fireEvent.change(secondCell, { target: { value: "s" } });

  expect(secondCell).toHaveValue("s");
});
