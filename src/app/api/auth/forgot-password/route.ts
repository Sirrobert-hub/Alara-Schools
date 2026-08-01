import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { username } = await req.json();

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    const inputUsername = username.trim();

    // Safe case variation lookups
    let user = await prisma.user.findUnique({
      where: { username: inputUsername },
      include: { teacher: true },
    });

    if (!user) {
      const capitalized = inputUsername.charAt(0).toUpperCase() + inputUsername.slice(1).toLowerCase();
      user = await prisma.user.findUnique({
        where: { username: capitalized },
        include: { teacher: true },
      });
    }

    if (!user) {
      user = await prisma.user.findUnique({
        where: { username: inputUsername.toLowerCase() },
        include: { teacher: true },
      });
    }

    if (!user) {
      user = await prisma.user.findUnique({
        where: { username: inputUsername.toUpperCase() },
        include: { teacher: true },
      });
    }

    if (!user) {
      // Return success response to prevent username enumeration
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

    let email = "mocked-email@alaraschools.ac.ke";
    if (user.teacher && user.teacher.email) {
      email = user.teacher.email;
    }

    await sendPasswordResetEmail(email, resetToken);

    return NextResponse.json({ message: "If an account exists, a reset link was sent." });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
