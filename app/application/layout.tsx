// app/dashboard/layout.tsx
import Sidebar from '@/componets/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 flex-1 p-6 bg-gray-50 min-h-screen">
        {children}
      </main>
    </div>
  );
}
