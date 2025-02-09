import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-blue-600 text-white py-4 px-6 flex items-center justify-center shadow-md">
        <h1 className="text-2xl font-bold">CURIO</h1>
      </header>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

export default Layout;