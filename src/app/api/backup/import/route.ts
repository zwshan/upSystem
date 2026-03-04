import {
  BackupSnapshot,
  importBackupSnapshot,
  loadSnapshotFromFile
} from "@/server/domain/backup/backup-service";

type ImportBody = {
  fileName?: string;
  snapshot?: BackupSnapshot;
};

function isSnapshotLike(value: unknown): value is BackupSnapshot {
  return !!value && typeof value === "object" && "users" in value && "questions" in value;
}

export async function POST(req: Request): Promise<Response> {
  const body = (await req.json()) as ImportBody | BackupSnapshot;

  const snapshot = "fileName" in body && body.fileName
    ? await loadSnapshotFromFile(body.fileName)
    : "snapshot" in body && body.snapshot
      ? body.snapshot
      : isSnapshotLike(body)
        ? body
        : null;

  if (!snapshot) {
    return Response.json({ message: "No snapshot payload provided" }, { status: 400 });
  }

  await importBackupSnapshot(snapshot);
  return Response.json({ imported: true });
}
