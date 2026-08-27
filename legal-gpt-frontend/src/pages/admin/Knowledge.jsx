import { useEffect, useState } from "react";
import API from "../../services/api";

export default function Knowledge() {
    const [chunks, setChunks] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({});

    const fetchChunks = async (page = 1) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await API.get(`/admin/knowledge?page=${page}&search=${search}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setChunks(res.data.data);
            setPagination(res.data);
        } catch (err) {
            console.error("Error fetching knowledge base chunks", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChunks();
    }, [search]);

    const handleDelete = async (id) => {
        if (!window.confirm("واش متأكد بغيتي تمحي هاد الـ Chunk؟")) return;
        try {
            const token = localStorage.getItem("token");
            // تم تصحيح الرابط هنا ليطابق /admin/knowledge عوض knowledge-base
            await API.delete(`/admin/knowledge/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setChunks(chunks.filter(chunk => chunk.id !== id));
        } catch (err) {
            console.error("Error deleting chunk", err);
            alert("فشل الحذف");
        }
    };
    

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-2">Knowledge Base</h1>
            <p className="text-gray-600 mb-6">Gestion des connaissances juridiques</p>

            {/* شريط البحث */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="ابحث في نصوص الـ Chunks..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full md:w-1/3 border rounded-lg px-4 py-2 bg-white"
                />
            </div>

            {/* الجدول */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-100 border-b">
                        <tr>
                            <th className="p-4 font-semibold">ID</th>
                            <th className="p-4 font-semibold">Source Title</th>
                            <th className="p-4 font-semibold w-1/2">Chunk Content (Excerpt)</th>
                            <th className="p-4 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                               <td colSpan="4" className="p-6 text-center text-gray-500">جاري التحميل...</td>
                            </tr>
                        ) : chunks.length > 0 ? (
                            chunks.map((chunk) => (
                                <tr key={chunk.id} className="border-b hover:bg-gray-50">
                                    <td className="p-4">{chunk.id}</td>
                                    <td className="p-4 font-medium">{chunk.source?.title || "N/A"}</td>
                                    <td className="p-4 text-sm text-gray-600 truncate max-w-xs">
                                        {chunk.content}
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => handleDelete(chunk.id)}
                                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="p-6 text-center text-gray-500">لا توجد بيانات متاحة حالياً.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}