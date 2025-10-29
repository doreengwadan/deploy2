'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash, BookOpen, Building, Hash, X } from "lucide-react";
import Link from "next/link";
import axios from "axios";

type Programme = {
  id: number;
  name: string;
  description?: string;
  department?: string;
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

  // Fetch programmes from Next.js API
  useEffect(() => {
    const fetchProgrammes = async () => {
      try {
        const res = await axios.get("/api/admin/programmes");
        setProgrammes(res.data);
      } catch (err) {
        console.error("Failed to fetch programmes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgrammes();
  }, []);

  const openModal = (prog: Programme) => {
    setProgrammeToDelete(prog);
    setModalOpen(true);
  };

  const closeModal = () => {
    setProgrammeToDelete(null);
    setModalOpen(false);
  };

  const confirmDelete = async () => {
    if (!programmeToDelete) return;
    try {
      await axios.delete(`/api/admin/programmes/${programmeToDelete.id}`);
      setProgrammes(programmes.filter((p) => p.id !== programmeToDelete.id));
      setNotification(`Programme "${programmeToDelete.name}" deleted successfully!`);
    } catch (err) {
      console.error("Failed to delete programme:", err);
      setNotification("Failed to delete programme. Please try again.");
    } finally {
      closeModal();
      setTimeout(() => setNotification(""), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
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
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Programme Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Description</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Department</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {programmes.map((prog) => (
                    <tr key={prog.id} className="hover:bg-green-50/50 transition-all duration-200 group">
                      <td className="px-6 py-4">{prog.id}</td>
                      <td className="px-6 py-4">{prog.name}</td>
                      <td className="px-6 py-4">{prog.description}</td>
                      <td className="px-6 py-4">{prog.department}</td>
                      <td className="px-6 py-4 whitespace-nowrap flex justify-center gap-3">
                        <Link href={`/appadmin/programmes/edit/${prog.id}`} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm">
                          <Pencil className="w-4 h-4 inline" /> Edit
                        </Link>
                        <button onClick={() => openModal(prog)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm">
                          <Trash className="w-4 h-4 inline" /> Delete
                        </button>
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
            <button onClick={closeModal} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete the programme "{programmeToDelete.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button onClick={closeModal} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
