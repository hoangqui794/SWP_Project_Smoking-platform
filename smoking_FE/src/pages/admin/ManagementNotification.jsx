import React, { useState, useEffect } from "react";
import { Tabs, Tab, Card, Row, Col, Button, Modal, Toast, ToastContainer } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import NotificationFilter from "../../components/Notification/NotificationFilter";
import NotificationTable from "../../components/Notification/NotificationTable";
import NotificationModal from "../../components/Notification/NotificationModal";
import SendNotificationTab from "../../components/Notification/SendNotificationTab";

const notificationTypeOptions = [
    { value: "System", label: "Hệ thống" },
    { value: "advice", label: "Tư vấn" },
    { value: "reminder", label: "Nhắc nhở" },
    { value: "achievement", label: "Thành tích" },
    { value: "feedback", label: "Phản hồi" },
];
const notifyToOptions = [
    { value: "All Users", label: "Tất cả người dùng" },
    { value: "coach", label: "Coach" },
    { value: "member", label: "Member" },
];

const ManagementNotificationTabs = () => {
    const [tabKey, setTabKey] = useState("all");
    const [allNotifications, setAllNotifications] = useState([]);
    const [personalNotifications, setPersonalNotifications] = useState([]);
    const [loadingAll, setLoadingAll] = useState(false);
    const [loadingPersonal, setLoadingPersonal] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [newNotification, setNewNotification] = useState({
        notificationName: "",
        message: "",
        notificationType: "",
        condition: "",
        notificationFor: "",
        notificationDate: "",
    });

    const [searchUserId, setSearchUserId] = useState(localStorage.getItem("userId") || 3);
    const [inputUserId, setInputUserId] = useState(localStorage.getItem("userId") || 3);

    // Toast and Modal states
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastVariant, setToastVariant] = useState('success');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [notificationToDelete, setNotificationToDelete] = useState(null);

    // Hàm hiển thị toast
    const showToastMessage = (message, variant = 'success') => {
        setToastMessage(message);
        setToastVariant(variant);
        setShowToast(true);
    };

    const [searchAll, setSearchAll] = useState({
        notificationName: "",
        notificationType: "",
        condition: "",
        notificationFor: "",
        notificationDate: "",
        createdBy: "",
    });

    // Fetch all notifications
    const fetchAllNotifications = async () => {
        setLoadingAll(true);
        try {
            const token = localStorage.getItem("userToken");
            const res = await fetch("/api/NotificationAdmin/list", {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const data = await res.json();
            setAllNotifications(data || []);
        } catch {
            setAllNotifications([]);
        }
        setLoadingAll(false);
    };

    // Fetch personal notifications
    const fetchPersonalNotifications = async (userIdParam) => {
        setLoadingPersonal(true);
        try {
            const token = localStorage.getItem("userToken");
            const res = await fetch(
                `/api/NotificationAdmin/getNotificationUserID?userId=${userIdParam}`,
                { headers: token ? { Authorization: `Bearer ${token}` } : {} }
            );
            const data = await res.json();
            setPersonalNotifications(data || []);
        } catch {
            setPersonalNotifications([]);
        }
        setLoadingPersonal(false);
    };

    useEffect(() => {
        if (tabKey === "all") fetchAllNotifications();
        else if (tabKey === "personal") fetchPersonalNotifications(searchUserId);
    }, [tabKey, searchUserId]);

    // Add notification
    const handleAddNotification = async () => {
        try {
            const token = localStorage.getItem("userToken");
            const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
            const body = {
                toAllUsers: newNotification.notificationFor === "All Users",
                toRole:
                    newNotification.notificationFor !== "All Users"
                        ? newNotification.notificationFor
                        : undefined,
                email: "",
                notificationID: 0,
                userID: 0,
                message: newNotification.message,
                notificationDate: newNotification.notificationDate
                    ? new Date(newNotification.notificationDate).toISOString()
                    : new Date().toISOString(),
                sentAt: new Date().toISOString(),
                notificationType: newNotification.notificationType,
                notificationName: newNotification.notificationName,
                condition: newNotification.condition,
                notificationFor: newNotification.notificationFor,
                createdBy: userInfo.name || userInfo.username || "Admin",
            };

            const res = await fetch("/api/NotificationAdmin/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error();
            setShowModal(false);
            showToastMessage("Tạo và gửi thông báo thành công!", "success");
            fetchAllNotifications();
        } catch {
            showToastMessage("Tạo và gửi thông báo thất bại!", "danger");
        }
    };

    // Edit
    const handleEdit = (item) => {
        setIsEdit(true);
        setNewNotification({
            notificationName: item.notificationName,
            message: item.message,
            notificationType: item.notificationType,
            condition: item.condition,
            notificationFor: item.notificationFor,
            notificationDate: (item.notificationDate || "").slice(0, 10),
        });
        setShowModal(true);
    };

    // Delete
    const handleDelete = (id) => {
        setNotificationToDelete(id);
        setShowDeleteModal(true);
    };

    // Xác nhận xóa
    const confirmDelete = async () => {
        if (!notificationToDelete) return;

        try {
            const token = localStorage.getItem("userToken");
            const res = await fetch(
                `/api/NotificationAdmin/deleteNotification?id=${notificationToDelete}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (!res.ok) throw new Error();
            setAllNotifications((prev) =>
                prev.filter((n) => n.notificationID !== notificationToDelete)
            );
            showToastMessage("Xóa thông báo thành công!", "success");
        } catch {
            showToastMessage("Xóa thông báo thất bại!", "danger");
        }

        setShowDeleteModal(false);
        setNotificationToDelete(null);
    };

    // Search userId
    const handleSearchUserId = (e) => {
        e.preventDefault();
        if (inputUserId && !isNaN(Number(inputUserId))) {
            setSearchUserId(inputUserId);
        }
    };

    // Filter all notifications
    const filteredAllNotifications = allNotifications.filter((item) => {
        const matchName = item.notificationName
            ?.toLowerCase()
            .includes(searchAll.notificationName.toLowerCase());
        const matchType = searchAll.notificationType
            ? item.notificationType === searchAll.notificationType
            : true;
        const matchCondition = item.condition
            ?.toLowerCase()
            .includes(searchAll.condition.toLowerCase());
        const matchNotifyTo = searchAll.notificationFor
            ? item.notificationFor === searchAll.notificationFor
            : true;
        const matchDate = searchAll.notificationDate
            ? (item.notificationDate || "").slice(0, 10) === searchAll.notificationDate
            : true;
        const matchCreatedBy = item.createdBy
            ?.toLowerCase()
            .includes(searchAll.createdBy.toLowerCase());
        return (
            matchName &&
            matchType &&
            matchCondition &&
            matchNotifyTo &&
            matchDate &&
            matchCreatedBy
        );
    });

    return (
        <div>
            <h2 className="text-center text-success"> Quản lý thông báo </h2>
            <Card>

                <Card.Body>

                    <Tabs
                        id="notification-tabs"
                        activeKey={tabKey}
                        onSelect={(k) => setTabKey(k)}
                        className="mb-3"
                    >
                        <Tab eventKey="all" title="Tất cả thông báo">
                            <Row className="mb-3">
                                <Col md={9}>
                                    <NotificationFilter
                                        searchAll={searchAll}
                                        setSearchAll={setSearchAll}
                                        notificationTypeOptions={notificationTypeOptions}
                                        notifyToOptions={notifyToOptions}
                                    />
                                </Col>
                                <Col md={3} className="d-flex justify-content-end align-items-end mb-2">
                                    <Button
                                        variant="outline-primary"
                                        onClick={() => {
                                            setShowModal(true);
                                            setIsEdit(false);
                                            setNewNotification({
                                                notificationName: "",
                                                message: "",
                                                notificationType: "",
                                                condition: "",
                                                notificationFor: "",
                                                notificationDate: "",
                                            });
                                        }}
                                    >
                                        Tạo thông báo <FaPlus />
                                    </Button>
                                </Col>
                            </Row>
                            <NotificationTable
                                notifications={filteredAllNotifications}
                                loading={loadingAll}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                notificationTypeOptions={notificationTypeOptions}
                                notifyToOptions={notifyToOptions}
                            />
                        </Tab>
                        {/* <Tab eventKey="personal" title="Thông báo cá nhân">
                            <NotificationPersonalSearch
                                inputUserId={inputUserId}
                                setInputUserId={setInputUserId}
                                searchUserId={searchUserId}
                                onSearchUserId={handleSearchUserId}
                            />
                            <NotificationPersonalTable
                                notifications={personalNotifications}
                                loading={loadingPersonal}
                            />
                        </Tab> */}
                        <Tab eventKey="send" title="Gửi thông báo">
                            <SendNotificationTab />
                        </Tab>
                    </Tabs>
                </Card.Body>
                <NotificationModal
                    show={showModal}
                    onHide={() => setShowModal(false)}
                    onSubmit={handleAddNotification}
                    isEdit={isEdit}
                    newNotification={newNotification}
                    setNewNotification={setNewNotification}
                    notificationTypeOptions={notificationTypeOptions}
                    notifyToOptions={notifyToOptions}
                />
            </Card>

            {/* Modal xác nhận xóa */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận xóa thông báo</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Bạn có chắc chắn muốn xóa thông báo này? Hành động này không thể hoàn tác.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Hủy
                    </Button>
                    <Button variant="danger" onClick={confirmDelete}>
                        Xóa
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Toast thông báo */}
            <ToastContainer position="top-end" className="p-3">
                <Toast
                    show={showToast}
                    onClose={() => setShowToast(false)}
                    delay={3000}
                    autohide
                    bg={toastVariant}
                >
                    <Toast.Header>
                        <strong className="me-auto">Thông báo</strong>
                    </Toast.Header>
                    <Toast.Body className={toastVariant === 'danger' ? 'text-white' : ''}>
                        {toastMessage}
                    </Toast.Body>
                </Toast>
            </ToastContainer>
        </div>
    );
};

export default ManagementNotificationTabs;