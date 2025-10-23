'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie'; // import js-cookie
import { FaBroom, FaUsers, FaDoorOpen, FaCalendarAlt } from 'react-icons/fa';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    groups: 0,
    rooms: 0,
    schedules: 0,
    users: 0,
  });

  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('token'); // get token from cookie

    if (!token) {
      router.push('/login'); // redirect to login if no token
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/admin/stats', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          router.push('/login'); // token invalid or expired
          return;
        }

        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        router.push('/login');
      }
    };

    fetchStats();
  }, [router]);

  return (
    <main className="p-6 md:p-10 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold text-green-800 mb-6">Admin</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        <Link href="/admin/groups" className="bg-white p-5 shadow rounded flex items-center space-x-4 hover:bg-green-50 transition-all">
          <FaUsers className="text-green-700 text-3xl" />
          <div>
            <p className="text-gray-500 text-sm">Total Groups</p>
            <h2 className="text-2xl font-bold text-green-800">{stats.groups}</h2>
          </div>
        </Link>

        <Link href="/admin/rooms" className="bg-white p-5 shadow rounded flex items-center space-x-4 hover:bg-green-50 transition-all">
          <FaDoorOpen className="text-green-700 text-3xl" />
          <div>
            <p className="text-gray-500 text-sm">Total Rooms</p>
            <h2 className="text-2xl font-bold text-green-800">{stats.rooms}</h2>
          </div>
        </Link>

        <Link href="/admin/schedules" className="bg-white p-5 shadow rounded flex items-center space-x-4 hover:bg-green-50 transition-all">
          <FaCalendarAlt className="text-green-700 text-3xl" />
          <div>
            <p className="text-gray-500 text-sm">Active Schedules</p>
            <h2 className="text-2xl font-bold text-green-800">{stats.schedules}</h2>
          </div>
        </Link>

        <Link href="/admin/users" className="bg-white p-5 shadow rounded flex items-center space-x-4 hover:bg-green-50 transition-all">
          <FaUsers className="text-green-700 text-3xl" />
          <div>
            <p className="text-gray-500 text-sm">Total Users</p>
            <h2 className="text-2xl font-bold text-green-800">{stats.users}</h2>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 shadow rounded">
          <h3 className="text-lg font-semibold text-green-800 mb-4">Recent Activities</h3>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>✓ Cleaner <strong>John Banda</strong> assigned to <em>Library</em></li>
            <li>✓ New room <strong>Lecture Hall B</strong> added</li>
            <li>✓ Group <strong>Group C</strong> created</li>
            <li>✓ Schedule updated for <strong>Jane Mwale</strong></li>
          </ul>
        </div>

        <div className="bg-white p-5 shadow rounded">
          <h3 className="text-lg font-semibold text-green-800 mb-4">Cleaning Performance</h3>
          <div className="h-48 flex items-center justify-center text-gray-400 border border-dashed rounded">
            The cleaning statistics shall be here...
          </div>
        </div>
      </div>
    </main>
  );
}
