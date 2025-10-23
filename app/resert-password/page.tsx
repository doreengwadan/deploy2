'use client';

import { Lock } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Password reset successful. Redirecting to login...');
        setTimeout(() => router.push('/login'), 3000);
      } else {
        setMessage(data.error || 'Something went wrong');
      }
    } catch (error) {
      setMessage('Error: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-green-800 mb-6">Reset Password</h2>

        {message && <div className="mb-4 text-center text-red-600 font-medium">{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-700 w-5 h-5" />
            <input
              type="password"
              required
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-700 w-5 h-5" />
            <input
              type="password"
              required
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 text-white py-2 rounded-md hover:bg-green-800 transition-all font-semibold"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
