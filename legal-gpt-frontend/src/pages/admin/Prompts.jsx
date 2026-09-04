import React, { useState, useEffect } from 'react';
import API from '../../services/api';

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

    const handleFieldChange = (id, field, value) => {
        setPrompts(prevPrompts =>
            prevPrompts.map(item =>
                item.id === id ? { ...item, [field]: value } : item
            )
        );
    };

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
            setMessage(`Modifications enregistrées avec succès pour le prompt : ${prompt.key} ✅`);
            
            setTimeout(() => {
                setMessage('');
            }, 4000);
        } catch (error) {
            console.error("Error saving prompt:", error);
            setMessage('Erreur lors de l’enregistrement des modifications ❌');
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen text-xs font-semibold" style={{ backgroundColor: '#EBE9E4', color: '#3D5A4C' }}>
            Chargement en cours...
        </div>
    );

    return (
        <div className="pt-24 px-6 pb-12 max-w-5xl mx-auto space-y-6 text-sm" style={{ backgroundColor: '#EBE9E4', minHeight: '100vh' }}>
            
            {/* Header Section */}
            <div className="flex items-center justify-between  px-6 py-5 rounded-xl shadow-sm border border-[#3D5A4C]/10">
                <div>
                    <h1 className="text-base font-bold text-[#3D5A4C]">Gestion et Configuration des Prompts</h1>
                    <p className="text-xs text-slate-400 mt-0.5">Paramétrez les instructions système et les comportements de l'IA</p>
                </div>
                <div className="bg-[#3D5A4C]/10 px-3.5 py-1.5 rounded-lg text-[#3D5A4C] font-semibold text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#3D5A4C] animate-pulse"></span>
                    {prompts.length} prompt(s)
                </div>
            </div>

            {/* Notification Message */}
            {message && (
                <div className="p-4 rounded-xl shadow-sm font-semibold text-xs text-white flex items-center gap-2" style={{ backgroundColor: '#3D5A4C' }}>
                    <span>{message}</span>
                </div>
            )}
            
            {/* Prompts List */}
            <div className="space-y-4">
                {prompts.map((item) => (
                    <div key={item.id} className="bg-white p-6 rounded-xl border border-[#3D5A4C]/10 shadow-sm space-y-4 transition-all hover:shadow-md">
                        
                        {/* Title and Status Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="w-full md:w-3/4">
                                <label className="block text-xs font-bold text-slate-700 mb-1">Titre (Title)</label>
                                <input
                                    type="text"
                                    value={item.title}
                                    onChange={(e) => handleFieldChange(item.id, 'title', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#3D5A4C]"
                                />
                            </div>
                            <div className="flex items-center gap-3 pt-2 md:pt-0">
                                <span className="bg-[#EBE9E4] text-[#3D5A4C] text-xs px-3 py-1.5 rounded-lg border border-[#3D5A4C]/20 font-mono">
                                    {item.key}
                                </span>
                                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                                    <input
                                        type="checkbox"
                                        checked={Boolean(item.is_active)}
                                        onChange={(e) => handleFieldChange(item.id, 'is_active', e.target.checked ? 1 : 0)}
                                        className="w-4 h-4 rounded text-[#3D5A4C] focus:ring-[#3D5A4C]"
                                    />
                                    <span className="text-xs font-semibold text-slate-700">Activé</span>
                                </label>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                            <input
                                type="text"
                                value={item.description || ''}
                                onChange={(e) => handleFieldChange(item.id, 'description', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#3D5A4C]"
                            />
                        </div>

                        {/* System Prompt */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">System Prompt</label>
                            <textarea
                                rows={4}
                                value={item.system_prompt}
                                onChange={(e) => handleFieldChange(item.id, 'system_prompt', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-800 font-mono focus:outline-none focus:border-[#3D5A4C] resize-none"
                            />
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end pt-2 border-t border-slate-100">
                            <button
                                onClick={() => handleSave(item)}
                                className="px-5 py-2 text-white rounded-lg text-xs font-semibold shadow-sm hover:opacity-90 transition-all flex items-center gap-2"
                                style={{ backgroundColor: '#4D6658' }}
                            >
                                Enregistrer 💾
                            </button>
                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
}