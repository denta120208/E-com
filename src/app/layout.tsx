import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import { cookies } from "next/headers";
import { Footer } from "@/components/shared/footer";
import { Header } from "@/components/shared/header";
import { AppProviders } from "@/components/providers/app-providers";
import { AUTH_COOKIE_NAME, parseSession } from "@/lib/auth";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EComPrime - Modern E-Commerce",
  description: "Modern Next.js storefront and admin dashboard scaffold.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const initialUser = parseSession(cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null);

  return (
    <html lang="en">
      <body className={`${manrope.variable} ${spaceGrotesk.variable} antialiased`}>
        <AppProviders initialUser={initialUser}>
          <Header />
          <main className="mx-auto min-h-[calc(100vh-180px)] w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
            {children}
          </main>
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
