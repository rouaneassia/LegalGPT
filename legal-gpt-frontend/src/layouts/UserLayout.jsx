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
    PanelLeft
} from 'lucide-react';
import API from '../services/api';

export default function UserLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [recentChats, setRecentChats] = useState([]);
    const { chatId } = useParams();
    const navigate = useNavigate();

    const fetchUserChats = async () => {
        try {
            const response = await API.get('/user/chats');
            setRecentChats(response.data);
        } catch (error) {
            console.error("Erreur lors du chargement des chats:", error);
        }
    };

    useEffect(() => {
        fetchUserChats();
    }, [chatId]);

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

    return (
        <div className="flex h-screen bg-slate-950 text-white overflow-hidden" dir="auto">
            {/* Sidebar d l-User */}
            <aside className={`${sidebarOpen ? 'w-72' : 'w-0 -ml-72'} transition-all duration-300 bg-slate-900 border-r border-slate-800 flex flex-col justify-between z-20`}>
                <div className="flex flex-col h-full overflow-y-auto">
                    
                    {/* Header / New Chat Button */}
                    <div className="p-4 border-b border-slate-800">
                        <button 
                            onClick={handleNewChat}
                            className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg font-medium transition shadow justify-center text-sm"
                        >
                            <MessageSquarePlus size={20} />
                            <span>New chat</span>
                        </button>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="p-3 space-y-1">
                        <NavLink 
                            to="/chat" 
                            className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${isActive && !chatId ? 'bg-slate-800 font-semibold' : 'hover:bg-slate-800/50 text-slate-300'}`}
                        >
                            <MessageSquare size={18} />
                            <span>Chat History</span>
                        </NavLink>
                        
                        {/* 🛠️ Fix: Changed from "/user/documents" to "/documents" */}
                        <NavLink 
                            to="/documents" 
                            className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${isActive ? 'bg-slate-800 font-semibold' : 'hover:bg-slate-800/50 text-slate-300'}`}
                        >
                            <FileText size={18} />
                            <span>My Documents</span>
                        </NavLink>

                        <NavLink 
                            to="/user/favorites" 
                            className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${isActive ? 'bg-slate-800 font-semibold' : 'hover:bg-slate-800/50 text-slate-300'}`}
                        >
                            <Star size={18} />
                            <span>Favorites</span>
                        </NavLink>
                        <NavLink 
                            to="/user/folders" 
                            className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${isActive ? 'bg-slate-800 font-semibold' : 'hover:bg-slate-800/50 text-slate-300'}`}
                        >
                            <Folder size={18} />
                            <span>Folders</span>
                        </NavLink>
                    </nav>

                    {/* Recent Chats Section */}
                    <div className="px-4 py-2 flex-1 overflow-y-auto">
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Recent Chats</p>
                        <div className="space-y-1 text-sm text-slate-400">
                            {recentChats.length === 0 ? (
                                <p className="text-xs text-slate-600 px-2 py-1">Aucune conversation récente</p>
                            ) : (
                                recentChats.map((chat) => (
                                    <button
                                        key={chat.id}
                                        onClick={() => navigate(`/chat/${chat.id}`)}
                                        className={`w-full text-left px-3 py-2 rounded-lg cursor-pointer truncate transition text-xs ${
                                            Number(chatId) === chat.id 
                                                ? 'bg-slate-800 text-white font-semibold' 
                                                : 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-200'
                                        }`}
                                    >
                                        {chat.title || "Conversation sans titre"}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* User Profile & Logout */}
                <div className="p-3 border-t border-slate-800 bg-slate-900/50">
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg text-xs transition"
                    >
                        <LogOut size={16} />
                        <span>Log out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full bg-slate-950 relative">
                {/* Toggle Sidebar Button */}
                <div className="absolute top-4 left-4 z-10">
                    <button 
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition bg-slate-900/80 border border-slate-800"
                        title="Toggle Sidebar"
                    >
                        {sidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
                    </button>
                </div>

                {/* Outlet for User Pages */}
                <main className="flex-1 overflow-y-auto pt-16">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}