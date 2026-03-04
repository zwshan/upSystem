import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import HomePage from "@/app/page";

test("homepage shows only two primary actions", () => {
  render(<HomePage />);
  expect(screen.getByRole("link", { name: "刷题" })).toHaveAttribute("href", "/practice");
  expect(screen.getByRole("link", { name: "复习" })).toHaveAttribute("href", "/review");
});

test("homepage uses shared glass dark theme marker", () => {
  render(<HomePage />);
  expect(document.querySelector("[data-theme='glass-dark']")).toBeInTheDocument();
});
