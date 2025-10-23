"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import axios from "axios";
import { ArrowLeft, BookOpen, Building, Save, Loader, FileText } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

export default function EditProgrammePage() {
  const { id } = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    department: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fetch existing programme details
  useEffect(() => {
    const fetchProgramme = async () => {
      try {
        const token = Cookies.get("token");
        const res = await axios.get(`${API_BASE_URL}/admin/programmes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFormData({
          name: res.data.name || "",
          description: res.data.description || "",
          department: res.data.department || "",
        });
      } catch (err) {
        console.error("Failed to fetch programme:", err);
        setError("Failed to fetch programme details");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProgramme();
  }, [id]);

  // Handle input and textarea change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const token = Cookies.get("token");
      await axios.put(`${API_BASE_URL}/admin/programmes/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Programme updated successfully!");
      router.push("/appadmin/programmes");
    } catch (err: any) {
      console.error("Failed to update programme:", err);
      setError(err.response?.data?.message || "Failed to update programme");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center max-w-md w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading programme details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/appadmin/programmes")}
            className="inline-flex items-center space-x-2 text-green-700 hover:text-green-800 font-medium mb-6 transition-colors duration-200 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Programmes</span>
          </button>

          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-xl">
              <BookOpen className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Programme</h1>
              <p className="text-gray-600 mt-1">Update the programme details below</p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-1 bg-gradient-to-r from-green-600 to-green-700"></div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Programme Name */}
              <div>
                <label className="flex items-center space-x-2 mb-3 text-sm font-semibold text-gray-700">
                  <BookOpen className="w-4 h-4 text-green-600" />
                  <span>Programme Name</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter programme name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400 transition-all duration-200"
                />
              </div>

              {/* Programme Description (textarea) */}
              <div>
                <label className="flex items-center space-x-2 mb-3 text-sm font-semibold text-gray-700">
                  <FileText className="w-4 h-4 text-green-600" />
                  <span>Programme Description</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="Enter detailed programme description"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400 transition-all duration-200 resize-none"
                />
              </div>

              {/* Department */}
              <div>
                <label className="flex items-center space-x-2 mb-3 text-sm font-semibold text-gray-700">
                  <Building className="w-4 h-4 text-green-600" />
                  <span>Department</span>
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  placeholder="Enter department name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400 transition-all duration-200"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 min-w-[200px]"
              >
                {submitting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Update Programme</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Editing Tips:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Write a clear, concise programme description</li>
            <li>• Ensure the department name matches existing departments</li>
            <li>• Changes will be reflected immediately across the system</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
