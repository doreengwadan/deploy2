'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Moon,
  Sun,
  Settings as SettingsIcon,
  User as UserIcon,
  LogOut,
} from 'lucide-react';
import Button from '@/componets/Button';

const Header2 = () => {
  const [user, setUser] = useState<{ firstname: string; lastname: string } | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const stored = Cookies.get('user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      } catch {
        console.error('Invalid user cookie');
      }
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogout = () => {
    Cookies.remove('user');
    Cookies.remove('token');
    router.push('/login');
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white py-4 shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-green-900 font-bold text-xl">Mzuzu University</h1>

          <nav className="flex items-center space-x-4">
            {/* Notifications */}
            <Link
              href="#"
              className="relative flex items-center text-green-900 font-bold hover:underline"
            >
              <Bell className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="w-10 h-10 rounded-full bg-green-700 text-white font-bold flex items-center justify-center"
                >
                  {user.firstname?.[0] ?? ''}{user.lastname?.[0] ?? ''}
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-44 bg-white border rounded shadow-lg z-50">
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-gray-800 hover:bg-gray-100"
                    >
                      <UserIcon className="w-4 h-4" /> Profile
                    </Link>

                    <Link
                      href="/settings"
                      className="flex items-center gap-2 px-4 py-2 text-gray-800 hover:bg-gray-100"
                    >
                      <SettingsIcon className="w-4 h-4" /> Settings
                    </Link>

                    <button
                      onClick={() => setDarkMode(!darkMode)}
                      className="flex items-center gap-2 px-4 py-2 w-full text-left text-gray-800 hover:bg-gray-100"
                    >
                      {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                      {darkMode ? 'Light Mode' : 'Dark Mode'}
                    </button>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 w-full text-left text-red-600 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button
                type="button"
                title="Login"
                icon="/user.svg"
                variant="bg-gray-800"
                href="/login"
              />
            )}
          </nav>
        </div>
      </header>

      {/* Spacer */}
      <div className="h-16" />
    </>
  );
};

export default Header2;
