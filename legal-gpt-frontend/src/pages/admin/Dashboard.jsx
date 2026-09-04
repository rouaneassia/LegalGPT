import { useEffect, useMemo, useState } from "react";
import {
    Users,
    BookOpen,
    MessageSquare,
    FileText,
    ShieldCheck,
    TrendingUp,
    Sparkles,
    Search,
    Bell,
    Settings2,
    ArrowUpRight,
    Filter
} from "lucide-react";
import { getDashboardStats } from "../../services/dashboardService";

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState([
        { id: 1, title: "Nouvelle demande de document", time: "Il y a 2 min", unread: true },
        { id: 2, title: "Contrat vérifié par l’équipe", time: "Il y a 15 min", unread: true },
        { id: 3, title: "Mise à jour du moteur IA", time: "Hier", unread: false },
    ]);
    const [stats, setStats] = useState({
        users: 0,
        knowledge: 0,
        chats: 0,
        documents: 0,
        resolutionRate: 99.1,
        activePrompts: 12450,
        monthlyVolume: 5120,
        barData: [35, 65, 40, 85, 55],
        chartPoints: [40, 25, 60, 30, 85, 45, 95, 70, 80, 60, 90, 75],
        recentActivity: [],
        adminProfile: {
            name: "LegalGPT Admin",
            email: "admin@legalgpt.com",
            templates: 42,
            sources: 128,
            chats: "5.1k",
        }
    });

    useEffect(() => {
        loadDashboard();
    }, []);

    const documentLibrary = useMemo(() => [
        { id: 1, title: "Contrat de travail CDI", type: "Document" },
        { id: 2, title: "Statuts SARL", type: "Document" },
        { id: 3, title: "Lettre de mise en demeure", type: "Document" },
        { id: 4, title: "Convention de partenariat", type: "Document" },
        { id: 5, title: "Consultation Code du Travail", type: "Chat" },
        { id: 6, title: "Rédaction clause de confidentialité", type: "Chat" },
    ], []);

    const searchResults = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();

        if (!term) {
            return [];
        }

        const chatMatches = (stats.recentActivity || []).filter((item) =>
            item.title?.toLowerCase().includes(term)
        );

        const docMatches = documentLibrary.filter((item) =>
            item.title.toLowerCase().includes(term) || item.type.toLowerCase().includes(term)
        );

        return [...chatMatches.map((item) => ({
            id: item.id,
            title: item.title,
            type: 'Chat',
            meta: item.time,
        })), ...docMatches.map((item) => ({
            id: item.id,
            title: item.title,
            type: item.type,
            meta: item.type === 'Document' ? 'Legal document' : 'Conversation',
        }))];
    }, [documentLibrary, searchTerm, stats.recentActivity]);

    const loadDashboard = async () => {
        setLoading(true);
        try {
            const response = await getDashboardStats();
            const data = response.data || {};

            setStats((prev) => ({
                ...prev,
                users: data.users ?? 7,
                knowledge: data.knowledge ?? 0,
                chats: data.chats ?? 0,
                documents: data.documents ?? 890,
                resolutionRate: data.resolutionRate ?? 99.1,
                monthlyVolume: data.monthlyVolume ?? 5120,
                recentActivity: Array.isArray(data.recentActivity) && data.recentActivity.length > 0
                    ? data.recentActivity
                    : [
                        { id: 1, title: "Contrat de travail CDI", time: "Aujourd'hui, 14:34", status: "+12.4%", isPositive: true },
                        { id: 2, title: "Statuts SARL", time: "Aujourd'hui, 15:23", status: "-2.1%", isPositive: false },
                        { id: 3, title: "Consultation Code du Travail", time: "Aujourd'hui, 17:54", status: "+5.8%", isPositive: true },
                    ]
            }));
        } catch (error) {
            console.error("Erreur de chargement des statistiques:", error);
            setStats((prev) => ({
                ...prev,
                users: 7,
                knowledge: 0,
                chats: 0,
                documents: 890,
                recentActivity: [
                    { id: 1, title: "Contrat de travail CDI", time: "Aujourd'hui, 14:34", status: "+12.4%", isPositive: true },
                    { id: 2, title: "Statuts SARL", time: "Aujourd'hui, 15:23", status: "-2.1%", isPositive: false },
                    { id: 3, title: "Consultation Code du Travail", time: "Aujourd'hui, 17:54", status: "+5.8%", isPositive: true },
                ]
            }));
        } finally {
            setLoading(false);
        }
    };

    const generateSvgPath = (points, width = 500, height = 100) => {
        if (!points || points.length === 0) return "";
        const max = Math.max(...points, 1);
        const min = Math.min(...points, 0);
        const step = width / (points.length - 1);

        const coords = points.map((val, i) => {
            const x = i * step;
            const y = height - ((val - min) / (max - min || 1)) * (height - 15) - 5;
            return { x, y };
        });

        let path = `M ${coords[0].x},${coords[0].y}`;
        for (let i = 0; i < coords.length - 1; i++) {
            const curr = coords[i];
            const next = coords[i + 1];
            const mx = (curr.x + next.x) / 2;
            const my = (curr.y + next.y) / 2;
            path += ` Q ${curr.x},${curr.y} ${mx},${my}`;
        }
        path += ` T ${coords[coords.length - 1].x},${coords[coords.length - 1].y}`;
        return path;
    };

    const svgLinePath = generateSvgPath(stats.chartPoints, 500, 80);
    const svgAreaPath = `${svgLinePath} L 500,100 L 0,100 Z`;
    const unreadNotifications = notifications.filter((item) => item.unread).length;

    const markNotificationsAsRead = () => {
        setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })));
    };

    return (
        <div className="min-h-screen bg-[#EBE9E4] text-slate-800 p-4 md:p-6 font-sans space-y-5">
            <div className="rounded-3xl border border-slate-200   backdrop-blur-sm p-4 md:p-5">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                        {/* Vous pouvez ajouter un titre ou laisser vide si vous voulez garder juste les contrôles à droite */}
                    </div>

                    {/* Contrôles à droite : Recherche compacte, Messages et Notifications */}
                    <div className="flex items-center gap-3 ml-auto">
                        <div className="relative flex items-center  rounded-full border border-green-900 bg-transparent shadow-none overflow-hidden px-4 py-2 w-72">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Search..."
                                className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                            />
                            <button
                                type="button"
                                className="h-8 w-8 rounded-full bg-[#1f1f1f] flex items-center justify-center text-white shadow-md hover:bg-[#111827] transition ml-2 flex-shrink-0"
                                aria-label="Search"
                            >
                                <Search className="h-4 w-4" />
                            </button>
                        </div>

                        <button
                            type="button"
                            className="relative h-11 w-11 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-700 shadow-sm hover:bg-slate-50 transition"
                            aria-label="Messages"
                        >
                            <MessageSquare className="h-4 w-4" />
                            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border border-white" />
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setNotificationsOpen((prev) => !prev);
                                markNotificationsAsRead();
                            }}
                            className="relative h-11 w-11 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-700 shadow-sm hover:bg-slate-50 transition"
                            aria-label="Notifications"
                        >
                            <Bell className="h-4 w-4" />
                            {unreadNotifications > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-[10px] font-semibold text-white flex items-center justify-center border-2 border-white">
                                    {unreadNotifications > 9 ? "9+" : unreadNotifications}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {notificationsOpen && (
                    <div className="relative mt-4">
                        <div className="absolute right-0 top-0 z-10 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg">
                            <div className="mb-2 flex items-center justify-between">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Notifications</p>
                                <span className="text-[10px] text-slate-500">{unreadNotifications} new</span>
                            </div>
                            <div className="space-y-2">
                                {notifications.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`rounded-xl border p-2 ${
                                            item.unread ? "border-emerald-200 bg-emerald-50/60" : "border-slate-200 bg-slate-50"
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold text-slate-800">{item.title}</p>
                                                <p className="mt-0.5 text-[10px] text-slate-500">{item.time}</p>
                                            </div>
                                            {item.unread && <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {searchTerm && (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Search results</p>
                            <span className="text-[11px] text-slate-500">{searchResults.length} result(s)</span>
                        </div>

                        {searchResults.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                {searchResults.slice(0, 6).map((item) => (
                                    <button
                                        key={`${item.type}-${item.id}`}
                                        type="button"
                                        className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:border-[#4D6658] hover:shadow-md"
                                    >
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{item.type}</p>
                                            <p className="mt-1 truncate text-sm font-semibold text-slate-800">{item.title}</p>
                                            <p className="mt-1 text-[11px] text-slate-500">{item.meta}</p>
                                        </div>
                                        <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:text-[#4D6658]" />
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-xl border border-dashed border-slate-300  p-4 text-sm text-slate-500">
                                No result found for “{searchTerm}”. Try another keyword.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* SECTION 1: Top 4 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between border border-black/5 transition-all hover:shadow">
                    <div>
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block mb-0.5">Total Users</span>
                        <h3 className="text-xl font-bold text-slate-900">{stats.users}</h3>
                    </div>
                    <div className="flex items-end gap-1 h-8 px-2">
                        {stats.barData.map((val, i) => (
                            <div
                                key={i}
                                className={`w-1.5 rounded-full transition-all duration-500 ${
                                    i === 3 ? "bg-[#3D5A4C]" : "bg-emerald-100"
                                }`}
                                style={{ height: `${val}%` }}
                            />
                        ))}
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between border border-black/5 transition-all hover:shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#E5ECE7] flex items-center justify-center text-[#3D5A4C]">
                            <BookOpen size={18} />
                        </div>
                        <div>
                            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block">Knowledge</span>
                            <h3 className="text-xl font-bold text-slate-900">{stats.knowledge}</h3>
                        </div>
                    </div>
                    <svg className="w-12 h-6 text-[#3D5A4C] stroke-current fill-none stroke-2" viewBox="0 0 60 30">
                        <path d="M 0 20 Q 15 25 30 10 T 60 5" />
                    </svg>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-3 border border-black/5 transition-all hover:shadow">
                    <div className="w-10 h-10 rounded-xl bg-[#F5EFE6] flex items-center justify-center text-[#A68A68]">
                        <MessageSquare size={18} />
                    </div>
                    <div>
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block">AI Chats</span>
                        <h3 className="text-xl font-bold text-slate-900">{stats.chats}</h3>
                    </div>
                </div>

                <div className="bg-[#4D6658] text-white p-4 rounded-2xl shadow-sm flex items-center justify-between relative overflow-hidden">
                    <div className="z-10">
                        <span className="text-[11px] font-medium text-emerald-100/80 uppercase tracking-wide block mb-0.5">System Activity</span>
                        <h3 className="text-xl font-bold">98.4%</h3>
                    </div>
                    <svg className="w-20 h-10 text-white/90 stroke-current fill-none stroke-[2.5] z-10" viewBox="0 0 100 40">
                        <path d="M 0 30 C 20 10, 40 35, 60 15 S 80 25, 100 10" />
                    </svg>
                </div>
            </div>

            {/* SECTION 2: Middle Analytics & Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-6 bg-white p-5 rounded-2xl shadow-sm border border-black/5 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-slate-900">Platform Analytics</h3>
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Optimal
                                </span>
                            </div>
                            <select className="text-[11px] font-medium text-slate-500 bg-transparent outline-none cursor-pointer">
                                <option>Monthly</option>
                                <option>Weekly</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <span className="text-[11px] text-slate-400 font-medium block mb-0.5">Active Prompts</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-base font-bold text-slate-900">12,450</span>
                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                        <TrendingUp size={10} /> +34%
                                    </span>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <span className="text-[11px] text-slate-400 font-medium block mb-0.5">Success Rate</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-base font-bold text-emerald-600">{stats.resolutionRate}%</span>
                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                        <TrendingUp size={10} /> +2.45%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="h-24 w-full relative">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 500 100" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#4D6658" stopOpacity="0.15" />
                                    <stop offset="100%" stopColor="#4D6658" stopOpacity="0.0" />
                                </linearGradient>
                            </defs>
                            <path d={svgAreaPath} fill="url(#chartGradient)" />
                            <path d={svgLinePath} fill="none" stroke="#4D6658" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                    </div>
                </div>

                <div className="lg:col-span-3 bg-white p-5 rounded-2xl shadow-sm border border-black/5 flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900">AI Performance</h3>
                        <span className="text-[11px] text-slate-400 font-medium block">Global Precision Rate</span>
                        <h4 className="text-xl font-bold text-slate-900 mt-1">{stats.resolutionRate}%</h4>
                    </div>

                    <div className="flex flex-col items-center justify-center my-2 relative">
                        <svg className="w-36 h-20" viewBox="0 0 100 50">
                            <path
                                d="M 10 50 A 40 40 0 0 1 90 50"
                                fill="none"
                                stroke="#E5ECE7"
                                strokeWidth="10"
                                strokeLinecap="round"
                            />
                            <path
                                d="M 10 50 A 40 40 0 0 1 90 50"
                                fill="none"
                                stroke="#4D6658"
                                strokeWidth="10"
                                strokeLinecap="round"
                                strokeDasharray="126"
                                strokeDashoffset={126 - (126 * stats.resolutionRate) / 100}
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <span className="text-lg font-bold text-slate-900 -mt-6">{stats.resolutionRate}%</span>
                    </div>

                    <p className="text-[10px] text-slate-400 text-center">Legal accuracy optimal</p>
                </div>

                <div className="lg:col-span-3 bg-white p-5 rounded-2xl shadow-sm border border-black/5 flex flex-col items-center text-center justify-between">
                    <div className="w-14 h-14 rounded-full bg-[#F5EFE6] flex items-center justify-center text-2xl shadow-inner border border-white">
                        👨‍💻
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900">{stats.adminProfile.name}</h3>
                        <p className="text-[10px] text-slate-400">{stats.adminProfile.email}</p>
                    </div>

                    <div className="grid grid-cols-3 w-full gap-1 my-2 py-2 border-t border-b border-slate-100 text-center">
                        <div>
                            <span className="text-[9px] text-slate-400 block">Templates</span>
                            <span className="text-xs font-bold text-slate-800">{stats.adminProfile.templates}</span>
                        </div>
                        <div>
                            <span className="text-[9px] text-slate-400 block">Sources</span>
                            <span className="text-xs font-bold text-slate-800">{stats.adminProfile.sources}</span>
                        </div>
                        <div>
                            <span className="text-[9px] text-slate-400 block">Chats</span>
                            <span className="text-xs font-bold text-slate-800">{stats.adminProfile.chats}</span>
                        </div>
                    </div>

                    <button className="w-full bg-[#4D6658] text-white py-1.5 rounded-xl text-[11px] font-bold hover:bg-[#3D5A4C] transition">
                        System Settings
                    </button>
                </div>
            </div>

            {/* SECTION 3: Bottom Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-black/5 flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 mb-1">Generated Documents</h3>
                        <p className="text-[11px] text-slate-400 mb-3">Total legal documents compiled securely.</p>
                        <div className="flex items-center gap-3 bg-emerald-50/60 p-2.5 rounded-xl mb-3">
                            <FileText className="text-emerald-700" size={18} />
                            <div>
                                <span className="text-[9px] text-slate-500 block uppercase font-bold">Total Files</span>
                                <span className="font-bold text-slate-900 text-xs">{stats.documents} Documents</span>
                            </div>
                        </div>
                    </div>
                    <button className="w-full bg-[#4D6658] text-white py-2 rounded-xl text-[11px] font-bold hover:bg-[#3D5A4C] transition">
                        View All Documents
                    </button>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-black/5 flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 mb-2">Recent AI Chats</h3>
                        <div className="space-y-2">
                            {stats.recentActivity?.slice(0, 3).map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                                    <div>
                                        <h4 className="text-[11px] font-bold text-slate-800 truncate max-w-[120px]">{item.title}</h4>
                                        <span className="text-[9px] text-slate-400 block">{item.time}</span>
                                    </div>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                                        item.isPositive ? "text-emerald-700 bg-emerald-50" : "text-amber-700 bg-amber-50"
                                    }`}>
                                        {item.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-black/5 flex flex-col items-center text-center justify-between">
                    <div className="w-10 h-10 rounded-full bg-[#E5ECE7] flex items-center justify-center text-[#4D6658]">
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-slate-900">Keep platform safe!</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">Manage encryption rules.</p>
                    </div>
                    <button className="w-full bg-[#4D6658] text-white py-2 rounded-xl text-[11px] font-bold hover:bg-[#3D5A4C] transition">
                        Security Settings
                    </button>
                </div>

                <div className="bg-[#3D5A4C] text-white p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mb-2">
                            <Sparkles size={16} />
                        </div>
                        <h3 className="text-xs font-bold mb-0.5">AI Assistant Pro</h3>
                        <p className="text-[10px] text-emerald-100/80">Running on latest legal updates.</p>
                    </div>
                    <span className="text-[9px] font-semibold bg-white/20 px-2 py-0.5 rounded-md w-fit">
                        Status: Active
                    </span>
                </div>
            </div>
        </div>
    );
}