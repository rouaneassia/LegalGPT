import { useState, useEffect } from "react";
import API from "../../services/api";

export default function AddSourceModal({ open, onClose, onCreated }) {
    const [form, setForm] = useState({
        title: "",
        url: "",
        type: "pdf",
        category_id: "", // 1. إضافة حقل الفئة
    });

    const [categories, setCategories] = useState([]);

    // 2. جلب الفئات من الـ API عند فتح المودال
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
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
            <div className="bg-white w-[500px] rounded-xl p-6">
                <h2 className="text-2xl font-bold mb-6">Add Source</h2>

                <form onSubmit={handleSubmit}>
                    <input
                        className="border w-full p-3 rounded mb-4"
                        placeholder="Title"
                        value={form.title}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                title: e.target.value,
                            })
                        }
                        required
                    />

                    {/* 3. خانة اختيار الفئة (Category) */}
                    <div className="mb-4">
                        <select
                            className="border w-full p-3 rounded bg-white"
                            value={form.category_id}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    category_id: e.target.value,
                                })
                            }
                        >
                            <option value="">Select Category</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <input
                        className="border w-full p-3 rounded mb-4"
                        placeholder="URL"
                        value={form.url}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                url: e.target.value,
                            })
                        }
                        required
                    />

                    <select
                        className="border w-full p-3 rounded mb-6 bg-white"
                        value={form.type}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                type: e.target.value,
                            })
                        }
                    >
                        <option value="pdf">PDF</option>
                        <option value="website">Website</option>
                    </select>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded hover:bg-gray-100"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}