import { NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    BookOpen,
    Folder,
    FileText,
    FileStack,
    ClipboardList,
    Bot,
    MessageSquare,
    FileOutput,
    Users,
    Sparkles,
    LogOut,
} from "lucide-react";
import API from "../../services/api";

const menuItems = [
    { title: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { title: "Knowledge Base", icon: BookOpen, path: "/admin/knowledge" },
    { title: "Sources", icon: FileText, path: "/admin/sources" },
    { title: "Categories", icon: Folder, path: "/admin/categories" },
    { title: "Templates", icon: FileText, path: "/admin/templates" },
    { title: "Template Sections", icon: FileStack, path: "/admin/template-sections" },
    { title: "Instructions", icon: ClipboardList, path: "/admin/instructions" },
    { title: "Prompt Manager", icon: Bot, path: "/admin/prompts" },
    { title: "Chats", icon: MessageSquare, path: "/admin/chats" },
    { title: "Generated Documents", icon: FileOutput, path: "/admin/documents" },
    { title: "Users", icon: Users, path: "/admin/users" },
];

export default function Sidebar() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await API.post("/logout");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login");
        }
    };

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-[#3D5A4C] text-emerald-100 flex flex-col select-none z-50 shadow-xl">
            <div className="p-4 border-b border-[#4D6658]">
                <div className="flex items-center justify-center">
                    <div className="w-12 h-12 rounded-xl bg-[#31483D] flex items-center justify-center text-white shadow-inner border border-[#4D6658]/60">
                        <Sparkles size={26} className="text-[#EBE9E4]" />
                    </div>
                </div>
            </div>

            <nav className="flex-1 py-3 space-y-0.5 overflow-y-auto custom-scrollbar">
                {menuItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === "/admin"}
                            className={({ isActive }) =>
                                `relative flex items-center gap-3 px-5 py-2.5 transition-all duration-300 group ${
                                    isActive
                                        ? "bg-[#EBE9E4] text-slate-900 font-semibold rounded-l-full shadow-md ml-2.5 before:absolute before:-top-4 before:right-0 before:w-4 before:h-4 before:bg-transparent before:rounded-br-full before:shadow-[0_8px_0_0_#EBE9E4] after:absolute after:-bottom-4 after:right-0 after:w-4 after:h-4 after:bg-transparent after:rounded-tr-full after:shadow-[0_-8px_0_0_#EBE9E4]"
                                        : "hover:bg-[#4D6658]/40 text-emerald-100/80 hover:text-white"
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <div
                                        className={`p-1.5 rounded-lg transition-transform duration-300 ${
                                            isActive
                                                ? "bg-[#3D5A4C] text-white shadow-sm scale-105"
                                                : "group-hover:scale-110 text-emerald-300"
                                        }`}
                                    >
                                        <Icon size={18} />
                                    </div>
                                    <span className="text-xs tracking-wide truncate">
                                        {item.title}
                                    </span>
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            <div className="p-3 border-t border-[#4D6658]">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-5 py-2.5 rounded-xl text-red-200 hover:bg-red-500/20 hover:text-white transition-all duration-300 group"
                >
                    <div className="p-1.5 rounded-lg bg-red-500/20 text-red-300 group-hover:scale-110 group-hover:bg-red-500 group-hover:text-white transition-all duration-300">
                        <LogOut size={18} />
                    </div>
                    <span className="text-xs font-semibold tracking-wide truncate">
                        Logout
                    </span>
                </button>
            </div>
        </aside>
    );
}
