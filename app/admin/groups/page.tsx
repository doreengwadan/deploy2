'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Edit3, Trash2 } from 'lucide-react';

type Cleaner = { id: number; firstname: string; lastname: string; group_id: number | null };
type Group = { id: number; name: string; members: Cleaner[] };

export default function AdminGroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [cleaners, setCleaners] = useState<Cleaner[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupMembers, setNewGroupMembers] = useState<number[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const API_URL = 'http://localhost:8000/api/groups';
  const APPLICANTS_URL = 'http://localhost:8000/api/applicants';
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('token');

    if (!token) {
      router.push('/login');
      return;
    }

    const fetchGroups = async () => {
      try {
        const res = await axios.get<Group[]>(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setGroups(res.data);
      } catch {
        alert('Error fetching groups');
        router.push('/login');
      }
    };

    const fetchCleaners = async () => {
      try {
        const res = await axios.get<Cleaner[]>(`${APPLICANTS_URL}?role=cleaner`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCleaners(res.data);
      } catch {
        alert('Error fetching cleaners');
        router.push('/login');
      }
    };

    fetchGroups();
    fetchCleaners();
  }, [router]);

  const handleAddGroup = async () => {
    const token = Cookies.get('token');
    if (!newGroupName.trim()) return alert('Group name is required');

    try {
      await axios.post(API_URL, {
        name: newGroupName.trim(),
        member_ids: newGroupMembers,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNewGroupName('');
      setNewGroupMembers([]);
      await fetchGroups();
      await fetchCleaners();
    } catch {
      alert('Failed to add group');
    }
  };

  const handleDeleteGroup = async (id: number) => {
    const token = Cookies.get('token');
    if (!confirm('Delete this group?')) return;

    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchGroups();
      await fetchCleaners();
    } catch {
      alert('Failed to delete group');
    }
  };

  const handleEditGroup = async (group: Group) => {
    const token = Cookies.get('token');
    const name = prompt('New group name:', group.name);
    if (!name) return;

    const members = prompt('Comma-separated member IDs:', group.members.map(m => m.id).join(','));
    if (members === null) return;

    const parsedMembers = members
      .split(',')
      .map(s => parseInt(s.trim()))
      .filter(id => !isNaN(id));

    try {
      await axios.put(`${API_URL}/${group.id}`, {
        name: name.trim(),
        member_ids: parsedMembers,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchGroups();
      await fetchCleaners();
    } catch {
      alert('Failed to update group');
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const handleCheckboxChange = (id: number) => {
    setNewGroupMembers(prev =>
      prev.includes(id) ? prev.filter(memberId => memberId !== id) : [...prev, id]
    );
  };

  return (
    <main className="p-6 md:p-10 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-green-800 mb-4">Group Management</h1>

      {/* Create Group Form */}
      <div className="bg-white shadow rounded-md p-6 mb-8">
        <h2 className="text-lg font-semibold text-green-700 mb-4">Create New Group</h2>
        <input
          type="text"
          placeholder="Group Name"
          value={newGroupName}
          onChange={e => setNewGroupName(e.target.value)}
          className="border rounded px-3 py-2 w-full mb-4"
        />
        <div className="border rounded px-3 py-2 max-h-48 overflow-y-auto mb-4">
          {cleaners.map(cleaner => (
            <div key={cleaner.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={newGroupMembers.includes(cleaner.id)}
                onChange={() => handleCheckboxChange(cleaner.id)}
              />
              <span>{cleaner.firstname} {cleaner.lastname}</span>
            </div>
          ))}
        </div>
        <button
          onClick={handleAddGroup}
          className="bg-green-700 text-white px-5 py-2 rounded hover:bg-green-800"
        >
          Add Group
        </button>
      </div>

      {/* Group List */}
      <div className="overflow-x-auto bg-white shadow rounded-md">
        <table className="min-w-full">
          <thead className="bg-green-100 text-green-800">
            <tr>
              <th className="px-4 py-2 text-left">Group Name</th>
              <th className="px-4 py-2 text-left"># Members</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {groups.map(group => (
              <React.Fragment key={group.id}>
                <tr className="border-t">
                  <td className="px-4 py-2">{group.name}</td>
                  <td className="px-4 py-2">{group.members?.length ?? 0}</td>
                  <td className="px-4 py-2 space-x-2 text-sm">
                    <button onClick={() => toggleExpand(group.id)} className="text-blue-600 hover:text-blue-800">
                      {expandedId === group.id ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    <button onClick={() => handleEditGroup(group)} className="text-yellow-600 hover:text-yellow-800">
                      <Edit3 size={18} />
                    </button>
                    <button onClick={() => handleDeleteGroup(group.id)} className="text-red-600 hover:text-red-800">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
                {expandedId === group.id && (
                  <tr className="bg-gray-50">
                    <td colSpan={3} className="px-4 py-2">
                      <strong>Members:</strong>
                      <ul className="list-disc ml-6 mt-2">
                        {group.members?.length ? (
                          group.members.map((m, i) => (
                            <li key={i}>{m.firstname} {m.lastname}</li>
                          ))
                        ) : (
                          <li className="text-gray-500 italic">No members</li>
                        )}
                      </ul>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {!groups.length && (
              <tr>
                <td colSpan={3} className="text-center py-4 text-gray-500">
                  No groups found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
