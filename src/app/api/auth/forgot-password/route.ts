import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { username } = await req.json();

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { username },
      include: { teacher: true },
    });

    if (!user) {
      // Return 200 even if user doesn't exist to prevent username enumeration
      return NextResponse.json({ message: "If an account exists, a reset link was sent." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Try to find an email. If the user is a teacher, they might have one.
    // If not, we'll use a dummy email just to trigger the console.log mock.
    let email = "mocked-email@alaraschools.ac.ke";
    if (user.teacher && user.teacher.email) {
      email = user.teacher.email;
    }

    await sendPasswordResetEmail(email, resetToken);

    return NextResponse.json({ message: "If an account exists, a reset link was sent." });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
