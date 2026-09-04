import React, { useState, useEffect } from 'react';
import API from '../../services/api';

export default function AdminChats() {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedChat, setSelectedChat] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [newChatNotification, setNewChatNotification] = useState(false);

    useEffect(() => {
        fetchAdminChats();
        
        const interval = setInterval(() => {
            // Logique de rafraîchissement ou détection de nouveaux éléments
        }, 15000);

        return () => clearInterval(interval);
    }, []);

    const fetchAdminChats = async () => {
        try {
            const response = await API.get('/admin/chats');
            if (chats.length > 0 && response.data.length > chats.length) {
                setNewChatNotification(true);
                setTimeout(() => setNewChatNotification(false), 5000);
            }
            setChats(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching admin chats:", error);
            setLoading(false);
        }
    };

    const filteredChats = chats.filter(chat => 
        chat.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen text-xs font-semibold tracking-wider" style={{ backgroundColor: '#EBE9E4', color: '#3D5A4C' }}>
            <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-xl shadow-sm border border-[#3D5A4C]/10">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3D5A4C] animate-ping"></span>
                Chargement de la console de supervision...
            </div>
        </div>
    );

    return (
        <div className="pt-24 px-6 pb-12 max-w-7xl mx-auto space-y-6 text-sm" style={{ backgroundColor: '#EBE9E4', minHeight: '100vh' }}>
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between  px-6 py-5 rounded-xl shadow-sm border border-[#3D5A4C]/10 gap-4">
                <div>
                    <h1 className="text-base font-bold text-[#3D5A4C] flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-[#3D5A4C]/10 text-[#3D5A4C]">💬</span> 
                        Supervision Avancée des Conversations
                    </h1>
                
                </div>
                
                <div className="flex items-center gap-3">
                    {newChatNotification && (
                        <div className="text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold animate-pulse shadow-sm flex items-center gap-2" style={{ backgroundColor: '#4D6658' }}>
                            <span>✨ Nouvelle conversation active !</span>
                        </div>
                    )}
                    <div className="bg-[#3D5A4C]/10 px-4 py-2 rounded-lg text-[#3D5A4C] font-semibold text-xs flex items-center gap-2 border border-[#3D5A4C]/20">
                        <span className="w-2 h-2 rounded-full bg-[#3D5A4C] animate-pulse"></span>
                        {chats.length} session(s) active(s)
                    </div>
                </div>
            </div>

            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 1. Sidebar: Chat List */}
                <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-[#3D5A4C]/10 shadow-sm h-[78vh] flex flex-col">
                    <div className="mb-4 space-y-3">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xs font-bold text-[#3D5A4C] tracking-wider uppercase">Fils de discussion</h2>
                            <span className="text-[10px] font-mono bg-[#EBE9E4] text-[#3D5A4C] px-2 py-0.5 rounded font-semibold">
                                {filteredChats.length} résultat(s)
                            </span>
                        </div>
                        <input
                            type="text"
                            placeholder="Rechercher par nom, email ou sujet..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#EBE9E4]/40 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#3D5A4C] transition-all"
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                        {filteredChats.length === 0 ? (
                            <div className="text-center py-16 text-slate-400 text-xs">
                                Aucune conversation ne correspond à votre recherche.
                            </div>
                        ) : (
                            filteredChats.map((chat) => (
                                <div
                                    key={chat.id}
                                    onClick={() => setSelectedChat(chat)}
                                    className={`p-3.5 rounded-xl cursor-pointer transition-all border ${
                                        selectedChat?.id === chat.id 
                                            ? 'bg-[#3D5A4C]/10 border-[#3D5A4C] text-[#3D5A4C] shadow-sm font-medium' 
                                            : 'bg-white border-slate-100 text-slate-700 hover:bg-[#EBE9E4]/50 hover:border-slate-200'
                                    }`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-xs truncate max-w-[140px]">
                                            👤 {chat.user?.name || 'Utilisateur Anonyme'}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-mono">
                                            {new Date(chat.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 truncate font-normal">
                                        {chat.title || 'Session de conseil juridique...'}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* 2. Main Panel: Detailed Chat View */}
                <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-[#3D5A4C]/10 shadow-sm h-[78vh] flex flex-col">
                    {selectedChat ? (
                        <>
                            {/* Chat Header Info */}
                            <div className="border-b border-slate-100 pb-4 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div>
                                    <h2 className="text-sm font-bold text-slate-800">
                                        Client Audité : <span className="text-[#3D5A4C]">{selectedChat.user?.name}</span>
                                    </h2>
                                    <p className="text-xs text-slate-400">Courriel : {selectedChat.user?.email || 'Non renseigné'}</p>
                                </div>
                                <div className="text-left sm:text-right">
                                    <span className="text-xs bg-[#EBE9E4] text-[#3D5A4C] px-3 py-1.5 rounded-lg border border-[#3D5A4C]/20 font-semibold inline-block mb-1">
                                        {new Date(selectedChat.created_at).toLocaleString()}
                                    </span>
                                    <p className="text-[10px] text-slate-400 font-mono">ID Session : #{selectedChat.id}</p>
                                </div>
                            </div>

                            {/* Messages & Sources Flow */}
                            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                                {selectedChat.messages && selectedChat.messages.map((msg, index) => (
                                    <div 
                                        key={index} 
                                        className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                                    >
                                        <div className={`max-w-[88%] p-4 rounded-xl text-xs space-y-2.5 shadow-sm ${
                                            msg.sender === 'user' 
                                                ? 'text-white rounded-br-none shadow-md' 
                                                : 'text-slate-800 rounded-bl-none border border-[#4D6658]/30 shadow-sm'
                                        }`}
                                        style={
                                            msg.sender === 'user' 
                                                ? { backgroundColor: '#4D6658' } 
                                                : { backgroundColor: '#F4F6F5', borderColor: '#4D6658' }
                                        }
                                        >
                                            <div className={`flex items-center justify-between pb-1.5 border-b ${
                                                msg.sender === 'user' ? 'opacity-90 border-white/15' : 'text-[#4D6658] border-[#4D6658]/20'
                                            }`}>
                                                <span className={`font-bold text-[11px] tracking-wide flex items-center gap-1.5 ${
                                                    msg.sender === 'user' ? 'text-white' : 'text-[#4D6658]'
                                                }`}>
                                                    {msg.sender === 'user' ? (
                                                        <><span>❓</span> Question Client</>
                                                    ) : (
                                                        <><span>🤖</span> Réponse Assistant IA</>
                                                    )}
                                                </span>
                                            </div>
                                            
                                            <p className="whitespace-pre-wrap leading-relaxed font-normal">
                                                {msg.content || msg.message}
                                            </p>
                                            
                                            {/* Sources List Box */}
                                            {msg.sources && msg.sources.length > 0 && (
                                                <div className="mt-3 pt-3 border-t border-[#4D6658]/20 text-xs bg-white/90 p-3 rounded-lg shadow-inner">
                                                    <span className="text-[#4D6658] font-bold block mb-2 flex items-center gap-1.5">
                                                        <span>📁</span> Références et sources juridiques mobilisées :
                                                    </span>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {msg.sources.map((src, i) => (
                                                            <span key={i} className="bg-[#EBE9E4] text-[#4D6658] px-2.5 py-1 rounded-md text-[11px] border border-[#4D6658]/30 font-mono font-semibold">
                                                                📄 {src.name || src.title || src}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-3">
                            <div className="w-12 h-12 rounded-full bg-[#EBE9E4] flex items-center justify-center text-[#3D5A4C] text-xl shadow-inner">
                                📂
                            </div>
                            <p className="text-xs text-center max-w-sm font-medium text-slate-500">
                                Veuillez sélectionner une conversation dans le panneau de gauche pour lancer l'audit détaillé des échanges et des sources juridiques.
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}