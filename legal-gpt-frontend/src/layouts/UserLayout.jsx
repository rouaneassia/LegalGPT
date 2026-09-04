import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate, useParams } from 'react-router-dom';
import { 
    MessageSquarePlus, 
    MessageSquare, 
    FileText, 
    Star, 
    Folder, 
    LogOut,
    PanelLeftClose,
    PanelLeft,
    Plus,
    Search,
    Scale,
    Pin,
    MoreHorizontal,
    ExternalLink,
    Trash2
} from 'lucide-react';
import API from '../services/api';

export default function UserLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [recentChats, setRecentChats] = useState([]);
    const [folders, setFolders] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [showFolderModal, setShowFolderModal] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSidebarDropdown, setActiveSidebarDropdown] = useState(null);
    
    const { chatId } = useParams();
    const navigate = useNavigate();

    const fetchUserData = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const chatsRes = await API.get('/user/chats');
            setRecentChats(chatsRes.data);

            const foldersRes = await API.get('/user/folders');
            setFolders(foldersRes.data);

            const favoritesRes = await API.get('/user/favorites');
            setFavorites(Array.isArray(favoritesRes.data) ? favoritesRes.data : []);
        } catch (error) {
            console.error("Erreur lors du chargement des données:", error);
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
            }
        }
    };

    useEffect(() => {
        fetchUserData();
        
        const handleFavoritesUpdate = () => fetchUserData();
        window.addEventListener('favorites-updated', handleFavoritesUpdate);
        return () => window.removeEventListener('favorites-updated', handleFavoritesUpdate);
    }, [chatId]);

    useEffect(() => {
        const handleClickOutside = () => setActiveSidebarDropdown(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    // Créer un dossier
    const handleCreateFolder = async (e) => {
        e.preventDefault();
        if (!newFolderName.trim()) return;

        try {
            await API.post('/user/folders', { name: newFolderName });
            setNewFolderName('');
            setShowFolderModal(false);
            fetchUserData();
        } catch (error) {
            console.error("Erreur création dossier:", error);
            alert("Erreur lors de la création du dossier.");
        }
    };

    const handleLogout = async () => {
        try {
            await API.post('/logout');
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
        }
    };

    const handleNewChat = () => {
        navigate('/chat');
    };

    const handleRemoveFavorite = async (item, e) => {
        if (e) e.stopPropagation();
        try {
            const payload = item.chat_id ? { chat_id: item.chat_id } : { generated_document_id: item.generated_document_id };
            await API.post('/user/favorites/toggle', payload);
            setFavorites((prev) => prev.filter((fav) => fav.id !== item.id));
            setActiveSidebarDropdown(null);
            window.dispatchEvent(new Event('favorites-updated'));
        } catch (error) {
            console.error('Error removing favorite:', error);
        }
    };

    const handleToggleFavoriteChat = async (cId, e) => {
        if (e) e.stopPropagation();
        try {
            await API.post('/user/favorites/toggle', { chat_id: Number(cId) });
            fetchUserData();
            setActiveSidebarDropdown(null);
            window.dispatchEvent(new Event('favorites-updated'));
        } catch (error) {
            console.error("Erreur favoris:", error);
        }
    };

    const handleDeleteChat = async (cId, e) => {
        if (e) e.stopPropagation();
        if (!window.confirm("Voulez-vous vraiment supprimer cette conversation ?")) return;
        
        try {
            await API.delete(`/user/chats/${cId}`);
            setRecentChats(prev => prev.filter(c => c.id !== Number(cId)));
            setActiveSidebarDropdown(null);
            window.dispatchEvent(new Event('favorites-updated'));
            
            // ila kan l-user mftooh f nfs l-chat li t-supprimat, dyh l /chat
            if (chatId && Number(chatId) === Number(cId)) {
                navigate('/chat');
            }
        } catch (error) {
            console.error("Erreur suppression chat:", error);
            alert("Erreur lors de la suppression de la conversation.");
        }
    };

    const handleOpenItem = (item) => {
        const targetId = item.chat_id || item.chat?.id;
        const isChat = Boolean(targetId);
        
        if (isChat) {
            navigate(`/chat/${targetId}`);
        } else {
            navigate('/documents');
        }
        setActiveSidebarDropdown(null);
    };

    const filteredChats = recentChats.filter(chat => 
        (chat.title || "Conversation sans titre").toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-[#FAFAFA] text-[#18181B] overflow-hidden font-sans" dir="auto">
            <aside className={`${sidebarOpen ? 'w-72' : 'w-0 -ml-72'} transition-all duration-300 ease-in-out bg-[#F4F7F5] border-r border-[#E2E8E4] flex flex-col justify-between z-20 shadow-sm text-[#2C3E35]`}>
                <div className="flex flex-col h-full overflow-hidden">
                    
                    <div className="p-4 border-b border-[#E2E8E4] space-y-3 bg-[#F4F7F5]">
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-[#3D5A4C] flex items-center justify-center shadow-sm text-white">
                                    <Scale size={18} />
                                </div>
                                <span className="font-bold text-base tracking-wide text-[#2C3E35]">
                                    LegalGPT
                                </span>
                            </div>
                        </div>

                        <div className="relative">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71847A]" />
                            <input 
                                type="text"
                                placeholder="Rechercher..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white border border-[#D8E2DC] rounded-xl pl-9 pr-3 py-2 text-xs text-[#2C3E35] placeholder-[#71847A] focus:outline-none focus:border-[#3D5A4C] focus:ring-1 focus:ring-[#3D5A4C]/20 transition shadow-xs"
                            />
                        </div>

                        <button 
                            onClick={handleNewChat}
                            className="w-full flex items-center justify-center gap-2 bg-[#3D5A4C] hover:bg-[#324B3F] text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-xs hover:shadow-md text-xs group"
                        >
                            <MessageSquarePlus size={16} className="group-hover:scale-110 transition-transform" />
                            <span>Nouveau chat</span>
                        </button>
                    </div>

                    <nav className="px-3 py-3 space-y-1 overflow-y-auto flex-1 custom-scrollbar">
                        <NavLink 
                            to="/chat" 
                            className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${isActive && !chatId ? 'bg-[#3D5A4C] text-white font-semibold shadow-xs' : 'hover:bg-[#E8EDE9] text-[#3A4E43]'}`}
                        >
                            <MessageSquare size={16} className={!chatId ? "text-white" : "text-[#5A7366]"} />
                            <span>Chat History</span>
                        </NavLink>
                        
                        <NavLink 
                            to="/documents" 
                            className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${isActive ? 'bg-[#3D5A4C] text-white font-semibold shadow-xs' : 'hover:bg-[#E8EDE9] text-[#3A4E43]'}`}
                        >
                            <FileText size={16} className="text-[#5A7366]" />
                            <span>My Documents</span>
                        </NavLink>

                        {/* SECTION FAVORIS */}
                        <div className="pt-4">
                            <div className="px-3 py-1 text-[#71847A] text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                                <Star size={11} className="text-[#5A7366]" />
                                <span>Favorites</span>
                            </div>
                            <div className="mt-1 space-y-1">
                                {favorites.length === 0 ? (
                                    <p className="text-[11px] text-[#8C9E94] px-3 py-1">Aucun favori</p>
                                ) : (
                                    favorites.map((item) => {
                                        const title = item.chat?.title || item.document?.title || 'Élément favori';
                                        const isDropdownOpen = activeSidebarDropdown === `fav-${item.id}`;

                                        return (
                                            <div
                                                key={item.id}
                                                onClick={() => handleOpenItem(item)}
                                                className="group relative w-full text-left px-3 py-2 rounded-xl cursor-pointer transition-all text-xs flex items-center justify-between hover:bg-[#E8EDE9] text-[#3A4E43]"
                                            >
                                                <div className="flex items-center gap-2.5 truncate flex-1 min-w-0">
                                                    <div className="w-1.5 h-1.5 rounded-full shrink-0 bg-[#71847A]"></div>
                                                    <span className="truncate flex-1">{title}</span>
                                                    <Star size={12} className="text-amber-500 fill-amber-500 shrink-0" />
                                                </div>

                                                <div className="relative shrink-0 ml-1">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveSidebarDropdown(isDropdownOpen ? null : `fav-${item.id}`);
                                                        }}
                                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#D4E2DC] rounded-lg text-[#3A4E43] transition flex items-center justify-center"
                                                    >
                                                        <MoreHorizontal size={14} />
                                                    </button>

                                                    {isDropdownOpen && (
                                                        <div 
                                                            className="absolute right-0 top-full mt-1 w-44 bg-white border border-[#D8E2DC] rounded-xl shadow-xl py-1 z-50 text-xs text-[#2C3E35]"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleOpenItem(item);
                                                                }}
                                                                className="w-full text-left px-3 py-2 hover:bg-gray-50 text-[#3A4E43] flex items-center gap-2 transition"
                                                            >
                                                                <ExternalLink size={13} /> Ouvrir
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => handleRemoveFavorite(item, e)}
                                                                className="w-full text-left px-3 py-2 hover:bg-amber-50 text-amber-700 flex items-center gap-2 transition border-t border-gray-100"
                                                            >
                                                                <Star size={13} /> Retirer des favoris
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* SECTION DOSSIERS */}
                        <div className="pt-4">
                            <div className="flex items-center justify-between px-3 py-1 text-[#71847A] text-[11px] font-bold uppercase tracking-wider">
                                <span>Dossiers</span>
                                <button 
                                    onClick={() => setShowFolderModal(true)} 
                                    className="p-1 hover:bg-[#E8EDE9] rounded-md text-[#3A4E43] transition shadow-xs"
                                    title="Créer un dossier"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                            <div className="mt-1 space-y-0.5">
                                {folders.length === 0 ? (
                                    <p className="text-[11px] text-[#8C9E94] px-3 py-1">Aucun dossier</p>
                                ) : (
                                    folders.map((folder) => (
                                        <button
                                            key={folder.id}
                                            type="button"
                                            onClick={() => navigate(`/folder/${folder.id}`)}
                                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#3A4E43] hover:bg-[#E8EDE9] rounded-lg truncate text-left transition-all group"
                                        >
                                            <Folder size={14} className="text-[#5A7366] group-hover:text-[#3D5A4C] transition-colors" />
                                            <span className="truncate flex-1">{folder.name}</span>
                                            <span className="text-[10px] text-[#3D5A4C] bg-white px-1.5 py-0.5 rounded font-bold border border-[#D8E2DC] shadow-xs">{folder.chats_count || 0}</span>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* SECTION RECENTS (CHATS) */}
                        <div className="pt-4">
                            <div className="px-3 py-1 text-[#71847A] text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                                <Pin size={11} className="text-[#5A7366]" />
                                <span>Récents</span>
                            </div>
                            <div className="mt-1 space-y-1">
                                {filteredChats.length === 0 ? (
                                    <p className="text-[11px] text-[#8C9E94] px-3 py-1">Aucune conversation</p>
                                ) : (
                                    filteredChats.map((chat) => {
                                        const isActive = chatId && Number(chatId) === Number(chat.id);
                                        const isDropdownOpen = activeSidebarDropdown === `chat-${chat.id}`;
                                        const isFavorite = favorites.some(fav => fav.chat_id === chat.id);

                                        return (
                                            <div
                                                key={chat.id}
                                                onClick={() => {
                                                    navigate(`/chat/${chat.id}`);
                                                }}
                                                className={`group relative w-full text-left px-3 py-2 rounded-xl cursor-pointer transition-all text-xs flex items-center justify-between ${
                                                    isActive 
                                                        ? 'bg-[#3D5A4C] text-white font-semibold shadow-xs' 
                                                        : 'hover:bg-[#E8EDE9] text-[#3A4E43]'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2.5 truncate flex-1 min-w-0">
                                                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? 'bg-white' : 'bg-[#71847A]'}`}></div>
                                                    <span className="truncate flex-1">{chat.title || "Conversation sans titre"}</span>
                                                </div>

                                                <div className="relative shrink-0 ml-1">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveSidebarDropdown(isDropdownOpen ? null : `chat-${chat.id}`);
                                                        }}
                                                        className={`opacity-0 group-hover:opacity-100 p-1 rounded-lg transition flex items-center justify-center ${
                                                            isActive ? 'hover:bg-[#324B3F] text-white' : 'hover:bg-[#D4E2DC] text-[#3A4E43]'
                                                        }`}
                                                    >
                                                        <MoreHorizontal size={14} />
                                                    </button>

                                                    {isDropdownOpen && (
                                                        <div 
                                                            className="absolute right-0 top-full mt-1 w-44 bg-white border border-[#D8E2DC] rounded-xl shadow-xl py-1 z-50 text-xs text-[#2C3E35]"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigate(`/chat/${chat.id}`);
                                                                    setActiveSidebarDropdown(null);
                                                                }}
                                                                className="w-full text-left px-3 py-2 hover:bg-gray-50 text-[#3A4E43] flex items-center gap-2 transition"
                                                            >
                                                                <ExternalLink size={13} /> Ouvrir
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => handleToggleFavoriteChat(chat.id, e)}
                                                                className="w-full text-left px-3 py-2 hover:bg-gray-50 text-[#3A4E43] flex items-center gap-2 transition"
                                                            >
                                                                <Star size={13} className={isFavorite ? "text-amber-500 fill-amber-500" : ""} /> 
                                                                {isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => handleDeleteChat(chat.id, e)}
                                                                className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 transition border-t border-gray-100"
                                                            >
                                                                <Trash2 size={13} /> Supprimer
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </nav>

                    <div className="p-3 border-t border-[#E2E8E4] bg-[#F4F7F5]">
                        <button 
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 transition"
                        >
                            <LogOut size={16} />
                            <span>Log out</span>
                        </button>
                    </div>
                </div>
            </aside>

            <main className="flex-1 flex flex-col h-full overflow-hidden bg-white">
                <Outlet />
            </main>

            {/* Modale Dossier */}
            {showFolderModal && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white border border-[#E2E8E4] text-[#18181B] w-full max-w-sm rounded-3xl p-6 relative shadow-xl" dir="ltr">
                        <button onClick={() => setShowFolderModal(false)} className="absolute top-4 right-4 text-[#71717A] hover:text-[#18181B] font-bold">✕</button>
                        <h2 className="text-base font-bold mb-4 text-center text-[#2C3E35]">Créer un nouveau dossier</h2>
                        <form onSubmit={handleCreateFolder} className="space-y-4">
                            <input 
                                type="text"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                placeholder="Nom du dossier..."
                                className="w-full bg-[#F4F4F5] border border-[#E4E4E7] rounded-xl px-4 py-2.5 text-xs text-[#18181B] placeholder-[#71717A] focus:outline-none focus:border-[#3D5A4C] shadow-inner"
                                autoFocus
                            />
                            <button type="submit" className="w-full bg-[#3D5A4C] hover:bg-[#324B3F] py-2.5 rounded-xl font-semibold text-xs transition shadow-sm text-white">
                                Créer
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
