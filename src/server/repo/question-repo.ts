import { Prisma } from "@prisma/client";

import prisma from "@/server/db/client";
import { CreateQuestionInput } from "@/server/domain/questions/question-schema";

export async function createQuestion(input: CreateQuestionInput) {
  const questionData = {
    bankId: input.bankId,
    summary: input.summary,
    prompt: input.prompt,
    referenceAnswer: input.referenceAnswer,
    scoreValue: input.scoreValue,
    wordLimit: input.wordLimit,
    questionType: input.questionType,
    materials: {
      create: input.materials
    }
  };

  const tags = input.tags as Prisma.InputJsonValue | undefined;

  return prisma.question.create({
    data: tags === undefined ? questionData : { ...questionData, tags },
    include: {
      materials: {
        orderBy: {
          seq: "asc"
        }
      }
    }
  });
}
