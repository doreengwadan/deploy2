'use client';

import AdminSidebar from '@/componets/AdminSidebar';
import React, { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-48"> {/* Sidebar width reduced */}
        <AdminSidebar />
      </div>
      <main className="flex-1 p-2 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}
