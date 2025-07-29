import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * Component "gác cổng" để bảo vệ các route.
 * @param {object} props
 * @param {string[]} props.allowedRoles - Mảng chứa các vai trò được phép truy cập. Ví dụ: ['ADMIN'] hoặc ['ADMIN', 'MANAGER']
 */
const ProtectedRoute = ({ allowedRoles }) => {
    const token = localStorage.getItem('userToken');
    const userRole = parseInt(localStorage.getItem('userRole'), 10); // Giả sử role là 'ADMIN' hoặc 'USER'

    // 1. Kiểm tra đã đăng nhập chưa?
    if (!token) {
        // Nếu chưa, chuyển hướng về trang đăng nhập
        return <Navigate to="/login" replace />;
    }

    // 2. Kiểm tra có đúng vai trò (quyền) không?
    // So sánh vai trò của người dùng với các vai trò được phép trong `allowedRoles`
    const isAuthorized = allowedRoles.includes(userRole);

    if (!isAuthorized) {
        // Nếu không có quyền, chuyển hướng về trang "Từ chối truy cập"
        return <Navigate to="/unauthorized" replace />;
    }

    // 3. Nếu đã đăng nhập và có quyền, cho phép truy cập
    return <Outlet />; // Outlet sẽ render component con được định nghĩa trong Router
};

export default ProtectedRoute;