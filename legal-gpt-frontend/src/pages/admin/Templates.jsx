import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

export default function Templates() {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    // جلب القوالب
    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await API.get("/admin/templates", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTemplates(res.data);
        } catch (err) {
            console.error("Error fetching templates", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    // إضافة قالب جديد
    const handleCreateTemplate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            await API.post("/admin/templates", { title, description }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTitle("");
            setDescription("");
            fetchTemplates();
        } catch (err) {
            console.error("Error creating template", err);
            alert("فشل إنشاء القالب");
        }
    };

    // حذف قالب
    const handleDelete = async (id) => {
        if (!window.confirm("واش متأكد بغيتي تمحي هاد القالب؟")) return;
        try {
            const token = localStorage.getItem("token");
            await API.delete(`/admin/templates/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTemplates(templates.filter(t => t.id !== id));
        } catch (err) {
            console.error("Error deleting template", err);
            alert("فشل الحذف");
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 min-h-screen" style={{ backgroundColor: '#EBE9E4' }}>
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl shadow-sm border border-[#3D5A4C]/10">
                <div>
                    <h1 className="text-xl font-bold text-[#3D5A4C] tracking-tight">إدارة قوالب الوثائق القانونية</h1>
                    <p className="text-sm text-slate-500 mt-1">إنشاء وتنسيق الهياكل القانونية والأقسام التابعة لها بسهولة واحترافية</p>
                </div>
                <div className="flex items-center gap-2 bg-[#3D5A4C]/10 px-4 py-2 rounded-xl text-[#3D5A4C] text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-[#3D5A4C] animate-pulse"></span>
                    {templates.length} قوالب متوفرة حالياً
                </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Form Section */}
                <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-[#3D5A4C]/10 h-fit">
                    <div className="border-b border-slate-100 pb-4 mb-5">
                        <h2 className="text-base font-bold text-slate-800">إضافة قالب جديد</h2>
                        <p className="text-xs text-slate-400 mt-0.5">أدخل تفاصيل القالب القانوني الجديد</p>
                    </div>

                    <form onSubmit={handleCreateTemplate} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">عنوان القالب</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3D5A4C]/20 focus:border-[#3D5A4C] transition-all"
                                placeholder="مثال: عقد نزاع دستوري..."
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">الوصف المختصر</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3D5A4C]/20 focus:border-[#3D5A4C] transition-all resize-none"
                                placeholder="وصف موجز يوضح الغرض من القالب..."
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-3 text-white rounded-xl text-sm font-semibold shadow-md transition-all flex items-center justify-center gap-2 hover:opacity-95"
                            style={{ backgroundColor: '#3D5A4C' }}
                        >
                            حفظ القالب الجديد
                        </button>
                    </form>
                </div>

                {/* Table Section */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-[#3D5A4C]/10 overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">قائمة القوالب القانونية</h3>
                        <span className="text-xs text-slate-400">إجمالي السجلات: {templates.length}</span>
                    </div>

                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b text-xs uppercase tracking-wider text-slate-600 bg-slate-50 font-semibold">
                                    <th className="p-4">ID</th>
                                    <th className="p-4">Title</th>
                                    <th className="p-4">Description</th>
                                    <th className="p-4">Sections Count</th>
                                    <th className="p-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-slate-400">جاري التحميل...</td>
                                    </tr>
                                ) : templates.length > 0 ? (
                                    templates.map((template) => (
                                        <tr key={template.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="p-4 font-mono text-xs text-slate-500">#{template.id}</td>
                                            <td className="p-4 font-semibold text-slate-900">{template.title}</td>
                                            <td className="p-4 text-xs text-slate-600 max-w-xs truncate">{template.description || "N/A"}</td>
                                            <td className="p-4">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#3D5A4C]/10 text-[#3D5A4C]">
                                                    {template.sections?.length || 0} أقسام
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => navigate(`/admin/template-sections`, { state: { templateId: template.id } })}
                                                        className="px-3 py-1.5 text-white rounded-lg text-xs font-medium transition-all shadow-sm hover:opacity-90"
                                                        style={{ backgroundColor: '#4D6658' }}
                                                    >
                                                        الأقسام
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(template.id)}
                                                        className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-medium hover:bg-rose-700 transition-all shadow-sm"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="p-12 text-center text-slate-400">لا توجد قوالب متاحة حالياً.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}