'use client';

import { useEffect, useState } from 'react';
import {
  Trash, Pencil, Loader, Save, X, CheckCircle, Ban, ChevronDown, ChevronUp
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

interface Room {
  id: number;
  room_name: string;
}

interface Applicant {
  id: number;
  firstname: string;
  lastname: string;
}

interface Schedule {
  id: number;
  room: Room;
  applicant: Applicant;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  approved_at?: string | null;
}

const API_URL = 'http://localhost:8000/api';

export default function AdminSchedulesPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedCleanerId, setSelectedCleanerId] = useState<string>('All');
  const [loading, setLoading] = useState(false);
  const [approvingId, setApprovingId] = useState<number | null>(null);

  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [showTable, setShowTable] = useState(false); // 👈 Toggle table

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [roomsData, applicantsData, schedulesData] = await Promise.all([
        fetch(`${API_URL}/rooms`).then(res => res.json()),
        fetch(`${API_URL}/applicants?role=cleaner`).then(res => res.json()),
        fetch(`${API_URL}/schedules`).then(res => res.json()),
      ]);
      setRooms(roomsData);
      setApplicants(applicantsData);
      setSchedules(schedulesData);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSchedule = async (scheduleId: number) => {
    setApprovingId(scheduleId);
    try {
      const res = await fetch(`${API_URL}/schedules/${scheduleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Approved' }),
      });
      if (!res.ok) throw new Error();
      toast.success('Schedule approved');
      await loadData();
    } catch {
      toast.error('Failed to approve schedule');
    } finally {
      setApprovingId(null);
    }
  };

  const handleDisapproveSchedule = async (scheduleId: number) => {
    setApprovingId(scheduleId);
    try {
      const res = await fetch(`${API_URL}/schedules/${scheduleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Completed', approved_at: null }),
      });
      if (!res.ok) throw new Error();
      toast.success('Schedule disapproved');
      await loadData();
    } catch {
      toast.error('Failed to disapprove schedule');
    } finally {
      setApprovingId(null);
    }
  };

  const monthlySchedules = schedules.filter(s => {
    const d = new Date(s.date);
    return d.getFullYear() === reportYear && d.getMonth() + 1 === reportMonth;
  });

  const statusCounts = ['Pending', 'Completed', 'Cancelled', 'Approved'].map(status => ({
    name: status,
    value: monthlySchedules.filter(s => s.status === status).length,
  }));

  const approvedMonthly = monthlySchedules.filter(s => s.status === 'Approved' && s.approved_at);

  return (
    <main className="p-6 md:p-10 max-w-6xl mx-auto">
      <Toaster />
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <h1 className="text-2xl font-bold text-green-800">Schedule Management</h1>
        <select
          value={selectedCleanerId}
          onChange={e => setSelectedCleanerId(e.target.value)}
          className="mt-3 md:mt-0 border p-2 rounded"
        >
          <option value="All">All Cleaners</option>
          {applicants.map(app => (
            <option key={app.id} value={app.id}>
              {app.firstname} {app.lastname}
            </option>
          ))}
        </select>
      </div>

      <input
        type="text"
        placeholder="Search by room, cleaner, or date..."
        className="border p-2 w-full rounded mb-4"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="flex justify-center gap-4 mb-6">
        {['All', 'Pending', 'Completed', 'Cancelled', 'Approved'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-full border font-semibold text-sm transition
              ${statusFilter === status
                ? 'bg-green-700 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-green-100'}
            `}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Monthly Report */}
      <section className="mb-8 p-4 bg-gray-50 border rounded">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Monthly Report</h2>
          <button onClick={() => setShowTable(prev => !prev)} className="text-green-700 hover:text-green-900 flex items-center">
            {showTable ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        <div className="flex gap-4 items-center mb-4 mt-2">
          <label>
            Year:
            <input
              type="number"
              min={2000}
              max={2100}
              value={reportYear}
              onChange={e => setReportYear(Number(e.target.value))}
              className="ml-2 border rounded p-1 w-20"
            />
          </label>
          <label>
            Month:
            <select
              value={reportMonth}
              onChange={e => setReportMonth(Number(e.target.value))}
              className="ml-2 border rounded p-1"
            >
              {[...Array(12).keys()].map(m => (
                <option key={m + 1} value={m + 1}>
                  {new Date(0, m).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </label>
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={statusCounts}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#16a34a" />
          </BarChart>
        </ResponsiveContainer>

        {showTable && (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead className="bg-green-700 text-white">
                <tr>
                  <th className="p-2 border">Cleaner Name</th>
                  <th className="p-2 border">Room</th>
                  <th className="p-2 border">Date Approved</th>
                </tr>
              </thead>
              <tbody>
                {approvedMonthly.map(s => (
                  <tr key={s.id} className="hover:bg-gray-100">
                    <td className="p-2 border">{s.applicant.firstname} {s.applicant.lastname}</td>
                    <td className="p-2 border">{s.room.room_name}</td>
                    <td className="p-2 border">{new Date(s.approved_at!).toLocaleString()}</td>
                  </tr>
                ))}
                {approvedMonthly.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-2 text-center text-gray-500">
                      No approved schedules for this month.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Schedule Cards */}
      {loading ? (
        <div className="flex justify-center items-center my-10">
          <Loader className="animate-spin text-green-700" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {schedules
            .filter(s =>
              (statusFilter === 'All' || s.status === statusFilter) &&
              (selectedCleanerId === 'All' || s.applicant.id.toString() === selectedCleanerId) &&
              (
                s.room.room_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                `${s.applicant.firstname} ${s.applicant.lastname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.date.includes(searchTerm)
              )
            )
            .map(schedule => (
              <div key={schedule.id} className="bg-white shadow p-4 rounded-lg border">
                <h3 className="text-lg font-semibold text-green-800 mb-2">{schedule.room.room_name}</h3>
                <p><strong>Cleaner:</strong> {schedule.applicant.firstname} {schedule.applicant.lastname}</p>
                <p><strong>Date:</strong> {schedule.date}</p>
                <p><strong>Start:</strong> {schedule.start_time}</p>
                <p><strong>End:</strong> {schedule.end_time}</p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span className={`px-2 py-1 rounded text-white text-xs font-semibold 
                    ${schedule.status === 'Pending' ? 'bg-gray-700' : ''}
                    ${schedule.status === 'Completed' ? 'bg-green-600' : ''}
                    ${schedule.status === 'Cancelled' ? 'bg-red-600' : ''}
                    ${schedule.status === 'Approved' ? 'bg-blue-600' : ''}
                  `}>
                    {schedule.status}
                  </span>
                </p>
                {schedule.status === 'Approved' && schedule.approved_at && (
                  <p><strong>Approved At:</strong> {new Date(schedule.approved_at).toLocaleString()}</p>
                )}

                <div className="flex justify-end gap-2 mt-3">
                  {schedule.status === 'Completed' && (
                    <button
                      onClick={() => handleApproveSchedule(schedule.id)}
                      disabled={approvingId === schedule.id}
                      className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                    >
                      {approvingId === schedule.id ? <Loader size={16} className="animate-spin" /> : <>
                        <CheckCircle size={16} />
                        Approve
                      </>}
                    </button>
                  )}
                  {schedule.status === 'Approved' && (
                    <button
                      onClick={() => handleDisapproveSchedule(schedule.id)}
                      disabled={approvingId === schedule.id}
                      className="text-yellow-600 hover:text-yellow-800 flex items-center gap-1"
                    >
                      {approvingId === schedule.id ? <Loader size={16} className="animate-spin" /> : <>
                        <Ban size={16} />
                        Disapprove
                      </>}
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}
      
    </main>
    
  );
}
