import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

/**
 * GET /api/admin/backup
 * Streams the live SQLite database file back to the browser as a download.
 * Admin-only. Every request is written to the audit log.
 *
 * Note: this reads the file directly from disk, so it only works against
 * the `sqlite` provider configured in prisma/schema.prisma. If the project
 * is later migrated to PostgreSQL/MySQL for multi-school hosting, this
 * route should be replaced with a `pg_dump` / `mysqldump` invocation instead.
 */
export async function GET() {
  const session = await getSession();
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rawUrl = process.env.DATABASE_URL ?? "";
  if (!rawUrl.startsWith("file:")) {
    return NextResponse.json(
      { error: "Automatic file backup is only supported for the sqlite provider." },
      { status: 400 }
    );
  }

  const relativePath = rawUrl.replace(/^file:/, "");
  const dbPath = path.isAbsolute(relativePath)
    ? relativePath
    : path.join(process.cwd(), "prisma", relativePath);

  let fileBuffer: Buffer;
  try {
    fileBuffer = await readFile(dbPath);
  } catch {
    return NextResponse.json({ error: "Could not read database file." }, { status: 500 });
  }

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "BACKUP_DATABASE",
      entity: "System",
      details: `Downloaded database backup (${fileBuffer.byteLength} bytes).`,
    },
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return new NextResponse(new Uint8Array(fileBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="alara-smis-backup-${timestamp}.db"`,
      "Content-Length": String(fileBuffer.byteLength),
    },
  });
}
