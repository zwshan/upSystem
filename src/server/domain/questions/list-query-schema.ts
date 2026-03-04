import { z } from "zod";

export const questionListQuerySchema = z.object({
  bankId: z.string().trim().min(1).optional(),
  type: z.string().trim().min(1).optional(),
  keyword: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20)
});

export type QuestionListQuery = z.infer<typeof questionListQuerySchema>;
