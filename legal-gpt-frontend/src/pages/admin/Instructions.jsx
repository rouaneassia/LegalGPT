import React, { useState, useEffect } from 'react';
import API from '../../services/api';

export default function Instructions() {
    const [instructions, setInstructions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');

    useEffect(() => {
        fetchInstructions();
    }, []);

    const fetchInstructions = async () => {
        try {
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
            setMessage(`Modifications enregistrées avec succès ✅`);
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error("Error saving:", error);
            setMessage('Erreur lors de l’enregistrement ❌');
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
            setMessage('Nouvelle instruction ajoutée avec succès ✅');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error("Error adding:", error);
            setMessage('Erreur lors de l’ajout ❌');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette instruction ?')) return;
        try {
            await API.delete(`/admin/instructions/${id}`);
            setInstructions(instructions.filter(item => item.id !== id));
            setMessage('Suppression réussie 🗑️');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error("Error deleting:", error);
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
                    <h1 className="text-base font-bold text-[#3D5A4C]">Gestion des Instructions Générales (AI Instructions)</h1>
                    <p className="text-xs text-slate-400 mt-0.5">Contrôle des directives comportementales de l'intelligence artificielle</p>
                </div>
                <div className="bg-[#3D5A4C]/10 px-3.5 py-1.5 rounded-lg text-[#3D5A4C] font-semibold text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#3D5A4C] animate-pulse"></span>
                    {instructions.length} instruction(s)
                </div>
            </div>

            {/* Notification Message */}
            {message && (
                <div className="p-4 rounded-xl shadow-sm font-semibold text-xs text-white flex items-center gap-2" style={{ backgroundColor: '#3D5A4C' }}>
                    <span>{message}</span>
                </div>
            )}

            {/* Add Instruction Form */}
            <form onSubmit={handleAdd} className="bg-white p-6 rounded-xl border border-[#3D5A4C]/10 shadow-sm space-y-4">
                <h2 className="text-xs font-bold text-slate-800 pb-2 border-b border-slate-100 uppercase tracking-wider">Ajouter une nouvelle directive</h2>
                
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Titre de la règle (Title)</label>
                        <input
                            type="text"
                            placeholder="Ex: Use Moroccan legal sources"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#3D5A4C]"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Texte de l'instruction (Content Rule)</label>
                        <textarea
                            rows={2.5}
                            placeholder="Ex: Always base your answers strictly on Moroccan law and official gazettes."
                            value={newContent}
                            onChange={(e) => setNewContent(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-[#3D5A4C] resize-none"
                        />
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="px-5 py-2 text-white rounded-lg font-semibold shadow-sm hover:opacity-95 transition-all text-xs"
                        style={{ backgroundColor: '#3D5A4C' }}
                    >
                        Ajouter l'instruction 🚀
                    </button>
                </div>
            </form>

            {/* Instructions List */}
            <div className="space-y-4">
                {instructions.map((item) => (
                    <div key={item.id} className="bg-white p-6 rounded-xl border border-[#3D5A4C]/10 shadow-sm space-y-4 transition-all hover:shadow-md">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="w-full md:w-3/4">
                                <label className="block text-xs font-bold text-slate-700 mb-1">Titre</label>
                                <input
                                    type="text"
                                    value={item.title}
                                    onChange={(e) => handleFieldChange(item.id, 'title', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#3D5A4C]"
                                />
                            </div>
                            <div className="flex items-center gap-2 pt-2 md:pt-0">
                                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                                    <input
                                        type="checkbox"
                                        checked={Boolean(item.is_active)}
                                        onChange={(e) => handleFieldChange(item.id, 'is_active', e.target.checked ? 1 : 0)}
                                        className="w-4 h-4 rounded text-[#3D5A4C] focus:ring-[#3D5A4C]"
                                    />
                                    <span className="text-xs font-semibold text-slate-700">Activée</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Texte de l'instruction</label>
                            <textarea
                                rows={3}
                                value={item.content}
                                onChange={(e) => handleFieldChange(item.id, 'content', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-800 font-mono focus:outline-none focus:border-[#3D5A4C] resize-none"
                            />
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                            <button
                                onClick={() => handleDelete(item.id)}
                                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-semibold transition-all border border-rose-200"
                            >
                                Supprimer 🗑️
                            </button>
                            <button
                                onClick={() => handleSave(item)}
                                className="px-5 py-2 text-white rounded-lg text-xs font-semibold shadow-sm hover:opacity-90 transition-all"
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