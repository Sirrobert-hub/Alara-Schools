import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const hasNextAuthSecret = !!process.env.NEXTAUTH_SECRET;
    const hasAuthSecret = !!process.env.AUTH_SECRET;
    const hasDatabaseUrl = !!process.env.DATABASE_URL;
    const hasDirectUrl = !!process.env.DIRECT_URL;
    const nextAuthUrl = process.env.NEXTAUTH_URL || null;
    const vercelUrl = process.env.VERCEL_URL || null;
    const nodeEnv = process.env.NODE_ENV;

    let userCount = 0;
    let dbStatus = "unknown";
    let adminUserExists = false;

    try {
      userCount = await prisma.user.count();
      const admin = await prisma.user.findFirst({
        where: { role: "ADMIN" },
      });
      adminUserExists = !!admin;
      dbStatus = "connected";
    } catch (dbErr: any) {
      dbStatus = `error: ${dbErr?.message || "failed to connect"}`;
    }

    return NextResponse.json({
      environment: {
        nodeEnv,
        hasNextAuthSecret,
        hasAuthSecret,
        hasDatabaseUrl,
        hasDirectUrl,
        nextAuthUrl,
        vercelUrl,
      },
      database: {
        status: dbStatus,
        userCount,
        adminUserExists,
      },
      activeSecretUsed: process.env.NEXTAUTH_SECRET ? "NEXTAUTH_SECRET (env)" : "Fallback hardcoded secret",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
