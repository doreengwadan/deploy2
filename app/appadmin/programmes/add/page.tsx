'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import Cookies from 'js-cookie';
import {
  BookOpen,
  Building,
  Calendar,
  Tag,
  Hash,
  Save,
  ArrowLeft,
  Layers,
} from 'lucide-react';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export default function AddOrEditProgrammePage() {
  const router = useRouter();
  const params = useParams();
  const programmeId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('');
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const token = Cookies.get('token');
        const res = await axios.get(`${API_BASE_URL}/admin/departments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDepartments(res.data);
      } catch (error) {
        console.error('Error fetching departments:', error);
        alert('Failed to fetch departments.');
      }
    };
    fetchDepartments();
  }, []);

  // Fetch programme details if editing
  useEffect(() => {
    const fetchProgramme = async () => {
      if (!programmeId) return;
      setIsEditing(true);
      try {
        const token = Cookies.get('token');
        const res = await axios.get(
          `${API_BASE_URL}/admin/programmes/${programmeId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = res.data;
        setName(data.name || '');
        setDescription(data.description || '');
        setDepartment(data.department || '');
        setDuration(data.duration || '');
        setCategory(data.category || '');
        setLevel(data.level || '');
      } catch (error) {
        console.error('Error fetching programme details:', error);
        alert('Failed to fetch programme details.');
      }
    };
    fetchProgramme();
  }, [programmeId]);

  // Handle submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = Cookies.get('token');
      const payload = { name, description, department, duration, category, level };

      if (isEditing) {
        await axios.put(`${API_BASE_URL}/admin/programmes/${programmeId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('Programme updated successfully!');
      } else {
        await axios.post(`${API_BASE_URL}/admin/programmes`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('Programme added successfully!');
      }

      router.push('/appadmin/programmes');
    } catch (error: any) {
      console.error('Error saving programme:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response:', error.response?.data);
        alert(
          `Failed to save programme: ${
            error.response?.data?.message || error.message
          }`
        );
      } else {
        alert('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/appadmin/programmes')}
            className="inline-flex items-center space-x-2 text-green-700 hover:text-green-800 font-medium mb-4 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Programmes</span>
          </button>

          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-xl">
              <BookOpen className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isEditing ? 'Edit Programme' : 'Add New Programme'}
              </h1>
              <p className="text-gray-600 mt-1">
                {isEditing
                  ? 'Update the programme details below.'
                  : 'Fill in the details to create a new programme.'}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-1 bg-gradient-to-r from-green-600 to-green-700"></div>
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* Programme Name */}
            <div>
              <label className="flex items-center space-x-2 mb-3 text-sm font-semibold text-gray-700">
                <BookOpen className="w-4 h-4 text-green-600" />
                <span>Programme Name</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Enter programme name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400 transition-all duration-200"
              />
            </div>

            {/* Programme Description */}
            <div>
              <label className="flex items-center space-x-2 mb-3 text-sm font-semibold text-gray-700">
                <Hash className="w-4 h-4 text-green-600" />
                <span>Programme Description</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Enter programme description"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400 font-mono transition-all duration-200 resize-none"
              />
            </div>

            {/* Department */}
            <div>
              <label className="flex items-center space-x-2 mb-3 text-sm font-semibold text-gray-700">
                <Building className="w-4 h-4 text-green-600" />
                <span>Department</span>
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white transition-all duration-200"
              >
                <option value="">Select a department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration / Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center space-x-2 mb-3 text-sm font-semibold text-gray-700">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span>Duration</span>
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                  placeholder="e.g., 3 years"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400 transition-all duration-200"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 mb-3 text-sm font-semibold text-gray-700">
                  <Tag className="w-4 h-4 text-green-600" />
                  <span>Category</span>
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  placeholder="e.g., Undergraduate"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400 transition-all duration-200"
                />
              </div>
            </div>

            {/* Programme Level */}
            {/* Submit Button */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 min-w-[200px]"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{isEditing ? 'Updating...' : 'Adding...'}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{isEditing ? 'Update Programme' : 'Add Programme'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Tips */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Quick Tips:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Programme name and description should be clear and specific</li>
            <li>• Duration format: “3 years”, “2 semesters”, etc.</li>
            <li>• Level examples: ODL, Masters, PhD</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
