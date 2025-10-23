'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { User, Calendar, Eye, Download, X } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

type Fee = {
  id: number;
  applicant_name: string;
  programme?: string;
  amount: number;
  status: string;
  deposit_slip: string | null;
  paid_at: string;
};

export default function FeesPage() {
  const router = useRouter();
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);

  useEffect(() => {
    const fetchFees = async () => {
      try {
        const token = Cookies.get('token');
        if (!token) return router.push('/login');

        const res = await axios.get(`${API_BASE_URL}/admin/fees`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFees(res.data);
      } catch (err: any) {
        console.error('Failed to fetch fees:', err);
        if (err.response?.status === 401) {
          alert('Session expired. Please log in again.');
          router.push('/login');
        } else {
          alert('Failed to fetch fees. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchFees();
  }, [router]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount);

  // Filter fees by search & status
  const filteredFees = fees.filter(
    (fee) =>
      fee.applicant_name.toLowerCase().includes(search.toLowerCase()) &&
      (statusFilter ? fee.status.toLowerCase() === statusFilter.toLowerCase() : true)
  );

  const openModal = (fee: Fee) => {
    setSelectedFee(fee);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedFee(null);
    setModalOpen(false);
  };

  const updateFeeStatus = async (newStatus: string) => {
    if (!selectedFee) return;

    try {
      const token = Cookies.get('token');
      if (!token) return router.push('/login');

      await axios.patch(
        `${API_BASE_URL}/admin/fees/${selectedFee.id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setFees((prev) =>
        prev.map((fee) => (fee.id === selectedFee.id ? { ...fee, status: newStatus } : fee))
      );
      closeModal();
    } catch (err: any) {
      console.error('Failed to update status:', err);
      alert('Failed to update status. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Application Fees</h1>
          <p className="text-gray-600">Manage and review all fee payments and deposits</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
          <input
            type="text"
            placeholder="Search by applicant"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading fee payments...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="bg-gradient-to-r from-green-600 to-green-700 text-white">
                    <th className="px-4 py-4 text-left text-sm font-semibold uppercase tracking-wider">#</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold uppercase tracking-wider">Applicant</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold uppercase tracking-wider">Programme</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold uppercase tracking-wider">Status</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold uppercase tracking-wider">Action</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold uppercase tracking-wider">Deposit Slip</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold uppercase tracking-wider">Paid Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredFees.length > 0 ? (
                    filteredFees.map((fee, idx) => (
                      <tr key={fee.id} className="hover:bg-green-50/50 transition-all duration-200 group">
                        <td className="px-4 py-4 whitespace-nowrap">{idx + 1}</td>
                        <td className="px-4 py-4 whitespace-nowrap flex items-center space-x-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="text-sm font-medium text-gray-900">{fee.applicant_name}</div>
                        </td>
                        <td className="px-4 py-4">{fee.programme || 'N/A'}</td>
                        <td className="px-4 py-4 whitespace-nowrap">{formatCurrency(fee.amount)}</td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(fee.status)}`}>
                            {fee.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {fee.status.toLowerCase() === 'pending' && (
                            <button
                              onClick={() => openModal(fee)}
                              className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-green-700"
                            >
                              Update Status
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {fee.deposit_slip ? (
                            <div className="flex space-x-2">
                              <a
                                href={fee.deposit_slip}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-xs"
                              >
                                <Eye className="w-3 h-3" /> <span>View</span>
                              </a>
                              <a
                                href={fee.deposit_slip}
                                download
                                className="inline-flex items-center space-x-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-lg text-xs"
                              >
                                <Download className="w-3 h-3" /> <span>Download</span>
                              </a>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">No slip</span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{new Date(fee.paid_at).toLocaleDateString()}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                        No fee payments found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal */}
        {modalOpen && selectedFee && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-96 p-6 relative">
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                onClick={closeModal}
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-bold mb-4">Update Status</h2>
              <p className="mb-6 text-gray-700">
                Update status for <span className="font-semibold">{selectedFee.applicant_name}</span>?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => updateFeeStatus('Rejected')}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Reject
                </button>
                <button
                  onClick={() => updateFeeStatus('Accepted')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
