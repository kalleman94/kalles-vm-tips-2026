import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kalles VM-Tips 2026",
  description: "Tippa VM i fotboll 2026",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv" className="h-full" style={{ colorScheme: 'light', backgroundColor: '#f8f9fa' }}>
      <body className={`${inter.className} min-h-full flex flex-col bg-gray-50 text-gray-900`}>
        <NavBar />
        <main className="flex-1 container mx-auto px-4 py-6 max-w-5xl">
          {children}
        </main>
        <footer className="text-center text-xs text-gray-400 py-4">
          Kalles VM-Tips 2026 🏆
          <div className="mt-1">
            <Link href="/admin" className="text-gray-300 hover:text-gray-500 transition-colors">
              Admin
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
