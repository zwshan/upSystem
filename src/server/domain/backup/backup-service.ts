import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { Prisma } from "@prisma/client";

import prisma from "@/server/db/client";

const BACKUP_DIR_NAME = "backups";

export type BackupSnapshot = {
  exportedAt: string;
  users: Array<{
    id: string;
    email: string;
    passwordHash: string;
    createdAt: string;
  }>;
  questionBanks: Array<{
    id: string;
    name: string;
    description: string | null;
    createdAt: string;
  }>;
  questions: Array<{
    id: string;
    bankId: string;
    summary: string;
    prompt: string;
    referenceAnswer: string | null;
    scoreValue: number;
    wordLimit: string;
    questionType: string;
    tags: unknown;
    createdAt: string;
    updatedAt: string;
  }>;
  questionMaterials: Array<{
    id: string;
    questionId: string;
    seq: number;
    content: string;
    createdAt: string;
    updatedAt: string;
  }>;
  reviewCards: Array<{
    id: string;
    questionId: string;
    userId: string;
    stability: number;
    difficulty: number;
    lastScore: number | null;
    dueAt: string;
    reviewCount: number;
    lapseCount: number;
    createdAt: string;
    updatedAt: string;
  }>;
  reviewLogs: Array<{
    id: string;
    reviewCardId: string;
    score: number;
    reviewedAt: string;
    note: string | null;
    createdAt: string;
  }>;
  practiceSessions: Array<{
    id: string;
    userId: string;
    mode: string;
    startedAt: string;
    endedAt: string | null;
    durationSec: number | null;
    createdAt: string;
  }>;
  practiceItemLogs: Array<{
    id: string;
    sessionId: string;
    questionId: string;
    selfScore: number;
    spentSec: number | null;
    createdAt: string;
  }>;
};

function toDate(value: string | null | undefined): Date | null {
  if (!value) {
    return null;
  }
  return new Date(value);
}

function pad(num: number): string {
  return String(num).padStart(2, "0");
}

export function createBackupFileName(date: Date): string {
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const hour = pad(date.getUTCHours());
  const minute = pad(date.getUTCMinutes());
  const second = pad(date.getUTCSeconds());
  return `backup-${year}-${month}-${day}-${hour}-${minute}-${second}.json`;
}

export function getBackupDir(): string {
  return resolve(process.cwd(), BACKUP_DIR_NAME);
}

async function ensureBackupDir(): Promise<string> {
  const dir = getBackupDir();
  await mkdir(dir, { recursive: true });
  return dir;
}

export async function exportBackupSnapshot() {
  const [
    users,
    questionBanks,
    questions,
    questionMaterials,
    reviewCards,
    reviewLogs,
    practiceSessions,
    practiceItemLogs
  ] = await Promise.all([
    prisma.user.findMany(),
    prisma.questionBank.findMany(),
    prisma.question.findMany(),
    prisma.questionMaterial.findMany(),
    prisma.reviewCard.findMany(),
    prisma.reviewLog.findMany(),
    prisma.practiceSession.findMany(),
    prisma.practiceItemLog.findMany()
  ]);

  const snapshot: BackupSnapshot = {
    exportedAt: new Date().toISOString(),
    users: users.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString()
    })),
    questionBanks: questionBanks.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString()
    })),
    questions: questions.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString()
    })),
    questionMaterials: questionMaterials.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString()
    })),
    reviewCards: reviewCards.map((item) => ({
      ...item,
      dueAt: item.dueAt.toISOString(),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString()
    })),
    reviewLogs: reviewLogs.map((item) => ({
      ...item,
      reviewedAt: item.reviewedAt.toISOString(),
      createdAt: item.createdAt.toISOString()
    })),
    practiceSessions: practiceSessions.map((item) => ({
      ...item,
      startedAt: item.startedAt.toISOString(),
      endedAt: item.endedAt?.toISOString() ?? null,
      createdAt: item.createdAt.toISOString()
    })),
    practiceItemLogs: practiceItemLogs.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString()
    }))
  };

  const dir = await ensureBackupDir();
  const fileName = createBackupFileName(new Date());
  const filePath = resolve(dir, fileName);
  await writeFile(filePath, JSON.stringify(snapshot, null, 2), "utf8");

  return {
    fileName,
    filePath,
    counts: {
      users: snapshot.users.length,
      questionBanks: snapshot.questionBanks.length,
      questions: snapshot.questions.length,
      reviewCards: snapshot.reviewCards.length
    }
  };
}

