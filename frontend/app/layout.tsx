// /frontend/app/layout.tsx

export const metadata = {
    title: 'SocialAdify',
    description: 'AI-powered Ad Insight Dashboard',
  };
  
  export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <html lang="en">
        <body>{children}</body>
      </html>
    );
  }
  