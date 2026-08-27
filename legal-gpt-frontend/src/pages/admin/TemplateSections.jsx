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

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            const resTemplates = await API.get("/admin/templates", { headers });
            setTemplates(resTemplates.data);

            // استخراج جميع الأقسام لعرضها في الجدول
            let allSections = [];
            resTemplates.data.forEach(t => {
                if (t.sections) {
                    t.sections.forEach(s => {
                        allSections.push({ ...s, template_title: t.title });
                    });
                }
            });
            setSections(allSections);

            // إيلا جا templateId من الصفحة الأخرى، نختاروه تلقائياً
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

    // دالة اختبار توليد الوثيقة بالذكاء الاصطناعي للقالب المختار
    const handleTestAI = async (targetTemplateId) => {
        try {
            const token = localStorage.getItem("token");
            alert("جاري الاتصال بالذكاء الاصطناعي لتوليد الوثيقة التجريبية...");
            
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
                // عرض جزء من النتيجة أو فتحها للتأكد
                console.log(res.data.document);
                alert("🤖 تم التوليد بنجاح! راجع الـ Console أو افتح معاينة الوثيقة.");
            }
        } catch (err) {
            console.error("Error testing AI", err);
            alert("فشل اختبار الـ AI، تأكد من إعدادات الـ Backend والمفتاح");
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-2">Template Sections</h1>
            <p className="text-gray-600 mb-6">إدارة أقسام الهيكل القانوني وتوجيهات الذكاء الاصطناعي</p>

            <div className="bg-white p-6 rounded-xl shadow mb-8">
                <h2 className="text-xl font-semibold mb-4">إضافة قسم جديد للقالب</h2>
                <form onSubmit={handleCreateSection} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">اختر القالب</label>
                        <select
                            value={templateId}
                            onChange={(e) => setTemplateId(e.target.value)}
                            required
                            className="w-full border rounded-lg px-4 py-2 bg-white"
                        >
                            <option value="">-- اختر القالب المناسب --</option>
                            {templates.map((t) => (
                                <option key={t.id} value={t.id}>{t.title}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">عنوان القسم (مثال: Les Faits / الوقائع)</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="w-full border rounded-lg px-4 py-2 bg-white"
                            placeholder="مثال: 1. الوقائع أو Introduction..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            هيكل الكتابة والتعليمات للذكاء الاصطناعي (باللغة المطلوبة: فرنسية، عربية...)
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                            className="w-full border rounded-lg px-4 py-2 bg-white h-28"
                            placeholder="مثال: Rédigez cette section en français de manière formelle et juridique..."
                        />
                    </div>

                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                        حفظ القسم
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-100 border-b">
                        <tr>
                            <th className="p-4 font-semibold">ID</th>
                            <th className="p-4 font-semibold">Template</th>
                            <th className="p-4 font-semibold">Section Title</th>
                            <th className="p-4 font-semibold">Instructions / Content</th>
                            <th className="p-4 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="p-6 text-center text-gray-500">جاري التحميل...</td>
                            </tr>
                        ) : sections.length > 0 ? (
                            sections.map((sec) => (
                                <tr key={sec.id} className="border-b hover:bg-gray-50">
                                    <td className="p-4">{sec.id}</td>
                                    <td className="p-4 font-medium text-blue-600">{sec.template_title}</td>
                                    <td className="p-4 font-semibold">{sec.title}</td>
                                    <td className="p-4 text-sm text-gray-600 max-w-md truncate">{sec.content}</td>
                                    <td className="p-4 space-x-2 flex items-center">
                                        {templates.find(t => t.title === sec.template_title) && (
                                            <button
                                                onClick={() => handleTestAI(templates.find(t => t.title === sec.template_title).id)}
                                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                                                title="تجربة توليد الوثيقة لهذا القالب بالذكاء الاصطناعي"
                                            >
                                                Test AI
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDeleteSection(sec.id)}
                                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="p-6 text-center text-gray-500">لا توجد أقسام مسجلة حالياً.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}