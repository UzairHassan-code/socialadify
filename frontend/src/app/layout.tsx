// D:\socialadify\frontend\src\app\layout.tsx
import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans'; // Ensure 'geist' is installed
import { GeistMono } from 'geist/font/mono';   // Ensure 'geist' is installed
import "./globals.css";                       // Your global styles
import { AuthProvider } from "@/context/AuthContext"; // For global authentication state

export const metadata: Metadata = {
  title: "SocialAdify", // General title for the whole application
  description: "Manage your social ads efficiently and gain AI-powered insights.", // Slightly enhanced description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // This console log is helpful for debugging to see when the root layout renders
  console.log("RootLayout rendering. AuthProvider is wrapping children.");

  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans antialiased">
        {/* AuthProvider makes authentication context available to all child components */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
