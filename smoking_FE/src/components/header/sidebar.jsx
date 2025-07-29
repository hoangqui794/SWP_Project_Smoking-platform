// src/components/sidebar.jsx
import React from 'react';
import { toast } from 'react-toastify';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../header/sidebar.scss';

const Sidebar = () => {
    const handleLogout = async () => {
        try {
            const response = await fetch('/api/Auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                }
            });
            if (response.ok) {
                localStorage.removeItem('userToken');
                localStorage.removeItem('userRole');
                localStorage.removeItem('userName');
                localStorage.removeItem('userEmail');
                localStorage.removeItem('userId');
                localStorage.removeItem('coachId');
                localStorage.removeItem('profilePicture');
                toast.success('Đăng xuất thành công! Hẹn gặp lại bạn.', {
                    autoClose: 500,
                    onClose: () => {
                        window.location.href = '/';
                    }
                });
            } else {
                const errorData = await response.json().catch(() => null);
                toast.error(errorData?.message || 'Có lỗi xảy ra khi đăng xuất.');
            }
        } catch (error) {
            console.error('Lỗi khi đăng xuất:', error);
            toast.error('Không thể kết nối với máy chủ. Vui lòng thử lại!');
        }
    };
    return (
        <div className="sidebar d-flex flex-column p-3">
            <img src="https://github.com/THQuis/SWP391_Group5/blob/main/image/logo.png?raw=true"
                alt="Logo" className="logoSibar mb-4" />
            <Nav className="flex-column  w-100">
                <Nav.Link as={Link} to="/admin">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/admin/users">Quản lý người dùng</Nav.Link>
                <Nav.Link as={Link} to="/admin/ManagementPackage">Gói thành viên</Nav.Link>
                <Nav.Link as={Link} to="/admin/ManagementBlog">Quản lý blog</Nav.Link>
                <Nav.Link as={Link} to="/admin/ManagementPerformance">Thành tích - huy hiệu</Nav.Link>
                <Nav.Link as={Link} to="/admin/ManagementNotification">Thông báo</Nav.Link>
                <Nav.Link as={Link} to="/admin/ManagementPlan">Quản lý tiến trình</Nav.Link>
                <Nav.Link as={Link} to="/admin/ManagementChangCoach">Quản lý đổi coach</Nav.Link>
                <Nav.Link as={Link} to="#" onClick={handleLogout} className="text-danger mt-3">Đăng xuất</Nav.Link>
            </Nav>
        </div>
    );
};

export default Sidebar;