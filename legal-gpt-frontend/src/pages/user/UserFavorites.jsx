import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

export default function UserFavorites() {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchFavorites();
        
        const handleUpdate = () => fetchFavorites();
        window.addEventListener('favorites-updated', handleUpdate);
        return () => window.removeEventListener('favorites-updated', handleUpdate);
    }, []);

    const fetchFavorites = async () => {
        try {
            const response = await API.get('/user/favorites');
            setFavorites(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching favorites:', error);
            setFavorites([]);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFavorite = async (item) => {
        try {
            const payload = item.chat_id ? { chat_id: item.chat_id } : { generated_document_id: item.generated_document_id };
            await API.post('/user/favorites/toggle', payload);
            
            // Mise à jour locale immédiate + Notification globale vers la sidebar
            setFavorites((prev) => prev.filter((fav) => fav.id !== item.id));
            window.dispatchEvent(new Event('favorites-updated'));
        } catch (error) {
            console.error('Error toggling favorite:', error);
            alert(error.response?.data?.message || 'Impossible de modifier le favori.');
        }
    };

    return (
        <div className="flex-1 h-screen bg-[#06090F] text-slate-100 flex flex-col overflow-y-auto p-8" dir="ltr">
            <div className="max-w-4xl mx-auto w-full">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                    <span className="text-2xl">⭐</span>
                    <h1 className="text-2xl font-bold tracking-tight">Favorite Chats & Documents</h1>
                </div>

                {loading ? (
                    <div className="text-slate-500 text-sm animate-pulse">Chargement...</div>
                ) : favorites.length === 0 ? (
                    <div className="text-center py-20 bg-[#0E1522] border border-slate-800/80 rounded-2xl">
                        <span className="text-3xl mb-2 block">⭐</span>
                        <p className="text-slate-400 text-sm">Aucun élément dans les favoris pour le moment.</p>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {favorites.map((item) => {
                            const title = item.chat?.title || item.document?.title || 'Discussion / Document juridique';
                            const type = item.chat_id ? 'Chat' : 'Document';

                            return (
                                <div
                                    key={item.id}
                                    className="bg-[#0E1522] border border-slate-800/80 hover:border-emerald-500/50 p-4 rounded-xl transition flex justify-between items-center shadow-md gap-3"
                                >
                                    <div
                                        onClick={() => {
                                            if (item.chat_id) navigate(`/chat/${item.chat_id}`);
                                            if (item.generated_document_id) navigate('/documents');
                                        }}
                                        className="flex-1 cursor-pointer"
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] uppercase tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-2 py-1">
                                                {type}
                                            </span>
                                        </div>
                                        <h3 className="font-semibold text-sm text-slate-200">{title}</h3>
                                        <p className="text-xs text-slate-400 mt-1">Accéder à l'élément enregistré</p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleToggleFavorite(item)}
                                            className="text-red-400 hover:text-red-300 text-xs font-medium transition"
                                        >
                                            Retirer
                                        </button>
                                        <span
                                            onClick={() => {
                                                if (item.chat_id) navigate(`/chat/${item.chat_id}`);
                                                if (item.generated_document_id) navigate('/documents');
                                            }}
                                            className="text-emerald-400 text-xs font-medium cursor-pointer"
                                        >
                                            Ouvrir ➜
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}