    // D:\socialadify\frontend\src\app\account\layout.tsx
    'use client'; // Important: As ProtectedRoute is a client component

    import ProtectedRoute from '@/components/ProtectedRoute'; // Adjust path if your components folder is elsewhere
    import { ReactNode } from 'react';

    export default function AccountLayout({
      children,
    }: {
      children: ReactNode;
    }) {
      console.log("AccountLayout rendering, using ProtectedRoute.");
      return (
        <ProtectedRoute>
          {/* You can add account-specific layout elements here if needed,
              like a consistent header or sidebar for all /account/... routes */}
          {children} {/* This will be your account/page.tsx */}
        </ProtectedRoute>
      );
    }
    