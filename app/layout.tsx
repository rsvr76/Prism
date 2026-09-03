import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import NavigationDrawer from "@/components/navigation/NavigationDrawer";

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
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const storedTheme = localStorage.getItem('prism_theme');
                if (storedTheme === 'light') {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                  document.documentElement.setAttribute('data-theme', 'light');
                } else {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-slate-50 dark:bg-[#070a13] text-slate-900 dark:text-slate-100 antialiased transition-colors duration-150">
        <ThemeProvider>
          <NavigationDrawer />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
