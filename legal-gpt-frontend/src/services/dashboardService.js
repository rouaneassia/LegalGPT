import API from "./api";

export const getDashboardStats = () => {
    return API.get("/admin/dashboard");
};