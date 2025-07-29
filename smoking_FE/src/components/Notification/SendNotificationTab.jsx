import React, { useState } from "react";
import { Form, Button, Row, Col, Alert } from "react-bootstrap";

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

const SendNotificationTab = () => {
    const [form, setForm] = useState({
        toAllUsers: false,
        toRole: "",
        emails: "",
        message: "",
        notificationType: "",
        notificationName: "",
        condition: "",
        notificationFor: "",
        createdBy: "",
        sendEmail: true,
    });
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState({ type: "", message: "" });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
        // Nếu gửi cho tất cả, clear role/emails
        if (name === "toAllUsers" && checked) {
            setForm((prev) => ({
                ...prev,
                toRole: "",
                emails: "",
                [name]: checked,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        setResult({ type: "", message: "" });
        try {
            const token = localStorage.getItem("userToken");
            const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

            // emails là chuỗi, cần tách thành mảng, loại bỏ rỗng và trim
            const emailArr = form.emails
                ? form.emails.split(",").map(e => e.trim()).filter(e => e)
                : [];

            const body = {
                toAllUsers: !!form.toAllUsers,
                toRole: !form.toAllUsers && form.toRole ? form.toRole : "",
                emails: !form.toAllUsers && emailArr.length > 0 ? emailArr : [],
                message: form.message,
                notificationType: form.notificationType,
                notificationName: form.notificationName,
                condition: form.condition || "",
                notificationFor: form.notificationFor,
                createdBy: form.createdBy || userInfo.name || userInfo.username || "Admin",
                sendEmail: !!form.sendEmail,
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
            setResult({ type: "success", message: "Gửi thông báo thành công!" });
            setForm({
                toAllUsers: false,
                toRole: "",
                emails: "",
                message: "",
                notificationType: "",
                notificationName: "",
                condition: "",
                notificationFor: "",
                createdBy: "",
                sendEmail: true,
            });
        } catch {
            setResult({ type: "danger", message: "Gửi thông báo thất bại!" });
        }
        setSending(false);
    };

    return (
        <Form onSubmit={handleSubmit} className="p-3 bg-light rounded">
            <h5 className="mb-3">Gửi thông báo qua Email</h5>
            {result.message && <Alert variant={result.type}>{result.message}</Alert>}
            <Row className="mb-3">
                <Col md={3} className="align-self-center">
                    <Form.Check
                        type="checkbox"
                        label="Gửi cho tất cả người dùng"
                        name="toAllUsers"
                        checked={form.toAllUsers}
                        onChange={handleChange}
                    />
                </Col>
                {!form.toAllUsers && (
                    <>
                        <Col md={3}>
                            <Form.Select
                                name="toRole"
                                value={form.toRole}
                                onChange={handleChange}
                            >
                                <option value="">Chọn vai trò</option>
                                {notifyToOptions
                                    .filter(opt => opt.value !== "All Users")
                                    .map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                            </Form.Select>
                        </Col>
                        <Col md={6}>
                            <Form.Control
                                type="text"
                                name="emails"
                                placeholder="Email (cách nhau bởi dấu phẩy, tùy chọn)"
                                value={form.emails}
                                onChange={handleChange}
                            />
                        </Col>
                    </>
                )}
            </Row>
            <Row className="mb-3">
                <Col md={4}>
                    <Form.Control
                        type="text"
                        name="notificationName"
                        placeholder="Tên thông báo"
                        value={form.notificationName}
                        onChange={handleChange}
                        required
                    />
                </Col>
                <Col md={4}>
                    <Form.Select
                        name="notificationType"
                        value={form.notificationType}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Chọn loại</option>
                        {notificationTypeOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </Form.Select>
                </Col>
                <Col md={4}>
                    <Form.Select
                        name="notificationFor"
                        value={form.notificationFor}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Thông báo cho</option>
                        {notifyToOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </Form.Select>
                </Col>
            </Row>
            <Row className="mb-3">
                <Col md={6}>
                    <Form.Control
                        type="text"
                        name="condition"
                        placeholder="Điều kiện (nếu có)"
                        value={form.condition}
                        onChange={handleChange}
                    />
                </Col>
                <Col md={6}>
                    <Form.Control
                        type="text"
                        name="createdBy"
                        placeholder="Người tạo"
                        value={form.createdBy}
                        onChange={handleChange}
                    />
                </Col>
            </Row>
            <Form.Group className="mb-3">
                <Form.Control
                    as="textarea"
                    rows={3}
                    name="message"
                    placeholder="Nội dung thông báo"
                    value={form.message}
                    onChange={handleChange}
                    required
                />
            </Form.Group>
            <Form.Check
                type="checkbox"
                label="Gửi email"
                name="sendEmail"
                checked={form.sendEmail}
                onChange={handleChange}
                className="mb-3"
            />
            <Button type="submit" variant="primary" disabled={sending}>
                {sending ? "Đang gửi..." : "Gửi thông báo"}
            </Button>
        </Form>
    );
};

export default SendNotificationTab;