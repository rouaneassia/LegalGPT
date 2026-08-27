import { useEffect, useState } from "react";
import API from "../../services/api";

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

        try {
            const token = localStorage.getItem("token");

            await API.put(
                `/admin/sources/${source.id}`,
                {
                    title,
                    url,
                    type,
                    category_id: categoryId, // ارسال الفئة المحدثة
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
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-[550px]">
                <h2 className="text-2xl font-bold mb-6">
                    Edit Source
                </h2>

                <form onSubmit={handleUpdate} className="space-y-5">
                    <div>
                        <label className="block mb-2 font-medium">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full border rounded-lg px-4 py-2"
                            required
                        />
                    </div>

                    {/* خانة اختيار الفئة للتعديل */}
                    <div>
                        <label className="block mb-2 font-medium">Category</label>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full border rounded-lg px-4 py-2 bg-white"
                        >
                            <option value="">Select Category</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block mb-2 font-medium">URL</label>
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="w-full border rounded-lg px-4 py-2"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-2 font-medium">Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full border rounded-lg px-4 py-2 bg-white"
                        >
                            <option value="pdf">PDF</option>
                            <option value="website">Website</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}