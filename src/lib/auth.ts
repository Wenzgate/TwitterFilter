import NextAuth, { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/server/prisma';
import { encrypt, decrypt } from '@/utils/crypto';
import { OAuthConfig } from 'next-auth/providers';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export const XProvider = {
  id: 'x',
  name: 'X',
  type: 'oauth',
  clientId: process.env.X_CLIENT_ID,
  clientSecret: process.env.X_CLIENT_SECRET,
  issuer: 'https://twitter.com',
  authorization: {
    url: 'https://twitter.com/i/oauth2/authorize',
    params: {
      scope: 'tweet.read users.read like.read offline.access'
    }
  },
  token: {
    url: 'https://api.twitter.com/2/oauth2/token'
  },
  userinfo: {
    url: 'https://api.twitter.com/2/users/me',
    async request({ tokens, client }) {
      const profile = await client.request({
        method: 'GET',
        url: 'https://api.twitter.com/2/users/me',
        headers: {
          Authorization: `Bearer ${tokens.access_token}`
        },
        params: {
          'user.fields': 'name,username,profile_image_url,verified'
        }
      });

      return profile.data;
    }
  },
  profile(profile) {
    return {
      id: profile.data.id,
      name: profile.data.name,
      email: `${profile.data.username}@x.com`,
      image: profile.data.profile_image_url,
      username: profile.data.username
    };
  }
} satisfies OAuthConfig<any>;

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt'
  },
  providers: [XProvider],
  callbacks: {
    async session({ session, token }) {
      if (token.sub) {
        session.user = session.user ?? {};
        session.user.id = token.sub;
        session.user.username = token.username as string;
      }
      return session;
    },
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token ? encrypt(account.access_token) : undefined;
        token.refreshToken = account.refresh_token ? encrypt(account.refresh_token) : undefined;
        token.expiresAt = account.expires_at;
      }

      if (profile) {
        token.username = (profile as any).data?.username ?? (profile as any).username;
      }

      return token;
    }
  },
  cookies: {
    sessionToken: {
      name: '__Secure-next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true
      }
    }
  }
};

export const { handlers: authHandlers, auth: authInstance } = NextAuth(authOptions);

export const getDecryptedAccessToken = (token: string | undefined | null) =>
  token ? decrypt(token) : undefined;

export async function getSessionToken(request: NextRequest | Request) {
  const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
  return token;
}
