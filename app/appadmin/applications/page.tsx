'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, User, Calendar, Eye, Edit, Check, X } from 'lucide-react';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

// ✅ Match backend structure
type ApplicantSubmission = {
  id: number;
  applicant_name: string;
  programme: string;
  reference_number?: string;
  status: string;
  submitted_at: string;
};

// Status options
const STATUS_OPTIONS = [
  'pending',
  'under review',
  'approved',
  'rejected'
];

export default function ApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicantSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [editingStatus, setEditingStatus] = useState<{id: number, status: string} | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = Cookies.get('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const res = await axios.get(`${API_BASE_URL}/applicant-submissions`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // ✅ The backend returns an array with applicant_name, programme, etc.
        setApplications(res.data);
      } catch (err: any) {
        console.error('Failed to fetch applications:', err);

        if (err.response?.status === 401) {
          alert('Session expired. Please log in again.');
          router.push('/login');
        } else if (err.response?.status === 403) {
          alert('You do not have permission to view applications.');
        } else if (err.response?.status === 404) {
          alert('Endpoint not found on the server.');
        } else {
          alert('Failed to fetch applications. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [router]);

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      setUpdatingId(id);
      const token = Cookies.get('token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await axios.patch(
        `${API_BASE_URL}/applicant-submissions/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setApplications(prev => prev.map(app => 
        app.id === id ? { ...app, status: newStatus } : app
      ));
      
      setEditingStatus(null);
      alert('Status updated successfully!');
    } catch (err: any) {
      console.error('Failed to update status:', err);
      
      if (err.response?.status === 401) {
        alert('Session expired. Please log in again.');
        router.push('/login');
      } else if (err.response?.status === 403) {
        alert('You do not have permission to update status.');
      } else if (err.response?.status === 404) {
        alert('Submission not found.');
      } else {
        alert('Failed to update status. Please try again.');
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const startEditing = (id: number, currentStatus: string) => {
    setEditingStatus({ id, status: currentStatus });
  };

  const cancelEditing = () => {
    setEditingStatus(null);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'under review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Applicant Submissions</h1>
          <p className="text-gray-600">Manage and review all applicant submissions</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading submissions...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Table Container */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-green-600 to-green-700 text-white">
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      Applicant
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      Programme
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      Reference
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {applications.length > 0 ? (
                    applications.map((app, idx) => (
                      <tr
                        key={app.id}
                        className="hover:bg-green-50/50 transition-all duration-200 group"
                      >
                        {/* Serial Number */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              {idx + 1}
                            </span>
                          </div>
                        </td>

                        {/* Applicant Name */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {app.applicant_name}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Programme */}
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-900 font-medium">
                              {app.programme}
                            </span>
                          </div>
                        </td>

                        {/* Reference Number */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono text-gray-600 bg-gray-50 px-3 py-1 rounded-lg border">
                            {app.reference_number || 'N/A'}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingStatus?.id === app.id ? (
                            <div className="flex items-center space-x-2">
                              <select
                                value={editingStatus.status}
                                onChange={(e) => setEditingStatus({...editingStatus, status: e.target.value})}
                                className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                disabled={updatingId === app.id}
                              >
                                {STATUS_OPTIONS.map(status => (
                                  <option key={status} value={status}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => updateStatus(app.id, editingStatus.status)}
                                disabled={updatingId === app.id}
                                className="p-1 text-green-600 hover:text-green-800 disabled:opacity-50"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={cancelEditing}
                                disabled={updatingId === app.id}
                                className="p-1 text-red-600 hover:text-red-800 disabled:opacity-50"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(app.status)}`}>
                                {app.status}
                              </span>
                              <button
                                onClick={() => startEditing(app.id, app.status)}
                                disabled={updatingId === app.id}
                                className="p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                                title="Edit status"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                          {updatingId === app.id && (
                            <div className="mt-1">
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600 mx-auto"></div>
                            </div>
                          )}
                        </td>

                        {/* Submission Date */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <div className="text-sm text-gray-900">
                              {new Date(app.submitted_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <Link
                              href={`/appadmin/applicant-submissions/${app.id}`}
                              className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all duration-200 group-hover:shadow-md"
                            >
                              <Eye className="w-4 h-4" />
                              <span className="text-sm font-medium">View</span>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <FileText className="w-12 h-12 text-gray-300" />
                          <div>
                            <p className="text-lg font-medium text-gray-900">No submissions found</p>
                            <p className="text-gray-500 text-sm mt-1">
                              There are no applicant submissions to display at this time.
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer with count */}
            {applications.length > 0 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-medium">{applications.length}</span> submission{applications.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}