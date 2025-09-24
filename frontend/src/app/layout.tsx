// D:\socialadify\frontend\src\app\layout.tsx
import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ImageProvider } from "@/context/ImageContext"; // *** NEW: Import the ImageProvider ***

export const metadata: Metadata = {
  title: "SocialAdify",
  description: "Manage your social ads efficiently and gain AI-powered insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  console.log("RootLayout rendering. AuthProvider is wrapping children.");

  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className={`${GeistSans.className} antialiased`}>
        <AuthProvider>
          {/* *** THIS IS THE CHANGE *** */}
          {/* We wrap the children with ImageProvider so all pages can access it */}
          <ImageProvider>
            {children}
          </ImageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}