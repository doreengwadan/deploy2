'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ApplyPage() {
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
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/applicants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to register');

      setMessage({ type: 'success', text: 'Application submitted successfully!' });
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
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white p-6 rounded shadow">
        <h1 className="text-3xl flex justify-center font-bold mb-6 text-green-900">
          Register to Apply
        </h1>

        {message && (
          <p
            className={`mb-4 text-center px-4 py-2 rounded ${
              message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {message.text}
          </p>
        )}

        {/* Title */}
        <label htmlFor="title" className="block mb-2 font-semibold text-gray-500">Title</label>
        <select
          id="title"
          name="title"
          required
          value={form.title}
          onChange={handleChange}
          className="w-full mb-4 border border-gray-300 rounded px-3 py-2"
        >
          <option value="">-- Select Title --</option>
          <option value="Mr">Mr</option>
          <option value="Ms">Ms</option>
          <option value="Mrs">Mrs</option>
          <option value="Dr">Dr</option>
          <option value="Prof">Prof</option>
        </select>

        {/* Names */}
        {['firstname', 'middlename', 'lastname'].map((field, i) => (
          <div key={i}>
            <label
              htmlFor={field}
              className="block mb-2 font-semibold text-gray-500 capitalize"
            >
              {field === 'middlename' ? 'Middle Name (Optional)' : `${field.charAt(0).toUpperCase() + field.slice(1)} Name`}
            </label>
            <input
              id={field}
              name={field}
              type="text"
              required={field !== 'middlename'}
              value={(form as any)[field]}
              onChange={handleChange}
              placeholder={`Your ${field.replace('name', ' name')}`}
              className="w-full mb-4 border border-gray-300 rounded px-3 py-2"
            />
          </div>
        ))}

        {/* DOB */}
        <label htmlFor="dob" className="block mb-2 font-semibold text-gray-500">Date of Birth</label>
        <input
          id="dob"
          name="dob"
          type="date"
          required
          value={form.dob}
          onChange={handleChange}
          className="w-full mb-4 border border-gray-300 rounded px-3 py-2"
        />

        {/* Email */}
        <label htmlFor="email" className="block mb-2 font-semibold text-gray-500">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
          placeholder="Your email address"
          className="w-full mb-4 border border-gray-300 rounded px-3 py-2"
        />

        {/* Phone */}
        <label htmlFor="phone" className="block mb-2 font-semibold text-gray-500">Phone</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          value={form.phone}
          onChange={handleChange}
          placeholder="+265 9XX XXX XXX"
          className="w-full mb-4 border border-gray-300 rounded px-3 py-2"
        />

        {/* Password */}
        <label htmlFor="password" className="block mb-2 font-semibold text-gray-500">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          value={form.password}
          onChange={handleChange}
          placeholder="Enter a password"
          className="w-full mb-6 border border-gray-300 rounded px-3 py-2"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-green-700 hover:bg-green-800 text-white font-semibold px-6 py-2 rounded w-full transition-colors"
        >
          {loading ? 'Submitting...' : 'Register & Apply'}
        </button>

        <p className="mt-6 text-center text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-green-700 hover:underline font-semibold">
            Log in
          </Link>
        </p>
      </form>
    </main>
  );
}
