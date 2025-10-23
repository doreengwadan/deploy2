'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { Building2, Receipt } from 'lucide-react';
import ProgressIndicator from '@/componets/ProgressIndicator';
import Button2 from '@/componets/Button2';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function ApplicationFeesPage() {
  const [depositSlip, setDepositSlip] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  const router = useRouter();
  const token = Cookies.get('token');

  const bankName = 'National Bank of Malawi';
  const accountNumber = '000123456789';
  const accountName = 'University of Malawi - Applications';
  const applicationAmount = 'MK 10,000';

  // ✅ Fetch authenticated user on mount
  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    fetchUser();
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_URL}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!res.ok) throw new Error('Not authenticated');
      const data = await res.json();
      setUserId(data.id);
    } catch (err: any) {
      console.error('User fetch error:', err);
      setError('Failed to fetch authenticated user.');
    }
  };

  // ✅ Handle file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setDepositSlip(file);
  };

  // ✅ Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!userId || !token) {
      setError('User not authenticated');
      return;
    }

    if (!depositSlip) {
      setError('Please upload your deposit slip.');
      return;
    }

    const formData = new FormData();
    formData.append('deposit_slip', depositSlip);

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/application-fees`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const text = await res.text(); // 👈 capture raw response
      let data;

      try {
        data = JSON.parse(text); // try parsing JSON
      } catch {
        console.error('Non-JSON response:', text);
        throw new Error('Unexpected response from the server.');
      }

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Failed to upload deposit slip.');
      }

      setSuccess('Deposit slip submitted successfully!');
      setDepositSlip(null);

      // ✅ Redirect after short delay
      setTimeout(() => {
        router.push('/application/submit');
      }, 1500);
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.message || 'Error uploading deposit slip.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ProgressIndicator currentStep={10} />
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 flex justify-center text-green-900">
          Application Fee Payment
        </h1>

        {/* ✅ Alert messages */}
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>}

        {/* ✅ Fee Info */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="font-medium text-blue-800">
            Application Fee: {applicationAmount}
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6 p-4 border border-green-200 rounded-lg bg-green-50">
            <h3 className="font-semibold text-green-800 mb-3 flex items-center">
              <Building2 className="mr-2" size={20} />
              Bank Deposit Instructions
            </h3>
            <div className="space-y-2 text-sm text-green-700">
              <p><strong>Bank:</strong> {bankName}</p>
              <p><strong>Account Number:</strong> {accountNumber}</p>
              <p><strong>Account Name:</strong> {accountName}</p>
              <p><strong>Amount:</strong> {applicationAmount}</p>
              <p className="mt-3 text-green-600">
                Please deposit the exact amount and upload your deposit slip below.
              </p>
            </div>

            <div className="mt-4">
              <label
                className="block font-semibold mb-2 text-green-800"
                htmlFor="depositSlip"
              >
                Upload Deposit Slip
              </label>
              <div className="relative">
                <Receipt
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600"
                  size={18}
                />
                <input
                  type="file"
                  id="depositSlip"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-green-600 rounded-lg file:border-0 file:bg-green-600 file:text-white file:py-2 file:px-4 file:rounded file:cursor-pointer"
                />
              </div>
              {depositSlip && (
                <p className="mt-2 text-sm text-green-600">
                  Selected file: {depositSlip.name}
                </p>
              )}
            </div>
          </div>

          {/* ✅ Submit button */}
          <div className="flex justify-center mt-8">
            <Button2
              type="submit"
              disabled={loading}
              className={`bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors min-w-[200px] ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Uploading...' : 'Submit Deposit Slip'}
            </Button2>
          </div>
        </form>

        {/* ✅ Info section */}
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Important Notes:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Payment must be made using the exact amount specified</li>
            <li>• Keep your bank receipt for reference</li>
            <li>• Processing may take up to 24 hours</li>
            <li>• Contact admissions@unima.mw if you encounter issues</li>
          </ul>
        </div>
      </div>
    </>
  );
}
