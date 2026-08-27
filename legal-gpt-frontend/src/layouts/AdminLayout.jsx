import { Outlet } from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

export default function AdminLayout() {
    return (
        <div className="flex">

            <Sidebar />

            <div className="flex-1 flex flex-col">

                <Navbar />

                <main className="flex-1 p-6 bg-gray-100">
                    <Outlet />
                </main>

                <Footer />

            </div>

        </div>
    );
}