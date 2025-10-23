'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import axios from 'axios';
import Button2 from '@/componets/Button2';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export default function UploadDocumentsPage() {
  const router = useRouter();
  const token = Cookies.get('token');
  const [programmeType, setProgrammeType] = useState<'masters' | 'phd' | ''>('');
  const [files, setFiles] = useState<{ [key: string]: File | null }>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const phdFields = [
    'Letter of Motivation',
    'Curriculum Vitae',
    'Three Referees',
    'Two Reference Letters',
    'Academic Certificates',
    'Academic Transcripts',
    'Research Concept',
    'Bank Deposit Slip',
  ];

  const mastersFields = [
    'Letter of Motivation',
    'Curriculum Vitae',
    'Two Reference Letters',
    'Academic Certificates',
    'Academic Transcripts',
    'Bank Deposit Slip',
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, label: string) => {
    if (e.target.files && e.target.files[0]) {
      setFiles((prev) => ({ ...prev, [label]: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!programmeType) {
      setMessage('Please select a programme type first.');
      return;
    }
    if (!token) {
      setMessage('You are not logged in.');
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const formData = new FormData();
      formData.append('programme_type', programmeType);

      Object.entries(files).forEach(([key, file]) => {
        if (file) formData.append(key, file);
      });

      await axios.post(`${API_BASE_URL}/upload-documents`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage('Documents uploaded successfully.');
      router.push('/application/program-selection/postgraduate');
    } catch (err: any) {
      console.error(err);
      setMessage(err.response?.data?.message || 'Failed to upload documents.');
    } finally {
      setLoading(false);
    }
  };

  const selectedFields = programmeType === 'phd' ? phdFields : mastersFields;

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 mt-10 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-green-800 mb-4">Upload Application Documents</h1>

      <div className="mb-4">
        <label className="font-semibold text-gray-700">Select Programme Type:</label>
        <select
          value={programmeType}
          onChange={(e) => setProgrammeType(e.target.value as 'masters' | 'phd' | '')}
          className="w-full mt-2 border border-gray-300 rounded px-3 py-2 bg-white"
        >
          <option value="">-- Choose --</option>
          <option value="masters">Masters</option>
          <option value="phd">Doctor of Philosophy (PhD)</option>
        </select>
      </div>

      {programmeType && (
        <form onSubmit={handleSubmit}>
          {selectedFields.map((label) => (
            <div key={label} className="mb-4">
              <label className="block font-medium text-gray-700 mb-1">{label}</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.png"
                onChange={(e) => handleFileChange(e, label)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
          ))}

          <Button2 type="submit" disabled={loading}>
            {loading ? 'Uploading...' : 'Submit Documents'}
          </Button2>
        </form>
      )}

      {message && (
        <div
          className={`mt-4 p-3 rounded text-center ${
            message.includes('success')
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
