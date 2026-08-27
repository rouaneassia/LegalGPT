export default function WelcomeCard() {

    const today = new Date().toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    return (
        <div className="bg-white rounded-xl shadow p-6 mb-8">

            <div className="flex justify-between items-center">

                <div>

                    <h1 className="text-3xl font-bold">
                        👋 Welcome back
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Manage your LegalGPT platform from here.
                    </p>

                </div>

                <div className="text-right">

                    <p className="text-gray-500">
                        Today
                    </p>

                    <h2 className="font-semibold">
                        {today}
                    </h2>

                </div>

            </div>

        </div>
    );
}