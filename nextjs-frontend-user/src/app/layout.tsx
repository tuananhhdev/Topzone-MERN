import type { Metadata } from "next";
import { Open_Sans, Roboto } from "next/font/google";
import "../styles/globals.css";
import Header from "@/components/Header";
import { NextAuthProvider } from "@/components/providers/authProviders";
import Footer from "@/components/Footer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import { ThemeProvider } from "@/provider/ThemeProvider";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-open-sans",
});

const roboto = Roboto({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
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
    <html lang="en">
      <body className={roboto.className}>
        <ThemeProvider>
          <MantineProvider>
            <NextAuthProvider>
              <header>
                <Header />
              </header>
              <main className="bg-[#3e3e3f]">
                {children} <ToastContainer />
              </main>
              <footer>
                <Footer />
              </footer>
            </NextAuthProvider>
          </MantineProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
