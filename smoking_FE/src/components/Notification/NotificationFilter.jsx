import { Row, Col, Form } from "react-bootstrap";
const NotificationFilter = ({ searchAll, setSearchAll, notificationTypeOptions, notifyToOptions }) => (
    <Form className="bg-light p-2 rounded mb-3" onSubmit={e => e.preventDefault()}>
        <Row>
            <Col md={3} className="mb-2">
                <Form.Control
                    placeholder="Tên thông báo"
                    value={searchAll.notificationName}
                    onChange={e => setSearchAll(s => ({ ...s, notificationName: e.target.value }))}
                />
            </Col>
            <Col md={2} className="mb-2">
                <Form.Select
                    value={searchAll.notificationType}
                    onChange={e => setSearchAll(s => ({ ...s, notificationType: e.target.value }))}
                >
                    <option value="">Loại</option>
                    {notificationTypeOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </Form.Select>
            </Col>
            <Col md={2} className="mb-2">
                <Form.Control
                    placeholder="Điều kiện"
                    value={searchAll.condition}
                    onChange={e => setSearchAll(s => ({ ...s, condition: e.target.value }))}
                />
            </Col>
            <Col md={2} className="mb-2">
                <Form.Select
                    value={searchAll.notificationFor}
                    onChange={e => setSearchAll(s => ({ ...s, notificationFor: e.target.value }))}
                >
                    <option value="">Thông báo cho</option>
                    {notifyToOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </Form.Select>
            </Col>
            <Col md={2} className="mb-2">
                <Form.Control
                    type="date"
                    value={searchAll.notificationDate}
                    onChange={e => setSearchAll(s => ({ ...s, notificationDate: e.target.value }))}
                />
            </Col>
            {/* <Col md={1} className="mb-2">
                <Form.Control
                    placeholder="Người tạo"
                    value={searchAll.createdBy}
                    onChange={e => setSearchAll(s => ({ ...s, createdBy: e.target.value }))}
                />
            </Col> */}
        </Row>
    </Form>
);
export default NotificationFilter;