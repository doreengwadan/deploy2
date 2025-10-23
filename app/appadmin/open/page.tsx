'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Edit, Save, X, AlertCircle, CheckCircle, Eye } from 'lucide-react';
import Cookies from 'js-cookie';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

interface ApplicationSchedule {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  openDate: string;
  closeDate: string;
  requirements: string[];
  currentStatus: 'open' | 'closed' | 'upcoming';
  daysRemaining: number;
}

export default function ApplicationScheduleAdmin() {
  const [schedules, setSchedules] = useState<ApplicationSchedule[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [newSchedule, setNewSchedule] = useState<Partial<ApplicationSchedule>>({
    openDate: '',
    closeDate: '',
    isActive: true
  });

  const token = Cookies.get('token');

  // Mock initial data - replace with API call
  const initialSchedules: ApplicationSchedule[] = [
    {
      id: 'odl',
      name: 'ODL Student Application',
      description: "For students applying for bachelor's degree programs under Open and Distance Learning",
      isActive: true,
      openDate: '2024-01-15',
      closeDate: '2024-03-31',
      requirements: ['High School Certificate or equivalent', 'Minimum GPA requirements met'],
      currentStatus: 'open',
      daysRemaining: 45
    },
    {
      id: 'postgraduate',
      name: 'Postgraduate Application',
      description: 'For students applying for master\'s or doctoral programs',
      isActive: true,
      openDate: '2024-02-01',
      closeDate: '2024-04-30',
      requirements: ["Bachelor's degree certificate", 'Academic transcripts'],
      currentStatus: 'open',
      daysRemaining: 75
    },
    {
      id: 'diploma',
      name: 'Diploma/Certificate Programs',
      description: 'For students applying for diploma or certificate courses',
      isActive: false,
      openDate: '2024-05-01',
      closeDate: '2024-06-30',
      requirements: ['High School Certificate or equivalent'],
      currentStatus: 'upcoming',
      daysRemaining: -1
    },
    {
      id: 'international',
      name: 'International Student Application',
      description: 'For international students applying to Mzuzu University',
      isActive: true,
      openDate: '2024-01-10',
      closeDate: '2024-02-29',
      requirements: ['Equivalent qualifications', 'English language proficiency'],
      currentStatus: 'closed',
      daysRemaining: -5
    }
  ];

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      // const response = await axios.get(`${API_BASE_URL}/admin/application-schedules`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // setSchedules(response.data);
      
      // Using mock data for now
      setSchedules(initialSchedules);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSchedule = async (id: string, updates: Partial<ApplicationSchedule>) => {
    try {
      setSaving(id);
      // Replace with actual API call
      // await axios.patch(`${API_BASE_URL}/admin/application-schedules/${id}`, updates, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      
      // Mock update for demo
      setSchedules(prev => prev.map(schedule => 
        schedule.id === id ? { ...schedule, ...updates } : schedule
      ));
      
      setEditingId(null);
    } catch (error) {
      console.error('Error updating schedule:', error);
      alert('Failed to update schedule');
    } finally {
      setSaving(null);
    }
  };

  const toggleApplicationStatus = async (id: string, isActive: boolean) => {
    try {
      setSaving(id);
      // Replace with actual API call
      // await axios.patch(`${API_BASE_URL}/admin/application-schedules/${id}/status`, {
      //   isActive
      // }, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      
      // Mock update for demo
      setSchedules(prev => prev.map(schedule => 
        schedule.id === id ? { ...schedule, isActive } : schedule
      ));
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Failed to update application status');
    } finally {
      setSaving(null);
    }
  };

  const getStatusBadge = (schedule: ApplicationSchedule) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";
    
    if (!schedule.isActive) {
      return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Disabled</span>;
    }

    switch (schedule.currentStatus) {
      case 'open':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Open</span>;
      case 'closed':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>Closed</span>;
      case 'upcoming':
        return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>Upcoming</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Unknown</span>;
    }
  };

  const getDaysRemainingText = (schedule: ApplicationSchedule) => {
    if (!schedule.isActive) return 'Application disabled';
    
    if (schedule.daysRemaining > 0) {
      return `${schedule.daysRemaining} days remaining`;
    } else if (schedule.daysRemaining === 0) {
      return 'Closes today';
    } else {
      return `Closed ${Math.abs(schedule.daysRemaining)} days ago`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application schedules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Application Schedule Management
          </h1>
          <p className="text-gray-600">
            Manage opening and closing times for different application types
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Applications</p>
                <h3 className="text-2xl font-bold text-gray-900">{schedules.length}</h3>
              </div>
              <Eye className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Open Applications</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {schedules.filter(s => s.isActive && s.currentStatus === 'open').length}
                </h3>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Closed Applications</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {schedules.filter(s => s.currentStatus === 'closed').length}
                </h3>
              </div>
              <X className="w-8 h-8 text-red-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Upcoming</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {schedules.filter(s => s.currentStatus === 'upcoming').length}
                </h3>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Application Schedules Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Application Schedules</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Application Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Remaining
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {schedules.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {schedule.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {schedule.description}
                        </p>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      {editingId === schedule.id ? (
                        <div className="space-y-2">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">
                              Open Date
                            </label>
                            <input
                              type="date"
                              value={schedule.openDate}
                              onChange={(e) => {
                                setSchedules(prev => prev.map(s => 
                                  s.id === schedule.id 
                                    ? { ...s, openDate: e.target.value }
                                    : s
                                ));
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">
                              Close Date
                            </label>
                            <input
                              type="date"
                              value={schedule.closeDate}
                              onChange={(e) => {
                                setSchedules(prev => prev.map(s => 
                                  s.id === schedule.id 
                                    ? { ...s, closeDate: e.target.value }
                                    : s
                                ));
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            Opens: {new Date(schedule.openDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-2" />
                            Closes: {new Date(schedule.closeDate).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4">
                      {getStatusBadge(schedule)}
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {getDaysRemainingText(schedule)}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {editingId === schedule.id ? (
                          <>
                            <button
                              onClick={() => updateSchedule(schedule.id, {
                                openDate: schedule.openDate,
                                closeDate: schedule.closeDate
                              })}
                              disabled={saving === schedule.id}
                              className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
                            >
                              <Save className="w-4 h-4 mr-1" />
                              {saving === schedule.id ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="flex items-center px-3 py-1 bg-gray-500 text-white rounded-md text-sm hover:bg-gray-600"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setEditingId(schedule.id)}
                              className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => toggleApplicationStatus(schedule.id, !schedule.isActive)}
                              disabled={saving === schedule.id}
                              className={`flex items-center px-3 py-1 rounded-md text-sm ${
                                schedule.isActive
                                  ? 'bg-red-600 text-white hover:bg-red-700'
                                  : 'bg-green-600 text-white hover:bg-green-700'
                              } disabled:opacity-50`}
                            >
                              {schedule.isActive ? 'Disable' : 'Enable'}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => {
                const now = new Date();
                const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                const endOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);
                
                setSchedules(prev => prev.map(schedule => ({
                  ...schedule,
                  openDate: nextMonth.toISOString().split('T')[0],
                  closeDate: endOfNextMonth.toISOString().split('T')[0]
                })));
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              Set All to Next Month
            </button>
            <button
              onClick={() => {
                setSchedules(prev => prev.map(schedule => ({
                  ...schedule,
                  isActive: true
                })));
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
            >
              Enable All Applications
            </button>
            <button
              onClick={() => {
                setSchedules(prev => prev.map(schedule => ({
                  ...schedule,
                  isActive: false
                })));
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
            >
              Disable All Applications
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}