import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Breadcrumbs } from './Breadcrumbs';

export const AdminLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors">
      
      {/* Global Sidebar */}
      <Sidebar isCollapsed={isCollapsed} />

      {/* Main Container */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header toggleSidebar={() => setIsCollapsed(!isCollapsed)} />
        
        <Breadcrumbs />
        
        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar">
          <div className="w-full max-w-[1400px] mx-auto">
            <Outlet />
          </div>
          
          <footer className="py-6 mt-8 text-center text-sm font-medium text-slate-400 dark:text-slate-600 border-t border-slate-200 dark:border-slate-800/50">
            &copy; 2026 Koha-style SLIB System. All rights reserved.
          </footer>
        </main>
      </div>

    </div>
  );
};
