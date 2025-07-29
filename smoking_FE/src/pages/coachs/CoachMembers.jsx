import React, { useState, useEffect } from "react";
import {
    Container,
    Row,
    Col,
    Card,
    Table,
    Badge,
    Button,
    Modal,
    Spinner,
    Alert,
    ListGroup,
    Image
} from "react-bootstrap";
import {
    FaUsers,
    FaUser,
    FaEnvelope,
    FaPhone,
    FaChartLine,
    FaEye,
    FaTasks,
    FaCalendarAlt,
    FaHistory,
    FaCalendarCheck,
    FaExternalLinkAlt
} from "react-icons/fa";
import "../../styles/CoachMembers.scss";

// Modal xem cuộc hẹn của thành viên
function MemberAppointmentsModal({ show, onHide, appointments, member, loading }) {
    const formatDate = (dateString) => {
        if (!dateString) return "Không có";
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case "completed":
                return <Badge bg="success">Đã hoàn thành</Badge>;
            case "approved":
                return <Badge bg="info">Đã duyệt</Badge>;
            case "pending":
                return <Badge bg="warning">Chờ duyệt</Badge>;
            case "cancelled":
                return <Badge bg="danger">Đã hủy</Badge>;
            default:
                return <Badge bg="secondary">{status || "Không xác định"}</Badge>;
        }
    };

    const openMeetingLink = (link) => {
        if (link) {
            window.open(link, "_blank");
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton className="bg-success text-white">
                <Modal.Title className="d-flex align-items-center">
                    <FaCalendarAlt className="me-2" />
                    Cuộc hẹn của {member?.FullName}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                {loading ? (
                    <div className="text-center my-5">
                        <Spinner animation="border" variant="success" style={{ width: '3rem', height: '3rem' }} />
                    </div>
                ) : !appointments || appointments.length === 0 ? (
                    <Alert variant="info" className="border-0 info-card">
                        <FaCalendarAlt className="me-2" />
                        Chưa có cuộc hẹn nào.
                    </Alert>
                ) : (
                    <ListGroup>
                        {appointments.map((appointment) => (
                            <ListGroup.Item key={appointment.bookingId} className="border rounded mb-3 shadow-sm appointment-item">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div className="flex-grow-1">
                                        <div className="d-flex align-items-center mb-2">
                                            <h6 className="mb-0 me-3">
                                                <FaCalendarAlt className="me-2 text-success" />
                                                Cuộc hẹn #{appointment.bookingId}
                                            </h6>
                                            {getStatusBadge(appointment.status)}
                                        </div>

                                        <div className="appointment-details">
                                            <div className="mb-2">
                                                <strong>Ngày hẹn:</strong> {formatDate(appointment.bookingDate)}
                                            </div>

                                            {appointment.meetingLink && (
                                                <div className="mb-2">
                                                    <strong>Link cuộc họp:</strong>
                                                    <Button
                                                        variant="link"
                                                        size="sm"
                                                        className="p-0 ms-2"
                                                        onClick={() => openMeetingLink(appointment.meetingLink)}
                                                    >
                                                        <FaExternalLinkAlt className="me-1" />
                                                        Tham gia cuộc họp
                                                    </Button>
                                                </div>
                                            )}

                                            {appointment.notes && (
                                                <div className="mb-2">
                                                    <strong>Ghi chú:</strong>
                                                    <div className="text-muted mt-1">{appointment.notes}</div>
                                                </div>
                                            )}

                                            <div className="mb-2">
                                                <strong>Ngày tạo:</strong> {formatDate(appointment.createdDate)}
                                            </div>

                                            <div>
                                                <strong>Coach:</strong> {appointment.coachName}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}
            </Modal.Body>
        </Modal>
    );
}

// Modal xem thử thách của thành viên
function MemberChallengesModal({ show, onHide, challenges, member, loading }) {
    // Helper: get image url from imageData (base64) and hasImage
    const getImageUrl = (c) => {
        if (c.imageData) {
            let contentType = "image/jpeg";
            if (typeof c.imageData === 'string' && c.imageData.startsWith("iVBOR")) contentType = "image/png";
            if (typeof c.imageData === 'string' && c.imageData.startsWith("/9j/")) contentType = "image/jpeg";
            return `data:${contentType};base64,${c.imageData}`;
        }
        return null;
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton className="bg-success text-white">
                <Modal.Title className="d-flex align-items-center">
                    <FaTasks className="me-2" />
                    Thử thách của {member?.FullName}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                {loading ? (
                    <div className="text-center my-5">
                        <Spinner animation="border" variant="success" style={{ width: '3rem', height: '3rem' }} />
                    </div>
                ) : !challenges || challenges.length === 0 ? (
                    <Alert variant="info" className="border-0 info-card">Chưa có thử thách nào.</Alert>
                ) : (
                    <ListGroup>
                        {challenges.map((c) => {
                            const imageUrl = getImageUrl(c);
                            return (
                                <ListGroup.Item key={c.id} className="border rounded mb-3 shadow-sm challenge-item">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>{c.templateTitle}</strong>
                                            <div className="text-muted" style={{ fontSize: 14 }}>
                                                {c.description}
                                            </div>
                                            <div>
                                                <span className="me-2">
                                                    <b>Ngày:</b> {c.scheduledDate?.split("T")[0]}
                                                </span>
                                                <span>
                                                    <b>Trạng thái:</b>{" "}
                                                    <Badge bg={c.isCompleted ? "success" : "secondary"}>
                                                        {c.isCompleted ? "Đã hoàn thành" : "Chưa hoàn thành"}
                                                    </Badge>
                                                </span>
                                            </div>
                                            {c.notes && (
                                                <div>
                                                    <b>Ghi chú:</b> {c.notes}
                                                </div>
                                            )}
                                            {imageUrl && (
                                                <div className="mt-2">
                                                    <Image src={imageUrl} thumbnail style={{ maxWidth: 120, maxHeight: 80, border: '2px solid #e0e7ef', boxShadow: '0 2px 8px rgba(79,70,229,0.07)' }} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </ListGroup.Item>
                            );
                        })}
                    </ListGroup>
                )}
            </Modal.Body>
        </Modal>
    );
}

// Modal xem thông tin chi tiết member
function MemberDetailModal({ show, onHide, member, loadingDetail, surveyAnswers, loadingSurveyAnswers }) {
    // Thêm state để toggle lịch sử tiến trình
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        // Reset khi mở modal mới
        if (show) setShowHistory(false);
    }, [show, member]);

    if (!member) return null;

    // Sắp xếp tiến trình mới nhất lên đầu (theo ngày giảm dần)
    let sortedProgress = (member.QuitProgress || []).slice().sort(
        (a, b) => new Date(b.progressDate) - new Date(a.progressDate)
    );
    const latest = sortedProgress[0];
    const history = sortedProgress.slice(1);

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton className="bg-success text-white">
                <Modal.Title className="d-flex align-items-center">
                    <FaUser className="me-2" />
                    Chi tiết thành viên: {member.FullName}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col md={6}>
                        <h5 className="text-success mb-3">
                            <FaUser className="me-2" />
                            Thông tin thành viên
                        </h5>
                        <Table bordered size="sm" className="mb-4">
                            <tbody>
                                <tr>
                                    <td>Họ tên</td>
                                    <td>{member.FullName}</td>
                                </tr>
                                <tr>
                                    <td>Email</td>
                                    <td>{member.Email}</td>
                                </tr>
                                <tr>
                                    <td>Điện thoại</td>
                                    <td>{member.PhoneNumber}</td>
                                </tr>
                                <tr>
                                    <td>Trạng thái</td>
                                    <td>
                                        <Badge bg={member.Status === "Active" ? "success" : "secondary"}>
                                            {member.Status === "Active" ? "Hoạt động" : "Không hoạt động"}
                                        </Badge>
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                    </Col>
                    <Col md={6}>
                        <h5 className="text-success mb-3">
                            <FaChartLine className="me-2" />
                            Tiến trình cai thuốc
                        </h5>
                        {loadingDetail ? (
                            <Spinner animation="border" size="sm" />
                        ) : sortedProgress.length > 0 ? (
                            <div style={{ background: "#f9f9f9", borderRadius: 8, border: "1px solid #e3e4e4", padding: 10 }}>
                                {/* Hiện tiến trình mới nhất */}
                                <Table bordered size="sm" className="mb-3" style={{ background: "#fff", borderRadius: 8, overflow: "hidden" }}>
                                    <tbody>
                                        <tr>
                                            <td style={{ width: 120, fontWeight: 500 }}>Ngày</td>
                                            <td colSpan={2}>{latest.progressDate?.split("T")[0]}</td>
                                        </tr>
                                        <tr>
                                            <td>Điếu/ngày (gốc)</td>
                                            <td colSpan={2}>{latest.cigarettesPerDayBaseline}</td>
                                        </tr>
                                        <tr>
                                            <td>Điếu đã hút</td>
                                            <td colSpan={2}>{latest.cigarettesSmokedToday}</td>
                                        </tr>
                                        <tr>
                                            <td>Điếu giảm</td>
                                            <td colSpan={2}>{latest.cigarettesDropped}</td>
                                        </tr>
                                        <tr>
                                            <td>Cộng dồn giảm</td>
                                            <td colSpan={2}>{latest.totalCigarettesDropped}</td>
                                        </tr>
                                        <tr>
                                            <td>Tiết kiệm</td>
                                            <td colSpan={2}>{latest.totalMoneySaved?.toLocaleString()} VNĐ</td>
                                        </tr>
                                        <tr>
                                            <td>Ghi chú</td>
                                            <td colSpan={2}>{latest.notes}</td>
                                        </tr>
                                    </tbody>
                                </Table>
                                {/* Nút toggle lịch sử */}
                                {history.length > 0 && (
                                    <div style={{ textAlign: "center" }}>
                                        <Button
                                            variant="success"
                                            onClick={() => setShowHistory((prev) => !prev)}
                                            style={{ fontWeight: 500 }}
                                        >
                                            <FaHistory className="me-1" />
                                            {showHistory ? "Ẩn lịch sử" : "Xem lịch sử"}
                                        </Button>
                                    </div>
                                )}
                                {/* Lịch sử tiến trình */}
                                {showHistory && history.length > 0 && (
                                    <div style={{ marginTop: 12 }}>
                                        {history.map((p, idx) => (
                                            <Table key={idx} bordered size="sm" className="mb-3" style={{ background: "#fff", borderRadius: 8, overflow: "hidden" }}>
                                                <tbody>
                                                    <tr>
                                                        <td style={{ width: 120, fontWeight: 500 }}>Ngày</td>
                                                        <td colSpan={2}>{p.progressDate?.split("T")[0]}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Điếu/ngày (gốc)</td>
                                                        <td colSpan={2}>{p.cigarettesPerDayBaseline}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Điếu đã hút</td>
                                                        <td colSpan={2}>{p.cigarettesSmokedToday}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Điếu giảm</td>
                                                        <td colSpan={2}>{p.cigarettesDropped}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Cộng dồn giảm</td>
                                                        <td colSpan={2}>{p.totalCigarettesDropped}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Tiết kiệm</td>
                                                        <td colSpan={2}>{p.totalMoneySaved?.toLocaleString()} VNĐ</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Ghi chú</td>
                                                        <td colSpan={2}>{p.notes}</td>
                                                    </tr>
                                                </tbody>
                                            </Table>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div>Chưa có tiến trình.</div>
                        )}
                    </Col>
                </Row>
                <hr />
                <h5 className="text-success mb-3">
                    <FaCalendarAlt className="me-2" />
                    Câu hỏi khảo sát & đáp án
                </h5>
                {loadingSurveyAnswers ? (
                    <Spinner animation="border" size="sm" />
                ) : surveyAnswers && surveyAnswers.length > 0 ? (
                    <Table bordered size="sm">
                        <thead>
                            <tr>
                                <th>Câu hỏi</th>
                                <th>Đáp án</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mergeSurveyAnswers(surveyAnswers).map((item, idx) => (
                                <tr key={idx}>
                                    <td>{item.questionText}</td>
                                    <td>
                                        {item.answerList.map((ans, i) => (
                                            <div key={i}>- {ans}</div>
                                        ))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                ) : (
                    <Alert variant="info">Chưa có dữ liệu khảo sát.</Alert>
                )}
            </Modal.Body>
        </Modal>
    );
}
// Thêm vào đầu file CoachMembers.jsx
function mergeSurveyAnswers(surveyAnswers) {
    const questionMap = new Map();
    (surveyAnswers || []).forEach(({ questionText, answerText, customAnswer }) => {
        if (!questionText) return;
        if (!questionMap.has(questionText)) {
            questionMap.set(questionText, []);
        }
        let fullAnswer = answerText;
        if (customAnswer) fullAnswer += ` (Khác: ${customAnswer})`;
        if (fullAnswer && !questionMap.get(questionText).includes(fullAnswer)) {
            questionMap.get(questionText).push(fullAnswer);
        }
    });
    return Array.from(questionMap, ([questionText, answerList]) => ({
        questionText,
        answerList
    }));
}

const CoachMembers = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    // State for Member Challenges Modal
    const [showChallengesModal, setShowChallengesModal] = useState(false);
    const [loadingChallenges, setLoadingChallenges] = useState(false);
    const [challenges, setChallenges] = useState([]);
    const [challengeMember, setChallengeMember] = useState(null);

    // State for Member Appointments Modal
    const [showAppointmentsModal, setShowAppointmentsModal] = useState(false);
    const [loadingAppointments, setLoadingAppointments] = useState(false);
    const [appointments, setAppointments] = useState([]);
    const [appointmentMember, setAppointmentMember] = useState(null);

    const [surveyAnswers, setSurveyAnswers] = useState([]);
    const [loadingSurveyAnswers, setLoadingSurveyAnswers] = useState(false);


    useEffect(() => {
        const token = localStorage.getItem("userToken");
        if (!token) {
            setLoading(false);
            return;
        }
        fetch("/api/coach/my-users", {
            method: "GET",
            headers: {
                "accept": "*/*",
                "Authorization": `Bearer ${token}`,
            },
        })
            .then(res => {
                if (!res.ok) throw new Error("Lỗi lấy danh sách thành viên");
                return res.json();
            })
            .then(data => {
                const mapped = data.map(u => ({
                    UserID: u.userID,
                    FullName: u.fullName,
                    Email: u.email,
                    PhoneNumber: u.phoneNumber,
                    Status: u.status,
                    profilePicture: u.profilePicture,
                    QuitProgress: [],
                }));
                setMembers(mapped);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    // Xem chi tiết member: fetch progress từ API
    const handleClickMember = (member) => {
        setLoadingDetail(true);
        setLoadingSurveyAnswers(true);
        const token = localStorage.getItem("userToken");

        // Lấy tiến trình cai thuốc
        fetch(`/api/coach/user/${member.UserID}/progress`, {
            method: "GET",
            headers: {
                "accept": "*/*",
                "Authorization": `Bearer ${token}`,
            },
        })
            .then(res => {
                if (!res.ok) throw new Error("Lỗi lấy tiến trình");
                return res.json();
            })
            .then(data => {
                setSelectedMember({
                    ...member,
                    QuitProgress: data.quitProgress || [],
                });
                setShowMemberModal(true);
                setLoadingDetail(false);
            })
            .catch(() => {
                setSelectedMember({ ...member, QuitProgress: [] });
                setShowMemberModal(true);
                setLoadingDetail(false);
            });

        // Lấy survey answers
        fetch(`/api/coach/user/${member.UserID}/survey-answers`, {
            method: "GET",
            headers: {
                "accept": "*/*",
                "Authorization": `Bearer ${token}`,
            },
        })
            .then(res => {
                if (!res.ok) throw new Error("Lỗi lấy khảo sát");
                return res.json();
            })
            .then(data => {
                setSurveyAnswers(data || []);
                setLoadingSurveyAnswers(false);
            })
            .catch(() => {
                setSurveyAnswers([]);
                setLoadingSurveyAnswers(false);
            });
    };

    // Xem thử thách của thành viên
    const handleViewChallenges = (member) => {
        setLoadingChallenges(true);
        setShowChallengesModal(true);
        setChallengeMember(member);
        const token = localStorage.getItem("userToken");
        fetch(`/api/coach/user/${member.UserID}/challenges`, {
            method: "GET",
            headers: {
                "accept": "*/*",
                "Authorization": `Bearer ${token}`,
            },
        })
            .then(res => {
                if (!res.ok) throw new Error("Lỗi lấy thử thách");
                return res.json();
            })
            .then(data => {
                setChallenges(data || []);
                setLoadingChallenges(false);
            })
            .catch(() => {
                setChallenges([]);
                setLoadingChallenges(false);
            });
    };

    // Xem cuộc hẹn của thành viên
    const handleViewAppointments = (member) => {
        setLoadingAppointments(true);
        setShowAppointmentsModal(true);
        setAppointmentMember(member);
        const token = localStorage.getItem("userToken");
        fetch(`/api/coach/user/${member.UserID}/appointments`, {
            method: "GET",
            headers: {
                "accept": "*/*",
                "Authorization": `Bearer ${token}`,
            },
        })
            .then(res => {
                if (!res.ok) throw new Error("Lỗi lấy cuộc hẹn");
                return res.json();
            })
            .then(data => {
                setAppointments(data || []);
                setLoadingAppointments(false);
            })
            .catch(() => {
                setAppointments([]);
                setLoadingAppointments(false);
            });
    };

    return (
        <Container fluid className="coach-members-management-page" style={{ marginTop: 40, marginBottom: 40 }}>
            {/* Header Section */}
            <div className="header-section">
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <h2 className="fw-bold text-dark mb-1 d-flex align-items-center">
                            <FaUsers className="me-3" />
                            Quản lý thành viên
                        </h2>
                        <p className="text-muted mb-0">Danh sách thành viên đang đồng hành cùng bạn</p>
                    </div>
                    <div className="d-flex align-items-center">
                        <span className="badge fs-6 px-3 py-2">
                            <FaUser className="me-2" />
                            {members.length} thành viên
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
                        <h5 className="mb-0 d-flex align-items-center text-success">
                            <FaUsers className="me-2" />
                            Danh sách thành viên
                        </h5>
                    </Card.Header>
                    <Card.Body className="p-0">
                        {members.length === 0 ? (
                            <div className="text-center py-5">
                                <div className="empty-state">
                                    <FaUsers className="empty-icon" />
                                    <h5 className="text-muted mb-3">Chưa có thành viên nào</h5>
                                    <p className="text-muted">
                                        Hiện tại chưa có thành viên nào chọn bạn làm coach.<br />
                                        Hãy chia sẻ thông tin của bạn để thu hút thêm thành viên!
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <Table hover className="mb-0">
                                    <thead className="bg-light">
                                        <tr>
                                            <th><FaUser className="me-2" />Thành viên</th>
                                            <th><FaEnvelope className="me-2" />Email</th>
                                            <th><FaPhone className="me-2" />Điện thoại</th>
                                            <th className="text-center"><FaChartLine className="me-2" />Trạng thái</th>
                                            <th className="text-center" style={{ width: '280px' }}>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {members.map((m) => (
                                            <tr key={m.UserID} className="align-middle">
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div className="avatar-sm rounded-circle d-flex align-items-center justify-content-center me-3">
                                                            {m.profilePicture ? (
                                                                <img
                                                                    src={m.profilePicture}
                                                                    alt="avatar"
                                                                    className="w-100 h-100 rounded-circle"
                                                                    style={{ objectFit: "cover" }}
                                                                />
                                                            ) : (
                                                                <FaUser className="text-white" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h6 className="mb-0">{m.FullName}</h6>
                                                            <small className="text-muted">ID: {m.UserID}</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{m.Email}</td>
                                                <td>{m.PhoneNumber}</td>
                                                <td className="text-center">
                                                    <Badge bg={m.Status === "Active" ? "success" : "secondary"}>
                                                        {m.Status === "Active" ? "Hoạt động" : "Không hoạt động"}
                                                    </Badge>
                                                </td>
                                                <td className="text-center">
                                                    <div className="d-flex gap-2 justify-content-center">
                                                        <Button
                                                            size="sm"
                                                            variant="success"
                                                            onClick={() => handleClickMember(m)}
                                                            className="btn-action-detail"
                                                        >
                                                            <FaEye className="me-1" />
                                                            Chi tiết
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline-info"
                                                            onClick={() => handleViewChallenges(m)}
                                                            className="btn-action-challenge"
                                                        >
                                                            <FaTasks className="me-1" />
                                                            Thử thách
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline-primary"
                                                            onClick={() => handleViewAppointments(m)}
                                                            className="btn-action-appointment"
                                                        >
                                                            <FaCalendarCheck className="me-1" />
                                                            Cuộc hẹn
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </Card.Body>
                </Card>
            )}

            {/* Modal xem chi tiết member */}
            <MemberDetailModal
                show={showMemberModal}
                onHide={() => setShowMemberModal(false)}
                member={selectedMember}
                loadingDetail={loadingDetail}
                surveyAnswers={surveyAnswers}
                loadingSurveyAnswers={loadingSurveyAnswers}
            />

            {/* Modal Cuộc hẹn của thành viên */}
            <MemberAppointmentsModal
                show={showAppointmentsModal}
                onHide={() => setShowAppointmentsModal(false)}
                appointments={appointments}
                member={appointmentMember}
                loading={loadingAppointments}
            />

            {/* Modal Thử thách của thành viên */}
            <MemberChallengesModal
                show={showChallengesModal}
                onHide={() => setShowChallengesModal(false)}
                challenges={challenges}
                member={challengeMember}
                loading={loadingChallenges}
            />
        </Container>
    );
};

export default CoachMembers;