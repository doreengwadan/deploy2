'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import axios from 'axios';
import { Users, FileText, GraduationCap, Banknote, ArrowRight, TrendingUp, Eye, Settings } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

type Stats = {
  totalApplicants: number;
  totalApplications: number;
  totalFees: number;
  totalProgrammes: number;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = Cookies.get('token');
        const response = await axios.get(`${API_BASE_URL}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 text-lg">
                Welcome to Mzuzu University Administration Portal
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-500">System Online</span>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Applicants Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Applicants</h3>
            <div className="flex items-baseline justify-between">
              <p className="text-3xl font-bold text-gray-900">
                {stats?.totalApplicants ? formatNumber(stats.totalApplicants) : '0'}
              </p>
              <div className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                Active
              </div>
            </div>
          </div>

          {/* Applications Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 rounded-xl group-hover:bg-purple-100 transition-colors">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Applications</h3>
            <div className="flex items-baseline justify-between">
              <p className="text-3xl font-bold text-gray-900">
                {stats?.totalApplications ? formatNumber(stats.totalApplications) : '0'}
              </p>
              <div className="text-xs font-medium bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                Processing
              </div>
            </div>
          </div>

          {/* Fees Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-50 rounded-xl group-hover:bg-green-100 transition-colors">
                <Banknote className="w-6 h-6 text-green-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Fees Collected</h3>
            <div className="flex items-baseline justify-between">
              <p className="text-3xl font-bold text-gray-900">
                MK {stats?.totalFees ? formatNumber(stats.totalFees) : '0'}
              </p>
              <div className="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Revenue
              </div>
            </div>
          </div>

          {/* Programmes Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-50 rounded-xl group-hover:bg-orange-100 transition-colors">
                <GraduationCap className="w-6 h-6 text-orange-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Programmes</h3>
            <div className="flex items-baseline justify-between">
              <p className="text-3xl font-bold text-gray-900">
                {stats?.totalProgrammes ? formatNumber(stats.totalProgrammes) : '0'}
              </p>
              <div className="text-xs font-medium bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                Available
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/appadmin/applicants">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-6 hover:shadow-xl cursor-pointer transition-all duration-300 group hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8" />
                  <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Manage Applicants</h3>
                <p className="text-blue-100 text-sm">View and manage applicant details and profiles</p>
              </div>
            </Link>

            <Link href="/appadmin/applications">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-6 hover:shadow-xl cursor-pointer transition-all duration-300 group hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <FileText className="w-8 h-8" />
                  <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Applications</h3>
                <p className="text-purple-100 text-sm">Track and process student applications</p>
              </div>
            </Link>

            <Link href="/application-fees">
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-6 hover:shadow-xl cursor-pointer transition-all duration-300 group hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <Banknote className="w-8 h-8" />
                  <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Fee Management</h3>
                <p className="text-green-100 text-sm">Monitor deposits and payment records</p>
              </div>
            </Link>

            <Link href="/appadmin/programmes">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl p-6 hover:shadow-xl cursor-pointer transition-all duration-300 group hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <GraduationCap className="w-8 h-8" />
                  <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Programmes</h3>
                <p className="text-orange-100 text-sm">Manage academic programmes and courses</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Additional Tools Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">System Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
              <Eye className="w-5 h-5 text-gray-600 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-900">View Reports</h3>
                <p className="text-sm text-gray-500">Analytics and insights</p>
              </div>
            </div>
            <div className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
              <Settings className="w-5 h-5 text-gray-600 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-900">System Settings</h3>
                <p className="text-sm text-gray-500">Configure preferences</p>
              </div>
            </div>
            <div className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
              <Users className="w-5 h-5 text-gray-600 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-900">User Management</h3>
                <p className="text-sm text-gray-500">Admin access control</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Mzuzu University Administration System • Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}