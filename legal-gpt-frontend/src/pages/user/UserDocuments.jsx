import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { FileText, Calendar, Eye, Loader2, Trash2, X, Sparkles, Scale } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function UserDocuments() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDoc, setSelectedDoc] = useState(null);

    useEffect(() => {
        fetchUserDocuments();
    }, []);

    const fetchUserDocuments = async () => {
        try {
            const response = await API.get('/user/documents');
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
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) return;
        try {
            await API.delete(`/user/documents/${id}`);
            setDocuments(documents.filter(doc => doc.id !== id));
        } catch (error) {
            console.error("Error deleting document:", error);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto text-[#1E2D25] w-full bg-[#F4F7F5] font-sans selection:bg-[#3D5A4C] selection:text-white custom-chat-scrollbar" dir="auto">
            
            {/* Custom CSS for thin scrollbar */}
            <style>{`
                .custom-chat-scrollbar {
                    overflow-y: scroll;
                    scrollbar-width: thin;
                    scrollbar-color: #3D5A4C #F4F7F5;
                }
                .custom-chat-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .custom-chat-scrollbar::-webkit-scrollbar-track {
                    background: #F4F7F5;
                }
                .custom-chat-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #3D5A4C;
                    border-radius: 9999px;
                }
                .custom-chat-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: #2D4539;
                }
            `}</style>

            {/* Header */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#D4E2DC] pb-6 gap-4">
                <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#3D5A4C] uppercase tracking-wider mb-1">
                        <Sparkles size={14} className="text-[#3D5A4C]" />
                     
                    </div>
                    <h1 className="text-2xl font-bold flex items-center gap-2.5 text-[#1E2D25]">
                        <Scale className="text-[#3D5A4C]" size={26} /> Mes Documents Juridiques
                    </h1>
                    
                </div>
                <div className="bg-[#3D5A4C] border border-[#3D5A4C] px-4 py-2.5 rounded-2xl shadow-sm text-xs font-semibold text-white flex items-center gap-2 self-start sm:self-auto">
                    <span className="w-2 h-2 rounded-full bg-[#A2C4B3] animate-pulse"></span>
                    <span>{documents.length} Document{documents.length > 1 ? 's' : ''} enregistré{documents.length > 1 ? 's' : ''}</span>
                </div>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="flex flex-col justify-center items-center h-64 space-y-3">
                    <Loader2 className="animate-spin text-[#3D5A4C]" size={36} />
                    <p className="text-xs text-[#5A7366] font-medium">Chargement de vos documents...</p>
                </div>
            ) : documents.length === 0 ? (
                <div className="text-center py-24 bg-[#3D5A4C] border border-[#3D5A4C] rounded-3xl shadow-lg max-w-lg mx-auto p-8 text-white">
                    <div className="w-16 h-16 bg-[#2D4539] border border-[#4E7061] rounded-2xl mx-auto flex items-center justify-center mb-4 text-[#A2C4B3] shadow-md">
                        <FileText size={28} />
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">Aucun document trouvé</h3>
                    <p className="text-xs text-[#CBDCD4] leading-relaxed mb-6">Vous n'avez pas encore généré de documents juridiques. Commencez par en créer un via le chat.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {documents.map((doc) => (
                        <div 
                            key={doc.id} 
                            onClick={() => setSelectedDoc(doc)}
                            className="bg-[#3D5A4C] border border-[#4E7061] hover:border-white/50 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-md hover:shadow-xl group"
                        >
                            <div>
                                <div className="flex justify-between items-start mb-3.5">
                                    <span className="p-2.5 bg-[#2D4539] border border-[#4E7061] text-[#A2C4B3] rounded-xl group-hover:scale-105 transition shadow-xs">
                                        <FileText size={18} />
                                    </span>
                                    <button 
                                        onClick={(e) => handleDelete(doc.id, e)}
                                        className="text-[#CBDCD4] hover:text-red-300 p-2 rounded-xl hover:bg-[#2D4539] border border-transparent hover:border-[#4E7061] transition cursor-pointer"
                                        title="Supprimer"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                                <h3 className="font-bold text-white text-sm sm:text-base line-clamp-1 mb-2 group-hover:text-[#A2C4B3] transition">
                                    {doc.title || "Document sans titre"}
                                </h3>
                                <div className="text-xs text-[#CBDCD4] line-clamp-3 bg-[#2D4539] p-3 rounded-xl border border-[#4E7061]/60 mb-4 font-mono leading-relaxed">
                                    {doc.content}
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between pt-3.5 border-t border-[#4E7061]/60 text-[11px] text-[#CBDCD4]">
                                <span className="flex items-center gap-1.5 font-medium">
                                    <Calendar size={13} className="text-[#A2C4B3]" /> {new Date(doc.created_at).toLocaleDateString()}
                                </span>
                                <span className="text-white bg-[#2D4539] border border-[#4E7061] px-3 py-1 rounded-lg font-semibold flex items-center gap-1 group-hover:bg-white group-hover:text-[#3D5A4C] transition shadow-xs">
                                    <Eye size={13} /> Consulter
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal لعرض محتوى الوثيقة بالتفصيل */}
            {selectedDoc && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-[#3D5A4C] border border-[#4E7061] text-white w-full max-w-4xl max-h-[90vh] rounded-3xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        
                        {/* Modal Header */}
                        <div className="flex justify-between items-center px-6 py-4 border-b border-[#4E7061] bg-[#2D4539]">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-[#3D5A4C] border border-[#4E7061] flex items-center justify-center text-[#A2C4B3] shadow-xs">
                                    <FileText size={16} />
                                </div>
                                <h2 className="text-sm sm:text-base font-bold text-white">{selectedDoc.title}</h2>
                            </div>
                            <button 
                                onClick={() => setSelectedDoc(null)} 
                                className="text-[#CBDCD4] hover:text-white p-2 rounded-xl hover:bg-[#3D5A4C] border border-transparent hover:border-[#4E7061] transition cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        
                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto space-y-4 text-[#F3F7F5] text-xs sm:text-sm leading-relaxed custom-chat-scrollbar">
                            <ReactMarkdown
                                components={{
                                    h1: ({node, ...props}) => <h1 className="text-base font-bold text-white mt-4 mb-2 border-b border-[#4E7061] pb-1" {...props} />,
                                    h2: ({node, ...props}) => <h2 className="text-sm font-bold text-white mt-3 mb-2" {...props} />,
                                    h3: ({node, ...props}) => <h3 className="text-xs font-bold text-[#A2C4B3] mt-3 mb-1" {...props} />,
                                    ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1.5 my-2 text-[#F3F7F5]" {...props} />,
                                    ol: ({node, ...props}) => <ol className="list-decimal pl-5 space-y-1.5 my-2 text-[#F3F7F5]" {...props} />,
                                    li: ({node, ...props}) => <li className="text-[#F3F7F5] leading-relaxed" {...props} />,
                                    p: ({node, ...props}) => <p className="text-[#F3F7F5] mb-2.5 leading-relaxed" {...props} />,
                                    strong: ({node, ...props}) => <strong className="font-bold text-white underline decoration-[#A2C4B3] underline-offset-2" {...props} />,
                                    hr: ({node, ...props}) => <hr className="border-[#4E7061] my-3" {...props} />
                                }}
                            >
                                {selectedDoc.content}
                            </ReactMarkdown>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-[#4E7061] bg-[#2D4539] flex justify-end">
                            <button 
                                onClick={() => setSelectedDoc(null)} 
                                className="bg-white hover:bg-[#EAF2ED] text-[#3D5A4C] px-5 py-2 rounded-xl text-xs font-semibold transition shadow-md border border-[#4E7061] cursor-pointer"
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