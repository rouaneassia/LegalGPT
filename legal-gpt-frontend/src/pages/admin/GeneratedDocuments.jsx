import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function GeneratedDocuments() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://127.0.0.1:8000/api/admin/generated-documents', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            const data = response.data;
            if (Array.isArray(data)) {
                setDocuments(data);
            } else if (data && Array.isArray(data.data)) {
                setDocuments(data.data);
            } else {
                setDocuments([]);
            }
        } catch (error) {
            console.error('Error fetching generated documents:', error);
            setDocuments([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredDocuments = documents.filter(doc => 
        (doc.title || doc.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen text-xs font-semibold tracking-wider" style={{ backgroundColor: '#EBE9E4', color: '#3D5A4C' }}>
                <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-xl shadow-sm border border-[#3D5A4C]/10">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#3D5A4C] animate-ping"></span>
                    Chargement des documents générés...
                </div>
            </div>
        );
    }

    return (
        <div className="pt-24 px-6 pb-12 max-w-7xl mx-auto space-y-6 text-sm" style={{ backgroundColor: '#EBE9E4', minHeight: '100vh' }} dir="auto">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between  px-6 py-5 rounded-xl shadow-sm border border-[#3D5A4C]/10 gap-4">
                <div>
                    <h1 className="text-base font-bold text-[#3D5A4C] flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-[#3D5A4C]/10 text-[#3D5A4C]">📁</span> 
                        Suivi & Supervision des Documents Générés
                    </h1>
                   
                
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="bg-[#3D5A4C]/10 px-4 py-2 rounded-lg text-[#3D5A4C] font-semibold text-xs flex items-center gap-2 border border-[#3D5A4C]/20">
                        <span className="w-2 h-2 rounded-full bg-[#3D5A4C] animate-pulse"></span>
                        {documents.length} document(s) enregistré(s)
                    </div>
                </div>
            </div>

            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 1. Sidebar: Documents List */}
                <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-[#3D5A4C]/10 shadow-sm h-[78vh] flex flex-col">
                    <div className="mb-4 space-y-3">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xs font-bold text-[#3D5A4C] tracking-wider uppercase">Registre des fichiers</h2>
                            <span className="text-[10px] font-mono bg-[#EBE9E4] text-[#3D5A4C] px-2 py-0.5 rounded font-semibold">
                                {filteredDocuments.length} résultat(s)
                            </span>
                        </div>
                        <input
                            type="text"
                            placeholder="Rechercher par titre ou utilisateur..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#EBE9E4]/40 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#3D5A4C] transition-all"
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                        {filteredDocuments.length === 0 ? (
                            <div className="text-center py-16 text-slate-400 text-xs">
                                Aucun document ne correspond à votre recherche.
                            </div>
                        ) : (
                            filteredDocuments.map((doc) => (
                                <div
                                    key={doc.id}
                                    onClick={() => setSelectedDoc(doc)}
                                    className={`p-3.5 rounded-xl cursor-pointer transition-all border ${
                                        selectedDoc?.id === doc.id 
                                            ? 'bg-[#3D5A4C]/10 border-[#3D5A4C] text-[#3D5A4C] shadow-sm font-medium' 
                                            : 'bg-white border-slate-100 text-slate-700 hover:bg-[#EBE9E4]/50 hover:border-slate-200'
                                    }`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-xs truncate max-w-[150px]">
                                            📄 {doc.title || doc.name || 'Document légal'}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-mono">
                                            {new Date(doc.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 truncate font-normal">
                                        👤 {doc.user?.name || `ID Utilisateur : ${doc.user_id}`}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* 2. Main Panel: Detailed Document View */}
                <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-[#3D5A4C]/10 shadow-sm h-[78vh] flex flex-col">
                    {selectedDoc ? (
                        <>
                            {/* Document Header Info */}
                            <div className="border-b border-slate-100 pb-4 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div>
                                    <h2 className="text-sm font-bold text-slate-800">
                                        Fichier : <span className="text-[#3D5A4C]">{selectedDoc.title || selectedDoc.name || 'Document légal'}</span>
                                    </h2>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Créé par : <span className="text-[#3D5A4C] font-medium">{selectedDoc.user?.name || `ID : ${selectedDoc.user_id}`}</span> ({selectedDoc.user?.email || 'Courriel non renseigné'})
                                    </p>
                                </div>
                                <div className="text-left sm:text-right flex flex-col sm:items-end gap-2">
                                    <span className="text-xs bg-[#EBE9E4] text-[#3D5A4C] px-3 py-1.5 rounded-lg border border-[#3D5A4C]/20 font-semibold inline-block">
                                        {new Date(selectedDoc.created_at).toLocaleString()}
                                    </span>
                                    <button 
                                        onClick={() => window.open(`http://127.0.0.1:8000/api/documents/${selectedDoc.id}/download`, '_blank')}
                                        className="text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition hover:opacity-90 flex items-center gap-1.5"
                                        style={{ backgroundColor: '#4D6658' }}
                                    >
                                        <span>⬇️</span> Télécharger le fichier original
                                    </button>
                                </div>
                            </div>

                            {/* Prompts, Responses & Sources Flow */}
                            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                                
                                {/* User Prompt Box */}
                                <div className="bg-[#EBE9E4]/30 p-4 rounded-xl border border-[#3D5A4C]/15 shadow-sm space-y-1.5">
                                    <span className="font-bold text-[11px] text-[#3D5A4C] flex items-center gap-1.5 uppercase tracking-wide">
                                        <span>❓</span> Requête / Demande Utilisateur (Prompt) :
                                    </span>
                                    <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed font-normal">
                                        {selectedDoc.prompt || selectedDoc.question || selectedDoc.description || 'Aucun descriptif de requête enregistré pour ce fichier.'}
                                    </p>
                                </div>

                                {/* AI Response Box with background #4D6658 and white text */}
                                <div className="p-4 rounded-xl shadow-sm space-y-1.5" style={{ backgroundColor: '#4D6658', color: '#ffffff' }}>
                                    <span className="font-bold text-[11px] flex items-center gap-1.5 uppercase tracking-wide" style={{ color: '#EBE9E4' }}>
                                        <span>🤖</span> Contenu & Réponse Générés par l'Assistant IA :
                                    </span>
                                    <p className="text-xs whitespace-pre-wrap leading-relaxed font-normal" style={{ color: '#ffffff' }}>
                                        {selectedDoc.content || selectedDoc.body || 'Aucun contenu textuel enregistré.'}
                                    </p>
                                </div>

                                {/* Sources Box */}
                                {selectedDoc.sources && selectedDoc.sources.length > 0 && (
                                    <div className="bg-[#EBE9E4]/50 p-4 rounded-xl border border-[#3D5A4C]/20 shadow-inner text-xs space-y-2">
                                        <span className="text-[#3D5A4C] font-bold block flex items-center gap-1.5 uppercase tracking-wide">
                                            <span>📁</span> Références et sources juridiques mobilisées :
                                        </span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {selectedDoc.sources.map((src, i) => (
                                                <span key={i} className="bg-white text-[#3D5A4C] px-2.5 py-1 rounded-md text-[11px] border border-[#3D5A4C]/20 font-mono font-semibold">
                                                    📄 {src.name || src.title || src}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-3">
                            <div className="w-12 h-12 rounded-full bg-[#EBE9E4] flex items-center justify-center text-[#3D5A4C] text-xl shadow-inner">
                                📂
                            </div>
                            <p className="text-xs text-center max-w-sm font-medium text-slate-500">
                                Veuillez sélectionner un document dans le panneau de gauche pour lancer l'audit détaillé de la requête, du contenu généré et des sources.
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}