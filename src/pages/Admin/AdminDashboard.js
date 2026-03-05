import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
    const navigate = useNavigate();

    useEffect(() => {
        navigate("/admin/dashboard");
    }, [navigate]);

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
            <p>Redirecting to Farm Management Portal...</p>
        </div>
    );
};

export default AdminDashboard;
