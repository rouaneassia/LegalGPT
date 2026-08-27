import { useEffect, useState } from "react";
import API from "../../services/api";
import { ExternalLink, FileText } from "lucide-react";
import AddSourceModal from "../../components/sources/AddSourceModal";
import EditSourceModal from "../../components/sources/EditSourceModal";

export default function Sources() {
    const [sources, setSources] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [selectedSource, setSelectedSource] = useState(null);

    useEffect(() => {
        fetchSources();
    }, []);

    async function fetchSources() {
        try {
            const token = localStorage.getItem("token");

            const res = await API.get("/admin/sources", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const dataArray = Array.isArray(res.data) 
                ? res.data 
                : (res.data.data || []);

            setSources(dataArray);
        } catch (err) {
            console.error("Error fetching sources:", err);
            setSources([]);
        }
    }

    async function deleteSource(id) {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this source?"
        );

        if (!confirmDelete) return;

        const token = localStorage.getItem("token");

        await API.delete(`/admin/sources/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        fetchSources();
    }

    async function syncSource(id) {
        try {
            const token = localStorage.getItem("token");

            const res = await API.post(`/admin/sources/${id}/sync`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            alert("Synchronization completed successfully!");
            fetchSources();
        } catch (err) {
            console.error(err);
            if (err.response) {
                alert(err.response.data.message || JSON.stringify(err.response.data));
            } else {
                alert(err.message);
            }
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">
                        Sources
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Manage your legal knowledge sources
                    </p>
                </div>

                <button
                    onClick={() => setOpenModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
                >
                    + Add Source
                </button>
            </div>

            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full">
                    {/* تم تعديل التنسيق هنا لإزالة المسافات الزائدة بين عناصر th */}
                    <thead className="bg-slate-100">
                        <tr><th className="text-left p-4">Title</th><th className="text-left p-4">Category</th><th className="text-left p-4">Type</th><th className="text-left p-4">URL</th><th className="text-left p-4">Actions</th></tr>
                    </thead>

                    <tbody>
                        {(Array.isArray(sources) ? sources : []).map((source) => (
                            <tr
                                key={source.id}
                                className="border-t hover:bg-slate-50"
                            >
                                <td className="p-4 flex items-center gap-3">
                                    <div className="bg-blue-100 p-2 rounded-lg">
                                        <FileText
                                            size={18}
                                            className="text-blue-600"
                                        />
                                    </div>
                                    <span className="font-medium">
                                        {source.title}
                                    </span>
                                </td>

                                <td className="p-4">
                                    <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-medium">
                                        {source.category ? source.category.name : "Uncategorized"}
                                    </span>
                                </td>

                                <td className="p-4">
                                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm">
                                        {source.type ? source.type.toUpperCase() : "N/A"}
                                    </span>
                                </td>

                                <td className="p-4">
                                    <a
                                        href={source.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-2 text-blue-600 hover:underline"
                                    >
                                        Open Document
                                        <ExternalLink size={16} />
                                    </a>
                                </td>
                                
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedSource(source);
                                                setOpenEditModal(true);
                                            }}
                                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => deleteSource(source.id)}
                                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg"
                                        >
                                            Delete
                                        </button>

                                        <button
                                            onClick={() => syncSource(source.id)}
                                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg"
                                        >
                                            Sync
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {(!sources || sources.length === 0) && (
                    <div className="p-10 text-center text-gray-500">
                        No sources found.
                    </div>
                )}
            </div>

            <AddSourceModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                onCreated={fetchSources}
            />
            
            <EditSourceModal
                open={openEditModal}
                onClose={() => setOpenEditModal(false)}
                onUpdated={fetchSources}
                source={selectedSource}
            />
        </div>
    );
}