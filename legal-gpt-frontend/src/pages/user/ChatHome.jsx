import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../services/api';
import ReactMarkdown from 'react-markdown';
import { Star, Send, Bot, User, Sparkles, Scale, Lock, Loader2 } from 'lucide-react';

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
                    if (botText) arr.push({ type: 'bot', content: cleanMarkdownText(botText), sources: m.sources || [], chatId: currentChat.id });
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

    const handleToggleFavorite = async (cId) => {
        try {
            await API.post('/user/favorites/toggle', { chat_id: Number(cId) });
            alert("Ajouté / Retiré des favoris avec succès !");
        } catch (error) {
            console.error("Erreur favoris:", error);
            alert("Erreur lors de la modification des favoris.");
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
            
            const newChatId = response.data.chat_id || response.data.record?.chat_id || chatId;

            setMessages(prev => [...prev, { 
                type: 'bot', 
                content: botAnswer,
                sources: botSources,
                chatId: newChatId
            }]);

            if (!chatId && newChatId) {
                navigate(`/chat/${newChatId}`, { replace: true });
            }

        } catch (error) {
            const status = error.response?.status;
            const backendMessage = error.response?.data?.message;

            if (status === 401) {
                setShowLoginModal(true);
            } else {
                const errorMsg = status === 503
                    ? "Le service juridique est temporairement indisponible."
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
        <div key={chatId || 'new-chat'} className="flex flex-col h-full bg-[#3D5A4C] text-[#F3F7F5] relative font-sans selection:bg-[#5F8775] selection:text-white">
            
            {/* Custom CSS for thin scrollbar pinned to the far right */}
            <style>{`
                .custom-chat-scrollbar {
                    overflow-y: scroll;
                    scrollbar-width: thin;
                    scrollbar-color: #5F8775 #3D5A4C;
                }
                .custom-chat-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .custom-chat-scrollbar::-webkit-scrollbar-track {
                    background: #3D5A4C;
                }
                .custom-chat-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #5F8775;
                    border-radius: 9999px;
                }
                .custom-chat-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: #82A895;
                }
            `}</style>

            {/* Top Bar / Actions de Connexion si non connecté */}
            {!localStorage.getItem('token') && (
                <div className="flex justify-end items-center px-6 py-3 gap-3 bg-[#3D5A4C]/95 backdrop-blur-md border-b border-[#4E7061] shadow-xs">
                    <button onClick={() => navigate('/login')} className="bg-transparent hover:bg-[#4E7061]/50 text-[#F3F7F5] border border-[#5F8775] px-4 py-1.5 rounded-xl text-xs font-semibold transition">
                        Log in
                    </button>
                    <button onClick={() => navigate('/register')} className="bg-[#263A31] hover:bg-[#1B2822] text-white px-4 py-1.5 rounded-xl text-xs font-semibold transition shadow-md border border-[#4E7061]">
                        Sign up for free
                    </button>
                </div>
            )}

            {/* Zone principale des messages avec le nouveau style de scrollbar */}
            <div className="flex-1 custom-chat-scrollbar px-4 py-8 space-y-6 max-w-4xl mx-auto w-full">
                {messages.length === 0 ? (
                    <div className="text-center my-24 space-y-4">
                        <div className="w-16 h-16 bg-[#344E41] border border-[#5F8775] rounded-2xl mx-auto flex items-center justify-center shadow-lg text-[#E1EBE6]">
                            <Scale size={28} />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-white">
                            Qu'est-ce qui vous intéresse aujourd'hui ?
                        </h1>
                        <p className="text-xs text-[#CBDCD4] max-w-md mx-auto leading-relaxed">
                            Posez vos questions juridiques ou demandez de générer des contrats avec l'assistance de LegalGPT.
                        </p>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <div key={index} className={`flex gap-3.5 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.type === 'bot' && (
                                <div className="w-8 h-8 rounded-xl bg-[#263A31] border border-[#4E7061] flex items-center justify-center shrink-0 shadow-md text-white">
                                    <Bot size={16} />
                                </div>
                            )}
                            <div 
                                dir="auto"
                                className={`max-w-3xl rounded-2xl p-5 text-xs sm:text-sm leading-relaxed relative border transition-all shadow-sm ${
                                    msg.type === 'user' 
                                        ? 'bg-[#263A31] text-white rounded-br-xs font-medium border-[#4E7061] shadow-md' 
                                        : 'bg-[#344E41] border-[#5F8775]/60 text-[#F3F7F5] rounded-bl-xs w-full shadow-lg hover:border-[#5F8775]'
                                }`}
                            >
                                {msg.type === 'bot' && msg.chatId && (
                                    <button 
                                        onClick={() => handleToggleFavorite(msg.chatId)}
                                        className="absolute top-4 right-4 text-[#CBDCD4] hover:text-amber-400 transition flex items-center gap-1.5 text-[11px] bg-[#2A3F34] px-2.5 py-1 rounded-lg border border-[#4E7061] shadow-xs font-medium cursor-pointer"
                                        title="Ajouter aux favoris"
                                    >
                                        <Star size={13} className="text-amber-400 fill-amber-400" />
                                        <span>Favoris</span>
                                    </button>
                                )}

                                {msg.type === 'bot' ? (
                                    <div className="space-y-3 leading-relaxed break-words pr-16">
                                        <ReactMarkdown
                                            components={{
                                                h1: ({node, ...props}) => <h1 className="text-base font-bold text-white mt-4 mb-2 border-b border-[#5F8775]/50 pb-1" {...props} />,
                                                h2: ({node, ...props}) => <h2 className="text-sm font-bold text-white mt-3 mb-2" {...props} />,
                                                h3: ({node, ...props}) => <h3 className="text-xs font-bold text-[#E1EBE6] mt-3 mb-1" {...props} />,
                                                ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1.5 my-2 text-[#F3F7F5]" {...props} />,
                                                ol: ({node, ...props}) => <ol className="list-decimal pl-5 space-y-1.5 my-2 text-[#F3F7F5]" {...props} />,
                                                li: ({node, ...props}) => <li className="text-[#F3F7F5] leading-relaxed" {...props} />,
                                                p: ({node, ...props}) => <p className="text-[#F3F7F5] mb-2.5 leading-relaxed" {...props} />,
                                                strong: ({node, ...props}) => <strong className="font-bold text-white underline decoration-[#5F8775] underline-offset-2" {...props} />,
                                                hr: ({node, ...props}) => <hr className="border-[#5F8775]/50 my-3" {...props} />
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>
                                ) : (
                                    <div className="whitespace-pre-wrap text-white">{msg.content}</div>
                                )}

                                {msg.sources && msg.sources.length > 0 && (
                                    <div className="mt-5 pt-3.5 border-t border-[#5F8775]/50" dir="auto">
                                        <div className="flex items-center gap-2 mb-2.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#82A895] animate-pulse"></span>
                                            <p className="text-[11px] font-bold tracking-wide text-[#A2C4B3] uppercase">
                                                Sources juridiques :
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {msg.sources.map((src, sIdx) => (
                                                <span key={sIdx} className="text-[11px] bg-[#2A3F34] text-[#F3F7F5] px-3 py-1.5 rounded-xl border border-[#5F8775]/60 shadow-xs flex items-center gap-1.5 font-medium">
                                                    <span>📄</span> 
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
                    <div className="flex gap-3.5 justify-start">
                        <div className="w-8 h-8 rounded-xl bg-[#263A31] border border-[#4E7061] flex items-center justify-center shrink-0 shadow-md text-white">
                            <Bot size={16} />
                        </div>
                        <div className="bg-[#EBE9E4] border border-[#5F8775] px-4 py-3 rounded-2xl text-[#4D6658] text-xs shadow-md flex items-center gap-2.5">
                            <Loader2 size={14} className="animate-spin text-[#82A895]" />
                            <span className="font-medium">En cours de traitement...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Barre de saisie (Prompt) moderne et élégante */}
            <div className="p-4 bg-[#3D5A4C] border-t border-[#4E7061]">
                <form onSubmit={handleSend} className="max-w-3xl mx-auto bg-[#344E41] border border-[#5F8775] hover:border-white/60 focus-within:border-white rounded-2xl p-3 shadow-xl transition-all">
                    <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Posez une question ou demandez de générer des contrats..."
                        rows="2"
                        dir="auto"
                        className="w-full bg-transparent text-[#F3F7F5] placeholder-[#A2BDB0] focus:outline-none resize-none text-xs sm:text-sm leading-relaxed"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend(e);
                            }
                        }}
                    />
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-[#5F8775]/40">
                        <span className="text-[11px] text-[#A2BDB0]">Appuyez sur Entrée pour envoyer</span>
                        <button 
                            type="submit" 
                            disabled={loading || !prompt.trim()} 
                            className="bg-[#263A31] hover:bg-[#1B2822] disabled:opacity-40 text-white px-4 py-2 rounded-xl transition font-semibold text-xs shadow-md flex items-center gap-1.5 cursor-pointer border border-[#4E7061]"
                        >
                            <span>Envoyer</span>
                            <Send size={13} />
                        </button>
                    </div>
                </form>
            </div>

            {/* Modal de Connexion */}
            {showLoginModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-[#344E41] border border-[#5F8775] text-[#F3F7F5] w-full max-w-sm rounded-3xl p-6 relative shadow-2xl text-center" dir="auto">
                        <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-[#A2BDB0] hover:text-white font-bold cursor-pointer">✕</button>
                        <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-2xl mx-auto flex items-center justify-center mb-4 text-white">
                            <Lock size={20} />
                        </div>
                        <h2 className="text-base font-bold mb-2 text-white">Connexion requise</h2>
                        <p className="text-xs text-[#CBDCD4] mb-6 leading-relaxed">
                            المرجو تسجيل الدخول أو إنشاء حساب جديد لمتابعة إرسال الأسئلة واستفادة من الميزات الكاملة.
                        </p>
                        <div className="flex gap-2.5">
                            <button onClick={() => navigate('/login')} className="flex-1 bg-[#2A3F34] hover:bg-[#324B3E] text-white py-2.5 rounded-xl font-semibold text-xs transition border border-[#5F8775] cursor-pointer">
                                Log in
                            </button>
                            <button onClick={() => navigate('/register')} className="flex-1 bg-[#263A31] hover:bg-[#1B2822] text-white py-2.5 rounded-xl font-semibold text-xs transition shadow-md border border-[#4E7061] cursor-pointer">
                                Sign up
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}