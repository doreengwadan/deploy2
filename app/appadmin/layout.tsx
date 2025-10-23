// app/dashboard/layout.tsx
import AdminSidebar from '@/componets/AdminSidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      {/* ✅ Use the AdminSidebar component */}
      <AdminSidebar />

      <main className="ml-64 flex-1 p-6 bg-gray-50 min-h-screen">
        {children}
      </main>
    </div>
  );
}
