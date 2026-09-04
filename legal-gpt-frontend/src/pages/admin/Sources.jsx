import { useEffect, useState } from "react";
import API from "../../services/api";
import { ExternalLink, FileText, Plus, Edit2, Trash2, RefreshCw, Layers } from "lucide-react";
import AddSourceModal from "../../components/sources/AddSourceModal";
import EditSourceModal from "../../components/sources/EditSourceModal";

export default function Sources() {
    const [sources, setSources] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [selectedSource, setSelectedSource] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSources();
    }, []);

    async function fetchSources() {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await API.get("/admin/sources", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const dataArray = Array.isArray(res.data) ? res.data : (res.data.data || []);
            setSources(dataArray);
        } catch (err) {
            console.error("Error fetching sources:", err);
            setSources([]);
        } finally {
            setLoading(false);
        }
    }

    async function deleteSource(id) {
        if (!window.confirm("Are you sure you want to delete this source?")) return;
        try {
            const token = localStorage.getItem("token");
            await API.delete(`/admin/sources/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchSources();
        } catch (err) {
            console.error("Error deleting source:", err);
            alert("Failed to delete source.");
        }
    }

    async function syncSource(id) {
        try {
            const token = localStorage.getItem("token");
            await API.post(`/admin/sources/${id}/sync`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert("Synchronization completed successfully!");
            fetchSources();
        } catch (err) {
            console.error(err);
            if (err.response) {
                alert(err.response.data.message || JSON.stringify(err.response.data));
            } else {
                alert(err.message);
            }
        }
    }

    const totalSources = sources.length;

    return (
        <div className="min-h-screen bg-[#EBE9E4] text-slate-800 p-4 md:p-6 font-sans space-y-6">
            
            {/* Top Bar: Title & Stats Badge + Add Button */}
            <div className=" p-4 md:p-5 rounded-4xl border border-slate-200/80 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
                    <div>
                       
                    </div>

                    {/* Total Badge */}
                    <div className="hidden md:flex items-center gap-2 bg-[#EBE9E4]/60 border border-slate-200/80 px-3.5 py-2 rounded-2xl">
                        <div className="w-6 h-6 rounded-xl bg-[#3D5A4C]/10 flex items-center justify-center text-[#3D5A4C]">
                            <Layers size={14} />
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-slate-600">Total:</span>
                            <span className="text-xs font-bold text-white bg-[#3D5A4C] px-2 py-0.5 rounded-full shadow-sm">
                                {totalSources}
                            </span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => setOpenModal(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#3D5A4C] hover:bg-[#4D6658] text-white px-5 py-2.5 rounded-2xl text-xs font-semibold transition shadow-md shadow-[#3D5A4C]/20"
                >
                    <Plus size={16} />
                    <span>Add Source</span>
                </button>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#EBE9E4]/30 border-b border-slate-200 text-[11px] font-bold text-[#3D5A4C] uppercase tracking-wider">
                            <tr>
                                <th className="p-4">Title</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Type</th>
                                <th className="p-4">URL</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-10 text-center text-slate-400 font-medium">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-[#3D5A4C] border-t-transparent rounded-full animate-spin"></div>
                                            جاري التحميل...
                                        </div>
                                    </td>
                                </tr>
                            ) : sources.length > 0 ? (
                                sources.map((source) => (
                                    <tr key={source.id} className="hover:bg-[#EBE9E4]/20 transition">
                                        <td className="p-4 flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-2xl bg-[#3D5A4C]/10 flex items-center justify-center text-[#3D5A4C] shrink-0">
                                                <FileText size={18} />
                                            </div>
                                            <span className="font-semibold text-slate-800 line-clamp-1">
                                                {source.title}
                                            </span>
                                        </td>

                                        <td className="p-4">
                                            <span className="bg-[#EBE9E4]/70 text-[#3D5A4C] px-3 py-1 rounded-xl border border-slate-200/60 inline-block font-medium">
                                                {source.category ? source.category.name : "Uncategorized"}
                                            </span>
                                        </td>

                                        <td className="p-4">
                                            <span className="bg-amber-50 text-amber-700 border border-amber-200/60 px-3 py-1 rounded-xl font-semibold inline-block">
                                                {source.type ? source.type.toUpperCase() : "N/A"}
                                            </span>
                                        </td>

                                        <td className="p-4">
                                            <a
                                                href={source.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1.5 text-[#3D5A4C] hover:text-[#4D6658] font-semibold transition"
                                            >
                                                <span>Open Document</span>
                                                <ExternalLink size={14} />
                                            </a>
                                        </td>
                                        
                                        <td className="p-4 text-right">
                                            <div className="inline-flex items-center gap-1.5">
                                                <button
                                                    onClick={() => {
                                                        setSelectedSource(source);
                                                        setOpenEditModal(true);
                                                    }}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-xl font-semibold transition border border-slate-200 shadow-sm"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={13} className="text-slate-500" />
                                                    <span>Edit</span>
                                                </button>

                                                <button
                                                    onClick={() => syncSource(source.id)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-xl font-semibold transition border border-emerald-200 shadow-sm"
                                                    title="Sync"
                                                >
                                                    <RefreshCw size={13} />
                                                    <span>Sync</span>
                                                </button>

                                                <button
                                                    onClick={() => deleteSource(source.id)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl font-semibold transition border border-red-200 shadow-sm"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={13} />
                                                    <span>Delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-10 text-center text-slate-400">
                                        No sources found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddSourceModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                onCreated={fetchSources}
            />
            
            <EditSourceModal
                open={openEditModal}
                onClose={() => setOpenEditModal(false)}
                onUpdated={fetchSources}
                source={selectedSource}
            />
        </div>
    );
}