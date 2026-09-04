import React, { useState, useEffect } from 'react';
import API from '../../services/api';

export default function UserFolders() {
    const [folders, setFolders] = useState([]);
    const [newFolderName, setNewFolderName] = useState('');
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchFolders();
    }, []);

    const fetchFolders = async () => {
        try {
            const response = await API.get('/user/folders');
            setFolders(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching folders:', error);
            setFolders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateFolder = async (e) => {
        e.preventDefault();
        const trimmed = newFolderName.trim();
        if (!trimmed) return;

        try {
            setCreating(true);
            const response = await API.post('/user/folders', { name: trimmed });
            setFolders((prev) => [response.data, ...prev]);
            setNewFolderName('');
        } catch (error) {
            console.error('Error creating folder:', error);
            alert(error.response?.data?.message || 'Impossible de créer le dossier.');
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteFolder = async (folderId) => {
        if (!window.confirm('Supprimer ce dossier ?')) return;

        try {
            await API.delete(`/user/folders/${folderId}`);
            setFolders((prev) => prev.filter((folder) => folder.id !== folderId));
        } catch (error) {
            console.error('Error deleting folder:', error);
            alert(error.response?.data?.message || 'Impossible de supprimer ce dossier.');
        }
    };

    return (
        <div className="flex-1 h-screen bg-[#06090F] text-slate-100 flex flex-col overflow-y-auto p-8" dir="ltr">
            <div className="max-w-4xl mx-auto w-full">
                <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">📁</span>
                        <h1 className="text-2xl font-bold tracking-tight">Folders Management</h1>
                    </div>
                </div>

                <form onSubmit={handleCreateFolder} className="flex gap-3 mb-8 bg-[#0E1522] p-4 rounded-2xl border border-slate-800 shadow-xl">
                    <input
                        type="text"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        placeholder="Nom du nouveau dossier..."
                        className="flex-1 bg-slate-900 border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                    <button
                        type="submit"
                        disabled={creating || !newFolderName.trim()}
                        className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-md"
                    >
                        {creating ? 'Création...' : 'Créer un dossier'}
                    </button>
                </form>

                {loading ? (
                    <div className="text-slate-500 text-sm animate-pulse">Chargement...</div>
                ) : folders.length === 0 ? (
                    <div className="text-center py-16 bg-[#0E1522] border border-slate-800/80 rounded-2xl">
                        <span className="text-3xl mb-2 block">📁</span>
                        <p className="text-slate-400 text-sm">Aucun dossier créé pour l'instant.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {folders.map((folder) => (
                            <div
                                key={folder.id}
                                className="bg-[#0E1522] border border-slate-800/80 hover:border-emerald-500/40 p-5 rounded-2xl shadow-lg transition flex items-center justify-between gap-3"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className="text-xl">📂</span>
                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-sm text-slate-200 truncate">{folder.name}</h3>
                                        <p className="text-xs text-slate-500 mt-0.5">{folder.chats_count || 0} discussions</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleDeleteFolder(folder.id)}
                                    className="text-slate-400 hover:text-red-400 text-xs font-medium transition"
                                >
                                    Supprimer
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}