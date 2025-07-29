import React, { useState, useEffect } from 'react';
import { Navbar } from 'react-bootstrap';
import { Bell, House } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import './HeaderAdmin.scss';

const HeaderAdmin = () => {
    const [showNotification, setShowNotification] = useState(false);
    const [notifications, setNotifications] = useState([]);

    const toggleNotification = () => {
        setShowNotification(!showNotification);
    };

    useEffect(() => {
        if (showNotification) {
            fetch('/api/admin/notifications')
                .then((res) => res.json())
                .then((data) => setNotifications(data.notifications || []))
                .catch(() => setNotifications(['Không thể tải thông báo']));
        }
    }, [showNotification]);

    return (
        <div className="header-admin-container">
            <Navbar className="custom-navbar justify-content-end px-4">
                <div className="icon-group">
                    <button onClick={toggleNotification} className="icon-button">
                        <Bell size={20} />
                    </button>
                    <Link to="/" className="icon-button">
                        <House size={20} />
                    </Link>
                </div>
            </Navbar>



            {showNotification && (
                <div className="notification-box">
                    <strong>🔔 Thông báo</strong>
                    <ul>
                        {notifications.map((note, index) => (
                            <li key={index}>{note}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default HeaderAdmin;
