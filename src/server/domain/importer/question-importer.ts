type RawQuestion = Record<string, unknown>;

function normalizeMaterials(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw
      .map((item) => String(item).trim())
      .filter((item) => item.length > 0);
  }

  if (typeof raw === "string") {
    return raw
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  return [];
}

export function mapRawQuestion(item: RawQuestion) {
  const materials = normalizeMaterials(item["题目材料"]);
  const scoreValue = Number(item["题目分值"] ?? 0);

  return {
    summary: String(item["题目摘要"] ?? "").trim(),
    prompt: String(item["题目问题"] ?? "").trim(),
    referenceAnswer: String(item["参考答案"] ?? "").trim() || undefined,
    scoreValue: Number.isFinite(scoreValue) ? scoreValue : 0,
    wordLimit: String(item["题目字数要求"] ?? "").trim(),
    questionType: String(item["题目类型"] ?? "").trim(),
    materials: materials.map((content, index) => ({
      seq: index + 1,
      content
    }))
  };
}
