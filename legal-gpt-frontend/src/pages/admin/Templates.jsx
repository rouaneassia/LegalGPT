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
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-2">Templates</h1>
            <p className="text-gray-600 mb-6">إدارة قوالب الوثائق القانونية</p>

            {/* نموذج إضافة قالب */}
            <div className="bg-white p-6 rounded-xl shadow mb-8">
                <h2 className="text-xl font-semibold mb-4">إضافة قالب جديد</h2>
                <form onSubmit={handleCreateTemplate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">عنوان القالب</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="w-full border rounded-lg px-4 py-2 bg-white"
                            placeholder="مثال: عقد نزاع دستوري..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full border rounded-lg px-4 py-2 bg-white"
                            placeholder="وصف مختصر للقالب..."
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                        حفظ القالب
                    </button>
                </form>
            </div>

            {/* جدول عرض القوالب */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-100 border-b">
                        <tr>
                            <th className="p-4 font-semibold">ID</th>
                            <th className="p-4 font-semibold">Title</th>
                            <th className="p-4 font-semibold">Description</th>
                            <th className="p-4 font-semibold">Sections Count</th>
                            <th className="p-4 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="p-6 text-center text-gray-500">جاري التحميل...</td>
                            </tr>
                        ) : templates.length > 0 ? (
                            templates.map((template) => (
                                <tr key={template.id} className="border-b hover:bg-gray-50">
                                    <td className="p-4">{template.id}</td>
                                    <td className="p-4 font-medium">{template.title}</td>
                                    <td className="p-4 text-sm text-gray-600">{template.description || "N/A"}</td>
                                    <td className="p-4">{template.sections?.length || 0} أقسام</td>
                                    <td className="p-4 space-x-2 flex items-center">
                                        {/* زر الانتقال لصفحة Template Sections مع تحديد الـ ID تلقائياً */}
                                        <button
                                            onClick={() => navigate(`/admin/template-sections`, { state: { templateId: template.id } })}
                                            className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                                        >
                                            الأقسام
                                        </button>
                                        <button
                                            onClick={() => handleDelete(template.id)}
                                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="p-6 text-center text-gray-500">لا توجد قوالب متاحة حالياً.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}