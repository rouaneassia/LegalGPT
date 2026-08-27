import React from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api'; // ila kan api.js f had l-chemin, wla bdl l-chemin 3la 7sab fin kayn

export default function Navbar() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            // صيفط request l logout l Laravel (Sanctum)
            await API.post('/logout');
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            // 7yd token w user mn localStorage w rje3 l page d login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
        }
    };

    return (
        <header className="h-16 bg-white shadow flex items-center justify-between px-6">
            <h1 className="text-xl font-semibold text-slate-800">
                Admin Dashboard
            </h1>

            <button 
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition font-medium shadow"
            >
                Logout 🚪
            </button>
        </header>
    );
}