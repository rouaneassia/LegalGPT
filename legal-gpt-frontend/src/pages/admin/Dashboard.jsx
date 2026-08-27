import { useEffect, useState } from "react";
import {
    Users,
    BookOpen,
    MessageSquare,
    FileText,
} from "lucide-react";

import WelcomeCard from "../../components/dashboard/WelcomeCard";
import StatCard from "../../components/dashboard/StatCard";
import { getDashboardStats } from "../../services/dashboardService";

export default function Dashboard() {

    const [stats, setStats] = useState({
        users: 0,
        knowledge: 0,
        chats: 0,
        documents: 0,
    });

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const response = await getDashboardStats();
            setStats(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>

            <WelcomeCard />

            <h1 className="text-3xl font-bold mb-8">
                Dashboard
            </h1>

            <div className="grid grid-cols-4 gap-6">

                <StatCard
                    title="Users"
                    value={stats.users}
                    icon={Users}
                    color="bg-blue-500"
                />

                <StatCard
                    title="Knowledge"
                    value={stats.knowledge}
                    icon={BookOpen}
                    color="bg-green-500"
                />

                <StatCard
                    title="Chats"
                    value={stats.chats}
                    icon={MessageSquare}
                    color="bg-purple-500"
                />

                <StatCard
                    title="Documents"
                    value={stats.documents}
                    icon={FileText}
                    color="bg-red-500"
                />

            </div>

        </div>
    );
}