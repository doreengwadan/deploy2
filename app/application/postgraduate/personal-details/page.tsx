'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import {
  User,
  Calendar,
  Globe,
  IdCard,
  Venus,
  Mail
} from 'lucide-react';
import ProgressIndicator from '@/componets/ProgressIndicator';
import Button2 from '@/componets/Button2';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

const countries = [
  'Malawi',
  'Zambia',
  'Tanzania',
  'South Africa',
  'Kenya',
  'Uganda',
  'Nigeria',
  'Ghana',
  'Zimbabwe',
  'Mozambique',
];

export default function InternationalPersonalDetailsPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstname: '',
    lastname: '',
    dob: '',
    gender: '',
    nationality: '',
    passport_number: '',
    email: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const token = Cookies.get('token');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    fetchUser();
  }, [token]);

  // Fetch authenticated user and prefill form
  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch user');
      const user = await res.json();
      setUserId(user.id);

      // Prefill form with existing applicant data
      const profileRes = await fetch(`${API_BASE_URL}/applicants/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      if (profileRes.ok) {
        const data = await profileRes.json();
        setForm({
          firstname: data.firstname || '',
          lastname: data.lastname || '',
          dob: data.dob ? data.dob.split('T')[0] : '',
          gender: data.gender || '',
          nationality: data.nationality || '',
          passport_number: data.passport_number || '',
          email: data.email || user.email || '',
        });
      } else {
        setForm((prev) => ({ ...prev, email: user.email || '' }));
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch user data');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Submit updates
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!userId || !token) {
      setError('User not authenticated');
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/applicants/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: JSON.stringify(form), // includes email now
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update details');
      }

      router.push('/application/contact-details');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to save details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ProgressIndicator currentStep={3} />

      <div className="max-w-xl mx-auto bg-white p-6 rounded shadow-md mt-6">
        <h1 className="text-2xl font-bold mb-4 text-green-900">
           Personal Details
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* First Name */}
          <label className="block font-semibold mb-1 text-gray-600">First Name</label>
          <div className="relative mb-4">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              name="firstname"
              value={form.firstname}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded"
            />
          </div>

          {/* Last Name */}
          <label className="block font-semibold mb-1 text-gray-600">Last Name</label>
          <div className="relative mb-4">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              name="lastname"
              value={form.lastname}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded"
            />
          </div>

          {/* Email */}
          <label className="block font-semibold mb-1 text-gray-600">Email</label>
          <div className="relative mb-4">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded"
            />
          </div>

          {/* Gender */}
          <label className="block font-semibold mb-1 text-gray-600">Gender</label>
          <div className="relative mb-4">
            <Venus className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded bg-white"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          {/* Date of Birth */}
          <label className="block font-semibold mb-1 text-gray-600">Date of Birth</label>
          <div className="relative mb-4">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="date"
              name="dob"
              value={form.dob}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded"
            />
          </div>

          {/* Nationality */}
          <label className="block font-semibold mb-1 text-gray-600">Nationality</label>
          <div className="relative mb-4">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select
              name="nationality"
              value={form.nationality}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded bg-white"
            >
              <option value="">Select Country</option>
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Passport Number */}
          <label className="block font-semibold mb-1 text-gray-600">Passport Number</label>
          <div className="relative mb-6">
            <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              name="passport_number"
              value={form.passport_number}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded"
            />
          </div>

          <Button2 type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Continue to Contact Details'}
          </Button2>
        </form>
      </div>
    </>
  );
}
