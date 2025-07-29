import React, { useEffect, useState } from 'react';
import { Container, Card, Button, Modal, Form, Spinner, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FaStar,
    FaCheckCircle,
    FaClock,
    FaUserCheck,
    FaUser,
    FaEnvelope,
    FaPhoneAlt,
    FaTransgender,
    FaUserTimes,
    FaCalendarCheck
} from "react-icons/fa";
import styles from '../../styles/CoachProfile.module.scss';
// API gửi yêu cầu hủy/chuyển coach
const requestChangeCoach = async ({ newCoachId, reason }) => {
    const token = localStorage.getItem("userToken");
    const response = await fetch('/api/user/coach/request-change', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token,
            "accept": "*/*"
        },
        body: JSON.stringify({ newCoachId, reason }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Gửi yêu cầu đổi/hủy coach thất bại");
    return data;
};

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
const fetchMyCoachId = async () => {
    const token = localStorage.getItem('userToken');
    const response = await fetch('/api/user/coach/my-coach', {
        headers: {
            "Accept": "*/*",
            "Authorization": "Bearer " + token,
        },
    });
    if (!response.ok) return null;
    const data = await response.json();
    // data.coach.userID hoặc data.coachId tuỳ BE trả về
    return (data.coach && data.coach.userID) || data.coachId || null;
};
const fetchCoachById = async (id) => {
    const token = localStorage.getItem("userToken");
    const response = await fetch(`/api/user/coach/${id}`, {
        headers: {
            "Accept": "*/*",
            "Authorization": "Bearer " + token, // Nếu BE yêu cầu, còn không thì bỏ dòng này đi
        },
    });
    if (!response.ok) throw new Error("Không tìm thấy thông tin huấn luyện viên");
    const data = await response.json();
    // data.coach là object coach trả về từ BE (theo ảnh 4)
    return {
        UserID: data.coach.userID,
        fullName: data.coach.fullName,
        email: data.coach.email,
        phoneNumber: data.coach.phoneNumber,
        profilePicture: data.coach.profilePicture || null,
        gender: data.coach.gender,
        status: data.coach.status,
        description: data.coach.description || "",
        // Thêm các field khác nếu cần
    };
};

// API đặt lịch tư vấn
const bookConsultation = async (data) => {
    const token = localStorage.getItem("userToken");

    try {
        const response = await fetch('/api/user/consultation/book', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + token, // Thêm dòng này
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.message || 'Đặt lịch thất bại');
        }
        return await response.json();
    } catch (error) {
        throw error;
    }
};
const requestCancelCoach = async ({ reason }) => {
    const token = localStorage.getItem("userToken");
    const response = await fetch('/api/user/coach/request-cancel-coach', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token,
            "accept": "*/*"
        },
        body: JSON.stringify({ reason }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Gửi yêu cầu hủy coach thất bại");
    return data;
};


const CoachProfileForUser = () => {
    const { id } = useParams(); // Lấy ID của coach từ URL
    const navigate = useNavigate();

    const [coach, setCoach] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    // TODO: Cần thêm logic để biết user đã chọn coach nào
    const [myChosenCoachId, setMyChosenCoachId] = useState(() => {
        const value = localStorage.getItem('coachId');
        return value ? parseInt(value, 10) : null;
    });
    // State cho modal hủy chọn coach
    const [showUnchooseCoachModal, setShowUnchooseCoachModal] = useState(false);
    const [unchooseReason, setUnchooseReason] = useState('');
    const [unchooseLoading, setUnchooseLoading] = useState(false);
    // Modal state cho đặt lịch
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [bookingData, setBookingData] = useState({
        consultationDate: '',
        consultationTime: '08:00:00', // Mặc định 8h sáng
        // duration: 30,
        notes: ''
    });
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingSuccessAlert, setBookingSuccessAlert] = useState(false);
    const [hasBookingWithThisCoach, setHasBookingWithThisCoach] = useState(false);
    const [changeCoachReason, setChangeCoachReason] = useState('');
    const [changeCoachLoading, setChangeCoachLoading] = useState(false);
    const [showChangeCoachModal, setShowChangeCoachModal] = useState(false);
    const handleRequestChangeCoach = async () => {
        if (!changeCoachReason.trim()) {
            toast.warning("Bạn cần nhập lý do muốn đổi huấn luyện viên!");
            return;
        }
        setChangeCoachLoading(true);
        try {
            await requestChangeCoach({ newCoachId: coach.UserID, reason: changeCoachReason });
            toast.success("Đã gửi yêu cầu đổi huấn luyện viên, vui lòng chờ xét duyệt!");
            setShowChangeCoachModal(false);
            setChangeCoachReason('');
        } catch (err) {
            toast.error(err.message || "Gửi yêu cầu thất bại!");
        } finally {
            setChangeCoachLoading(false);
        }
    };
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);
    // Thêm API gửi yêu cầu hủy chọn coach đúng endpoint
    const submitUnchooseCoach = async () => {
        if (!unchooseReason.trim()) {
            toast.warning("Vui lòng nhập lý do muốn hủy chọn coach!");
            return;
        }
        setUnchooseLoading(true);
        try {
            await requestCancelCoach({ reason: unchooseReason });
            toast.success("Đã gửi yêu cầu hủy chọn coach, vui lòng chờ admin duyệt!");
            setShowUnchooseCoachModal(false);
            setUnchooseReason('');
        } catch (err) {
            if (err.message?.includes("403")) {
                toast.error("Bạn đã gửi yêu cầu hủy trước đó rồi, không thể gửi lại!");
            } else {
                toast.error(err.message || "Gửi yêu cầu thất bại!");
            }
        } finally {
            setUnchooseLoading(false);
        }
    };

    // Hàm kiểm tra trạng thái còn hiệu lực
    const isActiveStatus = (status) =>
        status === "Pending" || status === "Confirmed" || status === "Chờ xác nhận" || status === "Đã xác nhận"; // tuỳ backend

    useEffect(() => {
        const getCoachProfile = async () => {
            setIsLoading(true);
            try {
                const coachData = await fetchCoachById(id);
                setCoach(coachData);

                // Lấy coachId thực tế của user từ BE
                const chosenId = await fetchMyCoachId();
                setMyChosenCoachId(chosenId);

                // Update luôn localStorage (nếu muốn sync)
                if (chosenId) {
                    localStorage.setItem('coachId', chosenId);
                } else {
                    localStorage.removeItem('coachId');
                }

                // Kiểm tra đã có booking với coach này chưa (còn hiệu lực)
                const bookings = await fetchMyBookings();
                const hasBooking = bookings.some(
                    b =>
                        // Tốt nhất nên so sánh bằng coachId nếu backend trả về
                        (b.coachId === coachData.UserID || b.coachName === coachData.fullName) &&
                        isActiveStatus(b.status)
                );
                setHasBookingWithThisCoach(hasBooking);

            } catch (e) {
                toast.error("Không tìm thấy thông tin huấn luyện viên.");
                navigate("/User/coachList");
            } finally {
                setIsLoading(false);
            }
        };
        if (id) getCoachProfile();
    }, [id, navigate]);

    // Xử lý các hành động (Chọn, Hủy, Đặt lịch) - Tạm thời chỉ hiện thông báo
    // API chọn coach cho user
    const chooseCoach = async (coachId) => {
        const token = localStorage.getItem("userToken");
        const response = await fetch(`/api/user/coach/choose/${coachId}`, {
            method: "POST",
            headers: {
                "Accept": "*/*",
                "Authorization": "Bearer " + token,
            },
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Chọn coach thất bại");
        }
        return data;
    };
    const handleChooseCoach = async () => {
        try {
            await chooseCoach(coach.UserID);
            setMyChosenCoachId(coach.UserID);
            localStorage.setItem('coachId', coach.UserID); // Thêm dòng này
            toast.success("Đã chọn huấn luyện viên thành công!");
        } catch (err) {
            toast.error(err.message || "Chọn coach thất bại");
        }
    };
    const handleUnchooseCoach = () => {
        setShowUnchooseCoachModal(true);
    };

    const handleBookAppointment = () => {
        setShowBookingModal(true);
    };

    // Xử lý gửi form đặt lịch
    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        setBookingLoading(true);
        try {
            await bookConsultation({
                coachId: coach.UserID,
                consultationDate: bookingData.consultationDate,
                consultationTime: bookingData.consultationTime,
                // duration: Number(bookingData.duration),
                notes: bookingData.notes
            });
            toast.success('Đặt lịch tư vấn thành công!');
            setHasBookingWithThisCoach(true);
            setShowBookingModal(false);
            setBookingData({
                consultationDate: '',
                consultationTime: '00:00:00',
                // duration: 30,
                notes: ''
            });
            // Thêm dòng này:
            setBookingSuccessAlert(true);
            // Ẩn alert sau 4 giây (tuỳ chọn)
            setTimeout(() => setBookingSuccessAlert(false), 4000);
        } catch (err) {
            toast.error(err.message || 'Đặt lịch thất bại, vui lòng thử lại!');
        } finally {
            setBookingLoading(false);
        }
    };

    if (isLoading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                <Spinner animation="border" variant="success" />
                <h4 className="ms-3">Đang tải hồ sơ chuyên gia...</h4>
            </Container>
        );
    }

    if (!coach) {
        return (
            <Container className="text-center mt-5">
                <Alert variant="danger">Không thể tải được thông tin của chuyên gia.</Alert>
            </Container>
        )
    }

    // Biến để kiểm tra trạng thái chọn coach
    const isThisCoachChosen = myChosenCoachId === coach.UserID;
    const hasChosenAnyCoach = myChosenCoachId !== null;


    return (
        <div className={styles.pageWrapper}>
            <Container>
                {/* Main Profile Card */}
                <div className={styles.profileContainer}>
                    {/* Left Section - Avatar & Main Info */}
                    <div className={styles.profileMainCard}>
                        <div className={styles.coverImage}>
                            <div className={styles.avatarWrapper}>
                                <img
                                    src={coach?.profilePicture || 'https://github.com/THQuis/SWP391_Group5/blob/main/image/user.png?raw=true'}
                                    alt={coach?.fullName}
                                    className={styles.avatarImage}
                                />
                                {isThisCoachChosen && (
                                    <div className={styles.verifyBadge}>
                                        <div className={styles.verifyIcon}>
                                            <FaCheckCircle />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles.mainInfo}>
                            <h1 className={styles.coachName}>{coach?.fullName}</h1>
                            <div className={styles.coachRole}>
                                <FaStar className={styles.roleIcon} />
                                Chuyên gia tư vấn cao cấp
                            </div>

                            {isThisCoachChosen && (
                                <div className={styles.yourCoachBadge}>
                                    <FaUserCheck /> Chuyên gia của bạn
                                </div>
                            )}

                            <div className={styles.statusIndicator}>
                                <span className={coach?.status === "Active" ? styles.active : styles.inactive}>
                                    <FaClock /> {coach?.status === "Active" ? "Đang hoạt động" : "Không hoạt động"}
                                </span>
                            </div>
                        </div>

                        <div className={styles.actionSection}>
                            {isThisCoachChosen ? (
                                <div className={styles.actionButtons}>
                                    {!hasBookingWithThisCoach && (
                                        <Button
                                            className={`${styles.actionBtn} ${styles.bookBtn}`}
                                            onClick={handleBookAppointment}
                                        >
                                            <FaCalendarCheck /> Đặt lịch tư vấn
                                        </Button>
                                    )}
                                    <Button
                                        className={`${styles.actionBtn} ${styles.cancelBtn}`}
                                        onClick={handleUnchooseCoach}
                                    >
                                        <FaUserTimes /> Hủy chọn chuyên gia
                                    </Button>
                                </div>
                            ) : !hasChosenAnyCoach ? (
                                <Button
                                    className={`${styles.actionBtn} ${styles.chooseBtn}`}
                                    onClick={handleChooseCoach}
                                >
                                    <FaUserCheck /> Chọn làm người đồng hành
                                </Button>
                            ) : (
                                <Alert variant="warning" className={styles.warningAlert}>
                                    Bạn đã có chuyên gia khác. Vui lòng hủy chọn chuyên gia hiện tại trước.
                                </Alert>
                            )}
                        </div>
                    </div>

                    {/* Right Section - Details */}
                    <div className={styles.detailsSection}>
                        {/* About Card */}
                        <div className={styles.detailCard}>
                            <div className={styles.cardHeader}>
                                <FaUser />
                                <h3>Giới thiệu</h3>
                            </div>
                            <div className={styles.cardBody}>
                                <p className={styles.description}>
                                    {coach?.description || 'Chưa có thông tin giới thiệu.'}
                                </p>
                            </div>
                        </div>

                        {/* Contact Info Card */}
                        <div className={styles.detailCard}>
                            <div className={styles.cardHeader}>
                                <FaEnvelope />
                                <h3>Thông tin liên hệ</h3>
                            </div>
                            <div className={styles.cardBody}>
                                <div className={styles.infoGrid}>
                                    <div className={styles.infoItem}>
                                        <FaEnvelope />
                                        <div>
                                            <span className={styles.label}>Email</span>
                                            <span className={styles.value}>{coach?.email}</span>
                                        </div>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <FaPhoneAlt />
                                        <div>
                                            <span className={styles.label}>Số điện thoại</span>
                                            <span className={styles.value}>{coach?.phoneNumber}</span>
                                        </div>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <FaTransgender />
                                        <div>
                                            <span className={styles.label}>Giới tính</span>
                                            <span className={styles.value}>
                                                {coach?.gender === 'Male' ? 'Nam' : 'Nữ'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal đặt lịch tư vấn */}
                <Modal show={showBookingModal} onHide={() => setShowBookingModal(false)} centered>
                    <Form onSubmit={handleBookingSubmit}>
                        <Modal.Header closeButton>
                            <Modal.Title>Đặt lịch tư vấn với {coach.fullName}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form.Group className="mb-3">
                                <Form.Label>Ngày tư vấn</Form.Label>
                                <Form.Control
                                    type="date"
                                    required
                                    value={bookingData.consultationDate}
                                    onChange={e => setBookingData({ ...bookingData, consultationDate: e.target.value })}
                                    min={new Date().toISOString().split("T")[0]}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Giờ bắt đầu</Form.Label>
                                <Form.Control
                                    type="time"
                                    required
                                    value={bookingData.consultationTime ? bookingData.consultationTime.slice(0, 5) : "12:00"}
                                    onChange={e => setBookingData({ ...bookingData, consultationTime: e.target.value + ':00' })}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Ghi chú (tuỳ chọn)</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={bookingData.notes}
                                    onChange={e => setBookingData({ ...bookingData, notes: e.target.value })}
                                    placeholder="Nhập ghi chú cho buổi tư vấn (nếu có)..."
                                />
                            </Form.Group>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowBookingModal(false)} disabled={bookingLoading}>
                                Đóng
                            </Button>
                            <Button variant="success" type="submit" disabled={bookingLoading}>
                                {bookingLoading ? <Spinner animation="border" size="sm" /> : 'Đặt lịch'}
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal>
                {/* Modal gửi yêu cầu hủy chọn coach */}
                <Modal show={showUnchooseCoachModal} onHide={() => setShowUnchooseCoachModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Yêu cầu hủy chọn huấn luyện viên</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Label>Lý do hủy chọn huấn luyện viên <span style={{ color: "red" }}>*</span></Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={unchooseReason}
                            onChange={e => setUnchooseReason(e.target.value)}
                            placeholder="Nhập lý do bạn muốn hủy chọn coach..."
                            required
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowUnchooseCoachModal(false)} disabled={unchooseLoading}>
                            Đóng
                        </Button>
                        <Button variant="danger" onClick={submitUnchooseCoach} disabled={unchooseLoading}>
                            {unchooseLoading ? <Spinner animation="border" size="sm" /> : "Gửi yêu cầu"}
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </div >
    );
};

export default CoachProfileForUser;