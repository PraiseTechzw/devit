/* eslint-disable @typescript-eslint/no-unused-vars */

import type React from "react";

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
