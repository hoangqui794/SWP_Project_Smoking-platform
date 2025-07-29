import React, { useEffect, useState } from "react";
import { Card, Table, Spinner, Button, Tabs, Tab, Badge, Modal, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
    FaCalendarPlus,
    FaCalendarCheck,
    FaTrashAlt,
    FaUserTie,
    FaClock,
    FaCalendarAlt,
    FaStickyNote,
    FaInfoCircle,
    FaVideo,
    FaCheckCircle,
    FaHourglassHalf,
    FaTimesCircle,
    FaBan,
    FaCheckDouble,
    FaStar,
    FaRegStar,
    FaComment
} from "react-icons/fa";
import { toast } from 'react-toastify';
import '../../styles/MyConsultations.scss';

const fetchMyBookings = async () => {
    const token = localStorage.getItem('userToken');
    const response = await fetch('/api/user/consultation/my-bookings', {
        headers: {
            "Accept": "*/*",
            "Authorization": "Bearer " + token,
        },
    });
    if (!response.ok) return [];
    return await response.json();
};

const cancelBooking = async (bookingId) => {
    const token = localStorage.getItem('userToken');
    const response = await fetch(`/api/user/consultation/cancel/${bookingId}`, {
        method: "DELETE",
        headers: {
            "Accept": "*/*",
            "Authorization": "Bearer " + token,
        },
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Hủy lịch thất bại.");
    }
    return data;
};

// API functions for feedback
const createFeedback = async (feedbackData) => {
    const token = localStorage.getItem('userToken');
    const response = await fetch('/api/UserFeedback/create', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "*/*",
            "Authorization": "Bearer " + token,
        },
        body: JSON.stringify(feedbackData)
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Tạo đánh giá thất bại.");
    }
    return data;
};

const getMyFeedbacks = async () => {
    const token = localStorage.getItem('userToken');
    const response = await fetch('/api/UserFeedback/my-feedback', {
        headers: {
            "Accept": "*/*",
            "Authorization": "Bearer " + token,
        },
    });
    if (!response.ok) return [];
    return await response.json();
};

const statusMap = {
    "Pending": { label: "Chờ xác nhận", className: "badge bg-warning text-dark" },
    "Approved": { label: "Đã xác nhận", className: "badge bg-success" },
    "Confirmed": { label: "Đã xác nhận", className: "badge bg-success" },
    "Completed": { label: "Hoàn thành", className: "badge bg-primary" },
    "Reject": { label: "Từ chối", className: "badge bg-danger" },
    "Cancelled": { label: "Đã huỷ", className: "badge bg-secondary" },
};

