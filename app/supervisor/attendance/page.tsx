export default function SupervisorAttendancePage() {
  return (
   <main className="p-6 md:p-10 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-green-800 mb-4">Attendance Overview</h1>
      <p className="text-gray-700 mb-6">Monitor attendance records of cleaners under your supervision.</p>

      {/* Placeholder table */}
      <div className="bg-white shadow rounded p-6 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-green-800 border-b">
              <th className="py-2 px-4">Cleaner Name</th>
              <th className="py-2 px-4">Date</th>
              <th className="py-2 px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2 px-4">John Banda</td>
              <td className="py-2 px-4">2025-05-25</td>
              <td className="py-2 px-4 text-green-700">Present</td>
            </tr>
            <tr>
              <td className="py-2 px-4">Mary Phiri</td>
              <td className="py-2 px-4">2025-05-25</td>
              <td className="py-2 px-4 text-red-600">Absent</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}
