'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, Settings, Calendar } from 'lucide-react';

type UserData = {
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

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    firstname: '',
    lastname: '',
    dob: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  const router = useRouter();
  const token = Cookies.get('token');

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    fetchLoggedInUser();
 
  }, []);

  const fetchLoggedInUser = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!res.ok) throw new Error('Not authenticated');

      const user = await res.json();
      setUserId(user.id);
      fetchUserProfile(user.id);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user info');
      setLoading(false);
    }
  };

  const fetchUserProfile = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/applicants/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!res.ok) throw new Error('Failed to fetch profile');

      const data: UserData = await res.json();
      const formattedDob = data.dob ? data.dob.split('T')[0] : '';

      setProfile(data);
      setFormData({
        title: data.title,
        firstname: data.firstname,
        lastname: data.lastname,
        dob: formattedDob,
        email: data.email,
        phone: data.phone,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!userId) {
      setError('User ID not found');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/applicants/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to update profile');

      const updated = await res.json();
      setProfile(updated.data || updated);
      alert('Profile updated successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      alert('Failed to update profile');
    }
  };

  if (loading) return <p className="text-center p-6">Loading profile...</p>;

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-green-900 mb-6 flex items-center gap-2">
    
        Profile Settings
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      {profile && (
        <div className="bg-white p-6 shadow rounded-lg mb-10">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 p-6 rounded-full">
              <User className="w-20 h-20 text-green-700" />
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

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 shadow rounded-lg">
        <h3 className="text-lg font-semibold text-green-800 mb-4">Edit Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Mr, Ms, Dr..."
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">Date of Birth</label>
            <div className="relative">
              <Calendar className="absolute top-3 left-3 text-gray-400 w-5 h-5" />
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full pl-10 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                required
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700">First Name</label>
            <input
              type="text"
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">Last Name</label>
            <input
              type="text"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              required
            />
          </div>
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Email</label>
          <div className="relative">
            <Mail className="absolute top-3 left-3 text-gray-400 w-5 h-5" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-10 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              required
            />
          </div>
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Phone</label>
          <div className="relative">
            <Phone className="absolute top-3 left-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full pl-10 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded-lg font-semibold transition"
        >
          Update Profile
        </button>
      </form>
    </div>
  );
}
