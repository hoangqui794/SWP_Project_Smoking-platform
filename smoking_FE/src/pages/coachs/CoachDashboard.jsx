import React, { useEffect, useState } from "react";
import {
    Container,
    Row,
    Col,
    Card,
    Button,
    Badge,
    Table,
    Modal,
    Spinner,
} from "react-bootstrap";

// DUMMY DATA
const DUMMY_BOOKINGS = [
    {
        BookingID: 1,
        Member: {
            UserID: 3,
            FullName: "Lê Thị Trà Mi",
            Email: "mi@gmail.com",
            PhoneNumber: "0905556666",
        },
        BookingDate: "2025-06-18",
        Time: "18:30",
        Status: "Pending",
        Notes: "Tôi cần tư vấn về stress.",
    },
    {
        BookingID: 2,
        Member: {
            UserID: 4,
            FullName: "Trần Thị Bình",
            Email: "member.binh@example.com",
            PhoneNumber: "0907778888",
        },
        BookingDate: "2025-06-19",
        Time: "20:00",
        Status: "Pending",
        Notes: "Muốn hỏi về chế độ ăn phù hợp.",
    },
];

const DUMMY_MEMBERS = [
    {
        UserID: 3,
        FullName: "Lê Thị Trà Mi",
        Email: "mi@gmail.com",
        PhoneNumber: "0905556666",
        Membership: "Gói Cơ bản",
        Status: "Active",
        StartDate: "2025-06-01",
        Plan: {
            QuitPlanID: 1,
            CigarettesPerDayAtStart: 20,
            PricePerPackAtStart: 25000,
            StartDate: "2025-06-01",
            Reason: "Vì sức khỏe của gia đình",
            PlanDetails: "Giảm dần 2 điếu mỗi ngày",
            Status: "Active",
            DaysSmokeFree: 10,
            CigarettesQuit: 50,
            MoneySaved: 100000,
        },
        Progress: [
            {
                name: "Nhịp tim ổn định",
                percent: 100,
                description: "Huyết áp và nhịp tim của bạn bắt đầu trở lại mức bình thường, giảm gánh nặng cho tim.",
                time: "20 phút",
            },
            {
                name: "Mức Oxy tăng",
                percent: 15,
                description: "Nồng độ CO trong máu giảm, cho phép oxy lưu thông tốt hơn.",
                time: "8 giờ",
            },
            {
                name: "Nguy cơ đau tim giảm",
                percent: 100,
                description: "Nguy cơ bị một cơn đau tim đột ngột đã giảm đi đáng kể.",
                time: "24 giờ",
            },
            {
                name: "Vị giác và khứu giác cải thiện",
                percent: 54,
                description: "Các đầu dây thần kinh bắt đầu tái tạo, giúp bạn cảm nhận mùi vị tốt hơn.",
                time: "48 giờ",
            },
        ],
    },
    {
        UserID: 4,
        FullName: "Trần Thị Bình",
        Email: "member.binh@example.com",
        PhoneNumber: "0907778888",
        Membership: "Gói Cao cấp",
        Status: "Active",
        StartDate: "2025-05-25",
        Plan: null,
        Progress: [],
    },
];

// Modal xác nhận lịch tư vấn
function BookingActionModal({ show, onHide, booking, onConfirm, onReject }) {
    if (!booking) return null;
    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Xác nhận lịch tư vấn</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>
                    Bạn muốn <b>nhận</b> lịch tư vấn với <b>{booking.Member.FullName}</b> vào lúc <b>{booking.BookingDate} {booking.Time}</b>?
                </p>
                <div className="mb-2">
                    <div><b>Email:</b> {booking.Member.Email}</div>
                    <div><b>Điện thoại:</b> {booking.Member.PhoneNumber}</div>
                    <div><b>Ghi chú:</b> {booking.Notes}</div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="danger" onClick={onReject}>Từ chối</Button>
                <Button variant="success" onClick={onConfirm}>Nhận lịch</Button>
            </Modal.Footer>
        </Modal>
    );
}

