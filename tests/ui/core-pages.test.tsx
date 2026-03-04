import { render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

import BackupPage from "@/app/backup/page";
import BanksPage from "@/app/banks/page";
import PracticePage from "@/app/practice/page";
import ReviewPage from "@/app/review/page";
import SettingsPage from "@/app/settings/page";

afterEach(() => {
  vi.restoreAllMocks();
});

test("core pages render expected headings", async () => {
  vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const url = String(input);

    if (url.includes("/api/banks")) {
      return new Response(
        JSON.stringify({
          items: [{ id: "b1", name: "默认题库" }]
        }),
        { status: 200 }
      );
    }

    if (url.includes("/api/questions/list")) {
      return new Response(
        JSON.stringify({
          items: [],
          total: 0,
          page: 1,
          pageSize: 20
        }),
        { status: 200 }
      );
    }

    if (url.includes("/api/question-types")) {
      return new Response(
        JSON.stringify({
          items: [{ name: "策论文" }]
        }),
        { status: 200 }
      );
    }

    return new Response("not-found", { status: 404 });
  });

  render(<PracticePage />);
  expect(screen.getByRole("heading", { name: "刷题" })).toBeInTheDocument();

  render(<ReviewPage />);
  expect(screen.getByRole("heading", { name: "复习" })).toBeInTheDocument();

  render(<BanksPage />);
  expect(screen.getByRole("heading", { name: "题库管理" })).toBeInTheDocument();
  await screen.findByRole("combobox", { name: "当前题库" });
  await screen.findByText("当前筛选无结果。");

  render(<SettingsPage />);
  expect(screen.getByRole("heading", { name: "设置" })).toBeInTheDocument();

  render(<BackupPage />);
  expect(screen.getByRole("heading", { name: "备份" })).toBeInTheDocument();
});
