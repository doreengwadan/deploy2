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

const API_BASE_URL = '/api';

interface FormData {
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  dob: string;
  nationality: string;
  nationalId: string;
  homeDistrict: string;
  physicalAddress: string;
  email: string;
}

export default function PersonalDetailsPage() {
  const [form, setForm] = useState<FormData>({
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
  const [userId, setUserId] = useState<string | null>(null);

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
      if (!token) throw new Error('Not authenticated');

      // Call the new /me endpoint
      const profileRes = await fetch(`${API_BASE_URL}/applicants/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!profileRes.ok) {
        const errData = await profileRes.json();
        throw new Error(errData.message || 'Failed to fetch profile');
      }

      const data = await profileRes.json();
      setUserId(data.id);

      setForm({
        firstName: data.firstName || '',
        middleName: data.middleName || '',
        lastName: data.lastName || '',
        gender: data.gender || '',
        dob: data.dob ? data.dob.split('T')[0] : '',
        nationality: data.nationality || '',
        nationalId: data.nationalId || '',
        homeDistrict: data.homeDistrict || '',
        physicalAddress: data.physicalAddress || '',
        email: data.email || '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    if (!userId || !token) {
      setError('User not authenticated');
      setSaving(false);
      return;
    }

    try {
      const payload = {
        firstname: form.firstName,
        middlename: form.middleName,
        lastname: form.lastName,
        gender: form.gender,
        dob: form.dob,
        nationality: form.nationality,
        national_id: form.nationalId,
        home_district: form.homeDistrict,
        physical_address: form.physicalAddress,
        email: form.email,
      };

      const res = await fetch(`${API_BASE_URL}/applicants/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to update profile');
      }

      router.push('/application/contact-details');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const getGenderIcon = () => {
    if (form.gender === 'Male') return <Mars className="w-5 h-5 text-blue-600" />;
    if (form.gender === 'Female') return <Venus className="w-5 h-5 text-pink-600" />;
    return <UserCircle className="w-5 h-5 text-gray-400" />;
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
        <ProgressIndicator currentStep={3} />

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mt-6">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Personal Details</h1>
                <p className="text-green-100 text-lg">Step 1 of 4 - Tell us about yourself</p>
              </div>
            </div>
          </div>

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
              {/* Add form fields here using `form` and `handleChange` */}
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

        <div className="text-center mt-6">
          <p className="text-gray-600 text-sm">
            Fields marked with * are required. Your information is secure and encrypted.
          </p>
        </div>
      </div>
    </div>
  );
}