export async function importBackupSnapshot(snapshot: BackupSnapshot) {
  await prisma.$transaction(async (tx) => {
    await tx.practiceItemLog.deleteMany();
    await tx.practiceSession.deleteMany();
    await tx.reviewLog.deleteMany();
    await tx.reviewCard.deleteMany();
    await tx.questionMaterial.deleteMany();
    await tx.question.deleteMany();
    await tx.questionBank.deleteMany();
    await tx.user.deleteMany();

    if (snapshot.users.length > 0) {
      await tx.user.createMany({
        data: snapshot.users.map((item) => ({
          ...item,
          createdAt: new Date(item.createdAt)
        }))
      });
    }

    if (snapshot.questionBanks.length > 0) {
      await tx.questionBank.createMany({
        data: snapshot.questionBanks.map((item) => ({
          ...item,
          createdAt: new Date(item.createdAt)
        }))
      });
    }

    if (snapshot.questions.length > 0) {
      await tx.question.createMany({
        data: snapshot.questions.map((item) => ({
          ...item,
          tags:
            item.tags === undefined
              ? undefined
              : item.tags === null
                ? Prisma.JsonNull
                : (item.tags as Prisma.InputJsonValue),
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt)
        }))
      });
    }

    if (snapshot.questionMaterials.length > 0) {
      await tx.questionMaterial.createMany({
        data: snapshot.questionMaterials.map((item) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt)
        }))
      });
    }

    if (snapshot.reviewCards.length > 0) {
      await tx.reviewCard.createMany({
        data: snapshot.reviewCards.map((item) => ({
          ...item,
          dueAt: new Date(item.dueAt),
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt)
        }))
      });
    }

    if (snapshot.reviewLogs.length > 0) {
      await tx.reviewLog.createMany({
        data: snapshot.reviewLogs.map((item) => ({
          ...item,
          reviewedAt: new Date(item.reviewedAt),
          createdAt: new Date(item.createdAt)
        }))
      });
    }

    if (snapshot.practiceSessions.length > 0) {
      await tx.practiceSession.createMany({
        data: snapshot.practiceSessions.map((item) => ({
          ...item,
          startedAt: new Date(item.startedAt),
          endedAt: toDate(item.endedAt),
          createdAt: new Date(item.createdAt)
        }))
      });
    }

    if (snapshot.practiceItemLogs.length > 0) {
      await tx.practiceItemLog.createMany({
        data: snapshot.practiceItemLogs.map((item) => ({
          ...item,
          createdAt: new Date(item.createdAt)
        }))
      });
    }
  });
}

export async function loadSnapshotFromFile(fileName: string): Promise<BackupSnapshot> {
  const filePath = resolve(getBackupDir(), fileName);
  const content = await readFile(filePath, "utf8");
  return JSON.parse(content) as BackupSnapshot;
}

export async function getBackupStatus() {
  const dir = await ensureBackupDir();
  const allFiles = await readdir(dir);
  const files = allFiles.filter((item) => item.endsWith(".json")).sort().reverse();
  const latest = files[0];

  if (!latest) {
    return {
      directory: dir,
      totalFiles: 0,
      latest: null as null | { fileName: string; modifiedAt: string }
    };
  }

  const info = await stat(resolve(dir, latest));
  return {
    directory: dir,
    totalFiles: files.length,
    latest: {
      fileName: latest,
      modifiedAt: info.mtime.toISOString()
    }
  };
}