const MyConsultations = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState(null);
    const [activeTab, setActiveTab] = useState("Pending");

    // Feedback states
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [feedbackRating, setFeedbackRating] = useState(0);
    const [feedbackContent, setFeedbackContent] = useState("");
    const [submittingFeedback, setSubmittingFeedback] = useState(false);
    const [userFeedbacks, setUserFeedbacks] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        // Scroll to top when component mounts
        window.scrollTo(0, 0);

        const getBookings = async () => {
            setLoading(true);
            const data = await fetchMyBookings();
            setBookings(data);
            setLoading(false);
        };

        const getFeedbacks = async () => {
            const feedbacks = await getMyFeedbacks();
            setUserFeedbacks(feedbacks);
        };

        getBookings();
        getFeedbacks();
    }, []);

    // Feedback handlers
    const handleShowFeedbackModal = (booking) => {
        setSelectedBooking(booking);
        setFeedbackRating(0);
        setFeedbackContent("");
        setShowFeedbackModal(true);
    };

    const handleCloseFeedbackModal = () => {
        setShowFeedbackModal(false);
        setSelectedBooking(null);
        setFeedbackRating(0);
        setFeedbackContent("");
    };

    const handleSubmitFeedback = async () => {
        if (feedbackRating === 0) {
            toast.error("Vui lòng chọn số sao đánh giá.");
            return;
        }
        if (!feedbackContent.trim()) {
            toast.error("Vui lòng nhập nội dung đánh giá.");
            return;
        }

        setSubmittingFeedback(true);
        try {
            await createFeedback({
                FeedbackContent: feedbackContent,
                Rating: feedbackRating
            });
            toast.success("Đánh giá thành công!");
            handleCloseFeedbackModal();
            // Reload feedbacks
            const feedbacks = await getMyFeedbacks();
            setUserFeedbacks(feedbacks);
        } catch (err) {
            toast.error(err.message || "Đánh giá thất bại.");
        } finally {
            setSubmittingFeedback(false);
        }
    };

    // Check if booking has feedback
    const hasBookingFeedback = (bookingId) => {
        return userFeedbacks.some(feedback => feedback.bookingID === bookingId);
    };

    const handleCancel = async (bookingId) => {
        setCancellingId(bookingId);
        try {
            await cancelBooking(bookingId);
            toast.success("Hủy lịch thành công.");
            // Reload bookings
            const data = await fetchMyBookings();
            setBookings(data);
        } catch (err) {
            toast.error(err.message || "Hủy lịch thất bại.");
        } finally {
            setCancellingId(null);
        }
    };

    // Phân loại booking theo status
    const bookingsByStatus = {
        Pending: bookings.filter(b => b.status === "Pending"),
        Approved: bookings.filter(b => b.status === "Approved" || b.status === "Confirmed"),
        Completed: bookings.filter(b => b.status === "Completed"),
        Rejected: bookings.filter(b => b.status === "Rejected"),
        Cancelled: bookings.filter(b => b.status === "Cancelled"),
    };

    const renderTable = (bookingList, statusKey) => (
        <div className="table-responsive">
            <Table className="modern-table">
                <thead>
                    <tr>
                        <th><FaInfoCircle className="me-2" />STT</th>
                        <th><FaUserTie className="me-2" />Chuyên gia</th>
                        <th><FaCalendarAlt className="me-2" />Ngày & Giờ</th>
                        {/* <th><FaClock className="me-2" />Thời lượng</th> */}
                        <th><FaStickyNote className="me-2" />Ghi chú</th>
                        <th><FaCheckCircle className="me-2" />Trạng thái & Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {bookingList.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="empty-row">
                                <div className="empty-message">
                                    <FaCalendarCheck className="empty-icon" />
                                    <p>Không có lịch hẹn nào trong danh mục này</p>
                                </div>
                            </td>
                        </tr>
                    ) : bookingList.map((b, idx) => (
                        <tr key={b.bookingID} className="data-row">
                            <td>
                                <div className="index-cell">
                                    <span className="index-number">{idx + 1}</span>
                                </div>
                            </td>
                            <td>
                                <div className="coach-info">
                                    <div className="coach-avatar">
                                        <FaUserTie />
                                    </div>
                                    <div className="coach-details">
                                        <span className="coach-name">{b.coachName}</span>
                                        <small className="coach-title">Chuyên gia tư vấn</small>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div className="datetime-info">
                                    <div className="date-part">
                                        <FaCalendarAlt className="me-1" />
                                        {(() => {
                                            const d = new Date(b.bookingDate);
                                            return d.toLocaleDateString('vi-VN');
                                        })()}
                                    </div>
                                    <div className="time-part">
                                        <FaClock className="me-1" />
                                        {(() => {
                                            const d = new Date(b.bookingDate);
                                            return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                                        })()}
                                    </div>
                                </div>
                            </td>
                            {/* <td>
                                <div className="duration-badge">
                                    <FaClock className="me-1" />
                                    <span>{b.duration} phút</span>
                                </div>
                            </td> */}
                            <td>
                                <div className="notes-cell">
                                    {b.notes ? (
                                        <div className="notes-content" title={b.notes}>
                                            <FaStickyNote className="me-1" />
                                            <span>{b.notes}</span>
                                        </div>
                                    ) : (
                                        <div className="no-notes">
                                            <span>—</span>
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td>
                                <div className="status-actions">
                                    <div className="status-badge-wrapper">
                                        <span className={`status-badge ${b.status.toLowerCase()}`}>
                                            {b.status === 'Pending' && <FaHourglassHalf className="me-1" />}
                                            {(b.status === 'Approved' || b.status === 'Confirmed') && <FaCheckCircle className="me-1" />}
                                            {b.status === 'Completed' && <FaCheckDouble className="me-1" />}
                                            {b.status === 'Rejected' && <FaTimesCircle className="me-1" />}
                                            {b.status === 'Cancelled' && <FaBan className="me-1" />}
                                            {statusMap[b.status]?.label || b.status}
                                        </span>
                                    </div>
                                    <div className="action-buttons">
                                        {statusKey === "Approved" && b.meetingLink && (
                                            <Button
                                                size="sm"
                                                className="meeting-btn"
                                                onClick={() => window.open(b.meetingLink.startsWith("http") ? b.meetingLink : undefined, "_blank")}
                                                title={b.meetingLink}
                                                disabled={!b.meetingLink.startsWith("http")}
                                            >
                                                <FaVideo className="me-1" />
                                                Vào phòng họp
                                            </Button>
                                        )}
                                        {statusKey === "Completed" && (
                                            hasBookingFeedback(b.bookingID) ? (
                                                <Button
                                                    size="sm"
                                                    className="feedback-done-btn"
                                                    disabled
                                                >
                                                    <FaCheckDouble className="me-1" />
                                                    Đã đánh giá
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    className="feedback-btn"
                                                    onClick={() => handleShowFeedbackModal(b)}
                                                >
                                                    <FaStar className="me-1" />
                                                    Đánh giá
                                                </Button>
                                            )
                                        )}
                                        {statusKey === "Pending" && (
                                            <Button
                                                size="sm"
                                                className="cancel-btn"
                                                onClick={() => handleCancel(b.bookingID)}
                                                disabled={cancellingId === b.bookingID}
                                            >
                                                {cancellingId === b.bookingID ? (
                                                    <>
                                                        <Spinner animation="border" size="sm" className="me-1" />
                                                        Đang hủy...
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaTrashAlt className="me-1" />
                                                        Hủy lịch
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    )

    return (
        <div className="consultations-page">
            <div className="consultations-container">
                {/* Header Section */}
                <div className="consultations-header">
                    <div className="header-content">
                        <div className="title-section">
                            <h1 className="main-title">
                                <FaCalendarCheck />
                                Lịch sử tư vấn
                            </h1>
                            <p className="subtitle">Quản lý và theo dõi các buổi tư vấn của bạn</p>
                        </div>
                        <div className="header-actions">
                            <Button
                                className="new-appointment-btn"
                                onClick={() => navigate('/User/coachList')}
                            >
                                <FaCalendarPlus />
                                Đặt lịch mới
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <Card className="consultations-card">
                    <div className="card-body">
                        {loading ? (
                            <div className="loading-container">
                                <Spinner animation="border" className="spinner-border" />
                            </div>
                        ) : bookings.length === 0 ? (
                            <div className="empty-state">
                                <FaCalendarCheck className="empty-icon" />
                                <h3 className="empty-title">Chưa có lịch tư vấn nào</h3>
                                <p className="empty-subtitle">Bạn chưa đặt lịch tư vấn với chuyên gia nào. Hãy bắt đầu hành trình cải thiện sức khỏe của bạn!</p>
                                <Button
                                    className="empty-action-btn"
                                    onClick={() => navigate('/User/coachList')}
                                >
                                    <FaCalendarPlus />
                                    Đặt lịch tư vấn ngay
                                </Button>
                            </div>
                        ) : (
                            <Tabs
                                id="booking-status-tabs"
                                activeKey={activeTab}
                                onSelect={k => setActiveTab(k)}
                                className="modern-tabs mb-4"
                            >
                                <Tab
                                    eventKey="Pending"
                                    title={
                                        <div className="tab-title">
                                            <FaHourglassHalf className="tab-icon" />
                                            <span>Chờ xác nhận</span>
                                            {bookingsByStatus.Pending.length > 0 && (
                                                <Badge bg="warning" className="tab-badge">
                                                    {bookingsByStatus.Pending.length}
                                                </Badge>
                                            )}
                                        </div>
                                    }
                                >
                                    {renderTable(bookingsByStatus.Pending, "Pending")}
                                </Tab>
                                <Tab
                                    eventKey="Approved"
                                    title={
                                        <div className="tab-title">
                                            <FaCheckCircle className="tab-icon" />
                                            <span>Đã xác nhận</span>
                                            {bookingsByStatus.Approved.length > 0 && (
                                                <Badge bg="success" className="tab-badge">
                                                    {bookingsByStatus.Approved.length}
                                                </Badge>
                                            )}
                                        </div>
                                    }
                                >
                                    {renderTable(bookingsByStatus.Approved, "Approved")}
                                </Tab>
                                <Tab
                                    eventKey="Completed"
                                    title={
                                        <div className="tab-title">
                                            <FaCheckDouble className="tab-icon" />
                                            <span>Hoàn thành</span>
                                            {bookingsByStatus.Completed.length > 0 && (
                                                <Badge bg="primary" className="tab-badge">
                                                    {bookingsByStatus.Completed.length}
                                                </Badge>
                                            )}
                                        </div>
                                    }
                                >
                                    {renderTable(bookingsByStatus.Completed, "Completed")}
                                </Tab>
                                <Tab
                                    eventKey="Rejected"
                                    title={
                                        <div className="tab-title">
                                            <FaTimesCircle className="tab-icon" />
                                            <span>Từ chối</span>
                                            {bookingsByStatus.Rejected.length > 0 && (
                                                <Badge bg="danger" className="tab-badge">
                                                    {bookingsByStatus.Rejected.length}
                                                </Badge>
                                            )}
                                        </div>
                                    }
                                >
                                    {renderTable(bookingsByStatus.Rejected, "Reject")}
                                </Tab>
                                <Tab
                                    eventKey="Cancelled"
                                    title={
                                        <div className="tab-title">
                                            <FaBan className="tab-icon" />
                                            <span>Đã hủy</span>
                                            {bookingsByStatus.Cancelled.length > 0 && (
                                                <Badge bg="secondary" className="tab-badge">
                                                    {bookingsByStatus.Cancelled.length}
                                                </Badge>
                                            )}
                                        </div>
                                    }
                                >
                                    {renderTable(bookingsByStatus.Cancelled, "Cancelled")}
                                </Tab>
                            </Tabs>
                        )}
                    </div>
                </Card>

                {/* Feedback Modal */}
                <Modal show={showFeedbackModal} onHide={handleCloseFeedbackModal} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            <FaComment className="me-2" />
                            Đánh giá buổi tư vấn
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {selectedBooking && (
                            <div className="feedback-form">
                                <div className="booking-info mb-3">
                                    <h6>Buổi tư vấn với: <strong>{selectedBooking.coachName}</strong></h6>
                                    <p className="text-muted">
                                        {new Date(selectedBooking.bookingDate).toLocaleDateString('vi-VN')} -
                                        {new Date(selectedBooking.bookingDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                    </p>
                                </div>

                                <Form.Group className="mb-3">
                                    <Form.Label>Đánh giá số sao</Form.Label>
                                    <div className="star-rating">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <span
                                                key={star}
                                                className={`star ${star <= feedbackRating ? 'filled' : ''}`}
                                                onClick={() => setFeedbackRating(star)}
                                                style={{ cursor: 'pointer', fontSize: '24px', marginRight: '5px' }}
                                            >
                                                {star <= feedbackRating ? <FaStar color="#ffc107" /> : <FaRegStar color="#dee2e6" />}
                                            </span>
                                        ))}
                                    </div>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Nội dung đánh giá</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        value={feedbackContent}
                                        onChange={(e) => setFeedbackContent(e.target.value)}
                                        placeholder="Chia sẻ trải nghiệm của bạn về buổi tư vấn..."
                                    />
                                </Form.Group>
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseFeedbackModal}>
                            Hủy
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleSubmitFeedback}
                            disabled={submittingFeedback}
                        >
                            {submittingFeedback ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Đang gửi...
                                </>
                            ) : (
                                <>
                                    <FaStar className="me-2" />
                                    Gửi đánh giá
                                </>
                            )}
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </div>
    );
};

export default MyConsultations;