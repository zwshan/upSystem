import { exportBackupSnapshot } from "@/server/domain/backup/backup-service";

export async function POST(): Promise<Response> {
  const result = await exportBackupSnapshot();
  return Response.json(result, { status: 201 });
}
