'use client';

import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function GuestDashboard() {
  const router = useRouter();
  const user = Cookies.get('user') ? JSON.parse(Cookies.get('user')!) : null;

  if (!user) {
    router.push('/login'); // Redirect if not logged in
    return null;
  }

  const applicationTypes = [
    { label: 'ODL Application', route: '/application/dashboard' },
    { label: 'Masters Application', route: '/apply/masters' },
    { label: 'PhD Application', route: '/apply/phd' },
    { label: 'Weekend Application', route: '/apply/weekend' },
    { label: 'Economic Fee Application', route: '/apply/economic-fee' },
  ];

  function handleSelect(route: string) {
    router.push(route);
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Welcome, {user.firstname}!
      </h1>
      <p className="mb-6 text-gray-700 text-center">
        Please select the type of application you want to submit:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {applicationTypes.map((app) => (
          <button
            key={app.route}
            onClick={() => handleSelect(app.route)}
            className="bg-white shadow-md hover:shadow-lg transition rounded-xl p-6 flex flex-col items-center justify-center text-center border border-gray-200"
          >
            <span className="text-lg font-semibold text-gray-800">{app.label}</span>
          </button>
        ))}
      </div>
    </main>
  );
}
