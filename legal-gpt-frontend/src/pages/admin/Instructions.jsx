import React, { useState, useEffect } from 'react';
import API from '../../services/api';

export default function Instructions() {
    const [instructions, setInstructions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    
    // فورم لإضافة Instruction جديدة
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');

    useEffect(() => {
        fetchInstructions();
    }, []);

    const fetchInstructions = async () => {
        try {
            // sta3mlna API w mhaqna ghir /admin/instructions (ila kan api.js fih baseURL msaob mzyan)
            const response = await API.get('/admin/instructions');
            setInstructions(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching instructions:", error);
            setLoading(false);
        }
    };

    const handleFieldChange = (id, field, value) => {
        setInstructions(prev =>
            prev.map(item => item.id === id ? { ...item, [field]: value } : item)
        );
    };

    const handleSave = async (item) => {
        try {
            await API.put(`/admin/instructions/${item.id}`, {
                title: item.title,
                content: item.content,
                is_active: item.is_active ? 1 : 0
            });
            setMessage(`تم حفظ التعديلات بنجاح ✅`);
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error("Error saving:", error);
            setMessage('خطأ أثناء الحفظ ❌');
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newTitle || !newContent) return;

        try {
            const response = await API.post('/admin/instructions', {
                title: newTitle,
                content: newContent,
                is_active: 1
            });
            setInstructions([...instructions, response.data.instruction]);
            setNewTitle('');
            setNewContent('');
            setMessage('تم إضافة تعليمة جديدة بنجاح ✅');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error("Error adding:", error);
            setMessage('خطأ أثناء الإضافة ❌');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من الحذف؟')) return;
        try {
            await API.delete(`/admin/instructions/${id}`);
            setInstructions(instructions.filter(item => item.id !== id));
            setMessage('تم الحذف بنجاح 🗑️');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error("Error deleting:", error);
        }
    };

    if (loading) return <div className="p-8 text-white text-center">جاري التحميل...</div>;

    return (
        <div className="p-6 bg-slate-950 text-white min-h-screen" dir="auto">
            <h1 className="text-2xl font-bold mb-6">📋 إدارة التعليمات العامة (AI Instructions)</h1>

            {message && (
                <div className="mb-6 p-4 bg-blue-600 text-white rounded-lg shadow font-medium">
                    {message}
                </div>
            )}

            {/* فورم لإضافة قاعدة جديدة */}
            <form onSubmit={handleAdd} className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-md mb-8">
                <h2 className="text-lg font-bold mb-4 text-indigo-400">➕ إضافة تعليمة سلوكية جديدة</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="text-xs text-slate-400 block mb-1">عنوان القاعدة (Title):</label>
                        <input
                            type="text"
                            placeholder="مثال: Use Moroccan legal sources"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>
                <div className="mb-4">
                    <label className="text-xs text-slate-400 block mb-1">نص التعليمة (Content Rule):</label>
                    <textarea
                        rows="2"
                        placeholder="مثال: Always base your answers strictly on Moroccan law and official gazettes."
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        className="w-full p-3 bg-slate-950 border border-slate-700 rounded text-sm text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                    />
                </div>
                <div className="flex justify-end">
                    <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition shadow">
                        إضافة التعليمة 🚀
                    </button>
                </div>
            </form>

            {/* لائحة التعليمات الموجودة */}
            <div className="space-y-6">
                {instructions.map((item) => (
                    <div key={item.id} className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-md">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                            <div className="w-full md:w-1/2">
                                <label className="text-xs text-slate-400 block mb-1">العنوان:</label>
                                <input
                                    type="text"
                                    value={item.title}
                                    onChange={(e) => handleFieldChange(item.id, 'title', e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded text-white font-semibold focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={Boolean(item.is_active)}
                                        onChange={(e) => handleFieldChange(item.id, 'is_active', e.target.checked ? 1 : 0)}
                                        className="w-4 h-4 text-blue-600 rounded"
                                    />
                                    <span className="text-sm text-slate-300">مفعلة</span>
                                </label>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="text-xs text-slate-400 block mb-1">نص التعليمة:</label>
                            <textarea
                                rows="3"
                                value={item.content}
                                onChange={(e) => handleFieldChange(item.id, 'content', e.target.value)}
                                className="w-full p-3 bg-slate-950 border border-slate-700 rounded text-sm text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => handleDelete(item.id)}
                                className="px-4 py-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg text-sm transition border border-red-600/30"
                            >
                                حذف 🗑️
                            </button>
                            <button
                                onClick={() => handleSave(item)}
                                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition shadow flex items-center gap-2"
                            >
                                حفظ التعديلات 💾
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}