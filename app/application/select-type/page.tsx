'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProgressIndicator from '@/componets/ProgressIndicator';
import Cookies from 'js-cookie';
import axios from 'axios';

interface ApplicationType {
  id: string;
  name: string;
  description: string;
  requirements: string[];
}

const applicationTypes: ApplicationType[] = [
  {
    id: 'odl',
    name: 'ODL student Application',
    description:
      "For students applying for bachelor's degree programs under Open and Distance Learning",
    requirements: [
      'High School Certificate or equivalent',
      'Minimum GPA requirements met',
      'Completed application form',
    ],
  },
  {
    id: 'postgraduate',
    name: 'Postgraduate Application',
    description: 'For students applying for master’s or doctoral programs',
    requirements: [
      "Bachelor's degree certificate",
      'Academic transcripts',
      'Research proposal (for research programs)',
      'Letters of recommendation',
    ],
  },
  {
    id: 'diploma',
    name: 'Diploma/Certificate Programs',
    description: 'For students applying for diploma or certificate courses',
    requirements: [
      'High School Certificate or equivalent',
      'Specific subject requirements (if applicable)',
    ],
  },
  {
    id: 'international',
    name: 'International Student Application',
    description: 'For international students applying to Mzuzu University',
    requirements: [
      'Equivalent qualifications recognized by Malawi Qualifications Authority',
      'English language proficiency certificate',
      'Student visa documentation',
      'Passport copies',
    ],
  },
];

const API_BASE_URL = '/api'; // ✅ Now pointing to Next.js API route

export default function SelectApplicationType() {
  const [selectedType, setSelectedType] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const t = Cookies.get('token');
    if (!t) {
      router.push('/login');
      return;
    }
    setToken(t);
  }, [router]);

  const handleSelection = (typeId: string) => {
    setSelectedType(typeId);
  };

  const handleContinue = async () => {
    if (!selectedType || !token) return;

    setIsLoading(true);
    try {
      const res = await axios.patch(
        `${API_BASE_URL}/applicants/update-role`,
        { role: selectedType },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );

      // ✅ Update token user info cookie
      const updatedUser = res.data.user;
      Cookies.set('user', JSON.stringify(updatedUser), { expires: 7 });
      localStorage.setItem('applicationType', selectedType);

      // ✅ Redirect based on selection
      switch (selectedType) {
        case 'odl':
          router.push('/application/personal-details');
          break;
        case 'postgraduate':
          router.push('/application/postgraduate/personal-details');
          break;
        case 'diploma':
          router.push('/application/diploma/personal-details');
          break;
        case 'international':
          router.push('/application/international/personal-details');
          break;
        default:
          router.push('/application/personal-details');
      }
    } catch (error: any) {
      console.error('Error updating role:', error.response?.data || error.message);
      alert(error.response?.data?.message || 'Failed to update role');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/application/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ProgressIndicator currentStep={2} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-green-900 mb-2">
              Select Application Type
            </h1>
            <p className="text-gray-600">
              Choose the type of application that matches your qualifications and goals
            </p>
          </div>

          {/* Application Type Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {applicationTypes.map((type) => (
              <div
                key={type.id}
                className={`border-2 rounded-lg p-6 cursor-pointer transition-all duration-200 ${
                  selectedType === type.id
                    ? 'border-green-900 bg-green-50 shadow-md'
                    : 'border-gray-200 hover:border-green-500 hover:bg-green-25'
                }`}
                onClick={() => handleSelection(type.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-semibold text-gray-900">{type.name}</h3>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedType === type.id
                        ? 'border-green-900 bg-green-900'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedType === type.id && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{type.description}</p>

                <div className="bg-gray-50 rounded p-3">
                  <h4 className="font-medium text-gray-700 mb-2">Requirements:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {type.requirements.map((req, index) => (
                      <li key={index} className="flex items-start">
                        <svg
                          className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Selection Info */}
          {selectedType && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-blue-800 font-medium">
                  Selected: {applicationTypes.find((t) => t.id === selectedType)?.name}
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <button
              onClick={handleBack}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Back to Dashboard
            </button>

            <button
              onClick={handleContinue}
              disabled={!selectedType || isLoading}
              className={`px-8 py-2 rounded-md text-white font-medium ${
                selectedType && !isLoading ? 'bg-green-900 hover:bg-green-800' : 'bg-gray-400 cursor-not-allowed'
              } transition-colors`}
            >
              {isLoading ? 'Processing...' : 'Continue to Personal Details'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
