import CleanerLayout from '@/componets/CleanerLayout';
import Sidebar2 from '@/componets/Sidebar';
import Sidebar from '@/componets/Sidebar';
import SupervisorSidebar from '@/componets/SupervisorSidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <SupervisorSidebar />
      <main className="ml-64 flex-1 p-6 bg-gray-50 min-h-screen">
        {children}
      </main>
    </div>
  );
}
