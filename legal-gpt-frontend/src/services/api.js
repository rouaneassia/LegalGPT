import axios from "axios";

const API = axios.create({
    baseURL: "http://127.0.0.1:8000/api",
    timeout: 60000, // 60 ثانية (عوض ما يقطع بسرعة)
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
});

// إرسال الـ Token تلقائياً مع كل Request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;