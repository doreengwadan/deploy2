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
    role: 'guest', // default role
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const response = await fetch('http://127.0.0.1:8000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Application submitted successfully!');
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
      } else {
        alert(`Failed: ${data.message || 'An error occurred'}`);
      }
    } catch (error) {
      alert('Something went wrong!');
      console.error(error);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white p-6 rounded shadow">
        <h1 className="text-3xl flex justify-center font-bold mb-6 text-green-900">
          Register to Apply
        </h1>

        {/* Title */}
        <label htmlFor="title" className="block mb-2 font-semibold text-gray-400">Title</label>
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

        {/* First Name */}
        <label htmlFor="firstname" className="block mb-2 font-semibold text-gray-400">First Name</label>
        <input
          id="firstname"
          name="firstname"
          type="text"
          required
          value={form.firstname}
          onChange={handleChange}
          placeholder="Your first name"
          className="w-full mb-4 border border-gray-300 rounded px-3 py-2"
        />

        {/* Middle Name */}
        <label htmlFor="middlename" className="block mb-2 font-semibold text-gray-400">Middle Name (Optional)</label>
        <input
          id="middlename"
          name="middlename"
          type="text"
          value={form.middlename}
          onChange={handleChange}
          placeholder="Your middle name"
          className="w-full mb-4 border border-gray-300 rounded px-3 py-2"
        />

        {/* Last Name */}
        <label htmlFor="lastname" className="block mb-2 font-semibold text-gray-400">Last Name</label>
        <input
          id="lastname"
          name="lastname"
          type="text"
          required
          value={form.lastname}
          onChange={handleChange}
          placeholder="Your last name"
          className="w-full mb-4 border border-gray-300 rounded px-3 py-2"
        />

        {/* DOB */}
        <label htmlFor="dob" className="block mb-2 font-semibold text-gray-400">Date of Birth</label>
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
        <label htmlFor="email" className="block mb-2 font-semibold text-gray-400">Email</label>
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
        <label htmlFor="phone" className="block mb-2 font-semibold text-gray-400">Phone Number</label>
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
        <label htmlFor="password" className="block mb-2 font-semibold text-gray-400">Password</label>
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

        {/* Submit */}
        <button
          type="submit"
          className="bg-green-700 hover:bg-green-800 text-white font-semibold px-6 py-2 rounded w-full"
        >
          Register & Apply
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
