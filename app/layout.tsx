import type React from "react";
import "@/styles/globals.css";
import { Inter } from "next/font/google";

import { AuthProvider } from "@/context/auth-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "StudPal - Student Resource Organization",
  description:
    "A centralized platform for students to digitally organize academic resources",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <main className="flex-1 overflow-y-auto">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
