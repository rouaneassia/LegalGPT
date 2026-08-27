import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../services/api';

export default function Register() {
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleNextStep = (e) => {
        e.preventDefault();
        if (!email) return;
        setStep(2);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await API.post('/register', { name, email, password });
            localStorage.setItem('token', response.data.token);
            navigate('/chat');
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de l’inscription.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white p-4" dir="ltr">
            <div className="bg-white text-slate-900 w-full max-w-md rounded-2xl p-8 shadow-2xl relative">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold tracking-tight">Create your account</h2>
                    <p className="text-xs text-slate-500 mt-1">Please enter your details to sign up.</p>
                </div>

                {error && <div className="bg-red-100 text-red-600 p-3 rounded-xl mb-4 text-xs">{error}</div>}

                {step === 1 ? (
                    <form onSubmit={handleNextStep} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-emerald-600 mb-1">Email address*</label>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                required
                                className="w-full border border-emerald-500 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                            />
                        </div>
                        <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-xl transition shadow">
                            Continue
                        </button>
                        <p className="text-xs text-center text-slate-500 mt-4">
                            Already have an account? <Link to="/login" className="text-emerald-600 font-medium hover:underline">Log in</Link>
                        </p>
                    </form>
                ) : (
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Full Name*</label>
                            <input 
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                                required
                                className="w-full border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-xs font-medium text-emerald-600">Password*</label>
                                <button type="button" onClick={() => setStep(1)} className="text-xs text-slate-400 hover:text-slate-600">Edit</button>
                            </div>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full border border-emerald-500 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                            />
                        </div>
                        <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-xl transition shadow">
                            Continue & Register
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}