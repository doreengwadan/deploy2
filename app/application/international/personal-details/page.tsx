'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import {
  User,
  Calendar,
  IdCard,
  MapPin,
  Flag,
  Save,
  Venus,
  Mars,
} from 'lucide-react';
import ProgressIndicator from '@/componets/ProgressIndicator';
import Button2 from '@/componets/Button2';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

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
  'Botswana',
  'Namibia',
  'Ethiopia',
  'Rwanda',
  'Burundi',
  'Democratic Republic of Congo',
  'Lesotho',
  'Eswatini',
  'Sudan',
  'Egypt',
  'Jerusalem',
];

export default function InternationalPersonalDetailsPage() {
  const router = useRouter();
  const token = Cookies.get('token');

  const [form, setForm] = useState({
    firstname: '',
    lastname: '',
    dob: '',
    gender: '',
    nationality: '',
    passport_number: '',
    email: '',
  });

  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Redirect to login if not authenticated
  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    fetchUser();
  }, [token]);

  // 🔹 Fetch authenticated user
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

      // Prefill email and other applicant data
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
        // fallback: use user email
        setForm((prev) => ({ ...prev, email: user.email || '' }));
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch user data');
    }
  };

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // 🔹 Submit updates to Laravel
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
        body: JSON.stringify(form), // send all form data
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

  const getGenderIcon = () => {
    if (form.gender === 'Male') {
      return (
        <Mars className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      );
    } else if (form.gender === 'Female') {
      return (
        <Venus className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      );
    } else {
      return (
        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Indicator */}
        <ProgressIndicator currentStep={3} />

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mt-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  International Applicant
                </h1>
                <p className="text-blue-100 text-lg">
                  Personal Details - Step 1 of 4
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg mr-3">
                    <svg
                      className="w-5 h-5 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    First Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="firstname"
                      value={form.firstname}
                      onChange={handleChange}
                      required
                      placeholder="Enter your first name"
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Last Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="lastname"
                      value={form.lastname}
                      onChange={handleChange}
                      required
                      placeholder="Enter your last name"
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Gender & DOB */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Gender *
                  </label>
                  <div className="relative">
                    {getGenderIcon()}
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white appearance-none"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Date of Birth *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="date"
                      name="dob"
                      value={form.dob}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Nationality & Passport */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Nationality *
                  </label>
                  <div className="relative">
                    <Flag className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      name="nationality"
                      value={form.nationality}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white appearance-none"
                    >
                      <option value="">Select Nationality</option>
                      {countries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Passport Number *
                  </label>
                  <div className="relative">
                    <IdCard className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="passport_number"
                      value={form.passport_number}
                      onChange={handleChange}
                      required
                      placeholder="e.g., AB1234567"
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white uppercase"
                    />
                  </div>
                </div>
              </div>

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

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-blue-800 font-semibold mb-1">
                      International Student Requirements
                    </h4>
                    <p className="text-blue-700 text-sm">
                      Ensure your passport is valid for at least 6 months from the
                      intended start date. Additional documentation may be
                      required for visa processing.
                    </p>
                  </div>
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
                      Continue to Contact Details
                    </div>
                  )}
                </Button2>
              </div>
            </form>
          </div>
        </div>

        {/* Help Text */}
        <div className="text-center mt-6">
          <p className="text-gray-600 text-sm">
            Need help? Contact international admissions at{' '}
            <a
              href="mailto:international@mzuni.ac.mw"
              className="text-blue-600 hover:underline"
            >
              international@mzuni.ac.mw
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
