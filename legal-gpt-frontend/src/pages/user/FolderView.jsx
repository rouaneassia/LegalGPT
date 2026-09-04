import React, { useEffect, useState } from 'react';
import { ArrowLeft, CalendarDays, Folder, MessageSquare, Search } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../services/api';

export default function FolderView() {
    const { folderId } = useParams();
    const navigate = useNavigate();
    const [folder, setFolder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchFolder = async () => {
            setLoading(true);
            setError('');

            try {
                const response = await API.get(`/user/folders/${folderId}`);
                setFolder(response.data);
            } catch (requestError) {
                console.error('Error fetching folder:', requestError);
                setError(requestError.response?.status === 404
                    ? 'Ce dossier est introuvable.'
                    : 'Impossible de charger ce dossier.');
            } finally {
                setLoading(false);
            }
        };

        fetchFolder();
    }, [folderId]);

    const formatDate = (date) => {
        if (!date) return '';
        return new Intl.DateTimeFormat('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }).format(new Date(date));
    };

    return (
        <div className="min-h-full bg-[#06090F] text-slate-100 p-8" dir="ltr">
            <div className="max-w-5xl mx-auto">
                <button
                    type="button"
                    onClick={() => navigate('/folders')}
                    className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition mb-6"
                >
                    <ArrowLeft size={16} />
                    Retour aux dossiers
                </button>

                {loading ? (
                    <div className="text-sm text-slate-500 animate-pulse">Chargement du dossier...</div>
                ) : error ? (
                    <div className="border border-red-500/30 bg-red-500/10 rounded-2xl p-6 text-red-300">{error}</div>
                ) : (
                    <>
                        <header className="flex items-center gap-4 border-b border-slate-800 pb-6 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                                <Folder size={24} className="text-emerald-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">{folder.name}</h1>
                                <p className="text-sm text-slate-400 mt-1">
                                    {folder.chats?.length || 0} conversation{folder.chats?.length === 1 ? '' : 's'} dans ce dossier
                                </p>
                            </div>
                        </header>

                        {!folder.chats?.length ? (
                            <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl">
                                <Search size={30} className="mx-auto text-slate-600 mb-3" />
                                <h2 className="text-base font-semibold text-slate-300">Ce dossier est vide</h2>
                                <p className="text-sm text-slate-500 mt-2">Les conversations associées à ce dossier apparaîtront ici.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {folder.chats.map((chat) => (
                                    <button
                                        key={chat.id}
                                        type="button"
                                        onClick={() => navigate(`/chat/${chat.id}`)}
                                        className="text-left bg-[#0E1522] border border-slate-800/80 hover:border-emerald-500/50 rounded-2xl p-5 transition group"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <MessageSquare size={18} className="text-emerald-400 shrink-0" />
                                                <h2 className="font-semibold text-slate-200 truncate group-hover:text-emerald-300 transition">
                                                    {chat.title || 'Conversation sans titre'}
                                                </h2>
                                            </div>
                                            <span className="text-xs text-slate-500 shrink-0">#{chat.id}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-5 text-xs text-slate-500">
                                            <CalendarDays size={14} />
                                            {formatDate(chat.updated_at || chat.created_at)}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
