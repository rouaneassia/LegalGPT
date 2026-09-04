import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";

export default function AdminLayout() {
    return (
        <div className="min-h-screen bg-[#EBE9E4]">
            <Sidebar />

            <main className="ml-64 min-h-screen bg-[#EBE9E4]">
                <Outlet />
            </main>
        </div>
    );
}