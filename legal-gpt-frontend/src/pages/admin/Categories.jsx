import { useState, useEffect } from "react";
import API from "../../services/api";
import { 
    Layers, 
    Plus, 
    Edit2, 
    Trash2, 
    FileText, 
    AlertCircle, 
    X, 
    CheckCircle2, 
    Loader2,
    FolderKanban
} from "lucide-react";

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await API.get("/admin/categories");
            if (response.data.success) {
                setCategories(response.data.data);
            }
        } catch (err) {
            setError("Failed to fetch categories");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        
        try {
            if (editingId) {
                await API.put(`/admin/categories/${editingId}`, { name, description });
                setSuccessMessage("Category updated successfully!");
            } else {
                await API.post("/admin/categories", { name, description });
                setSuccessMessage("Category created successfully!");
            }
            
            setName("");
            setDescription("");
            setEditingId(null);
            fetchCategories();

            setTimeout(() => setSuccessMessage(""), 4000);
        } catch (err) {
            setError(err.response?.data?.message || "Error saving category");
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (category) => {
        setEditingId(category.id);
        setName(category.name);
        setDescription(category.description || "");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this category?")) {
            try {
                await API.delete(`/admin/categories/${id}`);
                fetchCategories();
                setSuccessMessage("Category deleted successfully!");
                setTimeout(() => setSuccessMessage(""), 4000);
            } catch (err) {
                setError("Failed to delete category");
            }
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
            
            {/* Page Header */}
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-white via-white to-[#3D5A4C]/5 p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#3D5A4C]/5 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3D5A4C] to-[#4D6658] flex items-center justify-center text-white shadow-lg shadow-[#3D5A4C]/20 shrink-0">
                        <FolderKanban size={28} className="animate-pulse" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-[#3D5A4C] bg-[#3D5A4C]/10 px-2.5 py-0.5 rounded-full">
                                Administration
                            </span>
                        </div>
                     
                    </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center relative z-10 bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-semibold text-slate-700">
                        {categories.length} {categories.length === 1 ? 'Category' : 'Categories'} Active
                    </span>
                </div>
            </div>

            {/* Notifications */}
            {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-700 px-5 py-4 rounded-2xl text-xs shadow-sm">
                    <AlertCircle size={18} className="shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {successMessage && (
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 text-emerald-700 px-5 py-4 rounded-2xl text-xs shadow-sm">
                    <CheckCircle2 size={18} className="shrink-0" />
                    <span>{successMessage}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Form Section */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm sticky top-6">
                        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
                            <h2 className="text-sm font-bold text-slate-900">
                                {editingId ? "Edit Category" : "Add New Category"}
                            </h2>
                            {editingId && (
                                <button 
                                    onClick={() => { setEditingId(null); setName(""); setDescription(""); }}
                                    className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 transition"
                                >
                                    <X size={14} /> Cancel edit
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category Name</label>
                                <div className="relative flex items-center">
                                    <span className="absolute left-3.5 text-slate-400">
                                        <Layers size={16} />
                                    </span>
                                    <input 
                                        type="text" 
                                        value={name} 
                                        onChange={(e) => setName(e.target.value)} 
                                        className="w-full bg-[#EBE9E4]/30 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#3D5A4C] focus:ring-2 focus:ring-[#3D5A4C]/10 transition" 
                                        placeholder="e.g. Droit Civil"
                                        required 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description</label>
                                <textarea 
                                    value={description} 
                                    onChange={(e) => setDescription(e.target.value)} 
                                    rows="3"
                                    className="w-full bg-[#EBE9E4]/30 border border-slate-200 rounded-2xl p-4 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#3D5A4C] focus:ring-2 focus:ring-[#3D5A4C]/10 transition resize-none"
                                    placeholder="Brief description about this category..."
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={submitting}
                                className="w-full inline-flex items-center justify-center gap-2 bg-[#3D5A4C] hover:bg-[#4D6658] text-white py-3 rounded-2xl text-xs font-semibold transition shadow-md shadow-[#3D5A4C]/20 disabled:opacity-50"
                            >
                                {submitting ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : editingId ? (
                                    <>Update Category</>
                                ) : (
                                    <><Plus size={16} /> Add Category</>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Categories Table Section */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#EBE9E4]/30 border-b border-slate-100 text-xs text-slate-500 uppercase tracking-wider">
                                        <th className="p-4 font-semibold">Name</th>
                                        <th className="p-4 font-semibold">Slug</th>
                                        <th className="p-4 font-semibold text-center">Sources</th>
                                        <th className="p-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="4" className="p-8 text-center text-slate-400">
                                                <div className="inline-flex items-center gap-2">
                                                    <Loader2 size={18} className="animate-spin text-[#3D5A4C]" />
                                                    Loading categories...
                                                </div>
                                            </td>
                                        </tr>
                                    ) : categories.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="p-8 text-center text-slate-400">
                                                No categories found.
                                            </td>
                                        </tr>
                                    ) : (
                                        categories.map((cat) => (
                                            <tr key={cat.id} className="hover:bg-slate-50/50 transition">
                                                <td className="p-4 font-semibold text-slate-800">
                                                    <div>{cat.name}</div>
                                                    {cat.description && (
                                                        <div className="text-[11px] text-slate-400 font-normal truncate max-w-xs mt-0.5">
                                                            {cat.description}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-4 text-slate-500 font-mono text-[11px]">
                                                    {cat.slug}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#3D5A4C]/10 text-[#3D5A4C] font-semibold text-[11px]">
                                                        <FileText size={12} />
                                                        {cat.sources_count || 0}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right space-x-1.5">
                                                    <button 
                                                        onClick={() => handleEdit(cat)} 
                                                        className="w-8 h-8 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-600 inline-flex items-center justify-center transition shadow-sm"
                                                        title="Edit Category"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(cat.id)} 
                                                        className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 inline-flex items-center justify-center transition shadow-sm"
                                                        title="Delete Category"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}