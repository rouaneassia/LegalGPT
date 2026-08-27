import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');

    // Token ديال الأدمن (يمكنك تعديلها حسب طريقة تخزين الـ Token عندك، مثلاً localStorage أو Context)
    const token = localStorage.getItem('token'); 

    const axiosConfig = {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
        }
    };

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://127.0.0.1:8000/api/admin/categories', axiosConfig);
            if (response.data.success) {
                setCategories(response.data.data);
            }
        } catch (err) {
            setError('Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                // Update
                await axios.put(`http://127.0.0.1:8000/api/admin/categories/${editingId}`, { name, description }, axiosConfig);
            } else {
                // Create
                await axios.post('http://127.0.0.1:8000/api/admin/categories', { name, description }, axiosConfig);
            }
            setName('');
            setDescription('');
            setEditingId(null);
            fetchCategories();
        } catch (err) {
            setError(err.response?.data?.message || 'Error saving category');
        }
    };

    const handleEdit = (category) => {
        setEditingId(category.id);
        setName(category.name);
        setDescription(category.description || '');
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await axios.delete(`http://127.0.0.1:8000/api/admin/categories/${id}`, axiosConfig);
                fetchCategories();
            } catch (err) {
                setError('Failed to delete category');
            }
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Manage Categories</h1>

            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white p-4 shadow rounded-lg mb-6 max-w-xl">
                <h2 className="text-lg font-semibold mb-4">{editingId ? 'Edit Category' : 'Add New Category'}</h2>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Category Name</label>
                    <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        className="w-full p-2 border rounded" 
                        required 
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
                    <textarea 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        className="w-full p-2 border rounded" 
                    />
                </div>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    {editingId ? 'Update Category' : 'Add Category'}
                </button>
                {editingId && (
                    <button 
                        type="button" 
                        onClick={() => { setEditingId(null); setName(''); setDescription(''); }} 
                        className="ml-2 bg-gray-400 text-white px-4 py-2 rounded"
                    >
                        Cancel
                    </button>
                )}
            </form>

            {/* List */}
            <div className="bg-white shadow rounded-lg overflow-hidden max-w-4xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-100 border-b">
                            <th className="p-3">Name</th>
                            <th className="p-3">Slug</th>
                            <th className="p-3">Sources Count</th>
                            <th className="p-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4" className="p-4 text-center">Loading...</td></tr>
                        ) : categories.length === 0 ? (
                            <tr><td colSpan="4" className="p-4 text-center">No categories found.</td></tr>
                        ) : (
                            categories.map((cat) => (
                                <tr key={cat.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3 font-medium">{cat.name}</td>
                                    <td className="p-3 text-gray-600">{cat.slug}</td>
                                    <td className="p-3">{cat.sources_count || 0}</td>
                                    <td className="p-3 space-x-2">
                                        <button onClick={() => handleEdit(cat)} className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600">Edit</button>
                                        <button onClick={() => handleDelete(cat.id)} className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">Delete</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}