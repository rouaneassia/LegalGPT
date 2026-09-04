import { BrowserRouter, Routes, Route } from "react-router-dom";

import AdminLayout from "../layouts/AdminLayout";
import UserLayout from "../layouts/UserLayout";
import ProtectedRoute from "./ProtectedRoute";

import Login from "../pages/auth/Login";
import AdminLogin from "../pages/auth/AdminLogin";
import Register from "../pages/auth/Register";

import Dashboard from "../pages/admin/Dashboard";
import Knowledge from "../pages/admin/Knowledge";
import Categories from "../pages/admin/Categories";
import Templates from "../pages/admin/Templates";
import TemplateSections from "../pages/admin/TemplateSections";
import Instructions from "../pages/admin/Instructions";
import Prompts from "../pages/admin/Prompts";
import Users from "../pages/admin/Users";
import Sources from "../pages/admin/Sources";
import AdminChats from "../pages/admin/AdminChats";
import GeneratedDocuments from "../pages/admin/GeneratedDocuments";

import Chat from "../pages/user/ChatHome";
import UserDocuments from "../pages/user/UserDocuments";
import UserFavorites from "../pages/user/UserFavorites";
import UserFolders from "../pages/user/UserFolders";
import FolderView from "../pages/user/FolderView";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Auth */}
                <Route path="/login" element={<Login />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/register" element={<Register />} />

                {/* User & Public Chat (ChatGPT Style) */}
                <Route path="/" element={<UserLayout />}>
                    <Route index element={<Chat />} />
                    <Route path="chat" element={<Chat />} />
                    <Route path="chat/:chatId" element={<Chat />} />
                    
                    {/* User Documents, Favorites & Folders */}
                    <Route path="documents" element={<UserDocuments />} />
                    <Route path="favorites" element={<UserFavorites />} />
                    <Route path="folders" element={<UserFolders />} />
                    <Route path="folder/:folderId" element={<FolderView />} />
                    <Route path="user/favorites" element={<UserFavorites />} />
                    <Route path="user/folders" element={<UserFolders />} />
                </Route>

                {/* Admin Panel (Protected) */}
                <Route element={<ProtectedRoute allowedRole="admin" />}>
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="knowledge" element={<Knowledge />} />
                        <Route path="categories" element={<Categories />} />
                        <Route path="templates" element={<Templates />} />
                        <Route path="template-sections" element={<TemplateSections />} />
                        <Route path="instructions" element={<Instructions />} />
                        <Route path="prompts" element={<Prompts />} />
                        <Route path="sources" element={<Sources />} />
                        <Route path="users" element={<Users />} />
                        <Route path="chats" element={<AdminChats />} />
                        <Route path="documents" element={<GeneratedDocuments />} />
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}