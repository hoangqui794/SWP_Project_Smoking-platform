import React, { useState, useEffect } from "react";
import {
    Container, Card, Table, Button, Spinner, Modal, Tabs, Tab, Form
} from "react-bootstrap";
import { FaCalendarAlt, FaUser, FaClock, FaCheck, FaTimes, FaEdit, FaEye, FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from "react-icons/fa";
import { toast } from "react-toastify";
import '../../styles/CoachBookingsManagement.scss';

// Modal xác nhận lịch tư vấn (chỉ để duyệt hoặc từ chối)
function BookingActionModal({ show, onHide, booking, onApprove, onReject, loading }) {
    if (!booking) return null;
    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton className="bg-light">
                <Modal.Title className="d-flex align-items-center">
                    <FaExclamationTriangle className="text-warning me-2" />
                    Xác nhận lịch tư vấn
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                <div className="mb-3">
                    <h5 className="text-success mb-3">Chi tiết lịch hẹn:</h5>
                    <div className="card border-0 bg-light p-3">
                        <div className="d-flex align-items-center mb-2">
                            <FaUser className="text-success me-2" />
                            <strong>Thành viên:</strong>
                            <span className="ms-2 text-dark">{booking.userName}</span>
                        </div>
                        <div className="d-flex align-items-center mb-2">
                            <FaCalendarAlt className="text-success me-2" />
                            <strong>Thời gian:</strong>
                            <span className="ms-2 text-dark">
                                {booking.bookingDate?.slice(0, 10)} {booking.time || ""}
                            </span>
                        </div>
                        <div className="d-flex align-items-start">
                            <FaEye className="text-secondary me-2 mt-1" />
                            <div>
                                <strong>Ghi chú:</strong>
                                <div className="mt-1 text-muted">{booking.notes || "Không có ghi chú"}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <p className="text-center text-muted">
                    Bạn có muốn <strong className="text-success">nhận</strong> lịch tư vấn này không?
                </p>
            </Modal.Body>
            <Modal.Footer className="justify-content-center">
                <Button
                    variant="outline-danger"
                    onClick={onReject}
                    disabled={loading}
                    className="me-3 px-4"
                >
                    <FaTimes className="me-2" />
                    Từ chối
                </Button>
                <Button
                    variant="success"
                    onClick={onApprove}
                    disabled={loading}
                    className="px-4"
                >
                    <FaCheck className="me-2" />
                    Nhận lịch & Gửi thông tin
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

// Modal gửi (hoặc cập nhật) thông tin cho member
function SendInfoModal({ show, onHide, booking, onSend, loading, isUpdate }) {
    const [meetingLink, setMeetingLink] = useState("");
    const [coachNotes, setCoachNotes] = useState("");
    const [preferredLanguage, setPreferredLanguage] = useState("");

    useEffect(() => {
        if (show && booking) {
            setMeetingLink(booking.meetingLink || "");
            setCoachNotes(booking.coachNotes || "");
            setPreferredLanguage(booking.preferredLanguage || "");
        }
    }, [show, booking]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!meetingLink.trim()) {
            toast.error("Vui lòng nhập link phòng họp!");
            return;
        }
        onSend({
            meetingLink,
            coachNotes,
            preferredLanguage,
        });
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton className="bg-success text-white">
                    <Modal.Title className="d-flex align-items-center">
                        <FaEdit className="me-2" />
                        {isUpdate ? "Cập nhật thông tin cho thành viên" : "Gửi thông tin cho thành viên"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {booking && (
                        <div className="alert alert-info mb-4">
                            <div className="d-flex align-items-center">
                                <FaUser className="me-2" />
                                <strong>Thành viên:</strong> <span className="ms-2">{booking.userName}</span>
                            </div>
                            <div className="d-flex align-items-center mt-1">
                                <FaCalendarAlt className="me-2" />
                                <strong>Thời gian:</strong>
                                <span className="ms-2">
                                    {booking.bookingDate?.slice(0, 10)} {booking.time || ""}
                                </span>
                            </div>
                        </div>
                    )}

                    <Form.Group className="mb-4">
                        <Form.Label className="fw-bold d-flex align-items-center">
                            <FaClock className="text-success me-2" />
                            Link phòng họp (Meeting link) *
                        </Form.Label>
                        <Form.Control
                            type="url"
                            value={meetingLink}
                            onChange={e => setMeetingLink(e.target.value)}
                            placeholder="https://zoom.us/j/... hoặc https://meet.google.com/..."
                            className="form-control-lg"
                            required
                        />
                        <Form.Text className="text-muted">
                            Nhập link phòng họp Zoom, Google Meet, Teams, v.v.
                        </Form.Text>
                    </Form.Group>

                    {/* Tạm thời comment out các field khác theo code gốc */}
                    {/* <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Ghi chú của Coach</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={coachNotes}
                            onChange={e => setCoachNotes(e.target.value)}
                            placeholder="Nhập ghi chú gửi tới thành viên..."
                            className="form-control-lg"
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label className="fw-bold">Ngôn ngữ tư vấn (Preferred language)</Form.Label>
                        <Form.Control
                            type="text"
                            value={preferredLanguage}
                            onChange={e => setPreferredLanguage(e.target.value)}
                            placeholder="VD: Vietnamese, English..."
                            className="form-control-lg"
                        />
                    </Form.Group> */}
                </Modal.Body>
                <Modal.Footer className="justify-content-between bg-light">
                    <Button
                        variant="outline-secondary"
                        onClick={onHide}
                        disabled={loading}
                        className="px-4"
                    >
                        Đóng
                    </Button>
                    <Button
                        type="submit"
                        variant="success"
                        disabled={loading || !meetingLink.trim()}
                        className="px-4"
                    >
                        {loading ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                <FaCheckCircle className="me-2" />
                                {isUpdate ? "Cập nhật" : "Gửi thông tin"}
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

const STATUS_MAP = {
    Pending: {
        label: "Chờ xác nhận",
        className: "badge bg-warning text-dark",
        icon: <FaExclamationTriangle className="me-1" />
    },
    Approved: {
        label: "Đã xác nhận",
        className: "badge bg-success",
        icon: <FaCheckCircle className="me-1" />
    },
    Confirmed: {
        label: "Đã xác nhận",
        className: "badge bg-success",
        icon: <FaCheckCircle className="me-1" />
    },
    Completed: {
        label: "Hoàn thành",
        className: "badge bg-success",
        icon: <FaCheck className="me-1" />
    },
    Reject: {
        label: "Từ chối",
        className: "badge bg-danger",
        icon: <FaTimesCircle className="me-1" />
    },
    Cancelled: {
        label: "Đã huỷ",
        className: "badge bg-secondary",
        icon: <FaTimes className="me-1" />
    },
};

const CoachBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal & action state
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showSendInfoModal, setShowSendInfoModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [infoLoading, setInfoLoading] = useState(false);

    // Tab control
    const [activeTab, setActiveTab] = useState("Pending");
    // Gửi info: phân biệt gửi mới (approve) hay cập nhật (update)
    const [sendInfoIsUpdate, setSendInfoIsUpdate] = useState(false);

    // API lấy danh sách lịch
    const fetchBookings = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("userToken");
            const response = await fetch("/api/coach/consultation/my-appointments", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Lỗi khi lấy dữ liệu lịch tư vấn");
            const data = await response.json();
            setBookings(data);
        } catch (error) {
            setBookings([]);
            toast.error(error.message || "Lỗi kết nối server khi tải lịch tư vấn!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    // Khi bấm Duyệt/Từ chối ở tab Pending
    const handleClickBooking = (booking) => {
        setSelectedBooking(booking);
        setShowBookingModal(true);
    };

    // Duyệt lịch → mở modal gửi thông tin
    const handleApproveBooking = () => {
        setShowBookingModal(false);
        setSendInfoIsUpdate(false); // gửi info mới (approve)
        setTimeout(() => setShowSendInfoModal(true), 300);
    };

    // Gửi thông tin khi duyệt (approve)
    const handleApproveAndSendInfo = async (info) => {
        if (!selectedBooking) return;
        setInfoLoading(true);
        try {
            const token = localStorage.getItem("userToken");
            const response = await fetch(`/api/coach/consultation/approve/${selectedBooking.bookingID}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(info)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Lỗi khi duyệt lịch!");
            toast.success(data.message || "Duyệt lịch thành công!");
            setShowSendInfoModal(false);
            fetchBookings();
        } catch (error) {
            toast.error(error.message || "Lỗi khi duyệt lịch!");
        } finally {
            setInfoLoading(false);
        }
    };

    // Từ chối lịch
    const handleRejectBooking = async () => {
        if (!selectedBooking) return;
        setActionLoading(true);
        try {
            const token = localStorage.getItem("userToken");
            const response = await fetch(`/api/coach/consultation/reject/${selectedBooking.bookingID}`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Lỗi khi từ chối lịch!");
            toast.success(data.message || "Từ chối lịch thành công!");
            setShowBookingModal(false);
            fetchBookings();
        } catch (error) {
            toast.error(error.message || "Lỗi khi từ chối lịch!");
        } finally {
            setActionLoading(false);
        }
    };

    // Hoàn thành lịch (complete)
    const handleCompleteBooking = async (booking) => {
        if (!booking) return;
        setActionLoading(true);
        try {
            const token = localStorage.getItem("userToken");
            const response = await fetch(`/api/coach/consultation/complete/${booking.bookingID}`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Lỗi khi hoàn thành lịch!");
            toast.success(data.message || "Đánh dấu hoàn thành lịch thành công!");
            fetchBookings();
        } catch (error) {
            toast.error(error.message || "Lỗi khi hoàn thành lịch!");
        } finally {
            setActionLoading(false);
        }
    };

    // Tab "Đã xác nhận" → bấm "Gửi thông tin" để cập nhật meeting link, note, language
    const handleShowUpdateInfo = (booking) => {
        setSelectedBooking(booking);
        setSendInfoIsUpdate(true); // cập nhật info
        setShowSendInfoModal(true);
    };

    // Gửi/cập nhật info cho tab đã xác nhận
    const handleUpdateInfo = async (info) => {
        if (!selectedBooking) return;
        setInfoLoading(true);
        try {
            const token = localStorage.getItem("userToken");
            const response = await fetch(`/api/coach/consultation/update/${selectedBooking.bookingID}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(info)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Gửi thông tin thất bại!");
            toast.success(data.message || "Đã cập nhật thông tin cho thành viên!");
            setShowSendInfoModal(false);
            fetchBookings();
        } catch (error) {
            toast.error(error.message || "Gửi thông tin thất bại!");
        } finally {
            setInfoLoading(false);
        }
    };

    // Phân loại booking theo status
    const bookingsByStatus = {
        Pending: bookings.filter(b => b.status === "Pending"),
        Approved: bookings.filter(b => b.status === "Approved" || b.status === "Confirmed"),
        Completed: bookings.filter(b => b.status === "Completed"),
        Reject: bookings.filter(b => b.status === "Reject"),
        Cancelled: bookings.filter(b => b.status === "Cancelled"),
    };

    // Table render cho từng tab
    const renderTable = (bookingList, statusKey) => (
        <div className="table-responsive">
            <Table hover className="mb-0">
                <thead className="bg-light">
                    <tr>
                        <th className="text-center" style={{ width: '60px' }}>#</th>
                        <th><FaUser className="me-2" />Thành viên</th>
                        <th><FaCalendarAlt className="me-2" />Ngày & Giờ</th>
                        <th><FaEye className="me-2" />Ghi chú</th>
                        <th className="text-center"><FaClock className="me-2" />Trạng thái</th>
                        <th className="text-center" style={{ width: '200px' }}>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {bookingList.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="text-center text-muted py-4">
                                <div className="d-flex flex-column align-items-center empty-state">
                                    <FaCalendarAlt className="empty-icon" />
                                    <h5 className="text-muted">Không có lịch nào</h5>
                                    <p className="text-muted">Chưa có lịch tư vấn nào trong trạng thái này.</p>
                                </div>
                            </td>
                        </tr>
                    ) : bookingList.map((b, idx) => (
                        <tr key={b.bookingID} className="align-middle">
                            <td className="text-center">
                                <span className="badge bg-light text-dark">{idx + 1}</span>
                            </td>
                            <td>
                                <div className="d-flex align-items-center">
                                    <div className="avatar-sm rounded-circle d-flex align-items-center justify-content-center me-3">
                                        <FaUser className="text-white" />
                                    </div>
                                    <div>
                                        <h6 className="mb-0">{b.userName}</h6>
                                        {/* <small className="text-muted">ID: {b.bookingID}</small> */}
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div>
                                    <div className="fw-bold text-dark">
                                        {b.bookingDate
                                            ? new Date(b.bookingDate).toLocaleDateString('vi-VN', {
                                                weekday: 'short',
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric'
                                            })
                                            : ""}
                                    </div>
                                    <small className="text-muted">
                                        <FaClock className="me-1" />
                                        {b.bookingDate
                                            ? new Date(b.bookingDate).toLocaleTimeString('vi-VN', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: false // hoặc true nếu bạn muốn AM/PM
                                            })
                                            : ""}
                                    </small>

                                </div>
                            </td>
                            <td>
                                <div className="text-wrap" style={{ maxWidth: '200px' }}>
                                    {b.notes ? (
                                        <span className="text-dark">{b.notes}</span>
                                    ) : (
                                        <span className="text-muted fst-italic">Không có ghi chú</span>
                                    )}
                                </div>
                            </td>
                            <td className="text-center">
                                <span className={STATUS_MAP[b.status]?.className || "badge bg-secondary"}>
                                    {STATUS_MAP[b.status]?.icon}
                                    {STATUS_MAP[b.status]?.label || b.status}
                                </span>
                            </td>
                            <td className="text-center">
                                {statusKey === "Pending" && (
                                    <Button
                                        size="sm"
                                        variant="outline-success"
                                        onClick={() => handleClickBooking(b)}
                                        className="btn-action-detail"
                                    >
                                        <FaEdit className="me-1" />
                                        Duyệt / Từ chối
                                    </Button>
                                )}
                                {statusKey === "Approved" && (
                                    <div className="d-flex gap-2 justify-content-center">
                                        <Button
                                            size="sm"
                                            variant="success"
                                            onClick={() => handleCompleteBooking(b)}
                                            disabled={actionLoading}
                                            title="Đánh dấu hoàn thành"
                                            className="btn-action-detail"
                                        >
                                            <FaCheckCircle className="me-1" />
                                            Hoàn thành
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline-info"
                                            onClick={() => handleShowUpdateInfo(b)}
                                            disabled={infoLoading}
                                            title="Gửi/Cập nhật thông tin meeting"
                                            className="btn-action-challenge"
                                        >
                                            <FaEdit className="me-1" />
                                            Thông tin
                                        </Button>
                                    </div>
                                )}
                                {(statusKey === "Completed" || statusKey === "Reject" || statusKey === "Cancelled") && (
                                    <span className="text-muted fst-italic">
                                        <FaEye className="me-1" />
                                        Chỉ xem
                                    </span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );

    return (
        <Container fluid className="coach-bookings-management-page" style={{ marginTop: 40, marginBottom: 40 }}>
            {/* Header Section */}
            <div className="header-section">
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <h2 className="fw-bold text-dark mb-1 d-flex align-items-center">
                            <FaCalendarAlt className="me-3" />
                            Quản lý lịch tư vấn
                        </h2>
                        <p className="text-muted mb-0">Quản lý các lịch hẹn tư vấn từ thành viên</p>
                    </div>
                    <div className="d-flex align-items-center">
                        <span className="badge fs-6 px-3 py-2">
                            Tổng: {bookings.length} lịch hẹn
                        </span>
                    </div>
                </div>
            </div>

            {loading ? (
                <Card className="border-0 shadow-sm">
                    <Card.Body className="text-center py-5">
                        <Spinner animation="border" variant="success" style={{ width: '3rem', height: '3rem' }} />
                        <h5 className="mt-3 text-muted">Đang tải dữ liệu...</h5>
                        <p className="text-muted">Vui lòng chờ trong giây lát</p>
                    </Card.Body>
                </Card>
            ) : (
                <Card className="border-0 shadow-sm">
                    <Card.Header className="bg-white border-bottom">
                        <Tabs
                            id="coach-booking-status-tabs"
                            activeKey={activeTab}
                            onSelect={k => setActiveTab(k)}
                            className="border-0"
                        >
                            <Tab
                                eventKey="Pending"
                                title={
                                    <span className="d-flex align-items-center">
                                        <FaExclamationTriangle className="text-warning me-2" />
                                        Chờ xác nhận
                                        <span className="badge bg-warning text-dark ms-2">
                                            {bookingsByStatus.Pending.length}
                                        </span>
                                    </span>
                                }
                            >
                                {renderTable(bookingsByStatus.Pending, "Pending")}
                            </Tab>
                            <Tab
                                eventKey="Approved"
                                title={
                                    <span className="d-flex align-items-center">
                                        <FaCheckCircle className="text-success me-2" />
                                        Đã xác nhận
                                        <span className="badge bg-success ms-2">
                                            {bookingsByStatus.Approved.length}
                                        </span>
                                    </span>
                                }
                            >
                                {renderTable(bookingsByStatus.Approved, "Approved")}
                            </Tab>
                            <Tab
                                eventKey="Completed"
                                title={
                                    <span className="d-flex align-items-center">
                                        <FaCheck className="text-success me-2" />
                                        Hoàn thành
                                        <span className="badge bg-success ms-2">
                                            {bookingsByStatus.Completed.length}
                                        </span>
                                    </span>
                                }
                            >
                                {renderTable(bookingsByStatus.Completed, "Completed")}
                            </Tab>
                            <Tab
                                eventKey="Reject"
                                title={
                                    <span className="d-flex align-items-center">
                                        <FaTimesCircle className="text-danger me-2" />
                                        Từ chối
                                        <span className="badge bg-danger ms-2">
                                            {bookingsByStatus.Reject.length}
                                        </span>
                                    </span>
                                }
                            >
                                {renderTable(bookingsByStatus.Reject, "Reject")}
                            </Tab>
                            <Tab
                                eventKey="Cancelled"
                                title={
                                    <span className="d-flex align-items-center">
                                        <FaTimes className="text-secondary me-2" />
                                        Đã huỷ
                                        <span className="badge bg-secondary ms-2">
                                            {bookingsByStatus.Cancelled.length}
                                        </span>
                                    </span>
                                }
                            >
                                {renderTable(bookingsByStatus.Cancelled, "Cancelled")}
                            </Tab>
                        </Tabs>
                    </Card.Header>
                    <Card.Body className="p-0">
                        {/* Tables được render bên trong tabs */}
                    </Card.Body>
                </Card>
            )}

            {/* Modal xác nhận duyệt lịch */}
            <BookingActionModal
                show={showBookingModal}
                onHide={() => setShowBookingModal(false)}
                booking={selectedBooking}
                onApprove={handleApproveBooking}
                onReject={handleRejectBooking}
                loading={actionLoading}
            />
            {/* Modal gửi/cập nhật thông tin */}
            <SendInfoModal
                show={showSendInfoModal}
                onHide={() => setShowSendInfoModal(false)}
                booking={selectedBooking}
                onSend={sendInfoIsUpdate ? handleUpdateInfo : handleApproveAndSendInfo}
                loading={infoLoading}
                isUpdate={sendInfoIsUpdate}
            />
        </Container>
    );
};

export default CoachBookings;   