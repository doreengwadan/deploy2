'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, Lock, BookOpen, MessageSquare, FileText, Sun, Moon, ChevronRight 
} from 'lucide-react';

type UserData = {
  id: number;
  title: string;
  firstname: string;
  lastname: string;
  dob: string;
  email: string;
  phone: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();

  const applicantId = 2;

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/applicants/${applicantId}`);
      const data: UserData = await res.json();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = (section: string) => {
    switch (section) {
      case 'profile':
        router.push('/admin/settings');
        break;
      case 'security':
        router.push('/security');
        break;
      case 'manual':
        router.push('/manual');
        break;
      case 'contact':
        router.push('/contact');
        break;
      case 'terms':
        router.push('/terms');
        break;
      default:
        break;
    }
  };


  if (loading) return <p className="text-center p-6">Loading settings...</p>;

  const SectionHeader = ({ id, title, icon: Icon }: { id: string; title: string; icon: React.ElementType }) => (
    <button
      onClick={() => handleNavigation(id)}
      className="w-full flex justify-between items-center py-4 px-6 bg-gray-300 text-black rounded-lg mb-3 shadow"
    >
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5" />
        <span className="font-semibold">{title}</span>
      </div>
      <ChevronRight className="w-5 h-5" /> 
    </button>
  );

  return (
    <div className={`p-6 md:p-10 max-w-3xl mx-auto `}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl text-green-700 font-bold flex items-center gap-2">
          Settings
        </h2>
        
      </div>

      <SectionHeader id="profile" title="Profile" icon={User} />
      <SectionHeader id="security" title="Password & Security" icon={Lock} />
      <SectionHeader id="manual" title="System User Manual" icon={BookOpen} />
      <SectionHeader id="contact" title="Contact Us" icon={MessageSquare} />
      <SectionHeader id="terms" title="Terms and Policy" icon={FileText} />

    </div>
  );
}
