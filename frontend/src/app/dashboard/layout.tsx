    // D:\socialadify\frontend\src\app\dashboard\layout.tsx
    'use client'; // Important because ProtectedRoute is a Client Component

    import ProtectedRoute from '@/components/ProtectedRoute'; // Ensure this path is correct
    import { ReactNode } from 'react';

    export default function DashboardLayout({
      children,
    }: {
      children: ReactNode;
    }) {
      // This console log helps confirm the layout is rendering.
      console.log("DashboardLayout: Rendering, applying ProtectedRoute.");
      return (
        <ProtectedRoute>
          {/* The content of dashboard/page.tsx will be rendered here as 'children' */}
          {children}
        </ProtectedRoute>
      );
    }
    