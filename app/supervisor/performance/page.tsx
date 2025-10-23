'use client';

import { useState } from 'react';
  import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

// Sample data per cleaner
const performanceData = {
  'Alice Banda': [
    { name: 'Mon', tasks: 3 },
    { name: 'Tue', tasks: 2 },
    { name: 'Wed', tasks: 4 },
    { name: 'Thu', tasks: 3 },
    { name: 'Fri', tasks: 3 },
  ],
  'Brian Mvula': [
    { name: 'Mon', tasks: 4 },
    { name: 'Tue', tasks: 3 },
    { name: 'Wed', tasks: 2 },
    { name: 'Thu', tasks: 5 },
    { name: 'Fri', tasks: 4 },
  ],
};

// Sample cleaner list
const cleaners = Object.keys(performanceData);

export default function PerformancePage() {
  const [selectedCleaner, setSelectedCleaner] = useState(cleaners[0]);
  const [filter, setFilter] = useState('week');

  const getFilteredData = () => {
    const data = performanceData[selectedCleaner] || [];
    // Add monthly logic here if needed. Currently only weekly is mocked.
    return data;
  };

  return (
  <main className="p-6 md:p-10 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-green-800 mb-4">Cleaner Performance</h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Select Cleaner</label>
          <select
            value={selectedCleaner}
            onChange={(e) => setSelectedCleaner(e.target.value)}
            className="border rounded px-4 py-2 w-full md:w-64"
          >
            {cleaners.map((cleaner) => (
              <option key={cleaner} value={cleaner}>
                {cleaner}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Filter</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded px-4 py-2 w-full md:w-48"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold text-green-700 mb-4">
          Weekly Overview: {selectedCleaner}
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={getFilteredData()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="tasks" fill="#16a34a" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </main>
  );
}
