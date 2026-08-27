import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { FileText, Calendar, Eye, Loader2, Trash2, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function UserDocuments() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDoc, setSelectedDoc] = useState(null); // Modal bach n-chofo l-wathiqa

    useEffect(() => {
        fetchUserDocuments();
    }, []);

    const fetchUserDocuments = async () => {
        try {
            const response = await API.get('/user/documents');
            // كتاخد documents سواء صيفطهم ف array مباشر ولا ف object
            const docsData = response.data.documents || response.data.data || response.data;
            setDocuments(Array.isArray(docsData) ? docsData : []);
        } catch (error) {
            console.error("Error fetching user documents:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("Wakha tsupprimer had document?")) return;
        try {
            await API.delete(`/user/documents/${id}`);
            setDocuments(documents.filter(doc => doc.id !== id));
        } catch (error) {
            console.error("Error deleting document:", error);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto text-white w-full bg-[#06090F]" dir="auto">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between border-b border-slate-800/80 pb-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-100">
                        <FileText className="text-emerald-500" /> Mes Documents Juridiques
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Consultez l'historique de tous vos contrats et documents générés par l'IA.
                    </p>
                </div>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="animate-spin text-emerald-500" size={32} />
                </div>
            ) : documents.length === 0 ? (
                <div className="text-center py-20 bg-[#0E1522] border border-slate-800/80 rounded-2xl shadow-xl">
                    <FileText size={48} className="mx-auto text-slate-600 mb-3" />
                    <h3 className="text-lg font-semibold text-slate-300">Aucun document trouvé</h3>
                    <p className="text-sm text-slate-500 mt-1">Vous n'avez pas encore généré de documents.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {documents.map((doc) => (
                        <div 
                            key={doc.id} 
                            onClick={() => setSelectedDoc(doc)}
                            className="bg-[#0E1522] border border-slate-800/80 hover:border-emerald-600/50 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-lg hover:shadow-emerald-950/20 group"
                        >
                            <div>
                                <div className="flex justify-between items-start mb-3">
                                    <span className="p-2.5 bg-emerald-950/60 border border-emerald-500/20 text-emerald-400 rounded-xl group-hover:scale-110 transition">
                                        <FileText size={20} />
                                    </span>
                                    <button 
                                        onClick={(e) => handleDelete(doc.id, e)}
                                        className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg transition"
                                        title="Supprimer"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <h3 className="font-bold text-slate-100 text-base line-clamp-1 mb-2">
                                    {doc.title || "Document sans titre"}
                                </h3>
                                <div className="text-xs text-slate-400 line-clamp-3 bg-[#06090F]/60 p-3 rounded-xl border border-slate-800/50 mb-4 font-mono">
                                    {doc.content}
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 text-xs text-slate-500">
                                <span className="flex items-center gap-1.5">
                                    <Calendar size={14} /> {new Date(doc.created_at).toLocaleDateString()}
                                </span>
                                <span className="text-emerald-400 font-medium flex items-center gap-1 group-hover:underline">
                                    <Eye size={14} /> Voir
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal لعرض محتوى الوثيقة بالتفصيل */}
            {selectedDoc && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-[#0E1522] border border-slate-800 text-white w-full max-w-4xl max-h-[90vh] rounded-3xl flex flex-col shadow-2xl overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800 bg-[#06090F]">
                            <h2 className="text-lg font-bold text-emerald-400">{selectedDoc.title}</h2>
                            <button 
                                onClick={() => setSelectedDoc(null)} 
                                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto space-y-4 text-slate-200 text-sm leading-relaxed">
                            <ReactMarkdown>{selectedDoc.content}</ReactMarkdown>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-slate-800 bg-[#06090F] flex justify-end">
                            <button 
                                onClick={() => setSelectedDoc(null)} 
                                className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2 rounded-xl text-xs font-semibold transition"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}