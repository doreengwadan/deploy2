"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash, BookOpen, Building, Hash, Users, X } from "lucide-react";
import Link from "next/link";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

type Programme = {
  id: number;
  name: string;
  description: string;
  department: string;
  duration?: string;
  category?: string;
};

export default function AdminProgrammesPage() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [programmeToDelete, setProgrammeToDelete] = useState<Programme | null>(null);
  const [notification, setNotification] = useState("");
  const router = useRouter();

  // Fetch programmes
  useEffect(() => {
    const fetchProgrammes = async () => {
      try {
        const token = Cookies.get("token");
        const res = await axios.get(`${API_BASE_URL}/admin/programmes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProgrammes(res.data);
      } catch (err) {
        console.error("Failed to fetch programmes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgrammes();
  }, []);

  // Open modal
  const openModal = (prog: Programme) => {
    setProgrammeToDelete(prog);
    setModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setProgrammeToDelete(null);
    setModalOpen(false);
  };

  // Delete programme
  const confirmDelete = async () => {
    if (!programmeToDelete) return;
    try {
      const token = Cookies.get("token");
      await axios.delete(`${API_BASE_URL}/admin/programmes/${programmeToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProgrammes(programmes.filter((p) => p.id !== programmeToDelete.id));
      setNotification(`Programme "${programmeToDelete.name}" deleted successfully!`);
    } catch (err) {
      console.error("Failed to delete programme:", err);
      setNotification("Failed to delete programme. Please try again.");
    } finally {
      closeModal();
      // Hide notification after 3 seconds
      setTimeout(() => setNotification(""), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-xl">
              <BookOpen className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Programmes</h1>
              <p className="text-gray-600 mt-1">View and manage all academic programmes</p>
            </div>
          </div>

          <Link
            href="/appadmin/programmes/add"
            className="inline-flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 group"
          >
            <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Add Programme</span>
          </Link>
        </div>

        {/* Notification */}
        {notification && (
          <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-out">
            {notification}
          </div>
        )}

        {/* Programmes Table */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading programmes...</p>
          </div>
        ) : programmes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No programmes found</h3>
            <p className="text-gray-500 mb-6">Get started by adding your first programme.</p>
            <Link
              href="/appadmin/programmes/add"
              className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
            >
              <Plus className="w-5 h-5" />
              <span>Add Programme</span>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">All Programmes</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-green-600 to-green-700 text-white">
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <Hash className="w-4 h-4" />
                        <span>ID</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4" />
                        <span>Programme Name</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4" />
                        <span>Description</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4" />
                        <span>Department</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {programmes.map((prog) => (
                    <tr key={prog.id} className="hover:bg-green-50/50 transition-all duration-200 group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          {prog.id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{prog.name}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">{prog.description}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Building className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{prog.department}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-3">
                          <Link
                            href={`/appadmin/programmes/edit/${prog.id}`}
                            className="inline-flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-colors duration-200 group-hover:shadow-md"
                          >
                            <Pencil className="w-4 h-4" />
                            <span>Edit</span>
                          </Link>
                          <button
                            onClick={() => openModal(prog)}
                            className="inline-flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition-colors duration-200 group-hover:shadow-md"
                          >
                            <Trash className="w-4 h-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {modalOpen && programmeToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Deletion
            </h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete the programme "{programmeToDelete.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
