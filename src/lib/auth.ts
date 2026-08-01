import { type NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { seedDatabase } from "@/lib/seed-db";
import { redirect } from "next/navigation";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      username: string;
      role: Role;
      teacherId?: string | null;
    };
  }
  interface User {
    id: string;
    name: string;
    username: string;
    role: Role;
    teacherId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    role: Role;
    teacherId?: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  // NextAuth auto-detects HTTPS on Vercel and sets secure cookies correctly.
  // DO NOT override useSecureCookies or cookies manually - it breaks things.
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "alara-smis-default-secret-2026",
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const inputUsername = credentials.username.trim();

        // Auto-seed database if empty (handles fresh Vercel/Neon deployments)
        try {
          const userCount = await prisma.user.count();
          if (userCount === 0) {
            console.log("Database empty — auto-seeding...");
            await seedDatabase(prisma);
          }
        } catch (seedErr) {
          console.error("Auto-seed on authorize failed:", seedErr);
        }

        // Safe case variation lookups compatible with PostgreSQL
        let user = await prisma.user.findUnique({
          where: { username: inputUsername },
        });

        if (!user) {
          const capitalized =
            inputUsername.charAt(0).toUpperCase() + inputUsername.slice(1).toLowerCase();
          user = await prisma.user.findUnique({
            where: { username: capitalized },
          });
        }

        if (!user) {
          user = await prisma.user.findUnique({
            where: { username: inputUsername.toLowerCase() },
          });
        }

        if (!user || !user.active) return null;

        const ok = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!ok) return null;

        try {
          await prisma.auditLog.create({
            data: {
              userId: user.id,
              action: "LOGIN",
              entity: "User",
              entityId: user.id,
              details: `User ${user.username} logged in`,
            },
          });
        } catch (auditErr) {
          console.error("Failed to create audit log on login:", auditErr);
        }

        return {
          id: user.id,
          name: user.name,
          username: user.username,
          role: user.role,
          teacherId: user.teacherId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
        token.teacherId = user.teacherId;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        name: token.name || "",
        username: token.username,
        role: token.role,
        teacherId: token.teacherId,
      };
      return session;
    },
  },
};

export function getSession() {
  return getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  return session;
}

export async function requireRole(...roles: Role[]) {
  const session = await requireAuth();
  if (!roles.includes(session.user.role)) {
    redirect("/app");
  }
  return session;
}
