import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Modal, Image, Spinner, Alert } from "react-bootstrap";

const getUserInfo = () => ({
    userId: localStorage.getItem('userId'),
    token: localStorage.getItem('userToken'),
});

// CSS cho hiệu ứng xám
const grayscaleStyle = {
    filter: "grayscale(100%)",
    opacity: 0.6,
    cursor: "not-allowed"
};

// CSS cho huy hiệu đã mở khóa - hiệu ứng nổi bật
const unlockedCardStyle = {
    background: "white",
    border: "3px solidrgb(221, 235, 219)",
    boxShadow: "0 8px 25px rgba(211, 227, 209, 0.4)",
    animation: "pulse-glow 2s infinite alternate",
    position: "relative",
    overflow: "hidden"
};

// CSS cho huy hiệu chưa mở khóa
const lockedCardStyle = {
    background: "#f8f9fa",
    border: "2px solid #e9ecef",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)"
};

// CSS cho hiệu ứng hover
const cardHoverStyle = {
    transform: "translateY(-5px) scale(1.02)",
    transition: "all 0.3s ease",
    cursor: "pointer"
};

// CSS cho badge image nổi bật
const unlockedBadgeStyle = {
    width: 90,
    height: 90,
    border: "4px solid #fff",
    borderRadius: "50%",
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.3)",
    animation: "gentle-bounce 3s ease-in-out infinite"
};

const lockedBadgeStyle = {
    width: 90,
    height: 90,
    borderRadius: "50%"
};

