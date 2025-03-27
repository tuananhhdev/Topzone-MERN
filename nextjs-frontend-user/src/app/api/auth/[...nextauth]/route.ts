import type { Session, User } from "next-auth";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { JWT } from "next-auth/jwt";
import { SETTINGS } from "@/config/settings";
import { NextAuthOptions } from "next-auth";
import { AdapterUser } from "next-auth/adapters";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID as string,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "email@example.com",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and Password are required");
        }

        const res = await fetch(`${SETTINGS.URL_API}/v1/customers/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        const resJson = await res.json();

        if (res.ok && resJson) {
          const resUser = await fetch(`${SETTINGS.URL_API}/v1/customers/profile`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${resJson.data.access_token}`,
            },
          });

          const dataUser = await resUser.json();
          // let user = dataUser.data;
          const user = {
            ...dataUser.data,
            accessToken: resJson.data.accessToken,
          };
          // user = {
          //   ...user,
          //   token: resJson.data.token,
          //   refreshToken: resJson.data.refreshToken,
          // };
          return user;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login", // Trang login tùy chỉnh
  },
  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user, account }: { token: JWT; user: User; account?: any }) {
      console.log("callbacks jwt", token, user);

      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.first_name = user.first_name;
        token.last_name = user.last_name;
        token.full_name = (user.full_name || user.name) ?? "";
        token.phone = user.phone;
        token.city = user.city;
        token.avatar = user.avatar || user.picture;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.state = user.state;
        token.street = user.street;
      }

      // if (account && user) {
      //   return {
      //     ...token,
      //     accessToken: user.accessToken,
      //     refreshToken: user.refreshToken,
      //   };
      // }

      if (account?.provider === "google") {
        token.full_name = user.name ?? "";
        // token.name = user.name ?? "";
      }

      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      console.log("callbacks session", token);
      // session.user = {
      //   id: token.id as string,
      //   email: token.email as string,
      //   avatar: token.avatar as string,
      //   first_name: token.first_name as string,
      //   full_name: token.full_name as string,
      //   city: token.city as string,
      //   phone: token.phone as string,
      //   accessToken: token.accessToken as string,
      // };

      const userObject: AdapterUser = {
        id: token.id as string,
        email: token.email as string,
        avatar: token.avatar as string,
        first_name: token.first_name as string,
        last_name: token.last_name as string,
        full_name: token.full_name as string,
        city: token.city as string,
        phone: token.phone as string,
        accessToken: token.accessToken as string,
        emailVerified: null,
        picture: token.picture as string,
        refreshToken: token.accessToken as string,
        image: token.image as string,
        state: token.state as string,
        street: token.street as string,
      };

      // if (token) {
      //   session.user.id = token.id;
      //   session.user.email = token.email;
      //   session.user.avatar = token.avatar;
      //   session.user.first_name = token.first_name;
      //   session.user.full_name = token.full_name;

      //   session.user.city = token.city;
      //   session.user.phone = token.phone;
      //   session.user.accessToken = token.accessToken;
      // }

      if (token.name) {
        session.user.name = token.name;
      }

      session.user = userObject;

      console.log("Session user:", session.user);
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
