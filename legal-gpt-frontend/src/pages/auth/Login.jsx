import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { login as loginService } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
    const navigate = useNavigate();

    const { login } = useAuth();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError("");

        try {
            const response = await loginService(form);

            login(
                response.data.user,
                response.data.token
            );

            navigate("/chat");
        } catch (err) {
            setError("Email ou mot de passe incorrect.");
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 text-sm" style={{ backgroundColor: '#EBE9E4' }}>

            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-2xl shadow-sm border border-[#3D5A4C]/10 w-full max-w-md"
            >

                <div className="text-center mb-6">
                    <div className="w-12 h-12 rounded-xl bg-[#3D5A4C]/10 text-[#3D5A4C] flex items-center justify-center text-xl mx-auto mb-3 shadow-inner">
                        🔐
                    </div>
                    <h1 className="text-base font-bold text-[#3D5A4C]">Connexion</h1>
                    <p className="text-xs text-slate-500 mt-1">Accédez à votre espace LegalGPT</p>
                </div>

                {error && (
                    <p className="text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-3 mb-4 text-xs font-semibold">
                        {error}
                    </p>
                )}

                <div className="mb-4">
                    <label className="block text-xs font-bold text-[#3D5A4C] mb-2 uppercase tracking-wide">Email</label>

                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        placeholder="votre@email.com"
                        className="w-full bg-[#EBE9E4]/40 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#3D5A4C] transition-all"
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-xs font-bold text-[#3D5A4C] mb-2 uppercase tracking-wide">Mot de passe</label>

                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        placeholder="••••••••••••"
                        className="w-full bg-[#EBE9E4]/40 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#3D5A4C] transition-all"
                    />
                </div>

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
                        "Se connecter"
                    )}
                </button>

                <div className="text-center mt-4">
                    <p className="text-xs text-slate-500">
                        Vous n'avez pas de compte ?{" "}
                        <Link to="/register" className="text-[#3D5A4C] font-bold hover:underline">
                            S'inscrire
                        </Link>
                    </p>
                </div>

            </form>

        </div>
    );
}