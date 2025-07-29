import React, { useEffect, useState } from "react";
import { Dropdown, Badge, Spinner } from "react-bootstrap";
import { BellFill, CircleFill, Clock, CheckCircle } from "react-bootstrap-icons";
import '../../styles/nottification.scss';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let intervalId;
        const fetchNotifications = async () => {
            setLoading(true);
            try {
                const res = await fetch("/api/user/notifications/my", {
                    headers: {
                        "Accept": "*/*",
                        "Authorization": `Bearer ${localStorage.getItem("userToken")}`,
                    },
                });
                if (res.ok) {
                    const data = await res.json();
                    let notificationList = [];
                    if (Array.isArray(data)) {
                        notificationList = data;
                    } else if (Array.isArray(data.data)) {
                        notificationList = data.data;
                    } else if (Array.isArray(data.notificationList)) {
                        notificationList = data.notificationList;
                    } else {
                        notificationList = [];
                    }

                    // Sort notifications by date (newest first)
                    const sortedNotifications = notificationList.sort((a, b) => {
                        const dateA = new Date(a.sentAt || a.notificationDate || a.createdAt || a.date);
                        const dateB = new Date(b.sentAt || b.notificationDate || b.createdAt || b.date);
                        return dateB - dateA; // Descending order (newest first)
                    });

                    setNotifications(sortedNotifications);
                } else {
                    setNotifications([]);
                }
            } catch (e) {
                setNotifications([]);
            }
            setLoading(false);
        };

        fetchNotifications(); // Lấy lần đầu khi mount
        intervalId = setInterval(fetchNotifications, 15000); // Lấy lại mỗi 15s

        return () => clearInterval(intervalId);
    }, []);

    const handleViewNotification = async (id) => {
        try {
            await fetch(`/api/user/notifications/${id}/read`, {
                method: "POST",
                headers: {
                    "Accept": "*/*",
                    "Authorization": `Bearer ${localStorage.getItem("userToken")}`,
                },
            });
            // Update local state to mark as read and maintain sorting
            setNotifications(prev => {
                const updated = prev.map(n =>
                    n.notificationID === id ? { ...n, isRead: true } : n
                );
                // Re-sort to maintain newest first order
                return updated.sort((a, b) => {
                    const dateA = new Date(a.sentAt || a.notificationDate || a.createdAt || a.date);
                    const dateB = new Date(b.sentAt || b.notificationDate || b.createdAt || b.date);
                    return dateB - dateA;
                });
            });
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const unreadNotifications = notifications.filter(n => !n.isRead);
            await Promise.all(
                unreadNotifications.map(n =>
                    fetch(`/api/user/notifications/${n.notificationID}/read`, {
                        method: "POST",
                        headers: {
                            "Accept": "*/*",
                            "Authorization": `Bearer ${localStorage.getItem("userToken")}`,
                        },
                    })
                )
            );
            // Update local state to mark all as read and maintain sorting
            setNotifications(prev => {
                const updated = prev.map(n => ({ ...n, isRead: true }));
                // Re-sort to maintain newest first order
                return updated.sort((a, b) => {
                    const dateA = new Date(a.sentAt || a.notificationDate || a.createdAt || a.date);
                    const dateB = new Date(b.sentAt || b.notificationDate || b.createdAt || b.date);
                    return dateB - dateA;
                });
            });
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
        }
    };

    const formatTimeAgo = (dateString) => {
        if (!dateString) return 'Không rõ thời gian';

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Không rõ thời gian';

            const now = new Date();
            const diffInSeconds = Math.floor((now - date) / 1000);

            if (diffInSeconds < 60) return 'Vừa xong';
            if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
            if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
            if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
            return date.toLocaleDateString('vi-VN');
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Không rõ thời gian';
        }
    };

    const getNotificationIcon = (type) => {
        // Map các type từ API thành icon phù hợp
        const normalizedType = (type || '').toLowerCase();

        switch (normalizedType) {
            case 'consultation':
            case 'appointment':
            case 'booking':
                return <Clock className="notification-icon warning" size={16} />;
            case 'success':
            case 'completed':
            case 'approved':
                return <CheckCircle className="notification-icon success" size={16} />;
            case 'warning':
            case 'reminder':
            case 'pending':
                return <Clock className="notification-icon warning" size={16} />;
            case 'info':
            case 'information':
            default:
                return <CircleFill className="notification-icon info" size={12} />;
        }
    };

    // Đếm số thông báo chưa đọc
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <Dropdown align="end" className="modern-notification-dropdown">
            <Dropdown.Toggle
                variant="light"
                id="dropdown-notifications"
                className="modern-notification-bell"
            >
                <BellFill size={20} />
                {unreadCount > 0 && (
                    <Badge bg="danger" pill className="modern-notification-badge">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                )}
            </Dropdown.Toggle>

            <Dropdown.Menu className="modern-notification-menu">
                <div className="notification-header">
                    <h6 className="notification-title">
                        <BellFill size={16} className="me-2" />
                        Thông báo
                        {unreadCount > 0 && (
                            <Badge bg="primary" pill className="ms-2">
                                {unreadCount}
                            </Badge>
                        )}
                    </h6>
                    {unreadCount > 0 && (
                        <button
                            className="mark-all-read-btn"
                            onClick={handleMarkAllAsRead}
                        >
                            Đánh dấu tất cả đã đọc
                        </button>
                    )}
                </div>

                <div className="notification-content">
                    {loading ? (
                        <div className="notification-loading">
                            <Spinner animation="border" size="sm" variant="primary" />
                            <span className="ms-2">Đang tải thông báo...</span>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="notification-empty">
                            <BellFill size={48} className="empty-icon" />
                            <p>Không có thông báo mới</p>
                        </div>
                    ) : (
                        <div className="notification-list">
                            {notifications.slice(0, 10).map((notification, idx) => (
                                <div
                                    key={notification.notificationID ?? idx}
                                    className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                                    onClick={() => handleViewNotification(notification.notificationID)}
                                >
                                    <div className="notification-icon-wrapper">
                                        {getNotificationIcon(notification.notificationType || notification.type)}
                                        {!notification.isRead && (
                                            <CircleFill className="unread-indicator" size={8} />
                                        )}
                                    </div>

                                    <div className="notification-content-wrapper">
                                        <div className="notification-title">
                                            {notification.notificationName || notification.title || 'Thông báo'}
                                        </div>
                                        <div className="notification-message">
                                            {notification.message}
                                        </div>
                                        <div className="notification-time">
                                            <Clock size={12} className="me-1" />
                                            {formatTimeAgo(notification.sentAt || notification.notificationDate)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {notifications.length > 10 && (
                    <div className="notification-footer">
                        <button className="view-all-btn">
                            Xem tất cả thông báo
                        </button>
                    </div>
                )}
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default NotificationBell;