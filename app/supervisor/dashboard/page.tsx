'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import {
  CalendarDays,
  Clock,
  BarChart3,
  User,
  Mail,
  Phone,
  Calendar,
} from 'lucide-react';

type ProfileData = {
  id: number;
  title: string;
  firstname: string;
  lastname: string;
  dob: string;
  email: string;
  phone: string;
  role: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

const supervisorLinks = [
  {
    label: 'Schedule Management',
    href: '/supervisor/schedule',
    icon: CalendarDays,
    description: 'Manage cleaning schedules for assigned cleaners.',
  },
  {
    label: 'Attendance Overview',
    href: '/supervisor/attendance',
    icon: Clock,
    description: 'View attendance records of all cleaners.',
  },
  {
    label: 'Performance Reports',
    href: '/supervisor/performance',
    icon: BarChart3,
    description: 'Analyze performance metrics of your team.',
  },
];

export default function SupervisorDashboard() {
  const [isClient, setIsClient] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    const token = Cookies.get('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchUser(token);
  }, [router]);

  const fetchUser = async (token: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const user = await res.json();
      fetchProfile(user.id, token);
    } catch (err) {
      setError('Failed to fetch user info');
    }
  };

  const fetchProfile = async (id: number, token: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/applicants/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      if (!res.ok) throw new Error();
      const data: ProfileData = await res.json();
      data.dob = data.dob?.split('T')[0] || '';
      setProfile(data);
    } catch {
      setError('Failed to fetch profile');
    }
  };

  if (!isClient) return null;

  return (
    <main className="p-6 md:p-10 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold text-green-800 mb-6">Supervisor Dashboard</h1>
      <p className="text-gray-700 mb-8">
        Welcome to your dashboard. Use the cards below to manage your team and tasks efficiently.
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {profile && (
        <div className="bg-white p-6 shadow rounded-lg mb-10">
          <div className="flex justify-center mb-6">
            <div className="bg-green-700 text-white w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold shadow-md">
              {profile.firstname[0].toUpperCase()}
              {profile.lastname[0].toUpperCase()}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-4">
              <User className="text-green-700 text-3xl" />
              <div>
                <p className="text-gray-500 text-sm">Full Name</p>
                <h2 className="text-lg font-bold text-green-800">
                  {profile.title} {profile.firstname} {profile.lastname}
                </h2>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Mail className="text-green-700 text-3xl" />
              <div>
                <p className="text-gray-500 text-sm">Email</p>
                <h2 className="text-lg font-bold text-green-800">{profile.email}</h2>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Phone className="text-green-700 text-3xl" />
              <div>
                <p className="text-gray-500 text-sm">Phone</p>
                <h2 className="text-lg font-bold text-green-800">{profile.phone}</h2>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Calendar className="text-green-700 text-3xl" />
              <div>
                <p className="text-gray-500 text-sm">Date of Birth</p>
                <h2 className="text-lg font-bold text-green-800">{profile.dob}</h2>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {supervisorLinks.map(({ label, href, icon: Icon, description }) => (
          <Link
            key={href}
            href={href}
            className="bg-white p-6 shadow-lg rounded-xl hover:bg-green-50 hover:shadow-2xl transition group w-full"
          >
            <div className="flex items-start gap-8">
              <div className="p-4 bg-green-100 rounded-full text-black group-hover:bg-green-700 group-hover:text-white transform transition-all duration-300 group-hover:scale-110">
                <Icon className="w-10 h-10" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-green-800 group-hover:text-green-900">{label}</h2>
                <p className="text-sm text-gray-500">{description}</p>
              </div>
            </div>
            <hr className="my-4 border-t-2 border-gray-200" />
          </Link>
        ))}
      </div>
    </main>
  );
}
