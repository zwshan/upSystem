import { createQuestionSchema } from "@/server/domain/questions/question-schema";
import { mapRawQuestion } from "@/server/domain/importer/question-importer";
import { createQuestion } from "@/server/repo/question-repo";

type ImportBody = {
  bankId?: string;
  items?: unknown[];
  skipInvalid?: boolean;
  dryRun?: boolean;
};

type ImportErrorItem = {
  index: number;
  message: string;
};

export async function POST(req: Request): Promise<Response> {
  const body = (await req.json()) as ImportBody;
  const bankId = (body.bankId ?? "").trim();
  const items = body.items ?? [];
  const skipInvalid = body.skipInvalid ?? true;
  const dryRun = body.dryRun ?? false;

  if (!bankId || !Array.isArray(items)) {
    return Response.json({ message: "bankId and items[] are required" }, { status: 400 });
  }

  const errors: ImportErrorItem[] = [];
  let importedCount = 0;
  let validCount = 0;
  const importedIds: string[] = [];

  for (let index = 0; index < items.length; index += 1) {
    const rawItem = items[index];
    const mapped = mapRawQuestion((rawItem ?? {}) as Record<string, unknown>);
    const parsed = createQuestionSchema.safeParse({
      bankId,
      ...mapped
    });

    if (!parsed.success) {
      errors.push({
        index,
        message: parsed.error.issues.map((issue) => issue.message).join("; ")
      });
      if (!skipInvalid && !dryRun) {
        return Response.json(
          {
            importedCount,
            importedIds,
            validCount,
            skippedCount: errors.length,
            errorCount: errors.length,
            errors,
            dryRun
          },
          { status: 400 }
        );
      }
      continue;
    }

    validCount += 1;

    if (dryRun) {
      continue;
    }

    try {
      const created = await createQuestion(parsed.data);
      importedCount += 1;
      importedIds.push(created.id);
    } catch (error) {
      errors.push({
        index,
        message: error instanceof Error ? error.message : "Unknown import error"
      });
      if (!skipInvalid) {
        return Response.json(
          {
            importedCount,
            importedIds,
            validCount,
            skippedCount: errors.length,
            errorCount: errors.length,
            errors,
            dryRun
          },
          { status: 400 }
        );
      }
    }
  }

  return Response.json({
    importedCount,
    importedIds,
    validCount,
    skippedCount: errors.length,
    errorCount: errors.length,
    errors,
    dryRun
  });
}
