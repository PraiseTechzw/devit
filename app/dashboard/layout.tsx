import type React from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
    
        <main className="flex-1 overflow-y-auto">{children}</main>
    `</div>
  );
}
