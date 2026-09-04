import { useState, useEffect } from "react";
import API from "../../services/api";
import { X, Edit3, FileCheck, Layers, Link } from "lucide-react";

export default function EditSourceModal({
    open,
    onClose,
    onUpdated,
    source,
}) {
    const [title, setTitle] = useState("");
    const [url, setUrl] = useState("");
    const [type, setType] = useState("pdf");
    const [categoryId, setCategoryId] = useState("");
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    // جلب الفئات عند فتح المودال
    useEffect(() => {
        if (open) {
            API.get("/admin/categories")
                .then((res) => {
                    if (res.data.success) {
                        setCategories(res.data.data);
                    }
                })
                .catch((err) => console.error("Error fetching categories", err));
        }
    }, [open]);

    // تعبئة البيانات القديمة ديال الـ Source فاش يتختار
    useEffect(() => {
        if (source) {
            setTitle(source.title || "");
            setUrl(source.url || "");
            setType(source.type || "pdf");
            setCategoryId(source.category_id || "");
        }
    }, [source]);

    if (!open) return null;

    async function handleUpdate(e) {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem("token");

            await API.put(
                `/admin/sources/${source.id}`,
                {
                    title,
                    url,
                    type,
                    category_id: categoryId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            onUpdated();
            onClose();
        } catch (err) {
            console.error("Error updating source", err);
            alert("Error updating source.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden scale-in-center">
                
                {/* Modal Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-[#EBE9E4]/30">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#3D5A4C]/10 flex items-center justify-center text-[#3D5A4C]">
                            <Edit3 size={20} />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-900">Edit Source</h2>
                            <p className="text-xs text-slate-500">Update legal knowledge document details</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Modal Form */}
                <form onSubmit={handleUpdate} className="p-6 space-y-4">
                    
                    {/* Title Input */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Source Title</label>
                        <div className="relative flex items-center">
                            <span className="absolute left-3.5 text-slate-400">
                                <FileCheck size={16} />
                            </span>
                            <input
                                type="text"
                                className="w-full bg-[#EBE9E4]/30 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#3D5A4C] focus:ring-2 focus:ring-[#3D5A4C]/10 transition"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Category Select */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category</label>
                        <div className="relative flex items-center">
                            <span className="absolute left-3.5 text-slate-400 pointer-events-none">
                                <Layers size={16} />
                            </span>
                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="w-full bg-[#EBE9E4]/30 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-700 focus:outline-none focus:border-[#3D5A4C] focus:ring-2 focus:ring-[#3D5A4C]/10 transition appearance-none"
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* URL Input */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Document URL</label>
                        <div className="relative flex items-center">
                            <span className="absolute left-3.5 text-slate-400">
                                <Link size={16} />
                            </span>
                            <input
                                type="url"
                                className="w-full bg-[#EBE9E4]/30 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#3D5A4C] focus:ring-2 focus:ring-[#3D5A4C]/10 transition"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Type Select */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Source Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full bg-[#EBE9E4]/30 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-700 focus:outline-none focus:border-[#3D5A4C] focus:ring-2 focus:ring-[#3D5A4C]/10 transition appearance-none"
                        >
                            <option value="pdf">PDF Document</option>
                            <option value="website">Website Link</option>
                        </select>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition shadow-sm"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center justify-center gap-2 bg-[#3D5A4C] hover:bg-[#4D6658] text-white px-6 py-2.5 rounded-2xl text-xs font-semibold transition shadow-md shadow-[#3D5A4C]/20 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                "Save Changes"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}