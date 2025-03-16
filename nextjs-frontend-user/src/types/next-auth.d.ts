// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      picture: string;
      name?: string | null;
      first_name: string;
      last_name: string;
      accessToken: string;
      refreshToken: string;
      full_name: string;
      phone: string;
      avatar: string;
      image: string;
      city: string;
      state: string;
      street: string;
    };
  }
}

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    picture: string;
    name?: string | null;
    first_name: string;
    last_name: string;
    accessToken: string;
    refreshToken: string;
    full_name: string;
    phone: string;
    avatar: string;
    image: string;
    city: string;
    state: string;
    street: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    picture: string;
    name?: string | null;
    first_name: string;
    last_name: string;
    accessToken: string;
    refreshToken: string;
    full_name: string;
    phone: string;
    avatar: string;
    image: string;
    city: string;
    state: string;
    street: string;
    
  }
}
