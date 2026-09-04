import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import API from "../../services/api";

export default function TemplateSections() {
    const location = useLocation();
    const [templates, setTemplates] = useState([]);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [templateId, setTemplateId] = useState("");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            const resTemplates = await API.get("/admin/templates", { headers });
            setTemplates(resTemplates.data);

            let allSections = [];
            resTemplates.data.forEach(t => {
                if (t.sections) {
                    t.sections.forEach(s => {
                        allSections.push({ ...s, template_title: t.title });
                    });
                }
            });
            setSections(allSections);
            setCurrentPage(1);

            if (location.state?.templateId) {
                setTemplateId(location.state.templateId);
            }
        } catch (err) {
            console.error("Error fetching data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [location.state]);

    const handleCreateSection = async (e) => {
        e.preventDefault();
        if (!templateId) {
            alert("المرجو اختيار القالب أولاً");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            await API.post("/admin/template-sections", {
                template_id: templateId,
                title: title,
                content: content
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setTitle("");
            setContent("");
            fetchData();
            alert("تم إضافة القسم بنجاح!");
        } catch (err) {
            console.error("Error creating section", err);
            alert("فشل إضافة القسم");
        }
    };

    const handleDeleteSection = async (id) => {
        if (!window.confirm("واش متأكد بغيتي تمحي هاد القسم؟")) return;
        try {
            const token = localStorage.getItem("token");
            await API.delete(`/admin/template-sections/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch (err) {
            console.error("Error deleting section", err);
            alert("فشل الحذف");
        }
    };

    const handleTestAI = async (targetTemplateId) => {
        try {
            const token = localStorage.getItem("token");
            alert("جاري الاتصال بالذكاء الاصطناعي...");
            
            const res = await API.post("/admin/generate-document", {
                template_id: targetTemplateId,
                user_inputs: {
                    "الطرف الأول": "شركة تجريبية ش.م",
                    "الطرف الثاني": "محمد العلوي",
                    "المبلغ": "5000 درهم"
                }
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success || res.data.document) {
                alert("🤖 تم التوليد بنجاح!");
            }
        } catch (err) {
            console.error("Error testing AI", err);
            alert("فشل اختبار الـ AI");
        }
    };

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentSections = sections.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sections.length / itemsPerPage);

    return (
        <div className="pt-24 px-6 pb-12 max-w-6xl mx-auto space-y-5 text-sm" style={{ backgroundColor: '#EBE9E4' }}>
            
            {/* Header Section */}
            <div className="flex items-center justify-between px-5 py-4 rounded-xl shadow-sm border border-[#3D5A4C]/10">
                <div>
                    <h1 className="text-lg font-bold text-[#3D5A4C]">إدارة أقسام الهيكل القانوني</h1>
                    <p className="text-xs text-slate-400 mt-0.5">توجيهات الذكاء الاصطناعي وهيكلة الأقسام الخاصة بالقوالب</p>
                </div>
                <div className="bg-[#3D5A4C]/10 px-3.5 py-1.5 rounded-lg text-[#3D5A4C] font-semibold text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#3D5A4C] animate-pulse"></span>
                    {sections.length} قسم
                </div>
            </div>

            {/* Form Section (Medium) */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-[#3D5A4C]/10">
                <h2 className="text-xs font-bold text-slate-800 mb-3 pb-2 border-b border-slate-100 uppercase tracking-wide">إضافة قسم جديد للقالب</h2>

                <form onSubmit={handleCreateSection} className="space-y-3.5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">اختر القالب</label>
                            <select
                                value={templateId}
                                onChange={(e) => setTemplateId(e.target.value)}
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#3D5A4C]"
                            >
                                <option value="">-- اختر القالب المناسب --</option>
                                {templates.map((t) => (
                                    <option key={t.id} value={t.id}>{t.title}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">عنوان القسم</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#3D5A4C]"
                                placeholder="مثال: 1. الوقائع..."
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">تعليمات الذكاء الاصطناعي</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={2.5}
                            required
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#3D5A4C] resize-none"
                            placeholder="تعليمات الكتابة..."
                        />
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="px-5 py-2 text-white rounded-lg font-semibold shadow-sm hover:opacity-95 transition-all text-xs"
                            style={{ backgroundColor: '#3D5A4C' }}
                        >
                            حفظ القسم
                        </button>
                    </div>
                </form>
            </div>

            {/* Table Section (Medium) */}
            <div className="bg-white rounded-xl shadow-sm border border-[#3D5A4C]/10 overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">قائمة الأقسام والهياكل المسجلة</h3>
                    <span className="text-xs text-slate-400">الإجمالي: {sections.length}</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b uppercase tracking-wider text-slate-500 bg-slate-50 font-semibold text-[11px]">
                                <th className="p-3.5">ID</th>
                                <th className="p-3.5">Template</th>
                                <th className="p-3.5">Section Title</th>
                                <th className="p-3.5">Instructions</th>
                                <th className="p-3.5 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-6 text-center text-slate-400">جاري التحميل...</td>
                                </tr>
                            ) : currentSections.length > 0 ? (
                                currentSections.map((sec) => (
                                    <tr key={sec.id} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="p-3.5 font-mono text-[11px] text-slate-500">#{sec.id}</td>
                                        <td className="p-3.5 font-medium truncate max-w-[140px]" style={{ color: '#3D5A4C' }}>{sec.template_title}</td>
                                        <td className="p-3.5 font-semibold text-slate-900">{sec.title}</td>
                                        <td className="p-3.5 text-slate-600 max-w-[220px] truncate">{sec.content}</td>
                                        <td className="p-3.5">
                                            <div className="flex items-center justify-center gap-2">
                                                {templates.find(t => t.title === sec.template_title) && (
                                                    <button
                                                        onClick={() => handleTestAI(templates.find(t => t.title === sec.template_title).id)}
                                                        className="px-3 py-1.5 text-white rounded-md font-medium hover:opacity-90 transition-all text-[11px]"
                                                        style={{ backgroundColor: '#4D6658' }}
                                                    >
                                                        AI Test
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteSection(sec.id)}
                                                    className="px-3 py-1.5 bg-rose-600 text-white rounded-md font-medium hover:bg-rose-700 transition-all text-[11px]"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-400">لا توجد أقسام مسجلة حالياً.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
                        <span className="text-xs text-slate-500">
                            صفحة {currentPage} من {totalPages}
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 rounded-md border border-slate-200 bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-50 text-xs transition-all"
                            >
                                السابق
                            </button>
                            
                            {[...Array(totalPages)].map((_, index) => {
                                const pageNum = index + 1;
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`w-7 h-7 rounded-md font-semibold text-xs transition-all ${
                                            currentPage === pageNum 
                                                ? 'text-white shadow-sm' 
                                                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                        }`}
                                        style={currentPage === pageNum ? { backgroundColor: '#3D5A4C' } : {}}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 rounded-md border border-slate-200 bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-50 text-xs transition-all"
                            >
                                التالي
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}