export default function StatCard({
    title,
    value,
    icon,
    color,
}) {

    const Icon = icon;

    return (
        <div className="bg-white rounded-xl shadow p-6 flex justify-between items-center">

            <div>

                <p className="text-gray-500 text-sm">
                    {title}
                </p>

                <h2 className="text-3xl font-bold mt-2">
                    {value}
                </h2>

            </div>

            <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center ${color}`}
            >
                <Icon
                    size={28}
                    className="text-white"
                />
            </div>

        </div>
    );
}