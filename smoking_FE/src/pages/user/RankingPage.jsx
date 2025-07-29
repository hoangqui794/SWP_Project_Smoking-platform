import React, { useState } from "react";
import {
    Container,
    Card,
    Tabs,
    Tab,
} from "react-bootstrap";
import SmokeFreeDaysRanking from "../../components/Ranking/SmokeFreeDaysRanking";
import MoneySavedRanking from "../../components/Ranking/MoneySavedRanking";
import CigarettesDroppedRanking from "../../components/Ranking/CigarettesDroppedRanking";
import AchievementsRanking from "../../components/Ranking/AchievementsRanking";
import ChallengesCompletedRanking from "../../components/Ranking/ChallengesCompletedRanking";
import "../../styles/RankingPage.scss";

function UserRanking() {
    const [activeKey, setActiveKey] = useState("smoke-free-days");

    return (
        <div style={{ background: "#f6f8fa", minHeight: "100vh" }}>
            <div
                style={{
                    background: "linear-gradient(90deg, #2563eb 60%, #38bdf8 100%)",
                    padding: "48px 0 32px 0",
                    borderBottomLeftRadius: 32,
                    borderBottomRightRadius: 32,
                    marginBottom: 32,
                }}
            >
                <Container style={{ maxWidth: 1100 }}>
                    <h1 className="fw-bold text-white mb-2 text-center" style={{ fontSize: 38, letterSpacing: 1 }}>
                        🏆 Bảng xếp hạng thành viên
                    </h1>
                    <div className="text-center text-white-50 mb-1" style={{ fontSize: 20, opacity: 0.95 }}>
                        Khám phá và thi đua cùng cộng đồng cai thuốc lá tích cực!
                    </div>
                </Container>
            </div>

            <Container style={{ maxWidth: 1100 }}>
                <Card style={{ borderRadius: 18, boxShadow: "0 6px 30px rgba(0,0,0,0.08)" }}>
                    <Card.Body style={{ padding: 0 }}>
                        <Tabs
                            activeKey={activeKey}
                            onSelect={setActiveKey}
                            className="nav-justified nav-tabs"
                            style={{
                                borderBottom: "2px solid #f1f3f4",
                                backgroundColor: "#f8f9fa"
                            }}
                        >
                            <Tab
                                eventKey="smoke-free-days"
                                title={<span style={{ padding: "4px 8px", fontSize: "14px", fontWeight: "500", display: "block" }}>🚭 Ngày không hút thuốc</span>}
                            >
                                <div style={{ padding: "24px" }}>
                                    <SmokeFreeDaysRanking />
                                </div>
                            </Tab>
                            <Tab
                                eventKey="money-saved"
                                title={<span style={{ padding: "4px 8px", fontSize: "14px", fontWeight: "500", display: "block" }}>💰 Tiền tiết kiệm</span>}
                            >
                                <div style={{ padding: "24px" }}>
                                    <MoneySavedRanking />
                                </div>
                            </Tab>
                            <Tab
                                eventKey="cigarettes-dropped"
                                title={<span style={{ padding: "4px 8px", fontSize: "14px", fontWeight: "500", display: "block" }}>🚬 Điếu đã bỏ</span>}
                            >
                                <div style={{ padding: "24px" }}>
                                    <CigarettesDroppedRanking />
                                </div>
                            </Tab>
                            {/* <Tab
                                eventKey="achievements"
                                title={<span style={{ padding: "4px 8px", fontSize: "14px", fontWeight: "500", display: "block" }}>🏅 Thành tích</span>}
                            >
                                <div style={{ padding: "24px" }}>
                                    <AchievementsRanking />
                                </div>
                            </Tab> */}
                            <Tab
                                eventKey="challenges"
                                title={<span style={{ padding: "4px 8px", fontSize: "14px", fontWeight: "500", display: "block" }}>✅ Thử thách</span>}
                            >
                                <div style={{ padding: "24px" }}>
                                    <ChallengesCompletedRanking />
                                </div>
                            </Tab>
                        </Tabs>
                    </Card.Body>
                </Card>

                <div className="mt-4 text-center text-secondary" style={{ fontSize: 15 }}>
                    <div className="d-flex justify-content-center align-items-center gap-3 flex-wrap pb-4">
                        <span>🎯 <b>Mục tiêu hôm nay:</b> Hoàn thành milestone mới để tăng hạng!</span>
                        <span>|</span>
                        <span>💪 <b>Động lực:</b> Mỗi ngày không hút là một chiến thắng!</span>
                    </div>
                </div>
            </Container>
        </div>
    );
}

export default UserRanking;