import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prism - See your code from every angle",
  description: "AI-Powered Visual Learning Environment for Data Structures & Algorithms",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
