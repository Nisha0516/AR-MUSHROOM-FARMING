import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import "../../styles/AdminStyle.css";

const AdminLayout = ({ children }) => {
    const { logoutAdmin, adminUser } = useAdminAuth();
    const location = useLocation();

    return (
        <div className="admin-portal">
            {/* Sidebar */}
            <div className="admin-sidebar shadow-sm">
                <div className="text-center mb-5 px-3">
                    <h4 style={{ fontWeight: 800, letterSpacing: '1px' }}>FARM MATRIX</h4>
                    <p className="small text-muted mb-0 font-weight-bold text-uppercase" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Farm Management</p>
                </div>

                <nav className="px-2">
                    <Link to="/admin/dashboard" className={`nav-item-admin ${location.pathname === '/admin/dashboard' ? 'active' : ''}`}>
                        <i className="bi bi-speedometer2"></i>
                        Dashboard
                    </Link>
                    <Link to="/admin/orders" className={`nav-item-admin ${location.pathname === '/admin/orders' ? 'active' : ''}`}>
                        <i className="bi bi-cart-check"></i>
                        Order Registry
                    </Link>
                    <Link to="/admin/catalog" className={`nav-item-admin ${location.pathname === '/admin/catalog' ? 'active' : ''}`}>
                        <i className="bi bi-box-seam"></i>
                        Product Catalog
                    </Link>
                    <Link to="/admin/inquiries" className={`nav-item-admin ${location.pathname === '/admin/inquiries' ? 'active' : ''}`}>
                        <i className="bi bi-envelope"></i>
                        Inquiry Inbox
                    </Link>
                    <Link to="/admin/settings" className={`nav-item-admin ${location.pathname === '/admin/settings' ? 'active' : ''}`}>
                        <i className="bi bi-gear"></i>
                        Settings
                    </Link>
                </nav>

                <div className="mt-auto pt-5 px-2" style={{ position: 'absolute', bottom: '2rem', width: '100%', left: 0 }}>
                    <div className="px-3 mb-3">
                        <div className="p-3 bg-white rounded d-flex align-items-center shadow-sm" style={{ borderLeft: '3px solid var(--admin-yellow)' }}>
                            <div className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px', fontWeight: 700 }}>
                                A
                            </div>
                            <div>
                                <p className="mb-0 small font-weight-bold text-dark">{adminUser?.name || 'Admin User'}</p>
                                <p className="mb-0 smaller text-stone" style={{ fontSize: '0.7rem' }}>{adminUser?.role || 'Administrator'}</p>
                            </div>
                        </div>
                    </div>
                    <button onClick={logoutAdmin} className="nav-item-admin border-0 bg-transparent w-100 text-danger font-weight-bold">
                        <i className="bi bi-box-arrow-left"></i>
                        Logout Gateway
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="admin-content">
                <header className="mb-4 d-flex justify-content-between align-items-center">
                    <div>
                        <h3 className="mb-0 font-weight-bold">
                            {location.pathname === '/admin/dashboard' ? 'Operational Overview' :
                                location.pathname === '/admin/orders' ? 'Order Registry' :
                                    location.pathname === '/admin/catalog' ? 'Industrial Catalog' : 
                                    location.pathname === '/admin/inquiries' ? 'Inquiry Inbox' : 'Administrative Settings'}
                        </h3>
                        <p className="text-stone small mb-0">System Status: Operational • Modules: Online</p>
                    </div>
                    <div className="d-flex align-items-center">
                        <div className="me-4 px-3 py-1 bg-stone rounded-pill small font-weight-bold text-stone">
                            Last Sync: Just Now
                        </div>
                        <i className="bi bi-bell fs-5 text-stone cursor-pointer"></i>
                    </div>
                </header>
                <main>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
