'use client';

import { useEffect, useState } from 'react';
import { Edit, Trash, Save, X, Search, Eye } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface Room {
  id: number;
  room_name: string;
  building: string;
  room_type: string;
}

interface RoomForm {
  room_name: string;
  building: string;
  room_type: string;
}

const API_URL = 'http://localhost:8000/api';
const ROOM_TYPES = ['Lecture Hall', 'Laboratory', 'Office', 'Auditorium'];
const BUILDINGS = ['Main Block', 'Science Block', 'Engineering Block', 'Library', 'Admin Building'];

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [form, setForm] = useState<RoomForm>({ room_name: '', building: '', room_type: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<RoomForm>({ room_name: '', building: '', room_type: '' });
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRooms = async () => {
    try {
      const res = await fetch(`${API_URL}/rooms`);
      const text = await res.text();
      const data = JSON.parse(text);
      setRooms(data);
    } catch (err) {
      console.error("Failed to fetch rooms", err);
      toast.error('Failed to load rooms');
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleSubmit = async () => {
    try {
      await fetch(`${API_URL}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setForm({ room_name: '', building: '', room_type: '' });
      toast.success('Room added');
      fetchRooms();
    } catch (err) {
      console.error(err);
      toast.error('Failed to add room');
    }
  };

  const startEdit = (room: Room) => {
    setEditingId(room.id);
    setEditForm({
      room_name: room.room_name,
      building: room.building,
      room_type: room.room_type,
    });
  };

  const saveEdit = async () => {
    if (editingId === null) return;
    try {
      await fetch(`${API_URL}/rooms/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      toast.success('Room updated');
      setEditingId(null);
      fetchRooms();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update room');
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await fetch(`${API_URL}/rooms/${confirmDeleteId}`, { method: 'DELETE' });
      toast.success('Room deleted');
      setConfirmDeleteId(null);
      fetchRooms();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete room');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const filteredRooms = rooms.filter(room =>
    `${room.room_name} ${room.room_type} ${room.building}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="p-6 md:p-10 max-w-5xl mx-auto">
      <Toaster />
      <h1 className="text-2xl font-bold text-green-800 mb-4">Room Management</h1>

      {/* Add New Room Form */}
      <div className="bg-white p-4 shadow mb-6 rounded">
        <h2 className="font-semibold text-green-700 mb-2">Add New Room</h2>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Room Name"
            name="room_name"
            value={form.room_name}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />

          <select
            name="room_type"
            value={form.room_type}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          >
            <option value="">Select Room Type</option>
            {ROOM_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <select
            name="building"
            value={form.building}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          >
            <option value="">Select Building</option>
            {BUILDINGS.map(building => (
              <option key={building} value={building}>{building}</option>
            ))}
          </select>

          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white px-4 py-2 rounded w-full"
          >
            Add Room
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex justify-between items-center mb-4">
        <button
          className="flex items-center bg-green-600 text-white px-4 py-2 rounded"
          onClick={() => setSearchVisible(!searchVisible)}
        >
          <Search className="mr-2" size={20} />
          Search
        </button>
        {searchVisible && (
          <input
            type="text"
            placeholder="Search..."
            className="border p-2 rounded w-full ml-4"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        )}
      </div>

      {/* Show number of search results */}
      <div className="mb-4 text-gray-600">
        Showing {filteredRooms.length} {filteredRooms.length === 1 ? 'result' : 'results'}
      </div>

      {/* Room List Cards */}
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {filteredRooms.map((room) => (
    <div key={room.id} className="bg-white shadow rounded p-4 relative">
      {editingId === room.id ? (
        <>
          <input
            name="room_name"
            value={editForm.room_name}
            onChange={handleEditChange}
            className="border px-2 py-1 rounded w-full mb-2"
          />
          <select
            name="room_type"
            value={editForm.room_type}
            onChange={handleEditChange}
            className="border px-2 py-1 rounded w-full mb-2"
          >
            <option value="">Select Room Type</option>
            {ROOM_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select
            name="building"
            value={editForm.building}
            onChange={handleEditChange}
            className="border px-2 py-1 rounded w-full mb-2"
          >
            <option value="">Select Building</option>
            {BUILDINGS.map(building => (
              <option key={building} value={building}>{building}</option>
            ))}
          </select>
          <div className="flex justify-end space-x-2">
            <button onClick={saveEdit} className="text-green-600 hover:text-green-800"><Save size={18} /></button>
            <button onClick={() => setEditingId(null)} className="text-gray-600 hover:text-gray-800"><X size={18} /></button>
          </div>
        </>
      ) : (
        <>
          <h3 className="text-lg font-bold text-green-700 mb-2">{room.room_name}</h3>
          <p className="text-sm mb-1"><strong>Type:</strong> {room.room_type}</p>
          <p className="text-sm mb-1"><strong>Building:</strong> {room.building}</p>
          <p className="text-sm mb-3"><strong>ID:</strong> {room.id}</p>
          <div className="flex justify-between">
            <button onClick={() => startEdit(room)} className="text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
            <button onClick={() => setSelectedRoom(room)} className="text-green-600 hover:text-green-800"><Eye size={18} /></button>
            <button onClick={() => setConfirmDeleteId(room.id)} className="text-red-600 hover:text-red-800"><Trash size={18} /></button>
          </div>
        </>
      )}
    </div>
  ))}
</div>


      {/* Delete Confirmation Modal */}
      {confirmDeleteId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-sm w-full">
            <h2 className="text-xl font-bold text-red-600 mb-4">Confirm Delete</h2>
            <p className="mb-4">Are you sure you want to delete this room?</p>
            <div className="flex justify-end space-x-4">
              <button onClick={() => setConfirmDeleteId(null)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-sm w-full">
            <h2 className="text-xl font-bold text-green-800 mb-4">Room Details</h2>
            <div className="space-y-2">
              <p><strong>Room Name:</strong> {selectedRoom.room_name}</p>
              <p><strong>Room Type:</strong> {selectedRoom.room_type}</p>
              <p><strong>Building:</strong> {selectedRoom.building}</p>
              <p><strong>Room ID:</strong> {selectedRoom.id}</p>
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={() => setSelectedRoom(null)} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Close</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
