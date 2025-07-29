import React, { useState } from "react";
import { Tabs, Tab } from "react-bootstrap";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import các component con
import MilestoneTab from "../../components/Plan/MilestoneTab ";
import UserProgressTab from "../../components/Plan/UserProgressTab";
import QuestionnaireTab from "../../components/Plan/QuestionnaireTab";
import ChallengeTab from "../../components/Plan/ChallengeTab";

function ManagementPlan() {
    const [activeTab, setActiveTab] = useState("milestone");

    return (
        <div className="container py-4">
            <h2 className="mb-4 text-success text-center">Quản lý tiến trình</h2>
            {/* ToastContainer nên được đặt ở component cha cao nhất */}
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

            <Tabs
                activeKey={activeTab}
                onSelect={setActiveTab}
                className="mb-3"
                justify
            >
                <Tab eventKey="milestone" title="Cấu hình tiến trình">
                    {/* Render component con tương ứng */}
                    <MilestoneTab />
                </Tab>

                <Tab eventKey="progress" title="Tiến trình người dùng">
                    {/* Render component con tương ứng */}
                    <UserProgressTab />
                </Tab>

                <Tab eventKey="plan" title="Bộ câu hỏi kế hoạch">
                    {/* Render component con tương ứng */}
                    <QuestionnaireTab />
                </Tab>

                <Tab eventKey="challenge" title="Thử thách">
                    {/* Render component con tương ứng */}
                    <ChallengeTab />
                </Tab>
            </Tabs>
        </div>
    );
}

export default ManagementPlan;