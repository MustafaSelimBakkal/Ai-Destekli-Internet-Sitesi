import type { Metadata } from "next";
import Link from "next/link";
import { Space_Grotesk, Merriweather } from "next/font/google";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";

const sans = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"]
});

const serif = Merriweather({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "700"]
});

export const metadata: Metadata = {
  title: "Mustafa Art Hub",
  description: "Cizimlerini sergile, AI asistanla gelistir."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const admin = isAdminEmail(user?.email);

  return (
    <html lang="tr">
      <body className={`${sans.variable} ${serif.variable}`}>
        <div className="background" />
        <header className="site-header">
          <Link href="/" className="brand">
            Mustafa Art Hub
          </Link>
          <nav>
            <Link href="/">Galeri</Link>
            <Link href="/upload">Yukle</Link>
            <Link href="/auth">Hesap</Link>
            {admin ? <Link href="/admin">Admin</Link> : null}
            <span className="hint">{user ? user.email : "Misafir"}</span>
          </nav>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
