import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "../styles/globals.css";
import Header from "@/components/Header";
import ClientSessionProvider from "@/components/ClientSessionProvider";
import { NextAuthProvider } from "@/components/providers/authProviders";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-open-sans",
});

export const metadata: Metadata = {
  title: "Topzone - Cửa Hàng Apple Chính Hãng",
  description: "Cửa Hàng Apple Chính Hãng",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <NextAuthProvider>
      <html lang="en">
        <body className={openSans.variable}>
          <header>
            <Header />
          </header>
          <main>{children}</main>
        </body>
      </html>
    </NextAuthProvider>
  );
}
