import { useState, useEffect } from "react";
import API from "../../services/api";
import { X, FileText, Link, Layers, FileCheck } from "lucide-react";

export default function AddSourceModal({ open, onClose, onCreated }) {
    const [form, setForm] = useState({
        title: "",
        url: "",
        type: "pdf",
        category_id: "",
    });

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

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

    if (!open) return null;

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        try {
            await API.post("/admin/sources", form);

            setForm({
                title: "",
                url: "",
                type: "pdf",
                category_id: "",
            });

            onCreated();
            onClose();
        } catch (err) {
            console.error("Error saving source", err);
            alert("Error saving source, check console.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden scale-in-center">
                
                {/* Modal Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-[#EBE9E4]/30">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#3D5A4C]/10 flex items-center justify-center text-[#3D5A4C]">
                            <FileText size={20} />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-900">Add New Source</h2>
                            <p className="text-xs text-slate-500">Add a legal knowledge document or website link</p>
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
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    
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
                                placeholder="e.g. Code Civil Marocain"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
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
                                className="w-full bg-[#EBE9E4]/30 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-700 focus:outline-none focus:border-[#3D5A4C] focus:ring-2 focus:ring-[#3D5A4C]/10 transition appearance-none"
                                value={form.category_id}
                                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
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
                                placeholder="https://example.com/document.pdf"
                                value={form.url}
                                onChange={(e) => setForm({ ...form, url: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    {/* Type Select */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Source Type</label>
                        <select
                            className="w-full bg-[#EBE9E4]/30 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-700 focus:outline-none focus:border-[#3D5A4C] focus:ring-2 focus:ring-[#3D5A4C]/10 transition appearance-none"
                            value={form.type}
                            onChange={(e) => setForm({ ...form, type: e.target.value })}
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
                                "Save Source"
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}