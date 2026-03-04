import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import HomePage from "@/app/page";

test("settings and bank links exist but are not primary buttons", () => {
  render(<HomePage />);

  expect(screen.getByRole("link", { name: "设置" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "题库管理" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "备份" })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "设置" })).toBeNull();
});
