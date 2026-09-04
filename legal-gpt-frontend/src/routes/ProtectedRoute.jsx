import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute({ allowedRole }) {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    
    // Ila kan ma-m-connectich ga3, sifo3 l /login
    if (!token) {
        return <Navigate to={allowedRole === 'admin' ? '/admin/login' : '/login'} replace />;
    }

    if (allowedRole) {
        try {
            const user = userString ? JSON.parse(userString) : null;
            // Ila kan l-role makhlafch l-role li m-tlobo, rj3o l blasa m-nasba (ila kan user w bgha y-dkhol admin sifo3 l /chat)
            if (!user || user.role !== allowedRole) {
                return <Navigate to={allowedRole === 'admin' ? '/admin/login' : '/chat'} replace />;
            }
        } catch (e) {
            console.error("Error parsing user from localStorage", e);
            return <Navigate to={allowedRole === 'admin' ? '/admin/login' : '/login'} replace />;
        }
    }

    return <Outlet />;
}