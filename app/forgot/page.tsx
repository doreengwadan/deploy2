'use client';

import { Mail } from 'lucide-react';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setMessage('');

  const res = await fetch('/api/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();

  if (res.ok) {
    setMessage('A password reset link has been sent to your email address.');
    setEmail('');
  } else {
    setMessage(data.error || 'Email not found.');
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-green-800 mb-6">Forgot Password</h2>

        {message && (
          <div className="mb-4 text-green-700 text-center font-medium">{message}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-700 w-5 h-5" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-700 text-white py-2 rounded-md hover:bg-green-800 transition-all font-semibold"
          >
            Send Reset Link
          </button>
        </form>

        <div className="text-center mt-4">
          <a href="/login" className="text-green-700 hover:underline text-sm">
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}
