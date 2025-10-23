'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { User, Phone, MapPin, IdCard, Save } from 'lucide-react';
import ProgressIndicator from '@/componets/ProgressIndicator';
import Button2 from '@/componets/Button2';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export default function ContactDetailsPage() {
  const router = useRouter();
  const token = Cookies.get('token');

  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    email: '',
    phone: '',
    physical_address: '',
    home_district: '',
    national_id: '',
  });

  const [personalData, setPersonalData] = useState<any>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    fetchUser();
  }, [token]);

  // Fetch authenticated user
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

      // Fetch full applicant profile
      const profileRes = await fetch(`${API_BASE_URL}/applicants/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      if (!profileRes.ok) throw new Error('Failed to fetch profile');
      const data = await profileRes.json();
      setPersonalData(data);

      // Prefill contact form
      setForm({
        email: data.email || '',
        phone: data.phone || '',
        physical_address: data.physical_address || '',
        home_district: data.home_district || '',
        national_id: data.national_id || '',
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load data');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!userId || !token || !personalData) {
      setError('User not authenticated or personal data missing');
      return;
    }

    try {
      setLoading(true);

      // Merge personal + contact details
      const payload = {
        firstname: personalData.firstname,
        lastname: personalData.lastname,
        dob: personalData.dob,
        gender: personalData.gender,
        nationality: personalData.nationality,
        passport_number: personalData.passport_number,
        email: form.email,
        phone: form.phone,
        physical_address: form.physical_address,
        home_district: form.home_district,
        national_id: form.national_id,
      };

      const res = await fetch(`${API_BASE_URL}/applicants/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update contact details');
      }

      router.push('/application/next-of-kin'); // replace with next page
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to save contact details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Indicator */}
        <ProgressIndicator currentStep={4} />

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mt-6">
          <div className="bg-gradient-to-r from-green-600 to-red-100 px-8 py-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Contact Details
                </h1>
              </div>
            </div>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Email *
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Phone *
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    placeholder="Enter your phone number"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                  />
                </div>
              </div>

              {/* Physical Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Physical Address *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="physical_address"
                    value={form.physical_address}
                    onChange={handleChange}
                    required
                    placeholder="Enter your physical address"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                  />
                </div>
              </div>

              {/* Home District */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Home District
                </label>
                <input
                  type="text"
                  name="home_district"
                  value={form.home_district}
                  onChange={handleChange}
                  placeholder="Enter your home district"
                  className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                />
              </div>

              {/* National ID */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  National ID
                </label>
                <div className="relative">
                  <IdCard className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="national_id"
                    value={form.national_id}
                    onChange={handleChange}
                    placeholder="Enter your National ID"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <Button2
                  type="submit"
                  disabled={loading}
                  className="min-w-[200px] py-4 text-lg font-semibold"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Saving Details...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Save className="w-5 h-5 mr-2" />
                      Continue to Next Step
                    </div>
                  )}
                </Button2>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}