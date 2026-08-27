import { NavLink } from "react-router-dom";
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
    Star,
    FolderOpen,
    Users,
 
    
} from "lucide-react";

const menuItems = [
    {
        title: "Dashboard",
        icon: LayoutDashboard,
        path: "/admin",
    },
    {
        title: "Knowledge Base",
        icon: BookOpen,
        path: "/admin/knowledge",
    },
     {
        title: "Sources",
        icon: FileText,
        path: "/admin/sources",
    },
    {
        title: "Categories",
        icon: Folder,
        path: "/admin/categories",
    },
    {
        title: "Templates",
        icon: FileText,
        path: "/admin/templates",
    },
    {
        title: "Template Sections",
        icon: FileStack,
        path: "/admin/template-sections",
    },
    {
        title: "Instructions",
        icon: ClipboardList,
        path: "/admin/instructions",
    },
    {
        title: "Prompt Manager",
        icon: Bot,
        path: "/admin/prompts",
    },
    {
        title: "Chats",
        icon: MessageSquare,
        path: "/admin/chats",
    },
    {
        title: "Generated Documents",
        icon: FileOutput,
        path: "/admin/documents",
    },
    {
        title: "Favorites",
        icon: Star,
        path: "/admin/favorites",
    },
    {
        title: "Folders",
        icon: FolderOpen,
        path: "/admin/folders",
    },
    {
        title: "Users",
        icon: Users,
        path: "/admin/users",
    },
    
];

export default function Sidebar() {
    return (
        <aside className="w-72 min-h-screen bg-slate-900 text-white">

            <div className="p-6 border-b border-slate-700">
                <h1 className="text-2xl font-bold">
                    LegalGPT
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                    Admin Panel
                </p>
            </div>

            <nav className="mt-4">

                {menuItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-6 py-3 transition ${
                                    isActive
                                        ? "bg-blue-600"
                                        : "hover:bg-slate-800"
                                }`
                            }
                        >
                            <Icon size={20} />
                            <span>{item.title}</span>
                        </NavLink>
                    );
                })}

            </nav>

        </aside>
    );
}