const AchievementGallery = () => {
    const { userId, token } = getUserInfo();
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hoveredCard, setHoveredCard] = useState(null);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        if (!userId || !token) {
            setError("Bạn chưa đăng nhập.");
            setLoading(false);
            return;
        }
        fetch(`/api/user-achievement/all-status/${userId}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
            .then(res => res.ok ? res.json() : Promise.reject("API lỗi"))
            .then(data => {
                setAchievements(data || []);
                setLoading(false);
            })
            .catch(() => {
                setError("Không thể tải dữ liệu huy hiệu.");
                setLoading(false);
            });
    }, [userId, token]);

    const handleClick = (ach) => {
        setSelected(ach);
        setShowModal(true);
    };

    return (
        <Container style={{ marginTop: 40, marginBottom: 40 }}>
            {/* Thêm CSS animations */}
            <style>
                {`
                    @keyframes pulse-glow {
                        0% {
                            box-shadow: 0 8px 25px rgba(231, 243, 228, 0.4);
                        }
                        100% {
                            box-shadow: 0 12px 35px rgba(223, 238, 221, 0.7);
                        }
                    }
                    
                    @keyframes gentle-bounce {
                        0%, 100% {
                            transform: translateY(0px);
                        }
                        50% {
                            transform: translateY(-3px);
                        }
                    }
                    
                    @keyframes sparkle {
                        0%, 100% {
                            opacity: 0;
                        }
                        50% {
                            opacity: 1;
                        }
                    }
                    
                    @keyframes shimmer {
                        0% {
                            transform: translateX(-100%);
                        }
                        100% {
                            transform: translateX(100%);
                        }
                    }
                    
                    .achievement-card-unlocked {
                        position: relative;
                    }
                    
                    .achievement-card-unlocked::before {
                        content: '';
                        position: absolute;
                        top: -2px;
                        left: -2px;
                        right: -2px;
                        bottom: -2px;
                        background: linear-gradient(45deg,rgb(213, 224, 224),rgb(253, 254, 254),rgb(244, 251, 251),rgb(169, 214, 214));
                        background-size: 400% 400%;
                        border-radius: 15px;
                        z-index: -1;
                        animation: gradient-shift 3s ease infinite;
                    }
                    
                    @keyframes gradient-shift {
                        0% {
                            background-position: 0% 50%;
                        }
                        50% {
                            background-position: 100% 50%;
                        }
                        100% {
                            background-position: 0% 50%;
                        }
                    }
                    
                    .sparkle-effect {
                        position: absolute;
                        top: 10px;
                        right: 10px;
                        font-size: 20px;
                        animation: sparkle 2s infinite;
                    }
                `}
            </style>

            <h2 className="fw-bold mb-4 text-center" style={{
                color: "#2c3e50",
                textShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>
                🏆 Bộ sưu tập huy hiệu
            </h2>

            {loading ? (
                <div className="text-center my-5">
                    <Spinner animation="border" style={{ color: "#4cd137" }} />
                </div>
            ) : error ? (
                <Alert variant="danger" style={{ borderRadius: "15px" }}>
                    {error}
                </Alert>
            ) : (
                <Row className="g-4">
                    {achievements.map(ach => (
                        <Col xs={6} md={4} lg={3} key={ach.achievementID}>
                            <Card
                                className={`h-100 text-center ${ach.isUnlocked ? 'achievement-card-unlocked' : ''}`}
                                style={{
                                    cursor: "pointer",
                                    borderRadius: "15px",
                                    transition: "all 0.3s ease",
                                    ...(ach.isUnlocked ? unlockedCardStyle : lockedCardStyle),
                                    ...(hoveredCard === ach.achievementID ? cardHoverStyle : {})
                                }}
                                onClick={() => handleClick(ach)}
                                onMouseEnter={() => setHoveredCard(ach.achievementID)}
                                onMouseLeave={() => setHoveredCard(null)}
                            >
                                <Card.Body style={{ padding: "25px" }}>
                                    <div style={{ position: "relative", display: "inline-block" }}>
                                        <Image
                                            src={ach.badgeImage}
                                            alt={ach.achievementName}
                                            rounded
                                            style={{
                                                ...(ach.isUnlocked ? unlockedBadgeStyle : { ...lockedBadgeStyle, ...grayscaleStyle }),
                                                transform: hoveredCard === ach.achievementID ? "scale(1.1)" : "scale(1)"
                                            }}
                                        />

                                        {/* Hiệu ứng sparkle cho huy hiệu đã mở khóa */}
                                        {ach.isUnlocked && (
                                            <>
                                                <div className="sparkle-effect" style={{ top: "5px", right: "5px" }}>✨</div>
                                                <div className="sparkle-effect" style={{ top: "15px", right: "25px", animationDelay: "0.5s" }}>⭐</div>
                                                <div className="sparkle-effect" style={{ top: "25px", right: "10px", animationDelay: "1s" }}>💫</div>

                                                {/* Badge "Đã đạt được" */}
                                                <div style={{
                                                    position: "absolute",
                                                    top: "-8px",
                                                    right: "-8px",
                                                    background: "linear-gradient(45deg, #f39c12, #e67e22)",
                                                    color: "white",
                                                    borderRadius: "50%",
                                                    width: "30px",
                                                    height: "30px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: "14px",
                                                    fontWeight: "bold",
                                                    boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
                                                    border: "2px solid white"
                                                }}>
                                                    ✓
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <Card.Title
                                        className="mt-3"
                                        style={{
                                            fontSize: "1rem",
                                            fontWeight: "bold",
                                            color: ach.isUnlocked ? "#2c3e50" : "#2c3e50",
                                            textShadow: "none"
                                        }}
                                    >
                                        {ach.achievementName}
                                    </Card.Title>

                                    {/* Badge trạng thái */}
                                    <div style={{ marginTop: "10px" }}>
                                        {ach.isUnlocked ? (
                                            <span style={{
                                                background: "#4cd137",
                                                color: "white",
                                                padding: "4px 12px",
                                                borderRadius: "20px",
                                                fontSize: "0.8rem",
                                                fontWeight: "600",
                                                border: "1px solidrgb(130, 205, 216)"
                                            }}>
                                                🎉 Đã đạt được
                                            </span>
                                        ) : (
                                            <span style={{
                                                background: "#e9ecef",
                                                color: "#6c757d",
                                                padding: "4px 12px",
                                                borderRadius: "20px",
                                                fontSize: "0.8rem",
                                                fontWeight: "600"
                                            }}>
                                                🔒 Chưa đạt được
                                            </span>
                                        )}
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            {/* Modal xem chi tiết - cải tiến */}
            <Modal
                show={showModal}
                onHide={() => setShowModal(false)}
                centered
                size="md"
                style={{ zIndex: 1050 }}
            >
                {selected && (
                    <>
                        <Modal.Header
                            closeButton
                            style={{
                                background: selected.isUnlocked
                                    ? "linear-gradient(135deg,rgb(55, 209, 150),rgb(39, 138, 124))"
                                    : "linear-gradient(135deg, #95a5a6, #7f8c8d)",
                                color: "white",
                                border: "none",
                                borderTopLeftRadius: "15px",
                                borderTopRightRadius: "15px",
                                position: "relative",
                                overflow: "hidden"
                            }}
                        >
                            {selected.isUnlocked && (
                                <div style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)",
                                    animation: "shimmer 3s infinite"
                                }}></div>
                            )}
                            <Modal.Title style={{ fontSize: "1.4rem", fontWeight: "600", position: "relative", zIndex: 1 }}>
                                {selected.isUnlocked ? "🏆" : "🔒"} {selected.achievementName}
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body
                            className="text-center"
                            style={{
                                padding: "30px",
                                background: "#f8f9fa",
                                borderBottomLeftRadius: "15px",
                                borderBottomRightRadius: "15px"
                            }}
                        >
                            <div style={{ position: "relative", display: "inline-block", marginBottom: "20px" }}>
                                <Image
                                    src={selected.badgeImage}
                                    alt={selected.achievementName}
                                    style={{
                                        maxHeight: 200,
                                        width: "auto",
                                        borderRadius: "50%",
                                        border: selected.isUnlocked ? "6px solid #4cd137" : "4px solid #ddd",
                                        boxShadow: selected.isUnlocked
                                            ? "0 15px 30px rgba(76, 209, 55, 0.4)"
                                            : "0 8px 16px rgba(0, 0, 0, 0.2)",
                                        ...(selected.isUnlocked ? {} : grayscaleStyle)
                                    }}
                                />

                                {selected.isUnlocked && (
                                    <>
                                        {/* Hiệu ứng sparkle cho modal */}
                                        <div style={{
                                            position: "absolute",
                                            top: "10px",
                                            right: "10px",
                                            fontSize: "24px",
                                            animation: "sparkle 2s infinite"
                                        }}>✨</div>
                                        <div style={{
                                            position: "absolute",
                                            top: "30px",
                                            right: "40px",
                                            fontSize: "20px",
                                            animation: "sparkle 2s infinite",
                                            animationDelay: "0.5s"
                                        }}>⭐</div>
                                        <div style={{
                                            position: "absolute",
                                            top: "50px",
                                            right: "20px",
                                            fontSize: "18px",
                                            animation: "sparkle 2s infinite",
                                            animationDelay: "1s"
                                        }}>💫</div>

                                        {/* Badge xác nhận */}
                                        <div style={{
                                            position: "absolute",
                                            top: "-10px",
                                            right: "-10px",
                                            background: "linear-gradient(45deg, #f39c12, #e67e22)",
                                            color: "white",
                                            borderRadius: "50%",
                                            width: "40px",
                                            height: "40px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "18px",
                                            fontWeight: "bold",
                                            boxShadow: "0 6px 12px rgba(0,0,0,0.3)",
                                            border: "3px solid white"
                                        }}>
                                            ✓
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="mt-3">
                                <div style={{
                                    background: "white",
                                    padding: "20px",
                                    borderRadius: "12px",
                                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                                    marginBottom: "15px"
                                }}>
                                    <p style={{
                                        color: "#34495e",
                                        fontSize: "1.1rem",
                                        lineHeight: "1.6",
                                        margin: 0,
                                        fontWeight: "500"
                                    }}>
                                        {selected.description}
                                    </p>
                                </div>

                                <div style={{
                                    background: selected.isUnlocked
                                        ? "linear-gradient(135deg, #d5f4e6, #a3e9a4)"
                                        : "linear-gradient(135deg, #f8f9fa, #e9ecef)",
                                    padding: "15px",
                                    borderRadius: "12px",
                                    border: selected.isUnlocked ? "2px solid #4cd137" : "2px solid #dee2e6"
                                }}>
                                    <p style={{ margin: 0, fontSize: "1.1rem" }}>
                                        <span style={{ fontWeight: "600", color: "#2c3e50" }}>
                                            🎯 Trạng thái:
                                        </span>
                                        {" "}
                                        {selected.isUnlocked ? (
                                            <span style={{
                                                color: "#27ae60",
                                                fontWeight: "700",
                                                textShadow: "0 1px 2px rgba(0,0,0,0.1)"
                                            }}>
                                                🎉 Đã mở khóa thành công!
                                            </span>
                                        ) : (
                                            <span style={{
                                                color: "#7f8c8d",
                                                fontWeight: "600"
                                            }}>
                                                🔒 Chưa mở khóa
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </Modal.Body>
                    </>
                )}
            </Modal>
        </Container>
    );
};

export default AchievementGallery;