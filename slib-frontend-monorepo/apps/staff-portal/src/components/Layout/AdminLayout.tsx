import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors">
      <Header />
      
      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto w-full max-w-[1400px] mx-auto">
        <Outlet />
      </main>
      
      <footer className="py-6 text-center text-sm font-medium text-slate-400 dark:text-slate-600 border-t border-slate-200 dark:border-slate-800/50 mt-auto">
        &copy; 2026 Koha-style SLIB System. All rights reserved.
      </footer>
    </div>
  );
};
