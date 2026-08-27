import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

            navigate("/admin");
        } catch (err) {
            setError("Email ou mot de passe incorrect.");
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">

            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-xl shadow-lg w-[400px]"
            >

                <h1 className="text-4xl font-bold text-center mb-8">
                    Login
                </h1>

                {error && (
                    <p className="text-red-600 mb-4">
                        {error}
                    </p>
                )}

                <div className="mb-5">
                    <label>Email</label>

                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full border p-3 rounded mt-2"
                    />
                </div>

                <div className="mb-6">
                    <label>Password</label>

                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full border p-3 rounded mt-2"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700"
                >
                    {loading ? "Loading..." : "Login"}
                </button>

            </form>

        </div>
    );
}