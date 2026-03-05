import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { ADMIN_REGISTRY } from "../pages/Admin/auth";

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
    const [adminUser, setAdminUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Check for existing session (Simulated)
    useEffect(() => {
        const session = localStorage.getItem("admin_session");
        if (session) {
            setIsAdminAuthenticated(true);
            setAdminUser(JSON.parse(session));
        }
    }, []);

    const loginAdmin = (username, password) => {
        // Use Dedicated Authorization Registry
        if (username === ADMIN_REGISTRY.credentials.username && password === ADMIN_REGISTRY.credentials.password) {
            const user = ADMIN_REGISTRY.users[0];
            localStorage.setItem("admin_session", JSON.stringify(user));
            setIsAdminAuthenticated(true);
            setAdminUser(user);

            // Redirect to dashboard or previous location
            const origin = location.state?.from?.pathname || "/admin/dashboard";
            navigate(origin);
            return true;
        }
        return false;
    };

    const logoutAdmin = () => {
        localStorage.removeItem("admin_session");
        setIsAdminAuthenticated(false);
        setAdminUser(null);
        navigate("/admin/login");
    };

    return (
        <AdminAuthContext.Provider value={{ isAdminAuthenticated, adminUser, loginAdmin, logoutAdmin }}>
            {children}
        </AdminAuthContext.Provider>
    );
};

// Auth Guard Component
export const AdminGuard = ({ children }) => {
    const { isAdminAuthenticated } = useContext(AdminAuthContext);
    const location = useLocation();

    if (!isAdminAuthenticated) {
        // Redirect to admin login gateway, saving the attempted location
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    return children;
};

export const useAdminAuth = () => useContext(AdminAuthContext);