// Modal xem thông tin chi tiết member
function MemberDetailModal({ show, onHide, member }) {
    if (!member) return null;
    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Chi tiết thành viên: {member.FullName}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col md={6}>
                        <h5>Thông tin thành viên</h5>
                        <Table bordered size="sm">
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
                                    <td>Gói thành viên</td>
                                    <td>{member.Membership}</td>
                                </tr>
                                <tr>
                                    <td>Ngày tham gia</td>
                                    <td>{member.StartDate}</td>
                                </tr>
                                <tr>
                                    <td>Trạng thái</td>
                                    <td>
                                        <Badge bg={member.Status === "Active" ? "success" : "secondary"}>
                                            {member.Status}
                                        </Badge>
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                        {member.Plan && (
                            <>
                                <h5 className="mt-3">Kế hoạch cai thuốc</h5>
                                <Table bordered size="sm">
                                    <tbody>
                                        <tr>
                                            <td>Ngày bắt đầu</td>
                                            <td>{member.Plan.StartDate}</td>
                                        </tr>
                                        <tr>
                                            <td>Điếu/ngày lúc bắt đầu</td>
                                            <td>{member.Plan.CigarettesPerDayAtStart}</td>
                                        </tr>
                                        <tr>
                                            <td>Giá 1 gói thuốc (VND)</td>
                                            <td>{member.Plan.PricePerPackAtStart?.toLocaleString()}</td>
                                        </tr>
                                        <tr>
                                            <td>Lý do</td>
                                            <td>{member.Plan.Reason}</td>
                                        </tr>
                                        <tr>
                                            <td>Chi tiết kế hoạch</td>
                                            <td>{member.Plan.PlanDetails}</td>
                                        </tr>
                                        <tr>
                                            <td>Trạng thái</td>
                                            <td>
                                                <Badge bg={member.Plan.Status === "Active" ? "success" : "secondary"}>
                                                    {member.Plan.Status}
                                                </Badge>
                                            </td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </>
                        )}
                    </Col>
                    <Col md={6}>
                        {member.Plan ? (
                            <div className="mb-3">
                            </div>
                        ) : (
                            <div className="mb-3">Chưa có kế hoạch cai thuốc.</div>
                        )}
                        <div>
                            <h5>Tiến trình milestone</h5>
                            {member.Progress && member.Progress.length > 0 ? (
                                <div>
                                    {member.Progress.map((item, idx) => (
                                        <div key={idx} style={{
                                            background: "#fff",
                                            borderRadius: 12,
                                            border: "1px solid #e3e4e4",
                                            margin: "10px 0",
                                            padding: 12,
                                            boxShadow: "0 2px 6px #0001"
                                        }}>
                                            <div style={{ fontWeight: 600 }}>
                                                <span style={{
                                                    color: "#1EAD75",
                                                    fontWeight: 700,
                                                    fontSize: 18,
                                                    marginRight: 10
                                                }}>{item.percent}%</span>
                                                {item.name}
                                            </div>
                                            <div style={{ color: "#444" }}>{item.description}</div>
                                            <div className="text-end" style={{ fontSize: 14, color: "#2EA3A3" }}>{item.time}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div>Chưa có tiến trình.</div>
                            )}
                        </div>
                    </Col>
                </Row>
            </Modal.Body>
        </Modal>
    );
}

// ========== MAIN DASHBOARD ==========

const CoachDashboard = () => {
    // bookings = lịch tư vấn đang chờ xác nhận
    const [bookings, setBookings] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    const [showMemberModal, setShowMemberModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);

    useEffect(() => {
        setBookings(DUMMY_BOOKINGS);
        setMembers(DUMMY_MEMBERS);
        setLoading(false);
    }, []);

    // Gửi thông báo cho member khi xác nhận hoặc từ chối (API thực tế ở đây)
    const notifyMember = (memberId, message) => {
        // TODO: Gọi API gửi thông báo cho member
        // fetch('/api/notify', { method: 'POST', body: JSON.stringify({ userId: memberId, message }) })
        //   .then(...)
        alert(`Đã gửi thông báo tới member ${memberId}: ${message}`);
    };

    // --- Lịch tư vấn, xác nhận hoặc từ chối ---
    const handleClickBooking = (booking) => {
        setSelectedBooking(booking);
        setShowBookingModal(true);
    };
    const handleConfirmBooking = () => {
        notifyMember(selectedBooking.Member.UserID, "Lịch tư vấn của bạn đã được coach xác nhận!");
        setShowBookingModal(false);
        // TODO: Cập nhật trạng thái lịch tư vấn (API update ConsultationBooking.Status = Confirmed)
    };
    const handleRejectBooking = () => {
        notifyMember(selectedBooking.Member.UserID, "Lịch tư vấn của bạn đã bị coach từ chối.");
        setShowBookingModal(false);
        // TODO: Cập nhật trạng thái lịch tư vấn (API update ConsultationBooking.Status = Cancelled)
    };

    // --- Xem thông tin member ---
    const handleClickMember = (member) => {
        setSelectedMember(member);
        setShowMemberModal(true);
    };

    return (
        <Container style={{ marginTop: 40, marginBottom: 40 }}>
            <h2 className="fw-bold mb-4">Coach Dashboard</h2>
            {loading ? (
                <div className="text-center my-5">
                    <Spinner animation="border" />
                </div>
            ) : (
                <>
                    {/* Lịch tư vấn */}
                    <Card className="mb-4">
                        <Card.Header as="h5">Lịch tư vấn đang chờ xác nhận</Card.Header>
                        <Card.Body>
                            {bookings.length === 0 ? (
                                <div>Không có lịch tư vấn nào đang chờ.</div>
                            ) : (
                                <Table bordered hover responsive>
                                    <thead>
                                        <tr>
                                            <th>Thành viên</th>
                                            <th>Ngày</th>
                                            <th>Giờ</th>
                                            <th>Ghi chú</th>
                                            <th>Trạng thái</th>
                                            <th>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bookings.map((b) => (
                                            <tr key={b.BookingID}>
                                                <td>{b.Member.FullName}</td>
                                                <td>{b.BookingDate}</td>
                                                <td>{b.Time}</td>
                                                <td>{b.Notes}</td>
                                                <td>
                                                    <Badge bg="warning" text="dark">{b.Status}</Badge>
                                                </td>
                                                <td>
                                                    <Button size="sm" variant="success" onClick={() => handleClickBooking(b)}>
                                                        Xem chi tiết
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>

                    {/* Danh sách member */}
                    <Card>
                        <Card.Header as="h5">Danh sách thành viên đang đồng hành</Card.Header>
                        <Card.Body>
                            {members.length === 0 ? (
                                <div>Chưa có thành viên nào chọn bạn làm coach.</div>
                            ) : (
                                <Table bordered hover responsive>
                                    <thead>
                                        <tr>
                                            <th>Họ tên</th>
                                            <th>Email</th>
                                            <th>Điện thoại</th>
                                            <th>Gói thành viên</th>
                                            <th>Ngày tham gia</th>
                                            <th>Trạng thái</th>
                                            <th>Xem chi tiết</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {members.map((m) => (
                                            <tr key={m.UserID}>
                                                <td>{m.FullName}</td>
                                                <td>{m.Email}</td>
                                                <td>{m.PhoneNumber}</td>
                                                <td>{m.Membership}</td>
                                                <td>{m.StartDate}</td>
                                                <td>
                                                    <Badge bg={m.Status === "Active" ? "success" : "secondary"}>
                                                        {m.Status}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <Button size="sm" variant="primary" onClick={() => handleClickMember(m)}>
                                                        Xem chi tiết
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>
                </>
            )}

            {/* Modal xác nhận lịch tư vấn */}
            <BookingActionModal
                show={showBookingModal}
                onHide={() => setShowBookingModal(false)}
                booking={selectedBooking}
                onConfirm={handleConfirmBooking}
                onReject={handleRejectBooking}
            />
            {/* Modal xem chi tiết member */}
            <MemberDetailModal
                show={showMemberModal}
                onHide={() => setShowMemberModal(false)}
                member={selectedMember}
            />
        </Container>
    );
};

export default CoachDashboard;