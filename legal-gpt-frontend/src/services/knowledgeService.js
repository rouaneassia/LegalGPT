import API from "./api";

// جلب جميع المقالات القانونية
export const getKnowledge = () => {
    return API.get("/admin/knowledge");
};

// إضافة مقال جديد
export const createKnowledge = (data) => {
    return API.post("/admin/knowledge", data);
};

// تعديل مقال
export const updateKnowledge = (id, data) => {
    return API.put(`/admin/knowledge/${id}`, data);
};

// حذف مقال
export const deleteKnowledge = (id) => {
    return API.delete(`/admin/knowledge/${id}`);
};