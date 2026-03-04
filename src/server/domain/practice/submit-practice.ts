import prisma from "@/server/db/client";
import { computeNextDueAt } from "@/server/domain/review/scheduler";

export function assertScore(score: number): void {
  if (!Number.isInteger(score) || score < 0 || score > 5) {
    throw new Error("score out of range");
  }
}

type SubmitPracticeInput = {
  userId: string;
  questionId: string;
  selfScore: number;
  spentSec?: number;
};

export async function submitPractice(input: SubmitPracticeInput) {
  assertScore(input.selfScore);

  return prisma.$transaction(async (tx) => {
    const [user, question] = await Promise.all([
      tx.user.findUnique({ where: { id: input.userId } }),
      tx.question.findUnique({ where: { id: input.questionId } })
    ]);

    if (!user) {
      throw new Error("user not found");
    }
    if (!question) {
      throw new Error("question not found");
    }

    const existingCard = await tx.reviewCard.findUnique({
      where: {
        questionId_userId: {
          questionId: input.questionId,
          userId: input.userId
        }
      }
    });

    const nextReviewCount = (existingCard?.reviewCount ?? 0) + 1;
    const nextLapseCount =
      (existingCard?.lapseCount ?? 0) + (input.selfScore <= 1 ? 1 : 0);

    const session = await tx.practiceSession.create({
      data: {
        userId: input.userId,
        mode: "practice",
        startedAt: new Date(),
        endedAt: new Date(),
        durationSec: input.spentSec ?? null
      }
    });

    await tx.practiceItemLog.create({
      data: {
        sessionId: session.id,
        questionId: input.questionId,
        selfScore: input.selfScore,
        spentSec: input.spentSec ?? null
      }
    });

    const reviewCard = await tx.reviewCard.upsert({
      where: {
        questionId_userId: {
          questionId: input.questionId,
          userId: input.userId
        }
      },
      create: {
        questionId: input.questionId,
        userId: input.userId,
        lastScore: input.selfScore,
        reviewCount: nextReviewCount,
        lapseCount: nextLapseCount,
        dueAt: computeNextDueAt(input.selfScore, nextReviewCount)
      },
      update: {
        lastScore: input.selfScore,
        reviewCount: nextReviewCount,
        lapseCount: nextLapseCount,
        dueAt: computeNextDueAt(input.selfScore, nextReviewCount)
      }
    });

    await tx.reviewLog.create({
      data: {
        reviewCardId: reviewCard.id,
        score: input.selfScore
      }
    });

    return {
      sessionId: session.id,
      reviewCardId: reviewCard.id
    };
  });
}
