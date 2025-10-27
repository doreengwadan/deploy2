'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import ProgressIndicator from '@/componets/ProgressIndicator';

export default function NextOfKinPage() {
  const [form, setForm] = useState({
    title: '',
    relationship: '',
    firstName: '',
    lastName: '',
    mobile1: '',
    mobile2: '',
    email: '',
    address: '',
  });
  const [savedKins, setSavedKins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const token = Cookies.get('token');

  const authFetch = async (url: string, options: RequestInit = {}) => {
    if (!token) throw new Error('User not authenticated');

    const headers = {
      ...options.headers,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    };

    const res = await fetch(url, { ...options, headers, credentials: 'include' });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  };

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const user = await authFetch('/api/user');
        setUserId(user.id);

        const kinData = await authFetch(`/api/next-of-kin/${user.id}`);
        setSavedKins(kinData.data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveKin = async () => {
    if (!userId) {
      setError('User not authenticated');
      return false;
    }

    setIsSubmitting(true);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId
        ? `/api/next-of-kin/${userId}`
        : `/api/next-of-kin/${userId}`;

      const saved = await authFetch(url, {
        method,
        body: JSON.stringify(editingId ? { ...form, kinId: editingId } : form),
      });

      if (editingId) {
        setSavedKins((prev) =>
          prev.map((k) => (k.id === editingId ? saved.data : k))
        );
        setEditingId(null);
      } else {
        setSavedKins((prev) => [...prev, saved.data]);
      }

      setForm({
        title: '',
        relationship: '',
        firstName: '',
        lastName: '',
        mobile1: '',
        mobile2: '',
        email: '',
        address: '',
      });

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddAnother = async () => {
    await saveKin();
  };

  const handleNext = async () => {
    const success = await saveKin();
    if (!success) return;

    try {
      const user = await authFetch('/api/user');

      if (user.role?.toLowerCase() === 'postgraduate') {
        router.push('/application/academicHistory');
      } else {
        router.push('/application/High-school-records');
      }
    } catch {
      router.push('/application/High-school-records');
    }
  };

  const handleEdit = (kin: any) => {
    setForm({
      title: kin.title,
      relationship: kin.relationship,
      firstName: kin.firstName,
      lastName: kin.lastName,
      mobile1: kin.mobile1,
      mobile2: kin.mobile2 || '',
      email: kin.email || '',
      address: kin.address,
    });
    setEditingId(kin.id);
  };

  const handleDelete = async (kinId: number) => {
    if (!userId) return;
    if (!confirm('Are you sure you want to delete this next of kin?')) return;

    try {
      await authFetch(`/api/next-of-kin/${userId}`, {
        method: 'DELETE',
        body: JSON.stringify({ kinId }),
      });
      setSavedKins((prev) => prev.filter((k) => k.id !== kinId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <ProgressIndicator currentStep={5} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-6 py-8 text-white">
            <h1 className="text-3xl font-bold mb-2">Next of Kin Details</h1>
            <p className="text-green-100 opacity-90">
              Please provide information about your next of kin for emergency contact purposes
            </p>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <select 
                    name="title" 
                    value={form.title} 
                    onChange={handleChange} 
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white"
                  >
                    <option value="">Select Title</option>
                    <option value="Mr">Mr</option>
                    <option value="Mrs">Mrs</option>
                    <option value="Miss">Miss</option>
                    <option value="Dr">Dr</option>
                  </select>
                </div>

                {/* Relationship */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Relationship <span className="text-red-500">*</span>
                  </label>
                  <select 
                    name="relationship" 
                    value={form.relationship} 
                    onChange={handleChange} 
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white"
                  >
                    <option value="">Select Relationship</option>
                    <option value="Parent">Parent</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Uncle">Uncle</option>
                    <option value="Aunt">Aunt</option>
                    <option value="Grandparent">Grandparent</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* First Name */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    name="firstName" 
                    value={form.firstName} 
                    onChange={handleChange} 
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    placeholder="Enter first name"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    name="lastName" 
                    value={form.lastName} 
                    onChange={handleChange} 
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    placeholder="Enter last name"
                  />
                </div>

                {/* Mobile 1 */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Primary Mobile <span className="text-red-500">*</span>
                  </label>
                  <input 
                    name="mobile1" 
                    value={form.mobile1} 
                    onChange={handleChange} 
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    placeholder="Enter primary mobile number"
                  />
                </div>

                {/* Mobile 2 */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Secondary Mobile
                  </label>
                  <input 
                    name="mobile2" 
                    value={form.mobile2} 
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    placeholder="Enter secondary mobile number"
                  />
                </div>

                {/* Email */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Email Address
                  </label>
                  <input 
                    type="email" 
                    name="email" 
                    value={form.email} 
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    placeholder="Enter email address"
                  />
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Postal Address <span className="text-red-500">*</span>
                  </label>
                  <input 
                    name="address" 
                    value={form.address} 
                    onChange={handleChange} 
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    placeholder="Enter complete postal address"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between pt-6 border-t border-gray-200">
                <button 
                  type="button" 
                  onClick={handleAddAnother}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {editingId ? 'Updating...' : 'Saving...'}
                    </>
                  ) : (
                    editingId ? 'Update Kin' : 'Save & Add Another'
                  )}
                </button>
                
                <button 
                  type="button" 
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-200"
                >
                  Save & Continue
                </button>
              </div>
            </form>

            {/* Saved Next of Kin */}
            {savedKins.length > 0 && (
              <div className="mt-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Saved Next of Kin</h2>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {savedKins.length} saved
                  </span>
                </div>
                
                <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Relationship</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Mobile</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {savedKins.map((kin) => (
                          <tr key={kin.id} className="hover:bg-white transition-colors duration-150">
                            <td className="px-4 py-4 text-sm font-medium text-gray-900">{kin.title}</td>
                            <td className="px-4 py-4 text-sm text-gray-700">
                              {kin.firstName} {kin.lastName}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-700">{kin.relationship}</td>
                            <td className="px-4 py-4 text-sm text-gray-700">
                              <div>{kin.mobile1}</div>
                              {kin.mobile2 && <div className="text-gray-500 text-xs">{kin.mobile2}</div>}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-700">
                              {kin.email || <span className="text-gray-400">-</span>}
                            </td>
                            <td className="px-4 py-4 text-sm">
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => handleEdit(kin)}
                                  className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg font-medium hover:bg-yellow-200 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-1 transition-colors duration-200 text-xs"
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={() => handleDelete(kin.id)}
                                  className="px-3 py-1 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-colors duration-200 text-xs"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}