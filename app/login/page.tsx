'use client';

import { useState, useEffect } from 'react';
import { Mail, Lock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { FcGoogle } from 'react-icons/fc';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Background gradients for rotation
  const backgroundGradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  ];

  // Background rotation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentBgIndex((prevIndex) => 
          prevIndex === backgroundGradients.length - 1 ? 0 : prevIndex + 1
        );
        setIsTransitioning(false);
      }, 500);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      Cookies.set('token', data.token, { expires: 7 });
      Cookies.set('user', JSON.stringify(data.user), { expires: 7 });

      const role = data.user.role.toLowerCase();

      // Redirect based on updated roles
      switch (role) {
        case 'admin':
          router.push('/admin/dashboard');
          break;
        case 'odl':
          router.push('/odl/dashboard');
          break;
        case 'weekend':
          router.push('/weekend/dashboard');
          break;
        case 'phd':
          router.push('/phd/dashboard');
          break;
        case 'masters':
          router.push('/masters/dashboard');
          break;
        case 'economic fee':
          router.push('/economic-fee/dashboard');
          break;
        case 'guest':
          router.push('/guest');
          break;
        default:
          setError('Unknown role');
      }
    } catch {
      setError('Something went wrong');
    }
  }

  function handleGoogleLogin() {
    window.location.href = `${API_BASE_URL.replace(
      '/api',
      ''
    )}/auth/google/redirect`;
  }

  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 z-0">
        {backgroundGradients.map((gradient, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentBgIndex
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-105'
            }`}
            style={{
              background: gradient,
            }}
          />
        ))}
        
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
            <h1 className="text-4xl font-bold text-white mb-3">
              Mzuzu University
            </h1>
            <h2 className="text-2xl font-semibold text-white/90">
              Online Application System
            </h2>
            <div className="w-20 h-1 bg-green-400 mx-auto mt-4 rounded-full"></div>
          </div>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8"
        >
          <h2 className="text-2xl font-bold mb-6 text-white text-center">
            Welcome Back
          </h2>

          {/* Email Input */}
          <div className="mb-6">
            <label htmlFor="email" className="block mb-3 font-semibold text-white">
              Email Address
            </label>
            <div className="relative">
              <Mail
                size={20}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70"
              />
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-300"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="mb-6">
            <label htmlFor="password" className="block mb-3 font-semibold text-white">
              Password
            </label>
            <div className="relative">
              <Lock
                size={20}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70"
              />
              <input
                id="password"
                name="password"
                type="password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-300"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-400/50 rounded-xl">
              <p className="text-red-200 text-center font-medium">{error}</p>
            </div>
          )}

          {/* Forgot Password */}
          <Link
            href="/forgot"
            className="text-green-300 hover:text-green-200 hover:underline flex justify-center font-semibold mb-6 transition-colors"
          >
            Forgot your password?
          </Link>

          {/* Login Button */}
          <button
            type="submit"
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-6 py-3 rounded-xl w-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 mb-4"
          >
            Sign In
          </button>

          {/* Divider */}
          <div className="flex items-center my-6">
            <hr className="flex-grow border-white/30" />
            <span className="px-3 text-white/70 text-sm">OR CONTINUE WITH</span>
            <hr className="flex-grow border-white/30" />
          </div>

          {/* Google Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl px-6 py-3 w-full font-medium text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <FcGoogle size={24} /> 
            <span>Sign in with Google</span>
          </button>

          {/* Sign Up Link */}
          <p className="mt-8 text-center text-white/80">
            Don&apos;t have an account?{' '}
            <Link
              href="/apply"
              className="text-green-300 hover:text-green-200 font-semibold hover:underline transition-colors"
            >
              Create account
            </Link>
          </p>
        </form>

        {/* Background Indicator Dots */}
        <div className="flex justify-center mt-6 space-x-2">
          {backgroundGradients.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBgIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentBgIndex
                  ? 'bg-green-400 w-8'
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to background ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 mt-8 text-center">
        <p className="text-white/60 text-sm">
          © 2024 Mzuzu University. All rights reserved.
        </p>
      </div>
    </main>
  );
}