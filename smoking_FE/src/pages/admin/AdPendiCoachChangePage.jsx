import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';

const fetchPendingCoachChanges = async () => {
    const token = localStorage.getItem("userToken");
    const response = await fetch('/api/Admin/pending-coach-changes', {
        headers: {
            "Authorization": "Bearer " + token,
            "accept": "*/*"
        }
    });
    if (!response.ok) throw new Error("Lỗi tải danh sách yêu cầu đổi/hủy coach");
    return await response.json();
};

const approveCoachChange = async (userId) => {
    const token = localStorage.getItem("userToken");
    const response = await fetch(`/api/Admin/approve-coach-change/${userId}`, {
        method: "PUT",
        headers: {
            "Authorization": "Bearer " + token,
            "accept": "*/*"
        }
    });
    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.Message || "Duyệt yêu cầu thất bại");
    }
    return await response.json();
};

const AdminPendingCoachChangesPage = () => {
    const [pendingList, setPendingList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [approvingId, setApprovingId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [userToApprove, setUserToApprove] = useState(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await fetchPendingCoachChanges();
            setPendingList(data);
        } catch (err) {
            toast.error(err.message || "Lỗi tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleApprove = (userId) => {
        setUserToApprove(userId);
        setShowModal(true);
    };

    const confirmApprove = async () => {
        if (!userToApprove) return;

        setApprovingId(userToApprove);
        setShowModal(false);

        try {
            await approveCoachChange(userToApprove);
            toast.success("Duyệt yêu cầu thành công!");
            await loadData();
        } catch (err) {
            toast.error(err.message || "Duyệt yêu cầu thất bại");
        } finally {
            setApprovingId(null);
            setUserToApprove(null);
        }
    };

    return (
        <Container className="mt-4">
            <h2>Danh sách yêu cầu đổi/hủy huấn luyện viên đang chờ duyệt</h2>
            {loading ? (
                <div className="d-flex justify-content-center my-5">
                    <Spinner animation="border" />
                </div>
            ) : pendingList.length === 0 ? (
                <Alert variant="info" className="mt-4">
                    Không có yêu cầu nào đang chờ duyệt.
                </Alert>
            ) : (
                <Table striped bordered hover responsive className="mt-4">
                    <thead>
                        <tr>
                            <th>UserID</th>
                            <th>Họ tên</th>
                            <th>Coach hiện tại</th>
                            <th>Coach yêu cầu (nếu có)</th>
                            <th>Lý do</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingList.map(item => (
                            <tr key={item.userID}>
                                <td>{item.userID}</td>
                                <td>{item.fullName}</td>
                                <td>{item.currentCoachId ?? <i>Chưa có</i>}</td>
                                <td>
                                    {item.requestedCoachId === -1
                                        ? <span className="text-danger">Yêu cầu hủy</span>
                                        : (item.requestedCoachId ?? <i>---</i>)
                                    }
                                </td>
                                <td>{item.reason || <i>Không có</i>}</td>
                                <td>
                                    <Button
                                        variant="success"
                                        size="sm"
                                        disabled={approvingId === item.userID}
                                        onClick={() => handleApprove(item.userID)}
                                    >
                                        {approvingId === item.userID ? <Spinner size="sm" /> : "Duyệt"}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            {/* Modal xác nhận */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận duyệt yêu cầu</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Bạn có chắc chắn muốn duyệt yêu cầu đổi/hủy huấn luyện viên này?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Hủy
                    </Button>
                    <Button variant="success" onClick={confirmApprove}>
                        Duyệt
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default AdminPendingCoachChangesPage;