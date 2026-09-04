import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { adminLogin } from "../../services/authService";

export default function AdminLogin() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (localStorage.getItem("token")) {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            if (user?.role === "admin") {
                return <Navigate to="/admin" replace />;
            }
        } catch {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await adminLogin(form);
            login(response.data.user, response.data.token);
            navigate("/admin", { replace: true });
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Accès administrateur refusé.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 text-sm" style={{ backgroundColor: '#EBE9E4' }}>
            <form onSubmit={handleSubmit} className="bg-white w-full max-w-md rounded-2xl p-8 shadow-sm border border-[#3D5A4C]/10">
                
                <div className="text-center mb-6">
                    <div className="w-12 h-12 rounded-xl bg-[#3D5A4C]/10 text-[#3D5A4C] flex items-center justify-center text-xl mx-auto mb-3 shadow-inner">
                        ⚖️
                    </div>
                    <h1 className="text-base font-bold text-[#3D5A4C]">Administration LegalGPT</h1>
                    <p className="text-xs text-slate-500 mt-1">Connexion sécurisée réservée aux administrateurs.</p>
                </div>

                {error && <p className="text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-3 mb-4 text-xs font-semibold">{error}</p>}

                <label className="block text-xs font-bold text-[#3D5A4C] mb-2 uppercase tracking-wide">Email administrateur</label>
                <input
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    required
                    placeholder="admin@legalgpt.com"
                    className="w-full bg-[#EBE9E4]/40 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#3D5A4C] transition-all mb-4"
                />

                <label className="block text-xs font-bold text-[#3D5A4C] mb-2 uppercase tracking-wide">Mot de passe</label>
                <input
                    type="password"
                    value={form.password}
                    onChange={(event) => setForm({ ...form, password: event.target.value })}
                    required
                    placeholder="••••••••••••"
                    className="w-full bg-[#EBE9E4]/40 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#3D5A4C] transition-all mb-6"
                />

                <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full text-white py-2.5 rounded-lg text-xs font-semibold shadow-sm transition hover:opacity-95 disabled:opacity-60 flex items-center justify-center gap-2"
                    style={{ backgroundColor: '#4D6658' }}
                >
                    {loading ? (
                        <>
                            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
                            Connexion en cours...
                        </>
                    ) : (
                        "Accéder au dashboard"
                    )}
                </button>

                <button 
                    type="button" 
                    onClick={() => navigate("/chat")} 
                    className="w-full mt-4 text-xs font-medium text-slate-500 hover:text-[#3D5A4C] transition"
                >
                    ← Retour à l'interface utilisateur
                </button>
            </form>
        </div>
    );
}