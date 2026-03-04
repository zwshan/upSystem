import { z } from "zod";

export const materialSchema = z.object({
  seq: z.number().int().positive(),
  content: z.string().trim().min(1)
});

export const createQuestionSchema = z.object({
  bankId: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  prompt: z.string().trim().min(1),
  referenceAnswer: z.string().trim().optional(),
  scoreValue: z.number().int().positive(),
  wordLimit: z.string().trim().min(1),
  questionType: z.string().trim().min(1),
  tags: z.record(z.unknown()).optional(),
  materials: z.array(materialSchema).min(1)
});

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
