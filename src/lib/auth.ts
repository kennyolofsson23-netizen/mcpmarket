import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import { prisma } from '@/lib/prisma';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID ?? '',
      clientSecret: process.env.AUTH_GITHUB_SECRET ?? '',
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? '',
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? '',
    }),
  ],
  session: {
    strategy: 'database',
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = (user as { role?: string }).role ?? 'USER';
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
});

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function requireRole(role: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  const userRole = (session.user as { role?: string }).role ?? 'USER';
  if (userRole !== role && !(role === 'DEVELOPER' && userRole === 'ADMIN')) {
    throw new Error('Forbidden');
  }
  return session;
}
