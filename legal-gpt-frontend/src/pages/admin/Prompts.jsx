import React, { useState, useEffect } from 'react';
import API from '../../services/api'; // ⬅️ Koun m-t2akkad mn l-chemin dyal fichier api dyalk (e.g. '../api' wla './api')

export default function Prompts() {
    const [prompts, setPrompts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchPrompts();
    }, []);

    const fetchPrompts = async () => {
        try {
            const response = await API.get('/admin/prompts');
            setPrompts(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            setLoading(false);
        }
    };

    // دالة لتحديث القيمة محلياً في الـ State ملي كيتبدل شي input
    const handleFieldChange = (id, field, value) => {
        setPrompts(prevPrompts =>
            prevPrompts.map(item =>
                item.id === id ? { ...item, [field]: value } : item
            )
        );
    };

    // دالة الحفظ وإرسال الطلب PUT للسيرفر
    const handleSave = async (prompt) => {
        try {
            setMessage('');
            const response = await API.put(`/admin/prompts/${prompt.id}`, {
                title: prompt.title,
                description: prompt.description,
                system_prompt: prompt.system_prompt,
                is_active: prompt.is_active ? 1 : 0
            });

            console.log("Saved successfully:", response.data);
            setMessage(`تم حفظ التعديلات بنجاح للـ Prompt: ${prompt.key} ✅`);
            
            setTimeout(() => {
                setMessage('');
            }, 4000);
        } catch (error) {
            console.error("Error saving prompt:", error);
            setMessage('خطأ أثناء حفظ التعديلات ❌');
        }
    };

    if (loading) return <div className="p-8 text-white text-center">جاري التحميل...</div>;

    return (
        <div className="p-6 bg-slate-950 text-white min-h-screen" dir="auto">
            <h1 className="text-2xl font-bold mb-6">⚙️ إدارة وتعديل الـ Prompts</h1>

            {/* رسالة النجاح أو الخطأ */}
            {message && (
                <div className="mb-6 p-4 bg-blue-600 text-white rounded-lg shadow-md font-medium">
                    {message}
                </div>
            )}
            
            <div className="space-y-6">
                {prompts.map((item) => (
                    <div key={item.id} className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-md">
                        
                        {/* العنوان والرمايز */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                            <div className="w-full md:w-1/2">
                                <label className="text-xs text-slate-400 block mb-1">العنوان (Title):</label>
                                <input
                                    type="text"
                                    value={item.title}
                                    onChange={(e) => handleFieldChange(item.id, 'title', e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded text-white font-semibold focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded border border-slate-700 font-mono">
                                    {item.key}
                                </span>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={Boolean(item.is_active)}
                                        onChange={(e) => handleFieldChange(item.id, 'is_active', e.target.checked ? 1 : 0)}
                                        className="w-4 h-4 text-blue-600 rounded"
                                    />
                                    <span className="text-sm text-slate-300">مفعل</span>
                                </label>
                            </div>
                        </div>

                        {/* الوصف */}
                        <div className="mb-4">
                            <label className="text-xs text-slate-400 block mb-1">الوصف (Description):</label>
                            <input
                                type="text"
                                value={item.description || ''}
                                onChange={(e) => handleFieldChange(item.id, 'description', e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded text-sm text-slate-300 focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        {/* الـ System Prompt */}
                        <div className="mb-4">
                            <label className="text-xs text-slate-400 block mb-1">System Prompt:</label>
                            <textarea
                                rows="4"
                                value={item.system_prompt}
                                onChange={(e) => handleFieldChange(item.id, 'system_prompt', e.target.value)}
                                className="w-full p-3 bg-slate-950 border border-slate-700 rounded text-sm text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        {/* زر الحفظ */}
                        <div className="flex justify-end">
                            <button
                                onClick={() => handleSave(item)}
                                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition shadow-lg flex items-center gap-2"
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