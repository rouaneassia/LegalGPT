import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminChats() {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedChat, setSelectedChat] = useState(null);

    useEffect(() => {
        fetchAdminChats();
    }, []);

    const fetchAdminChats = async () => {
        try {
            // جلب الـ token من الـ localStorage أو المكان المخصص لديك
            const token = localStorage.getItem('token');
            const response = await axios.get('http://127.0.0.1:8000/api/admin/chats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setChats(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching admin chats:", error);
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-white text-center bg-slate-950 min-h-screen">جاري تحميل لوحة المحادثات...</div>;
    }

    return (
        <div className="p-6 bg-slate-950 text-white min-h-screen" dir="auto">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span>💬</span> مراقبة محادثات المستخدمين (Admin Chat Control)
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. القائمة الجانبية: لائحة المحادثات مرتبطة بالمستخدمين */}
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 h-[75vh] overflow-y-auto space-y-3">
                    <h2 className="text-sm font-semibold text-slate-400 mb-3">جميع المحادثات النشطة</h2>
                    {chats.length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-4">لا توجد محادثات مسجلة حالياً.</p>
                    ) : (
                        chats.map((chat) => (
                            <div
                                key={chat.id}
                                onClick={() => setSelectedChat(chat)}
                                className={`p-3 rounded-lg cursor-pointer transition border ${
                                    selectedChat?.id === chat.id 
                                        ? 'bg-blue-600/20 border-blue-500 text-white' 
                                        : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:bg-slate-800'
                                }`}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-sm text-indigo-400">
                                        👤 {chat.user?.name || 'مستخدم مجهول'}
                                    </span>
                                    <span className="text-[10px] text-slate-500">
                                        {new Date(chat.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 truncate">
                                    {chat.title || 'محادثة قانونية جديدة...'}
                                </p>
                            </div>
                        ))
                    )}
                </div>

                {/* 2. النافذة الرئيسية: عرض الأسئلة، الأجوبة، والمصادر المستعملة للمحادثة المختارة */}
                <div className="lg:col-span-2 bg-slate-900 p-6 rounded-xl border border-slate-800 h-[75vh] flex flex-col">
                    {selectedChat ? (
                        <>
                            {/* معلومات رأس المحادثة والمستخدم */}
                            <div className="border-b border-slate-800 pb-4 mb-4 flex justify-between items-center">
                                <div>
                                    <h2 className="text-lg font-bold text-white">
                                        المستخدم: <span className="text-indigo-400">{selectedChat.user?.name}</span>
                                    </h2>
                                    <p className="text-xs text-slate-400">البريد الإلكتروني: {selectedChat.user?.email}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded border border-slate-700 block mb-1">
                                        تاريخ المحادثة: {new Date(selectedChat.created_at).toLocaleString()}
                                    </span>
                                    <span className="text-[10px] text-slate-500">Chat ID: {selectedChat.id}</span>
                                </div>
                            </div>

                            {/* تفاصيل الرسائل (الأسئلة والأجوبة والمصادر) */}
                            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                                {selectedChat.messages && selectedChat.messages.map((msg, index) => (
                                    <div 
                                        key={index} 
                                        className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                                    >
                                        <div className={`max-w-[85%] p-4 rounded-xl text-sm ${
                                            msg.sender === 'user' 
                                                ? 'bg-blue-600 text-white rounded-br-none shadow-md' 
                                                : 'bg-slate-950 text-slate-200 rounded-bl-none border border-slate-800 shadow-md'
                                        }`}>
                                            <p className="font-bold text-[11px] opacity-70 mb-1 text-indigo-300">
                                                {msg.sender === 'user' ? '❓ Question (السؤال):' : '🤖 Answer (الجواب):'}
                                            </p>
                                            <p className="whitespace-pre-wrap leading-relaxed">{msg.content || msg.message}</p>
                                            
                                            {/* المصادر المستعملة (Sources) */}
                                            {msg.sources && msg.sources.length > 0 && (
                                                <div className="mt-3 pt-3 border-t border-slate-800 text-xs">
                                                    <span className="text-amber-400 font-semibold block mb-1">📁 Sources (المصادر المستعملة):</span>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {msg.sources.map((src, i) => (
                                                            <span key={i} className="bg-slate-900 text-slate-300 px-2.5 py-1 rounded text-[11px] border border-slate-700 font-mono">
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
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-2">
                            <span className="text-4xl">💬</span>
                            <p className="text-sm">المرجو اختيار محادثة من القائمة الجانبية لمراقبة الأسئلة، الأجوبة والمصادر.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}