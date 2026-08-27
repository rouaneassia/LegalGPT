import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function GeneratedDocuments() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDoc, setSelectedDoc] = useState(null);

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

    if (loading) {
        return <div className="p-8 text-white text-center bg-slate-950 min-h-screen">جاري تحميل الوثائق...</div>;
    }

    return (
        <div className="p-6 bg-slate-950 text-white min-h-screen" dir="auto">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span>📄</span> مراقبة الوثائق المولدة (Admin Documents Control)
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. القائمة الجانبية: لائحة الوثائق */}
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 h-[75vh] overflow-y-auto space-y-3">
                    <h2 className="text-sm font-semibold text-slate-400 mb-3">جميع الوثائق والملفات المولدة</h2>
                    {documents.length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-4">لا توجد وثائق مسجلة حالياً.</p>
                    ) : (
                        documents.map((doc) => (
                            <div
                                key={doc.id}
                                onClick={() => setSelectedDoc(doc)}
                                className={`p-3 rounded-lg cursor-pointer transition border ${
                                    selectedDoc?.id === doc.id 
                                        ? 'bg-blue-600/20 border-blue-500 text-white' 
                                        : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:bg-slate-800'
                                }`}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-sm text-blue-400 truncate max-w-[150px]">
                                        📄 {doc.title || doc.name || 'وثيقة قانونية'}
                                    </span>
                                    <span className="text-[10px] text-slate-500">
                                        {new Date(doc.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400">
                                    👤 {doc.user?.name || `User ID: ${doc.user_id}`}
                                </p>
                            </div>
                        ))
                    )}
                </div>

                {/* 2. النافذة الرئيسية: تفاصيل الوثيقة، السؤال، والجواب */}
                <div className="lg:col-span-2 bg-slate-900 p-6 rounded-xl border border-slate-800 h-[75vh] flex flex-col">
                    {selectedDoc ? (
                        <>
                            {/* معلومات الوثيقة والمستخدم */}
                            <div className="border-b border-slate-800 pb-4 mb-4 flex justify-between items-center">
                                <div>
                                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                        <span>📋</span> {selectedDoc.title || selectedDoc.name || 'وثيقة قانونية'}
                                    </h2>
                                    <p className="text-xs text-slate-400 mt-1">
                                        أنشئت بواسطة: <span className="text-indigo-400">{selectedDoc.user?.name || `User ID: ${selectedDoc.user_id}`}</span> ({selectedDoc.user?.email || 'بدون بريد'})
                                    </p>
                                </div>
                                <div className="text-right flex flex-col items-end gap-2">
                                    <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded border border-slate-700">
                                        {new Date(selectedDoc.created_at).toLocaleString()}
                                    </span>
                                    <button 
                                        onClick={() => window.open(`http://127.0.0.1:8000/api/documents/${selectedDoc.id}/download`, '_blank')}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs transition"
                                    >
                                        تحميل الملف الأصلي
                                    </button>
                                </div>
                            </div>

                            {/* محتوى السؤال والجواب والـ Prompt */}
                            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                                
                                {/* السؤال أو الطلب (Prompt / Question) */}
                                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-md">
                                    <p className="font-bold text-[11px] text-indigo-300 mb-1">
                                        ❓ سؤال / طلب المستخدم (User Prompt):
                                    </p>
                                    <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                                        {selectedDoc.prompt || selectedDoc.question || selectedDoc.description || 'لا يوجد وصف أو سؤال مسجل لهذا الطلب.'}
                                    </p>
                                </div>

                                {/* الجواب أو المحتوى المولّد (AI Response / Content) */}
                                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-md">
                                    <p className="font-bold text-[11px] text-emerald-400 mb-1">
                                        🤖 الجواب / محتوى الوثيقة المولدة (AI Response):
                                    </p>
                                    <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                                        {selectedDoc.content || selectedDoc.body || 'لا يوجد محتوى نصي مسجل.'}
                                    </p>
                                </div>

                                {/* المصادر إن وجدت (Sources) */}
                                {selectedDoc.sources && selectedDoc.sources.length > 0 && (
                                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-md text-xs">
                                        <span className="text-amber-400 font-semibold block mb-2">📁 المصادر المعتمدة (Sources):</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {selectedDoc.sources.map((src, i) => (
                                                <span key={i} className="bg-slate-900 text-slate-300 px-2.5 py-1 rounded text-[11px] border border-slate-700 font-mono">
                                                    📄 {src.name || src.title || src}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-2">
                            <span className="text-4xl">📄</span>
                            <p className="text-sm">المرجو اختيار وثيقة من القائمة الجانبية لمشاهدة تفاصيل الطلب، السؤال، والجواب.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}