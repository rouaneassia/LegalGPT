import React, { useEffect, useState } from 'react';
import API from '../../services/api';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // جلب المستخدمين العاديين فقط من الـ API
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.get('http://127.0.0.1:8000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (err) {
      setError('تعذر تحميل بيانات المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // تغيير دور المستخدم
  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      await API.put(`http://127.0.0.1:8000/api/admin/users/${userId}/role`, { role: newRole }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err) {
      alert('فشل تحديث الدور');
    }
  };

  // تغيير حالة الحساب (Active / Inactive)
  const handleStatusChange = async (userId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await API.put(`http://127.0.0.1:8000/api/admin/users/${userId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err) {
      alert('فشل تحديث الحالة');
    }
  };

  // حذف مستخدم
  const handleDelete = async (userId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    try {
      const token = localStorage.getItem('token');
      await API.delete(`http://127.0.0.1:8000/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'فشل حذف المستخدم');
    }
  };

  if (loading) return <div className="p-6 text-white">جاري التحميل...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-8 bg-slate-950 min-h-screen text-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">👥 إدارة المستخدمين المسجلين (Users Control)</h1>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800 text-slate-400 text-sm uppercase">
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4">Created At</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {users.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-6 text-center text-slate-400">
                  لا يوجد أي مستخدم مسجل حالياً.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-800/50 transition">
                  <td className="p-4 font-medium">{user.name}</td>
                  <td className="p-4 text-slate-400">{user.email}</td>
                  <td className="p-4">
                    <select 
                      value={user.role} 
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-white focus:outline-none"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      user.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-center space-x-2">
                    <button 
                      onClick={() => handleStatusChange(user.id, user.status === 'active' ? 'inactive' : 'active')}
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        user.status === 'active' ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      {user.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button 
                      onClick={() => handleDelete(user.id)}
                      className="px-3 py-1 rounded text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}