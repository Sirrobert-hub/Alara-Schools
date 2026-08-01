import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { seedDatabase } from "@/lib/seed-db";

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    
    if (userCount > 0) {
      return NextResponse.json({
        status: "already_seeded",
        message: `Database already contains ${userCount} users. Seed skipped to avoid overwriting existing data.`,
      });
    }

    await seedDatabase(prisma);

    return NextResponse.json({
      status: "success",
      message: "Database seeded successfully! You can now log in with username: 'admin' and password: 'Admin123'.",
    });
  } catch (error: any) {
    console.error("API Seed error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to seed database" },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
