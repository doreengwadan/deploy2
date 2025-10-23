'use client';

import { useEffect, useState } from 'react';
import { Edit, Trash, Save, X, Search, Eye } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface Resource {
  id: number;
  name: string;
  description: string;
  quantity: number;
  status: string;
}

const API_URL = 'http://localhost:8000/api';
const STATUSES = ['available', 'in-use', 'damaged'];

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [form, setForm] = useState<Omit<Resource, 'id'>>({
    name: '',
    description: '',
    quantity: 0,
    status: 'available',
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Omit<Resource, 'id'>>({
    name: '',
    description: '',
    quantity: 0,
    status: 'available',
  });
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const res = await fetch(`${API_URL}/resources`);
      const data = await res.json();
      setResources(data);
    } catch {
      toast.error('Failed to load resources');
    }
  };

  const handleSubmit = async () => {
    try {
      await fetch(`${API_URL}/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setForm({ name: '', description: '', quantity: 0, status: 'available' });
      toast.success('Resource added');
      fetchResources();
    } catch {
      toast.error('Failed to add resource');
    }
  };

  const startEdit = (resource: Resource) => {
    setEditingId(resource.id);
    setEditForm({
      name: resource.name,
      description: resource.description,
      quantity: resource.quantity,
      status: resource.status,
    });
  };

  const saveEdit = async () => {
    if (editingId === null) return;
    try {
      await fetch(`${API_URL}/resources/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      toast.success('Resource updated');
      setEditingId(null);
      fetchResources();
    } catch {
      toast.error('Failed to update resource');
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await fetch(`${API_URL}/resources/${confirmDeleteId}`, { method: 'DELETE' });
      toast.success('Resource deleted');
      setConfirmDeleteId(null);
      fetchResources();
    } catch {
      toast.error('Failed to delete resource');
    }
  };

  const filteredResources = resources.filter(resource =>
    `${resource.name} ${resource.description} ${resource.status}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="p-6 md:p-10 max-w-5xl mx-auto">
      <Toaster />
      <h1 className="text-2xl font-bold text-green-800 mb-4">Resource Management</h1>

      {/* Add Resource Form */}
      <div className="bg-white p-4 shadow mb-6 rounded">
        <h2 className="font-semibold text-green-700 mb-2">Add New Resource</h2>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border p-2 rounded w-full"
          />
          <input
            type="text"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="border p-2 rounded w-full"
          />
          <input
            type="number"
            placeholder="Quantity"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })}
            className="border p-2 rounded w-full"
          />
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="border p-2 rounded w-full"
          >
            {STATUSES.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded w-full">
            Add Resource
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex justify-between items-center mb-4">
        <button
          className="flex items-center bg-green-600 text-white px-4 py-2 rounded"
          onClick={() => setSearchVisible(!searchVisible)}
        >
          <Search className="mr-2" size={20} /> Search
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

      <div className="mb-4 text-gray-600">
        Showing {filteredResources.length} {filteredResources.length === 1 ? 'result' : 'results'}
      </div>

      {/* Resource Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredResources.map(resource => (
          <div key={resource.id} className="bg-white p-4 shadow rounded relative">
            {editingId === resource.id ? (
              <>
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="border p-2 mb-2 rounded w-full"
                  placeholder="Name"
                />
                <input
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="border p-2 mb-2 rounded w-full"
                  placeholder="Description"
                />
                <input
                  type="number"
                  value={editForm.quantity}
                  onChange={(e) => setEditForm({ ...editForm, quantity: parseInt(e.target.value) || 0 })}
                  className="border p-2 mb-2 rounded w-full"
                  placeholder="Quantity"
                />
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="border p-2 mb-2 rounded w-full"
                >
                  {STATUSES.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <div className="flex justify-end space-x-2 mt-2">
                  <button onClick={saveEdit} className="text-green-600"><Save size={20} /></button>
                  <button onClick={() => setEditingId(null)} className="text-gray-600"><X size={20} /></button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold text-green-800 mb-1">{resource.name}</h2>
                <p className="text-sm text-gray-600 mb-1">{resource.description}</p>
                <p className="text-sm text-gray-700 mb-1">Quantity: <span className="font-semibold">{resource.quantity}</span></p>
                <p className="text-sm text-gray-700 mb-2">Status: <span className="font-semibold">{resource.status}</span></p>
                <div className="flex justify-end space-x-2">
                  <button onClick={() => startEdit(resource)} className="text-blue-600"><Edit size={20} /></button>
                  <button onClick={() => setSelectedResource(resource)} className="text-green-600"><Eye size={20} /></button>
                  <button onClick={() => setConfirmDeleteId(resource.id)} className="text-red-600"><Trash size={20} /></button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Delete Confirmation */}
      {confirmDeleteId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-sm w-full">
            <h2 className="text-xl font-bold text-red-600 mb-4">Confirm Delete</h2>
            <p className="mb-4">Are you sure you want to delete this resource?</p>
            <div className="flex justify-end space-x-4">
              <button onClick={() => setConfirmDeleteId(null)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* View Resource Details */}
      {selectedResource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-sm w-full">
            <h2 className="text-xl font-bold text-green-800 mb-4">Resource Details</h2>
            <div className="space-y-2">
              <p><strong>Name:</strong> {selectedResource.name}</p>
              <p><strong>Description:</strong> {selectedResource.description}</p>
              <p><strong>Quantity:</strong> {selectedResource.quantity}</p>
              <p><strong>Status:</strong> {selectedResource.status}</p>
              <p><strong>ID:</strong> {selectedResource.id}</p>
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={() => setSelectedResource(null)} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Close</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
