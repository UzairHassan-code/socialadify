// D:\socialadify\frontend\src\app\layout.tsx
import type { Metadata } from "next";

// Geist Font Imports:
// Ensure the 'geist' package is installed: npm install geist
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';

import "./globals.css";
import { AuthProvider } from "@/context/AuthContext"; // Assuming this is now working

// REMOVED: No need to call GeistSans() or GeistMono() again.
// The imported GeistSans and GeistMono objects directly provide .variable and .className
// const geistSans = GeistSans({
//   variable: "--font-geist-sans", // This was causing the "not callable" error
// });

// const geistMono = GeistMono({
//   variable: "--font-geist-mono", // This was causing the "not callable" error
// });

export const metadata: Metadata = {
  title: "SocialAdify",
  description: "Manage your social ads efficiently.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Use GeistSans.variable and GeistMono.variable directly from the imports
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body
        className="font-sans antialiased" // Tailwind will use the CSS variable for font-sans
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
