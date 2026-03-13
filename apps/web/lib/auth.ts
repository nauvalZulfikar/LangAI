import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from './db';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as NextAuthOptions['adapter'],
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await db.user.findUnique({ where: { email: credentials.email } });
        if (!user || !user.password) return null;
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;
        return { id: user.id, email: user.email, name: user.name, image: user.avatar };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    newUser: '/onboarding',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: {
            id: true,
            xpTotal: true,
            streakCurrent: true,
            currentLevel: true,
            targetLanguage: true,
            nativeLanguage: true,
            dailyGoalMinutes: true,
          },
        });
        if (dbUser) {
          Object.assign(session.user, dbUser);
        }
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      await db.userSettings.create({
        data: { userId: user.id },
      }).catch(() => null);
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
