import React, { useEffect, useState } from 'react';
import API from '../../services/api';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // جلب المستخدمين من الـ API
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
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    try {
      const token = localStorage.getItem('token');
      await API.delete(`http://127.0.0.1:8000/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Échec de la suppression de l\'utilisateur');
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-xs font-semibold tracking-wider" style={{ backgroundColor: '#EBE9E4', color: '#3D5A4C' }}>
        <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-xl shadow-sm border border-[#3D5A4C]/10">
          <span className="w-2.5 h-2.5 rounded-full bg-[#3D5A4C] animate-ping"></span>
          Chargement des utilisateurs...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-xs font-semibold text-rose-600" style={{ backgroundColor: '#EBE9E4' }}>
        <div className="bg-white px-6 py-4 rounded-xl shadow-sm border border-rose-200">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 px-6 pb-12 max-w-7xl mx-auto space-y-6 text-sm" style={{ backgroundColor: '#EBE9E4', minHeight: '100vh' }} dir="auto">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between  px-6 py-5 rounded-xl shadow-sm border border-[#3D5A4C]/10 gap-4">
        <div>
          <h1 className="text-base font-bold text-[#3D5A4C] flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#3D5A4C]/10 text-[#3D5A4C]">👥</span> 
            Gestion des Utilisateurs Enregistrés
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-normal">Supervision des comptes, des rôles et des accès aux services de la plateforme</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-[#3D5A4C]/10 px-4 py-2 rounded-lg text-[#3D5A4C] font-semibold text-xs flex items-center gap-2 border border-[#3D5A4C]/20">
            <span className="w-2 h-2 rounded-full bg-[#3D5A4C] animate-pulse"></span>
            {users.length} utilisateur(s) au total
          </div>
        </div>
      </div>

      {/* Search & Table Card */}
      <div className="bg-white p-6 rounded-xl border border-[#3D5A4C]/10 shadow-sm space-y-4">
        
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#EBE9E4]/40 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#3D5A4C] transition-all"
            />
          </div>
          <div className="text-[10px] font-mono bg-[#EBE9E4] text-[#3D5A4C] px-3 py-1.5 rounded-lg font-semibold">
            {filteredUsers.length} résultat(s) affiché(s)
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#EBE9E4]/50 text-[#3D5A4C] text-[11px] font-bold uppercase tracking-wider border-b border-slate-200/60">
                <th className="p-4">Utilisateur</th>
                <th className="p-4">Courriel</th>
                <th className="p-4">Rôle</th>
                <th className="p-4">Statut</th>
                <th className="p-4">Date d'inscription</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-400 text-xs font-medium">
                    Aucun utilisateur ne correspond à votre recherche.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#EBE9E4]/30 transition-colors">
                    <td className="p-4 font-bold text-slate-800 text-xs">
                      {user.name}
                    </td>
                    <td className="p-4 text-slate-500 text-xs font-normal">
                      {user.email}
                    </td>
                    <td className="p-4">
                      <select 
                        value={user.role} 
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="bg-[#EBE9E4]/60 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-[#3D5A4C] font-semibold focus:outline-none focus:border-[#3D5A4C] transition-all cursor-pointer"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide inline-block ${
                        user.status === 'active' 
                          ? 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/20' 
                          : 'bg-rose-500/15 text-rose-700 border border-rose-500/20'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-500 font-mono">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-center space-x-2">
                      <button 
                        onClick={() => handleStatusChange(user.id, user.status === 'active' ? 'inactive' : 'active')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition hover:opacity-95 ${
                          user.status === 'active' 
                            ? 'bg-amber-600 text-white' 
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {user.status === 'active' ? 'Désactiver' : 'Activer'}
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}