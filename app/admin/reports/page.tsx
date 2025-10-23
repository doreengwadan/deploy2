'use client';

import { useState } from 'react';

export default function AdminReportsPage() {
  const [reportType, setReportType] = useState('schedule');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const mockData = [
    { id: 1, cleaner: 'John Doe', date: '2025-05-15', status: 'Completed' },
    { id: 2, cleaner: 'Jane Smith', date: '2025-05-16', status: 'Pending' },
  ];

  const handleGenerate = () => {
    alert(`Generating ${reportType} report from ${fromDate} to ${toDate}`);
    // Here you'd usually call the backend API and fetch report data
  };

  const handleDownload = () => {
    alert('Downloading report...');
    // Hook up PDF/Excel export here
  };

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-green-800 mb-4">Reports & Logs</h1>
      <p className="mb-6 text-gray-700">Generate and view cleaning schedules, attendance, and performance reports.</p>

      {/* Filters */}
      <div className="bg-white p-6 rounded shadow mb-6 space-y-4">
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium">Report Type</label>
            <select
              className="mt-1 border rounded px-3 py-2 w-full"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="schedule">Cleaning Schedule</option>
              <option value="attendance">Attendance</option>
              <option value="performance">Performance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="mt-1 border rounded px-3 py-2 w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="mt-1 border rounded px-3 py-2 w-full"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleGenerate}
              className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 w-full"
            >
              Generate
            </button>
          </div>
        </div>
      </div>

      {/* Report Table */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Generated Report</h2>
          <button
            onClick={handleDownload}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Download Report
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">#</th>
                <th className="px-4 py-2 border">Cleaner</th>
                <th className="px-4 py-2 border">Date</th>
                <th className="px-4 py-2 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockData.map((row, index) => (
                <tr key={row.id} className="text-sm">
                  <td className="border px-4 py-2">{index + 1}</td>
                  <td className="border px-4 py-2">{row.cleaner}</td>
                  <td className="border px-4 py-2">{row.date}</td>
                  <td className="border px-4 py-2">{row.status}</td>
                </tr>
              ))}
              {mockData.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500">
                    No data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
