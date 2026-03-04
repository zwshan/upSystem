import { getBackupStatus } from "@/server/domain/backup/backup-service";

export async function GET(): Promise<Response> {
  const status = await getBackupStatus();
  return Response.json(status);
}
