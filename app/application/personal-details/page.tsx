'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { User, Calendar, Globe, MapPin, IdCard, Mail, Save, Venus, Mars, UserCircle } from 'lucide-react';
import ProgressIndicator from '@/componets/ProgressIndicator';
import Button2 from '@/componets/Button2';

const countries = [
  'Malawi','Zambia','Tanzania','South Africa','Kenya','Uganda','Nigeria','Ghana','Zimbabwe','Mozambique',
];

const districts = [
  'Balaka', 'Blantyre', 'Chikwawa', 'Chiradzulu', 'Chitipa', 'Dedza', 'Dowa',
  'Karonga', 'Kasungu', 'Likoma', 'Lilongwe', 'Machinga', 'Mangochi', 'Mchinji',
  'Mulanje', 'Mwanza', 'Mzimba', 'Nkhata Bay', 'Nkhotakota', 'Nsanje', 'Ntcheu',
  'Ntchisi', 'Phalombe', 'Rumphi', 'Salima', 'Thyolo', 'Zomba'
];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export default function PersonalDetailsPage() {
  const [form, setForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    gender: '',
    dob: '',
    nationality: '',
    nationalId: '',
    homeDistrict: '',
    physicalAddress: '',
    email: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  const router = useRouter();
  const token = Cookies.get('token');

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    fetchProfile();
  }, [token]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      // Get authenticated user
      const res = await fetch(`${API_BASE_URL}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!res.ok) throw new Error('Not authenticated');

      const user = await res.json();
      setUserId(user.id);

      // Get applicant profile
      const profileRes = await fetch(`${API_BASE_URL}/applicants/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!profileRes.ok) throw new Error('Failed to fetch profile');

      const data = await profileRes.json();
      const dob = data.dob ? data.dob.split('T')[0] : '';

      setForm({
        firstName: data.firstname || '',
        middleName: data.middlename || '',
        lastName: data.lastname || '',
        gender: data.gender || '',
        dob,
        nationality: data.nationality || '',
        nationalId: data.national_id || '',
        homeDistrict: data.home_district || '',
        physicalAddress: data.physical_address || '',
        email: data.email || '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    if (!userId || !token) {
      setError('User not authenticated');
      setSaving(false);
      return;
    }

    try {
      // Map frontend form to Laravel column names
      const payload = {
        firstname: form.firstName,
        middlename: form.middleName,
        lastname: form.lastName,
        gender: form.gender,
        email: form.email,
        dob: form.dob,
        nationality: form.nationality,
        national_id: form.nationalId,
        home_district: form.homeDistrict,
        physical_address: form.physicalAddress,
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
        throw new Error(errorData.message || 'Failed to update profile');
      }

      await res.json();

      // ✅ Redirect to next step after success
      router.push('/application/contact-details');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  // Get gender icon based on selection
  const getGenderIcon = () => {
    if (form.gender === 'Male') {
      return <Mars className="w-5 h-5 text-blue-600" />;
    } else if (form.gender === 'Female') {
      return <Venus className="w-5 h-5 text-pink-600" />;
    } else {
      return <UserCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Indicator */}
        <ProgressIndicator currentStep={3} />

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mt-6">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Personal Details
                </h1>
                <p className="text-green-100 text-lg">
                  Step 1 of 4 - Tell us about yourself
                </p>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg mr-3">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information Section */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 text-green-600 mr-2" />
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      First Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                        required
                        placeholder="Enter your first name"
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white"
                      />
                    </div>
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Last Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        required
                        placeholder="Enter your last name"
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white"
                      />
                    </div>
                  </div>

                  {/* Middle Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Middle Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="middleName"
                        value={form.middleName}
                        onChange={handleChange}
                        placeholder="Optional middle name"
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white"
                      />
                    </div>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Gender *
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        {getGenderIcon()}
                      </div>
                      <select
                        name="gender"
                        value={form.gender}
                        onChange={handleChange}
                        required
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white appearance-none"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        placeholder="your.email@example.com"
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white"
                      />
                    </div>
                  </div>

                  {/* Date of Birth */}
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
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Nationality & Identification Section */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Globe className="w-5 h-5 text-blue-600 mr-2" />
                  Nationality & Identification
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nationality */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Nationality *
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <select
                        name="nationality"
                        value={form.nationality}
                        onChange={handleChange}
                        required
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white appearance-none"
                      >
                        <option value="">Select Nationality</option>
                        {countries.map((country) => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* National ID */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      National ID Number
                    </label>
                    <div className="relative">
                      <IdCard className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="nationalId"
                        value={form.nationalId}
                        onChange={handleChange}
                        placeholder="e.g., MW1234567"
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Information Section */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 text-orange-600 mr-2" />
                  Location Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Home District */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Home District *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <select
                        name="homeDistrict"
                        value={form.homeDistrict}
                        onChange={handleChange}
                        required
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white appearance-none"
                      >
                        <option value="">Select District</option>
                        {districts.map((district) => (
                          <option key={district} value={district}>
                            {district}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Physical Address */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Physical Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="physicalAddress"
                        value={form.physicalAddress}
                        onChange={handleChange}
                        placeholder="Enter your complete physical address"
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <Button2 
                  type="submit" 
                  disabled={saving}
                  className="min-w-[200px] py-4 text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {saving ? (
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
            Fields marked with * are required. Your information is secure and encrypted.
          </p>
        </div>
      </div>
    </div>
  );
}