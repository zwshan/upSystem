import { expect, test } from "vitest";

import { joinMaterialsToText, splitMaterialText } from "@/app/banks/utils/material-transform";

test("split material text by blank lines into sequenced materials", () => {
  const text = "材料一\n\n材料二\n\n\n材料三";
  const result = splitMaterialText(text);

  expect(result).toHaveLength(3);
  expect(result[0].seq).toBe(1);
  expect(result[0].content).toBe("材料一");
  expect(result[2].seq).toBe(3);
  expect(result[2].content).toBe("材料三");
});

test("join materials to text with blank lines", () => {
  const text = joinMaterialsToText([
    { seq: 1, content: "A" },
    { seq: 2, content: "B" }
  ]);

  expect(text).toBe("A\n\nB");
});

test("split should ignore empty segments", () => {
  const result = splitMaterialText("\n\n \n\n");
  expect(result).toHaveLength(0);
});
