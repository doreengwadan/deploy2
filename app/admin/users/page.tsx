'use client';

import { useEffect, useState } from 'react';
import { Edit, Trash, Save, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

type User = {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  role: 'Admin' | 'Supervisor' | 'Cleaner';
};

const USERS_PER_PAGE = 5;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Omit<User, 'id'>>({ firstname: '', lastname: '', email: '', role: 'Cleaner' });

  const [roleFilter, setRoleFilter] = useState<'All' | 'Admin' | 'Supervisor' | 'Cleaner'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const API_BASE = 'http://localhost:8000';
useEffect(() => {
  const fetchUsers = async () => {
    try {
      await fetch('http://localhost:8000/sanctum/csrf-cookie', {
        credentials: 'include',
      });

      const res = await fetch('http://localhost:8000/api/applicants', {
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!res.ok) throw new Error('Fetch failed');

      const data = await res.json();
      setUsers(data);
    } catch (err) {
      toast.error('Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  fetchUsers();
}, []);


  const filteredUsers = roleFilter === 'All'
    ? users
    : users.filter(user => user.role === roleFilter);

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * USERS_PER_PAGE, currentPage * USERS_PER_PAGE);

  const startEdit = (user: User) => {
    setEditingId(user.id);
    setEditForm({ firstname: user.firstname, lastname: user.lastname, email: user.email, role: user.role });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const saveEdit = async () => {
    if (editingId === null) return;

    try {
      const response = await fetch(`${API_BASE}/api/applicants/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(editForm),
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to update user');

      setUsers(prev => prev.map(u => (u.id === editingId ? { id: u.id, ...editForm } : u)));
      toast.success('User updated');
      setEditingId(null);
    } catch (err) {
      toast.error('Failed to update user');
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;

    try {
      const response = await fetch(`${API_BASE}/api/applicants/${confirmDeleteId}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to delete user');

      setUsers(prev => prev.filter(u => u.id !== confirmDeleteId));
      toast.success('User deleted');
      setConfirmDeleteId(null);
    } catch (err) {
      toast.error('Failed to delete user');
      console.error(err);
    }
  };

  return (
    <main className="p-6 md:p-10 max-w-5xl mx-auto">
      <Toaster />
      <h1 className="text-2xl font-bold text-green-800 mb-4">The Users Details</h1>

      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="mb-2 md:mb-0">
          <label className="mr-2 font-semibold">Filter by Role:</label>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="p-2 border rounded"
          >
            <option value="All">All</option>
            <option value="Admin">Admin</option>
            <option value="Supervisor">Supervisor</option>
            <option value="Cleaner">Cleaner</option>
          </select>
        </div>

        <div>
          <span className="font-semibold text-green-700">
            Showing {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {loading ? (
        <p>We are loading the data please be patient...</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded">
          <table className="min-w-full">
            <thead className="bg-green-100 text-green-800">
              <tr>
                <th className="text-left px-4 py-2">Name</th>
                <th className="text-left px-4 py-2">Email</th>
                <th className="text-left px-4 py-2">Role</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map(user => (
                <tr key={user.id} className="border-t">
                  {editingId === user.id ? (
                    <>
                      <td className="px-4 py-2">
                        <input name="firstname" value={editForm.firstname} onChange={handleChange} className="border px-2 py-1 rounded w-full" />
                        <input name="lastname" value={editForm.lastname} onChange={handleChange} className="border px-2 py-1 rounded w-full mt-1" />
                      </td>
                      <td className="px-4 py-2">
                        <input type="email" name="email" value={editForm.email} onChange={handleChange} className="border px-2 py-1 rounded w-full" />
                      </td>
                      <td className="px-4 py-2">
                        <select name="role" value={editForm.role} onChange={handleChange} className="border px-2 py-1 rounded w-full">
                          <option value="Admin">Admin</option>
                          <option value="Supervisor">Supervisor</option>
                          <option value="Cleaner">Cleaner</option>
                        </select>
                      </td>
                      <td className="px-4 py-2 text-center space-x-2">
                        <button onClick={saveEdit} className="text-green-600 hover:text-green-800">
                          <Save size={18} />
                        </button>
                        <button onClick={() => setEditingId(null)} className="text-gray-500 hover:text-gray-800">
                          <X size={18} />
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-2">{user.firstname} {user.lastname}</td>
                      <td className="px-4 py-2">{user.email}</td>
                      <td className="px-4 py-2">{user.role}</td>
                      <td className="px-4 py-2 text-center space-x-2">
                        <button onClick={() => startEdit(user)} className="text-blue-600 hover:text-blue-800">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => setConfirmDeleteId(user.id)} className="text-red-600 hover:text-red-800">
                          <Trash size={18} />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-green-700 text-white' : 'bg-gray-200 text-gray-800'}`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-sm w-full">
            <h2 className="text-xl font-bold text-red-600 mb-4">Confirm Delete</h2>
            <p className="mb-4">Are you sure you want to delete this user?</p>
            <div className="flex justify-end space-x-4">
              <button onClick={() => setConfirmDeleteId(null)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
