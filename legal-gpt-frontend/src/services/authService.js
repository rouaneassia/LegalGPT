import API from "./api";

export const register = (data) => {
    return API.post("/register", data);
};

export const login = (data) => {
    return API.post("/login", data);
};

export const adminLogin = (data) => {
    return API.post("/admin/login", data);
};

export const logout = (token) => {
    return API.post(
        "/logout",
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
};