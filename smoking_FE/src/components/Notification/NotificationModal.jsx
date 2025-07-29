import { Modal, Button, Form, Row, Col } from "react-bootstrap";
const NotificationModal = ({
    show,
    onHide,
    onSubmit,
    isEdit,
    newNotification,
    setNewNotification,
    notificationTypeOptions,
    notifyToOptions
}) => (
    <Modal
        show={show}
        onHide={onHide}
        centered
        size="lg"
        backdrop="static"
    >
        <Modal.Header closeButton>
            <Modal.Title as="h3" style={{ fontWeight: 700 }}>
                {isEdit ? "Sửa thông báo" : "Thêm thông báo"}
            </Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form>
                <Form.Group as={Row} className="mb-3" controlId="notificationName">
                    <Form.Label column sm={3} className="fst-italic fw-semibold">
                        Tên thông báo:
                    </Form.Label>
                    <Col sm={9}>
                        <Form.Control
                            type="text"
                            placeholder="Nhập tên thông báo"
                            value={newNotification.notificationName}
                            onChange={e => setNewNotification({ ...newNotification, notificationName: e.target.value })}
                            className="rounded-pill px-4 py-2"
                        />
                    </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3" controlId="notificationMessage">
                    <Form.Label column sm={3} className="fst-italic fw-semibold">
                        Nội dung:
                    </Form.Label>
                    <Col sm={9}>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            placeholder="Nội dung gửi"
                            value={newNotification.message}
                            onChange={e => setNewNotification({ ...newNotification, message: e.target.value })}
                            className="rounded-pill px-4 py-2"
                            style={{ resize: "none" }}
                        />
                    </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3" controlId="notificationType">
                    <Form.Label column sm={3} className="fst-italic fw-semibold">
                        Loại:
                    </Form.Label>
                    <Col sm={9}>
                        <Form.Select
                            value={newNotification.notificationType}
                            onChange={e => setNewNotification({ ...newNotification, notificationType: e.target.value })}
                            className="rounded-pill px-4 py-2"
                        >
                            <option value="">Chọn loại</option>
                            {notificationTypeOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </Form.Select>
                    </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3" controlId="notificationCondition">
                    <Form.Label column sm={3} className="fst-italic fw-semibold">
                        Điều kiện:
                    </Form.Label>
                    <Col sm={9}>
                        <Form.Control
                            type="text"
                            placeholder="Nhập điều kiện"
                            value={newNotification.condition}
                            onChange={e => setNewNotification({ ...newNotification, condition: e.target.value })}
                            className="rounded-pill px-4 py-2"
                        />
                    </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3" controlId="notificationFor">
                    <Form.Label column sm={3} className="fst-italic fw-semibold">
                        Thông báo cho:
                    </Form.Label>
                    <Col sm={9}>
                        <Form.Select
                            value={newNotification.notificationFor}
                            onChange={e => setNewNotification({ ...newNotification, notificationFor: e.target.value })}
                            className="rounded-pill px-4 py-2"
                        >
                            <option value="">Chọn đối tượng</option>
                            {notifyToOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </Form.Select>
                    </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3" controlId="notificationDate">
                    <Form.Label column sm={3} className="fst-italic fw-semibold">
                        Ngày gửi:
                    </Form.Label>
                    <Col sm={9}>
                        <Form.Control
                            type="date"
                            value={newNotification.notificationDate}
                            onChange={e => setNewNotification({ ...newNotification, notificationDate: e.target.value })}
                            className="rounded-pill px-4 py-2"
                        />
                    </Col>
                </Form.Group>
            </Form>
        </Modal.Body>
        <Modal.Footer>
            <Button
                variant="outline-secondary"
                className="rounded-pill px-4 fw-semibold"
                onClick={onHide}
            >
                Hủy
            </Button>
            <Button
                variant="primary"
                className="rounded-pill px-4 fw-semibold"
                onClick={onSubmit}
            >
                Lưu
            </Button>
        </Modal.Footer>
    </Modal>
);
export default NotificationModal;