import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const PlanOverviewPage = () => {
    const [plan, setPlan] = useState(null);
    const [coach, setCoach] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // 🚧 Giả lập API: lấy kế hoạch và coach đã chọn
        const mockPlan = {
            startDate: "2025-06-25",
            endDate: "2025-08-30",
            reason: "Vì sức khỏe và gia đình",
            difficulties: "Thèm thuốc, stress, môi trường",
            dailySmoking: 10,
            packPrice: 25000,
        };

        const mockCoach = {
            name: "Coach Minh",
            avatar: "https://randomuser.me/api/portraits/men/45.jpg",
            experience: 5,
            rating: 4.8,
            bio: "Chuyên gia cai thuốc giai đoạn đầu, nhiệt huyết và đồng hành cùng bạn.",
        };

        setTimeout(() => {
            setPlan(mockPlan);
            setCoach(mockCoach);
            setLoading(false);
        }, 1000);
    }, []);

    const calcMoneySaved = () => {
        if (!plan) return 0;
        const days = Math.ceil(
            (new Date(plan.endDate) - new Date(plan.startDate)) / (1000 * 60 * 60 * 24)
        );
        const dailyCost = (plan.dailySmoking / 20) * plan.packPrice;
        return dailyCost * days;
    };

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" />
            </Container>
        );
    }

    return (
        <Container className="mt-5">
            <h2 className="text-center mb-4">📋 Kế hoạch cai thuốc của bạn</h2>
            <Row>
                <Col md={7}>
                    <Card className="mb-4 shadow-sm">
                        <Card.Body>
                            <h5>🗓 Thời gian:</h5>
                            <p>Bắt đầu: {plan.startDate}</p>
                            <p>Kết thúc dự kiến: {plan.endDate}</p>

                            <h5>🎯 Lý do:</h5>
                            <p>{plan.reason}</p>

                            <h5>⚠️ Khó khăn dự đoán:</h5>
                            <p>{plan.difficulties}</p>

                            <h5>💰 Dự kiến tiết kiệm:</h5>
                            <p>{calcMoneySaved().toLocaleString()} VNĐ</p>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={5}>
                    <Card className="mb-4 shadow-sm text-center p-3">
                        <img
                            src={coach.avatar}
                            alt={coach.name}
                            className="rounded-circle mb-3"
                            style={{ width: "120px", height: "120px", objectFit: "cover" }}
                        />
                        <h5>{coach.name}</h5>
                        <p>⭐ {coach.rating} / 5.0 | {coach.experience} năm kinh nghiệm</p>
                        <p>{coach.bio}</p>
                        <Button variant="primary" className="mt-2 w-100" onClick={() => navigate("/chat")}>
                            💬 Chat với Coach
                        </Button>
                    </Card>
                </Col>
            </Row>

            <div className="text-center mt-4">
                <Button variant="success" className="me-2" onClick={() => navigate("/progress")}>
                    📊 Xem tiến trình
                </Button>
                <Button variant="warning" onClick={() => navigate("/User/Challenges")}>
                    🧩 Xem thử thách
                </Button>
            </div>
        </Container>
    );
};

export default PlanOverviewPage;
