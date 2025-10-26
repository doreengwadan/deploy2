'use client';

import { useState, useEffect } from 'react';
import { Mail, Lock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { FcGoogle } from 'react-icons/fc';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const backgroundGradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  ];

  // Rotate background
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentBgIndex((prev) => (prev === backgroundGradients.length - 1 ? 0 : prev + 1));
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
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }
  
      // Save JWT and user info in cookies
      Cookies.set('token', data.token, { expires: 7 });
      Cookies.set('user', JSON.stringify(data.user), { expires: 7 });
  
      // Show success message before redirecting
      setError('Success! We are logging you in now');
  
      const role = data.user.role.toLowerCase();
  
      // Small delay to show success message
      setTimeout(() => {
        switch (role) {
          case 'admin':
            router.push('/admin/dashboard');
            break;
          case 'odl':
            router.push('/application/dashboard');
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
            router.push('/application/dashboard');
            break;
          default:
            setError('Unknown role');
        }
      }, 1200); // 1.2 seconds delay
    } catch (err) {
      console.error(err);
      setError('Something went wrong');
    }
  }
  
  function handleGoogleLogin() {
    // Adjust this if you implement OAuth
    window.location.href = '/api/auth/google/redirect';
  }

  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        {backgroundGradients.map((grad, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-all duration-1000 ${
              i === currentBgIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
            style={{ background: grad }}
          />
        ))}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Login Form */}
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          

        <form onSubmit={handleSubmit} className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-white text-center">Welcome Back</h2>

          {/* Email */}
          <div className="mb-6">
            <label htmlFor="email" className="block mb-3 font-semibold text-white">Email Address</label>
            <div className="relative">
              <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70" />
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-6">
            <label htmlFor="password" className="block mb-3 font-semibold text-white">Password</label>
            <div className="relative">
              <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70" />
              <input
                id="password"
                name="password"
                type="password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-400/50 rounded-xl">
              <p className="text-red-200 text-center font-medium">{error}</p>
            </div>
          )}

          <Link href="/forgot" className="text-green-300 hover:text-green-200 hover:underline flex justify-center font-semibold mb-6">Forgot your password?</Link>

          <button
            type="submit"
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-6 py-3 rounded-xl w-full mb-4 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Sign In
          </button>

          <div className="flex items-center my-6">
            <hr className="flex-grow border-white/30" />
            <span className="px-3 text-white/70 text-sm">OR CONTINUE WITH</span>
            <hr className="flex-grow border-white/30" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl px-6 py-3 w-full font-medium text-white shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <FcGoogle size={24} />
            <span>Sign in with Google</span>
          </button>

          <p className="mt-8 text-center text-white/80">
            Don&apos;t have an account?{' '}
            <Link href="/apply" className="text-green-300 hover:text-green-200 font-semibold hover:underline">
              Create account
            </Link>
          </p>
        </form>
      </div>

      {/* Background Dots */}
      <div className="flex justify-center mt-6 space-x-2">
        {backgroundGradients.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentBgIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentBgIndex ? 'bg-green-400 w-8' : 'bg-white/50 hover:bg-white/70'}`}
          />
        ))}
      </div>

      <div className="relative z-10 mt-8 text-center">
        <p className="text-white/60 text-sm">© 2024 Mzuzu University. All rights reserved.</p>
      </div>
    </main>
  );
}
