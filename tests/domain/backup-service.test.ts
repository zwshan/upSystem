import { expect, test } from "vitest";

import { createBackupFileName } from "@/server/domain/backup/backup-service";

test("backup filename should include timestamp and .json extension", () => {
  expect(createBackupFileName(new Date("2026-03-04T01:02:03Z"))).toMatch(
    /^backup-2026-03-04.*\.json$/
  );
});
