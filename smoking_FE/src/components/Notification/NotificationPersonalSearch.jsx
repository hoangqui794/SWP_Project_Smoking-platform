import { Form, Row, Col, InputGroup, Button } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
const NotificationPersonalSearch = ({
    inputUserId,
    setInputUserId,
    searchUserId,
    onSearchUserId
}) => (
    <Form onSubmit={onSearchUserId} className="mb-3">
        <Row>
            <Col xs={12} md={6} lg={4}>
                <InputGroup>
                    <Form.Control
                        type="number"
                        min={1}
                        placeholder="Nhập user ID..."
                        value={inputUserId}
                        onChange={e => setInputUserId(e.target.value)}
                    />
                    <Button variant="success" type="submit"><FaSearch /></Button>
                </InputGroup>
            </Col>
            <Col xs={12} md={6} className="text-muted d-flex align-items-center mt-2 mt-md-0">
                <span style={{ fontSize: 14 }}>
                    Đang xem thông báo của User ID: <b>{searchUserId}</b>
                </span>
            </Col>
        </Row>
    </Form>
);
export default NotificationPersonalSearch;