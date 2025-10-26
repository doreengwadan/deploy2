'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [form, setForm] = useState({
    title: '',
    firstname: '',
    middlename: '',
    lastname: '',
    dob: '',
    email: '',
    phone: '',
    password: '',
    role: 'guest',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/applicants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to register');

      setMessage({ type: 'success', text: 'Application submitted successfully! Redirecting to login...' });
      setForm({
        title: '',
        firstname: '',
        middlename: '',
        lastname: '',
        dob: '',
        email: '',
        phone: '',
        password: '',
        role: 'guest',
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-8 w-full max-w-lg space-y-4"
      >
        <h2 className="text-2xl font-bold text-center mb-4">Register</h2>

        {message && (
          <p
            className={`text-center ${
              message.type === 'success' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {message.text}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <select
            name="title"
            value={form.title}
            onChange={handleChange}
            className="border rounded p-2"
            required
          >
            <option value="">Select title</option>
            <option value="Mr">Mr</option>
            <option value="Mrs">Mrs</option>
            <option value="Miss">Miss</option>
          </select>

          <input
            name="firstname"
            value={form.firstname}
            onChange={handleChange}
            placeholder="First name"
            className="border rounded p-2"
            required
          />

          <input
            name="middlename"
            value={form.middlename}
            onChange={handleChange}
            placeholder="Middle name"
            className="border rounded p-2"
          />

          <input
            name="lastname"
            value={form.lastname}
            onChange={handleChange}
            placeholder="Last name"
            className="border rounded p-2"
            required
          />

          <input
            type="date"
            name="dob"
            value={form.dob}
            onChange={handleChange}
            className="border rounded p-2"
            required
          />

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="border rounded p-2"
            required
          />

          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone"
            className="border rounded p-2"
            required
          />

          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            className="border rounded p-2"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? 'Submitting...' : 'Register'}
        </button>
      </form>
    </div>
  );
}
