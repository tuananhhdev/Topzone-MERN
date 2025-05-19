import type { Session, User } from "next-auth";
import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";
import { NextAuthOptions } from "next-auth";
import { AdapterUser } from "next-auth/adapters";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp: number;
  [key: string]: any;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  pages: { signIn: "/login", error: "/login" },
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      if (account?.provider === "google") {
        token.full_name = user.name ?? "";
      }
      if (token.accessToken) {
        try {
          const decoded: DecodedToken = jwtDecode(token.accessToken as string);
          const currentTime = Date.now() / 1000;
          if (decoded.exp < currentTime) return { ...token, accessToken: undefined };
        } catch (error) {
          console.error("Lỗi giải mã token:", error);
          return { ...token, accessToken: undefined };
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (!token) return { ...session, user: null };
      session.user = {
        id: token.id as string,
        email: token.email as string,
        name: token.name as string,
        image: token.picture as string,
        full_name: token.full_name as string,
      };
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };