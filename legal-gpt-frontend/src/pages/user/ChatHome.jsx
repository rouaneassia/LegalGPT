import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../services/api';
import ReactMarkdown from 'react-markdown';

export default function ChatHome() {
    const [prompt, setPrompt] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    
    const { chatId } = useParams();
    const navigate = useNavigate();

    const cleanMarkdownText = (text) => {
        if (!text) return "";
        return String(text)
            .replace(/\*\*\s*(\d+\.)\s*\*\*/g, '### $1')
            .replace(/---/g, '\n\n---\n\n');
    };

    useEffect(() => {
        if (!chatId) {
            setMessages([]);
        } else {
            fetchChatMessages(chatId);
        }
    }, [chatId]);

    const fetchChatMessages = async (id) => {
        try {
            const response = await API.get(`/user/chats`);
            const currentChat = response.data.find(c => c.id === Number(id));
            
            if (currentChat && currentChat.messages) {
                const formatted = currentChat.messages.flatMap(m => {
                    const isAssistant = m.role === 'assistant' || m.role === 'bot';
                    const userText = isAssistant ? "" : (m.question || m.prompt || m.content || "");
                    const botText = isAssistant ? (m.answer || m.response || m.reply || m.content || "") : "";
                    
                    const arr = [];
                    if (userText) arr.push({ type: 'user', content: userText });
                    if (botText) arr.push({ type: 'bot', content: cleanMarkdownText(botText), sources: m.sources || [] });
                    return arr;
                });
                setMessages(formatted);
            } else {
                setMessages([]);
            }
        } catch (error) {
            console.error("Error loading chat messages:", error);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        const token = localStorage.getItem('token');
        if (!token) {
            setShowLoginModal(true);
            return;
        }

        const userQuestion = prompt;
        setPrompt('');
        
        setMessages(prev => [...prev, { type: 'user', content: userQuestion }]);
        setLoading(true);

        try {
            let response;
            const lowerQuery = userQuestion.toLowerCase();
            const documentKeywords = [
                'contrat', 'bail', 'cdi', 'cdd', 'convention', 'accord',
                'lettre juridique', 'mise en demeure', 'plainte', 'requête', 'requete',
                'procuration', 'attestation', 'certificat', 'statuts', 'règlement', 'reglement',
                'acte juridique', 'document juridique', 'documents juridiques',
                'dictionnaire juridique', 'journal juridique', 'rapport juridique',
                'modèle de document', 'modele de document', 'formulaire juridique',
                'rédige', 'redige', 'génère', 'genere', 'crée', 'cree', 'écris', 'ecris',
                'prépare', 'prepare', 'اكتب', 'أنشئ', 'انشئ', 'صمم', 'نموذج'
            ];
            const shouldGenerateDocument = documentKeywords.some(keyword => lowerQuery.includes(keyword));

            if (shouldGenerateDocument) {
                response = await API.post('/generate-document', {
                    template_id: 1,
                    prompt: userQuestion, 
                    user_inputs: { demande: userQuestion },
                    language: "fr",
                    chat_id: chatId ? Number(chatId) : null 
                });
            } else {
                response = await API.post('/chat/ask', {
                    question: userQuestion,
                    chat_id: chatId ? Number(chatId) : null
                });
            }

            const rawBotAnswer = response.data.answer || response.data.document || response.data.message || response.data.response || "Makaynch jawab.";
            const botAnswer = cleanMarkdownText(rawBotAnswer);
            const botSources = response.data.sources || [];
            
            const newChatId = response.data.chat_id || response.data.record?.chat_id;

            setMessages(prev => [...prev, { 
                type: 'bot', 
                content: botAnswer,
                sources: botSources
            }]);

            if (!chatId && newChatId) {
                navigate(`/chat/${newChatId}`, { replace: true });
            }

        } catch (error) {
            const status = error.response?.status;
            const backendMessage = error.response?.data?.message;
            const backendError = error.response?.data?.error;

            console.error("Chat request failed", {
                status,
                message: backendMessage || error.message,
                details: backendError,
            });

            if (status === 401) {
                setShowLoginModal(true);
            } else {
                const errorMsg = status === 503
                    ? "Le service juridique est temporairement indisponible. Vérifiez la configuration Gemini puis réessayez."
                    : backendMessage || "Smeh lia, waqa3 mochkil f l-connection m3a l-server.";
                setMessages(prev => [...prev, { 
                    type: 'bot', 
                    content: errorMsg 
                }]);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div key={chatId || 'new-chat'} className="flex flex-col h-screen bg-[#06090F] text-slate-100 relative font-sans">
            
            {/* Top Bar */}
            <div className="flex justify-end items-center px-6 py-4 gap-3 bg-[#06090F] border-b border-slate-800/80">
                {!localStorage.getItem('token') && (
                    <>
                        <button onClick={() => navigate('/login')} className="bg-transparent hover:bg-slate-800 text-slate-200 border border-slate-700/80 px-4 py-1.5 rounded-xl text-xs font-semibold transition">Log in</button>
                        <button onClick={() => navigate('/register')} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-xl text-xs font-semibold transition shadow-md shadow-emerald-950">Sign up for free</button>
                    </>
                )}
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 max-w-4xl mx-auto w-full">
                {messages.length === 0 ? (
                    <div className="text-center my-28">
                        <div className="w-14 h-14 bg-emerald-950/60 border border-emerald-500/30 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-xl text-2xl text-emerald-400">⚖️</div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Qu'est-ce qui vous intéresse aujourd'hui ?</h1>
                        <p className="text-sm text-slate-400 mt-2">Posez vos questions juridiques ou demandez de générer des contrats.</p>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <div key={index} className={`flex gap-4 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.type === 'bot' && (
                                <div className="w-8 h-8 rounded-full bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center font-bold text-xs shrink-0 shadow-md text-emerald-300">AI</div>
                            )}
                            <div 
                                dir="auto"
                                className={`max-w-3xl rounded-2xl p-6 text-sm leading-relaxed shadow-xl ${
                                    msg.type === 'user' 
                                        ? 'bg-slate-800 text-slate-100 rounded-br-none text-right font-medium border border-slate-700/50' 
                                        : 'bg-[#0E1522] border border-slate-800/80 text-slate-200 rounded-bl-none w-full shadow-2xl'
                                }`}
                            >
                                {msg.type === 'bot' ? (
                                    <div className="text-sm space-y-4 leading-loose tracking-wide break-words text-slate-200">
                                        <ReactMarkdown
                                            components={{
                                                h1: ({node, ...props}) => <h1 className="!text-lg !font-bold !text-emerald-400 mt-4 mb-2" {...props} />,
                                                h2: ({node, ...props}) => <h2 className="!text-base !font-bold !text-emerald-400 mt-3 mb-2" {...props} />,
                                                h3: ({node, ...props}) => <h3 className="!text-sm !font-bold !text-emerald-300 mt-3 mb-1" {...props} />,
                                                ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-2 my-2 !text-slate-200" {...props} />,
                                                ol: ({node, ...props}) => <ol className="list-decimal pl-5 space-y-2 my-2 !text-slate-200" {...props} />,
                                                li: ({node, ...props}) => <li className="!text-slate-200 leading-relaxed" {...props} />,
                                                p: ({node, ...props}) => <p className="!text-slate-200 mb-3 leading-relaxed" {...props} />,
                                                strong: ({node, ...props}) => <strong className="!font-bold !text-emerald-300" {...props} />,
                                                hr: ({node, ...props}) => <hr className="border-slate-800 my-4" {...props} />
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>
                                ) : (
                                    <div className="whitespace-pre-wrap text-slate-100">{msg.content}</div>
                                )}

                                {/* Sources Section */}
                                {msg.sources && msg.sources.length > 0 && (
                                    <div className="mt-6 pt-4 border-t border-slate-800/80" dir="auto">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                            <p className="text-xs font-bold tracking-wider text-emerald-400 uppercase">المصادر القانونية (Sources) :</p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {msg.sources.map((src, sIdx) => (
                                                <span 
                                                    key={sIdx} 
                                                    className="text-xs bg-[#091510] text-emerald-300 px-3.5 py-2 rounded-xl border border-emerald-800/60 shadow-sm flex items-center gap-2 font-medium transition-all duration-200 hover:bg-emerald-950 hover:border-emerald-500 hover:text-emerald-200 hover:scale-[1.02] cursor-pointer"
                                                >
                                                    <span className="text-emerald-400">📄</span> 
                                                    <span>{src.title || src}</span>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}

                {loading && (
                    <div className="flex gap-4 justify-start">
                        <div className="w-8 h-8 rounded-full bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center font-bold text-xs shadow-md text-emerald-300">AI</div>
                        <div className="bg-[#0E1522] border border-slate-800/80 px-5 py-3 rounded-2xl text-slate-400 text-sm animate-pulse flex items-center gap-3">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                            En cours de traitement...
                        </div>
                    </div>
                )}
            </div>

            {/* Input Form */}
            <div className="p-4 bg-[#06090F] border-t border-slate-800/80">
                <form onSubmit={handleSend} className="max-w-3xl mx-auto bg-[#0E1522] border border-slate-800/80 rounded-2xl p-3 shadow-2xl relative focus-within:border-emerald-600/60 transition">
                    <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Posez une question ou demandez de générer des contrats..."
                        rows="2"
                        dir="auto"
                        className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none resize-none text-sm leading-relaxed"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend(e);
                            }
                        }}
                    />
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-800/60">
                        <span className="text-xs text-slate-500">Appuyez sur Entrée pour envoyer</span>
                        <button type="submit" disabled={loading || !prompt.trim()} className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl transition font-bold text-sm shadow-md shadow-emerald-950">
                            Envoyer ⬆
                        </button>
                    </div>
                </form>
            </div>

            {/* Login Modal */}
            {showLoginModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-[#0E1522] border border-slate-800 text-white w-full max-w-sm rounded-3xl p-8 relative shadow-2xl text-center" dir="ltr">
                        <button onClick={() => setShowLoginModal(false)} className="absolute top-5 right-5 text-slate-400 hover:text-white font-bold">✕</button>
                        <h2 className="text-xl font-bold mb-2">Welcome back</h2>
                        <p className="text-xs text-slate-400 mb-6">Log in to continue chatting.</p>
                        <button onClick={() => navigate('/login')} className="w-full bg-emerald-600 hover:bg-emerald-500 py-3 rounded-xl mb-3 font-semibold text-sm shadow-md transition">Log in</button>
                        <button onClick={() => navigate('/register')} className="w-full bg-slate-800 hover:bg-slate-700 py-3 rounded-xl font-semibold text-sm transition">Create account</button>
                    </div>
                </div>
            )}
        </div>
    );
}