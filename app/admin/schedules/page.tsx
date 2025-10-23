'use client';

import { useEffect, useState } from 'react';
import { Trash, Pencil, Loader, Save, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

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
}

const API_URL = 'http://localhost:8000/api';

export default function AdminSchedulesPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [form, setForm] = useState({
    room_id: '',
    applicant_id: '',
    date: '',
    start_time: '10:00',
    end_time: '12:00',
    status: 'Pending'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    room_id: '',
    applicant_id: '',
    date: '',
    start_time: '',
    end_time: '',
    status: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchRooms(),
        fetchApplicants(),
        fetchSchedules()
      ]);
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    const res = await fetch(`${API_URL}/rooms`);
    const data = await res.json();
    setRooms(data);
  };

  const fetchApplicants = async () => {
    const res = await fetch(`${API_URL}/applicants?role=cleaner`);
    const data = await res.json();
    setApplicants(data);
  };

  const fetchSchedules = async () => {
    const res = await fetch(`${API_URL}/schedules`);
    const data = await res.json();
    setSchedules(data);
  };

  // Create schedule
  const handleSubmit = async () => {
    if (!form.room_id || !form.applicant_id || !form.date) {
      toast.error("Please fill in all required fields");
      return;
    }

    const duplicate = schedules.find(s =>
      s.room.id === Number(form.room_id) && s.date === form.date
    );

    if (duplicate) {
      toast.error("Room is already scheduled for this date");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/schedules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id: Number(form.room_id),
          applicant_id: Number(form.applicant_id),
          date: form.date,
          start_time: form.start_time,
          end_time: form.end_time,
          status: form.status
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData?.message || 'Failed to create schedule');
        return;
      }

      toast.success('Schedule created successfully');
      setForm({ room_id: '', applicant_id: '', date: '', start_time: '10:00', end_time: '12:00', status: 'Pending' });
      await fetchSchedules();
    } catch (err) {
      toast.error('Failed to create schedule');
    } finally {
      setSubmitting(false);
    }
  };

  // Start editing schedule
  const handleEditClick = (schedule: Schedule) => {
    setEditId(schedule.id);
    setEditForm({
      room_id: schedule.room.id.toString(),
      applicant_id: schedule.applicant.id.toString(),
      date: schedule.date,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      status: schedule.status,
    });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditId(null);
  };

  // Save edited schedule
  const handleSaveEdit = async () => {
    if (!editForm.room_id || !editForm.applicant_id || !editForm.date) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Optional: Check if the updated schedule conflicts with existing ones, excluding the current editing schedule
    const conflict = schedules.find(s =>
      s.id !== editId &&
      s.room.id === Number(editForm.room_id) &&
      s.date === editForm.date
    );

    if (conflict) {
      toast.error("Room is already scheduled for this date");
      return;
    }

    if (!editId) return;

    setEditSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/schedules/${editId}`, {
        method: 'PUT', // or 'PATCH' depending on your backend
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id: Number(editForm.room_id),
          applicant_id: Number(editForm.applicant_id),
          date: editForm.date,
          start_time: editForm.start_time,
          end_time: editForm.end_time,
          status: editForm.status
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData?.message || 'Failed to update schedule');
        return;
      }

      toast.success('Schedule updated successfully');
      setEditId(null);
      await fetchSchedules();
    } catch (err) {
      toast.error('Failed to update schedule');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeleteClick = async (scheduleId: number) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/schedules/${scheduleId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        toast.error('Failed to delete schedule');
        return;
      }
      toast.success('Schedule deleted');
      await fetchSchedules();
    } catch {
      toast.error('Failed to delete schedule');
    } finally {
      setLoading(false);
    }
  };

  const filteredSchedules = schedules.filter(s =>
    s.room.room_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${s.applicant.firstname} ${s.applicant.lastname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.date.includes(searchTerm)
  );

  // Rooms unavailable for create form date
  const unavailableRooms = schedules
    .filter(s => s.date === form.date)
    .map(s => s.room.id);

  // Rooms unavailable for edit form date (excluding the current editing schedule)
  const unavailableRoomsForEdit = editId
    ? schedules
        .filter(s => s.date === editForm.date && s.id !== editId)
        .map(s => s.room.id)
    : [];

  return (
   <main className="p-6 md:p-10 max-w-5xl mx-auto">
      <Toaster />

      <h1 className="text-2xl font-bold text-green-800 mb-4">Schedule Management</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by room, cleaner, or date..."
          className="border p-2 w-full rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Create Schedule Form */}
      <div className="bg-white p-4 shadow mb-6 rounded">
        <h2 className="font-semibold text-green-700 mb-2">Create Schedule</h2>

        <div className="flex flex-col gap-3 mb-2 max-w-lg">
          <select
            name="room_id"
            value={form.room_id}
            onChange={(e) => setForm({ ...form, room_id: e.target.value })}
            className="border p-2 rounded"
          >
            <option value="">Select Room</option>
            {rooms.map(room => (
              <option
                key={room.id}
                value={room.id}
            
              >
                {room.room_name}
              </option>
            ))}
          </select>

          <select
            name="applicant_id"
            value={form.applicant_id}
            onChange={(e) => setForm({ ...form, applicant_id: e.target.value })}
            className="border p-2 rounded"
          >
            <option value="">Select Cleaner</option>
            {applicants.map(applicant => (
              <option key={applicant.id} value={applicant.id}>
                {applicant.firstname} {applicant.lastname}
              </option>
            ))}
          </select>

          <input
            type="date"
            name="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="border p-2 rounded"
          />

          <select
            name="start_time"
            value={form.start_time}
            onChange={(e) => setForm({ ...form, start_time: e.target.value })}
            className="border p-2 rounded"
          >
            <option value="08:00">08:00 AM</option>
            <option value="10:00">10:00 AM</option>
          </select>

          <select
            name="end_time"
            value={form.end_time}
            onChange={(e) => setForm({ ...form, end_time: e.target.value })}
            className="border p-2 rounded"
          >
            <option value="12:00">12:00 PM</option>
            <option value="14:00">02:00 PM</option>
          </select>

          <select
            name="status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="border p-2 rounded"
          >
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white px-4 py-2 rounded flex items-center justify-center"
            disabled={submitting}
          >
            {submitting ? <Loader className="animate-spin" size={20} /> : 'Create'}
          </button>
        </div>
      </div>

      {/* Schedules Table */}
      {loading ? (
        <div className="flex justify-center items-center my-10">
          <Loader className="animate-spin text-green-700" size={40} />
        </div>
      ) : (
        <div className="overflow-x-auto">
          {/* Schedules Cards */}
{loading ? (
  <div className="flex justify-center items-center my-10">
    <Loader className="animate-spin text-green-700" size={40} />
  </div>
) : (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {filteredSchedules.map(schedule => (
      <div key={schedule.id} className="bg-white shadow p-4 rounded-lg border border-gray-200">
        {editId === schedule.id ? (
          <>
            <div className="mb-2">
              <label className="text-sm font-semibold">Room:</label>
              <select
                value={editForm.room_id}
                onChange={(e) => setEditForm({ ...editForm, room_id: e.target.value })}
                className="border p-1 rounded w-full"
              >
                {rooms.map(room => (
                  <option key={room.id} value={room.id}>{room.room_name}</option>
                ))}
              </select>
            </div>

            <div className="mb-2">
              <label className="text-sm font-semibold">Cleaner:</label>
              <select
                value={editForm.applicant_id}
                onChange={(e) => setEditForm({ ...editForm, applicant_id: e.target.value })}
                className="border p-1 rounded w-full"
              >
                {applicants.map(applicant => (
                  <option key={applicant.id} value={applicant.id}>
                    {applicant.firstname} {applicant.lastname}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-2">
              <label className="text-sm font-semibold">Date:</label>
              <input
                type="date"
                value={editForm.date}
                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                className="border p-1 rounded w-full"
              />
            </div>

            <div className="mb-2">
              <label className="text-sm font-semibold">Start:</label>
              <select
                value={editForm.start_time}
                onChange={(e) => setEditForm({ ...editForm, start_time: e.target.value })}
                className="border p-1 rounded w-full"
              >
                <option value="08:00">08:00 AM</option>
                <option value="10:00">10:00 AM</option>
              </select>
            </div>

            <div className="mb-2">
              <label className="text-sm font-semibold">End:</label>
              <select
                value={editForm.end_time}
                onChange={(e) => setEditForm({ ...editForm, end_time: e.target.value })}
                className="border p-1 rounded w-full"
              >
                <option value="12:00">12:00 PM</option>
                <option value="14:00">02:00 PM</option>
              </select>
            </div>

            <div className="mb-2">
              <label className="text-sm font-semibold">Status:</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="border p-1 rounded w-full"
              >
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={handleSaveEdit}
                disabled={editSubmitting}
                className="text-green-600 hover:text-green-900"
                aria-label="Save schedule"
              >
                {editSubmitting ? <Loader className="animate-spin" size={16} /> : <Save size={16} />}
              </button>
              <button
                onClick={handleCancelEdit}
                className="text-red-600 hover:text-red-900"
                aria-label="Cancel edit"
              >
                <X size={16} />
              </button>
            </div>
          </>
        ) : (
          <>
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
              `}>
                {schedule.status}
              </span>
            </p>

            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => handleEditClick(schedule)}
                className="text-blue-600 hover:text-blue-900"
                aria-label="Edit schedule"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => handleDeleteClick(schedule.id)}
                className="text-red-600 hover:text-red-900"
                aria-label="Delete schedule"
              >
                <Trash size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    ))}
    </div>
  )}

</div>
  )}
      

</main>
  );
}
