// layouts/AdminLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom'; // QUAN TRỌNG: Import Outlet
import HeaderAdmin from "../components/header/headerAdmin";
import Sidebar from "../components/header/sidebar";

const AdminLayout = () => { // Bỏ {children}
    return (
        <div>
            <Sidebar />
            <div style={{ marginLeft: 220 }}>
                <HeaderAdmin />
                <div className="p-4">
                    <Outlet /> {/* <-- Sửa thành Outlet */}
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;