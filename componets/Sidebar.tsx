'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  User,
  Home,
  FileText,
  BookOpen,
  Users,
  Building2,
  Settings,
  Menu,
  X,
  FileCheck,
} from 'lucide-react';

// ✅ Nav Items for ODL Student
const studentNavItems = [
  { label: 'Dashboard', href: '/application/dashboard', icon: Home },
  { label: 'Profile', href: '/application/personal-details', icon: User },
  { label: 'Contacts', href: '/application/contact-details', icon: Building2 },
  { label: 'Grades', href: '/application/High-school-records', icon: BookOpen },
  { label: 'Documents', href: '/application/documents', icon: FileText },
  { label: 'Next of Kin', href: '/application/next-of-kin', icon: Users },
  { label: 'Program Selection', href: '/application/program-selection', icon: FileCheck },
  { label: 'Submit', href: '/application/submit', icon: FileText },
  { label: 'Settings', href: '/student/settings', icon: Settings },
];

export default function StudentSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isActiveLink = (href: string) => {
    return pathname === href;
  };

  return (
    <aside className="w-64 fixed top-0 left-0 h-screen bg-white shadow-md border-r border-gray-200 py-2 overflow-y-auto z-50">
      {/* Mobile Toggle */}
      <button
        className="md:hidden fixed top-4 right-4 z-[60] bg-white p-2 rounded shadow"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Sidebar"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-green-800" />
        ) : (
          <Menu className="w-6 h-6 text-green-800" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-10 left-0 h-screen w-64 bg-white shadow-md border-r border-gray-200 px-4 pt-0
          overflow-y-auto z-40
          transform transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        {/* Logo */}
        <Image
          src="/logo.jpeg"
          width={80}
          height={40}
          alt="Mzuzu University Logo"
          className="mb-4 mx-auto"
        />

        {/* Title */}
        <div className="text-center mb-4">
          <h1 className="font-extrabold text-green-950">
            Mzuni  Application Student
          </h1>
          <p className="text-gray-500 text-sm">
            Online Distance Learning Application Portal
          </p>
        </div>

        <hr className="mb-3" />

        {/* Navigation */}
        <nav className="space-y-4">
          {studentNavItems.map(({ label, href, icon: Icon }) => {
            const isActive = isActiveLink(href);
            return (
              <Link
                key={`${href}-${label}`}
                href={href}
                className={`flex items-center gap-3 font-bold px-3 py-2 rounded-md transition-all ${
                  isActive
                    ? 'bg-green-700 text-white'
                    : 'text-green-700 hover:bg-gray-400 hover:text-white'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-700'}`} />
                <span className="text-base font-bold">{label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </aside>
  );
}