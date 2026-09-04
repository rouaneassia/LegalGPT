import { useEffect, useState } from "react";
import API from "../../services/api";
import { Search, Trash2, ChevronLeft, ChevronRight, Layers } from "lucide-react";

export default function Knowledge() {
    const [chunks, setChunks] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 15
    });

    const fetchChunks = async (page = 1) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await API.get(`/admin/knowledge?page=${page}&search=${search}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setChunks(res.data.data || []);
            setPagination({
                current_page: res.data.current_page || 1,
                last_page: res.data.last_page || 1,
                total: res.data.total || 0,
                per_page: res.data.per_page || 15
            });
        } catch (err) {
            console.error("Error fetching knowledge base chunks", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchChunks(1);
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    const handleDelete = async (id) => {
        if (!window.confirm("واش متأكد بغيتي تمحي هاد الـ Chunk؟")) return;
        try {
            const token = localStorage.getItem("token");
            await API.delete(`/admin/knowledge/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setChunks(chunks.filter(chunk => chunk.id !== id));
        } catch (err) {
            console.error("Error deleting chunk", err);
            alert("فشل الحذف");
        }
    };

    return (
        <div className="min-h-screen bg-[#EBE9E4] text-slate-800 p-4 md:p-6 font-sans space-y-6">
            
            {/* Top Bar: Search input on the left/full, Total Chunks aligned to the Right */}
            <div className="p-4 md:p-5 rounded-3xl border border-slate-200/80  backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                
                {/* Search Bar */}
                <div className="relative w-full sm:w-96 flex items-center">
                    <span className="absolute left-3.5 text-[#4D6658] pointer-events-none">
                        <Search size={18} />
                    </span>
                    <input
                        type="text"
                        placeholder="ابحث في نصوص الـ Chunks..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-[#EBE9E4]/40 border border-slate-900 rounded-2xl pl-11 pr-4 py-3 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#3D5A4C] focus:ring-2 focus:ring-[#3D5A4C]/10 transition"
                    />
                </div>

                {/* Total Chunks Badge on the Right */}
                <div className="flex items-center gap-2.5 bg-[#EBE9E4]/60 border border-slate-200/80 px-4 py-2.5 rounded-2xl self-end sm:self-center">
                    <div className="w-7 h-7 rounded-xl bg-[#3D5A4C]/10 flex items-center justify-center text-[#3D5A4C]">
                        <Layers size={16} />
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-800">Total Chunks:</span>
                        <span className="text-xs font-bold text-white bg-[#3D5A4C] px-2.5 py-0.5 rounded-full shadow-sm">
                            {pagination.total}
                        </span>
                    </div>
                </div>

            </div>

            {/* Table Section */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#EBE9E4]/30 border-b border-slate-200 text-[11px] font-bold text-[#3D5A4C] uppercase tracking-wider">
                            <tr>
                                <th className="p-4">ID</th>
                                <th className="p-4">Source Title</th>
                                <th className="p-4 w-1/2">Chunk Content (Excerpt)</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="p-10 text-center text-slate-400 font-medium">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-[#3D5A4C] border-t-transparent rounded-full animate-spin"></div>
                                            جاري التحميل...
                                        </div>
                                    </td>
                                </tr>
                            ) : chunks.length > 0 ? (
                                chunks.map((chunk) => (
                                    <tr key={chunk.id} className="hover:bg-[#EBE9E4]/20 transition">
                                        <td className="p-4 font-mono font-medium text-slate-500">#{chunk.id}</td>
                                        <td className="p-4 font-semibold text-slate-800">
                                            <span className="bg-[#EBE9E4]/70 text-[#3D5A4C] px-2.5 py-1 rounded-xl border border-slate-200/60 inline-block font-medium">
                                                {chunk.source?.title || "N/A"}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-600 max-w-md">
                                            <p className="line-clamp-2 leading-relaxed font-normal">{chunk.content}</p>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleDelete(chunk.id)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl font-semibold transition border border-red-200 shadow-sm"
                                                title="Supprimer"
                                            >
                                                <Trash2 size={14} />
                                                <span>Delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="p-10 text-center text-slate-400">
                                        لا توجد بيانات متاحة حالياً.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Modern Footer */}
                {pagination.last_page > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-[#EBE9E4]/20">
                        <span className="text-xs text-slate-500 font-medium">
                            Page <span className="font-bold text-[#3D5A4C]">{pagination.current_page}</span> sur <span className="font-bold text-slate-800">{pagination.last_page}</span>
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => fetchChunks(pagination.current_page - 1)}
                                disabled={pagination.current_page === 1 || loading}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-[#3D5A4C] disabled:opacity-40 disabled:pointer-events-none transition shadow-sm hover:text-white "
                            >
                                <ChevronLeft size={14} />
                                Précédent
                            </button>

                            <button
                                onClick={() => fetchChunks(pagination.current_page + 1)}
                                disabled={pagination.current_page === pagination.last_page || loading}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-[#3D5A4C] disabled:opacity-40 disabled:pointer-events-none transition shadow-sm  hover:text-white"
                            >
                                Suivant
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}