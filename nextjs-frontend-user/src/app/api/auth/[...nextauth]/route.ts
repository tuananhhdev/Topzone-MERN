import type { Session, User } from "next-auth";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { JWT } from "next-auth/jwt";
import { SETTINGS } from "@/config/settings";
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
        console.log("Login API response:", resJson);

        if (res.ok && resJson && resJson.data?.token) {
          const resUser = await fetch(
            `${SETTINGS.URL_API}/v1/customers/profile`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${resJson.data.token}`,
              },
            }
          );

          const dataUser = await resUser.json();
          console.log("Profile API response:", dataUser);

          if (!resUser.ok || !dataUser.data) {
            throw new Error("Failed to fetch customer profile");
          }

          const user = {
            ...dataUser.data,
            id: resJson.data.id || dataUser.data.id,
            accessToken: resJson.data.token, // Đảm bảo lưu accessToken
          };

          console.log("User object in authorize:", user); // Thêm log
          
          return user;
        }
        throw new Error("Invalid credentials");
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({
      token,
      user,
      account,
    }: {
      token: JWT;
      user: User;
      account?: any;
    }) {
      console.log("callbacks jwt", token, user);

      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.first_name = user.first_name?.trim();
        token.last_name = user.last_name?.trim();
        token.full_name = (
          user.full_name ||
          user.name ||
          `${token.first_name} ${token.last_name}`
        )?.trim();
        token.phone = user.phone;
        token.city = user.city;
        token.avatar = user.avatar || user.picture;
        token.accessToken = user.accessToken; // Đảm bảo lưu accessToken
        token.refreshToken = user.refreshToken;
        token.state = user.state;
        token.street = user.street;
      }

      if (account?.provider === "google") {
        token.full_name = user.name ?? "";
      }

      if (token.accessToken) {
        try {
          const decoded: DecodedToken = jwtDecode(token.accessToken as string);
          const currentTime = Date.now() / 1000;
          if (decoded.exp < currentTime) {
            console.log("Access token expired:", token.accessToken);
            return { ...token, accessToken: undefined }; // Xóa accessToken và yêu cầu đăng nhập lại
          }
        } catch (error) {
          console.error("Error decoding token in jwt callback:", error);
          return { ...token, accessToken: undefined }; // Token không hợp lệ, yêu cầu đăng nhập lại
        }
      }

      console.log("Token after jwt callback:", token);
      return token;
    },
    async session({ session, token }) {
      console.log("callbacks session", token);

      if (!token) {
        session.user = undefined;
        return session;
      }

      const userObject: AdapterUser = {
        id: token.id as string,
        email: token.email as string,
        avatar: token.avatar as string,
        first_name: (token.first_name || "").trim(),
        last_name: (token.last_name || "").trim(),
        full_name: (token.full_name || "").trim(),
        city: token.city as string,
        phone: token.phone as string,
        accessToken: token.accessToken as string,
        emailVerified: null,
        picture: token.picture as string,
        refreshToken: token.refreshToken as string,
        image: token.image as string,
        state: token.state as string,
        street: token.street as string,
      };

      if (token.name) {
        session.user.name = token.name;
      }

      session.user = userObject;

      console.log("Session user after login:", session.user);
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
