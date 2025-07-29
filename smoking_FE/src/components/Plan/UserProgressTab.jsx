import React, { useState, useEffect } from "react";
import { Table, Button, Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import { FaTrash } from "react-icons/fa"; // Thêm icon thùng rác cho đẹp

function UserProgressTab() {
    const [userPlans, setUserPlans] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userProgressHistory, setUserProgressHistory] = useState([]);

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null); // Lưu thông tin user sẽ bị xóa
    // Hàm load lại toàn bộ danh sách
    const fetchUserPlans = () => {
        const token = localStorage.getItem("userToken");
        if (!token) {
            // Không cần toast ở đây vì có thể được gọi lại nhiều lần
            console.error("No token found for fetching user plans.");
            return;
        }

        fetch("/api/admin/quitplan/ListAllPlans", {
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(res => res.ok ? res.json() : Promise.reject(res))
            .then(data => setUserPlans(data))
            .catch(err => {
                console.error("Lỗi khi tải danh sách kế hoạch:", err);
                toast.error("Không thể tải danh sách kế hoạch của người dùng.");
            });
    };

    // Lấy danh sách kế hoạch của tất cả người dùng khi component được tải
    useEffect(() => {
        fetchUserPlans();
    }, []);

    // Xử lý khi xem chi tiết tiến trình của một người dùng
    const handleViewDetails = (user) => {
        setSelectedUser(user);
        const token = localStorage.getItem("userToken");
        if (!token) return;

        fetch(`/api/admin/quitplan/GetUserIDProgress?userId=${user.userID}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.ok ? res.json() : Promise.reject(res))
            .then(data => setUserProgressHistory(data))
            .catch(err => {
                console.error("Lỗi tải tiến trình chi tiết:", err);
                toast.error("Không thể tải lịch sử tiến trình.");
            });
    };

    // Hàm này được gọi khi người dùng nhấn nút "Xoá". Nó chỉ mở Modal.
    const openDeleteConfirmModal = (user) => {
        setUserToDelete(user);
        setShowConfirmModal(true);
    };

    // Hàm này được gọi khi người dùng nhấn "Xác nhận Xóa" trong Modal
    const handleConfirmDelete = () => {
        const token = localStorage.getItem("userToken");
        if (!token || !userToDelete) {
            toast.error("Có lỗi xảy ra, không thể xác định người dùng cần xóa.");
            return;
        }

        fetch(`/api/admin/quitplan/DeleteQuitPlanAndProgressUserID?userId=${userToDelete.userID}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(res => {
                if (res.ok) {
                    toast.success("Xóa tiến trình thành công!");
                    fetchUserPlans(); // Tải lại bảng để đảm bảo dữ liệu luôn mới nhất
                } else {
                    return res.json().then(err => { throw new Error(err.message || 'Xóa thất bại') });
                }
            })
            .catch(err => {
                console.error("Lỗi khi xóa:", err);
                toast.error(err.message || "Đã xảy ra lỗi khi xoá.");
            })
            .finally(() => {
                // Đóng modal và reset state sau khi hoàn tất
                setShowConfirmModal(false);
                setUserToDelete(null);
            });
    };

    return (
        <div>
            <Table bordered hover responsive>
                <thead>
                    <tr className="text-center">
                        <th>Mã User</th>
                        <th>Ngày Bắt Đầu</th>
                        <th>Điếu/Ngày</th>
                        <th>Giá/Gói</th>
                        <th>Số Điếu/Gói</th>
                        <th>Trạng Thái</th>
                        <th>Hành Động</th>
                    </tr>
                </thead>
                <tbody>
                    {userPlans.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="text-center text-muted">Không có dữ liệu</td>
                        </tr>
                    ) : userPlans.map((plan) => (
                        <tr key={plan.userID} className="text-center align-middle">
                            <td>{plan.userID}</td>
                            <td>{new Date(plan.startDate).toLocaleDateString("vi-VN")}</td>
                            <td>{plan.cigarettesPerDayAtStart}</td>
                            <td>{plan.pricePerPackAtStart?.toLocaleString()} vnđ</td>
                            <td>{plan.cigarettesPerPack}</td>
                            <td>{plan.status}</td>
                            <td>
                                <Button variant="outline-info" size="sm" className="me-2" onClick={() => handleViewDetails(plan)}>
                                    Xem chi tiết
                                </Button>
                                <Button variant="outline-danger" size="sm" onClick={() => openDeleteConfirmModal(plan)}>
                                    Xoá
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Modal xem chi tiết tiến trình */}
            <Modal show={!!selectedUser} onHide={() => setSelectedUser(null)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Lịch sử tiến trình của User #{selectedUser?.userID}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {/* ... Nội dung chi tiết của Modal ... */}
                    <Table bordered>
                        <thead>
                            <tr className="text-center">
                                <th>Ngày</th>
                                <th>Điếu Hôm Nay</th>
                                <th>Tổng Bỏ</th>
                                <th>Tiền Tiết Kiệm</th>
                                <th>Ghi Chú</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userProgressHistory.length === 0 ? (
                                <tr><td colSpan={5} className="text-center text-muted">Không có dữ liệu tiến trình</td></tr>
                            ) : (
                                userProgressHistory.map((item, idx) => (
                                    <tr key={idx} className="text-center">
                                        <td>{new Date(item.progressDate).toLocaleDateString("vi-VN")}</td>
                                        <td>{item.cigarettesSmokedToday ?? "N/A"}</td>
                                        <td>{item.totalCigarettesDropped ?? "N/A"}</td>
                                        <td>{item.totalMoneySaved != null ? item.totalMoneySaved.toLocaleString() + " vnđ" : "0 vnđ"}</td>
                                        <td>{item.notes || "Không"}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </Modal.Body>
            </Modal>

            <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="text-danger">
                        <FaTrash className="me-2" /> Xác nhận xóa
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Bạn có chắc chắn muốn xóa toàn bộ kế hoạch và tiến trình của người dùng <strong>#{userToDelete?.userID}</strong> không?
                    <br />
                    Hành động này sẽ xóa vĩnh viễn và không thể hoàn tác.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
                        Hủy
                    </Button>
                    <Button variant="danger" onClick={handleConfirmDelete}>
                        Xác nhận Xóa
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default UserProgressTab;