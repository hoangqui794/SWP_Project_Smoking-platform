import React, { useEffect, useState } from "react";
import { Table, Button, Toast, ToastContainer, Modal } from "react-bootstrap";
import { FaCheck, FaTimes } from "react-icons/fa";

function PendingBlogTab({ reloadBlogList }) {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastVariant, setToastVariant] = useState('success');
    const [showModal, setShowModal] = useState(false);
    const [modalAction, setModalAction] = useState('');
    const [blogToAction, setBlogToAction] = useState(null);

    // Hàm hiển thị toast
    const showToastMessage = (message, variant = 'success') => {
        setToastMessage(message);
        setToastVariant(variant);
        setShowToast(true);
    };

    // Hàm gọi API để lấy danh sách blog đang chờ duyệt
    const fetchPendingBlogs = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('userToken');
            const res = await fetch('/api/BlogAdmin/pending', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error("Failed to fetch pending blogs");
            const data = await res.json();
            setBlogs(data);
        } catch (e) {
            console.error(e);
            setBlogs([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPendingBlogs();
    }, []);

    // Hàm xử lý khi duyệt bài viết
    const handleApprove = (blogId) => {
        setBlogToAction(blogId);
        setModalAction('approve');
        setShowModal(true);
    };

    // Hàm xử lý khi từ chối bài viết
    const handleReject = (blogId) => {
        setBlogToAction(blogId);
        setModalAction('reject');
        setShowModal(true);
    };

    // Xác nhận hành động
    const confirmAction = async () => {
        if (!blogToAction || !modalAction) return;

        try {
            const token = localStorage.getItem('userToken');
            const endpoint = modalAction === 'approve' ? 'approve' : 'reject';
            const res = await fetch(`/api/BlogAdmin/${endpoint}/${blogToAction}`, {
                method: 'PUT', // Hoặc POST tùy vào thiết kế API của bạn
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error();

            const successMessage = modalAction === 'approve'
                ? 'Bài viết đã được duyệt thành công.'
                : 'Bài viết đã bị từ chối.';
            showToastMessage(successMessage, 'success');

            // Xóa bài viết khỏi danh sách chờ duyệt trên UI
            setBlogs(blogs.filter(b => b.blogId !== blogToAction));
            // Tải lại danh sách chính ở tab "View"
            if (reloadBlogList) reloadBlogList();
        } catch {
            const errorMessage = modalAction === 'approve'
                ? 'Duyệt bài viết thất bại!'
                : 'Từ chối bài viết thất bại!';
            showToastMessage(errorMessage, 'danger');
        }

        setShowModal(false);
        setBlogToAction(null);
        setModalAction('');
    };

    return (
        <div>
            <h5 className="mb-3">Danh sách bài viết chờ duyệt</h5>
            <Table bordered hover responsive>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Tiêu đề</th>
                        <th>Tác giả</th>
                        <th>Ngày tạo</th>
                        <th className="text-center">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={5} className="text-center">Đang tải...</td>
                        </tr>
                    ) : blogs.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="text-center text-secondary">Không có bài viết nào cần duyệt.</td>
                        </tr>
                    ) : (
                        blogs.map((blog, idx) => (
                            <tr key={blog.blogId}>
                                <td>{idx + 1}</td>
                                <td>{blog.title}</td>
                                <td>{blog.authorName}</td>
                                <td>{new Date(blog.createdDate).toLocaleDateString('vi-VN')}</td>
                                <td className="text-center">
                                    <Button variant="success" size="sm" className="me-2" onClick={() => handleApprove(blog.blogId)}>
                                        <FaCheck /> Duyệt
                                    </Button>
                                    <Button variant="danger" size="sm" onClick={() => handleReject(blog.blogId)}>
                                        <FaTimes /> Từ chối
                                    </Button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>

            {/* Modal xác nhận */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {modalAction === 'approve' ? 'Xác nhận duyệt bài viết' : 'Xác nhận từ chối bài viết'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {modalAction === 'approve'
                        ? 'Bạn có chắc chắn muốn duyệt bài viết này?'
                        : 'Bạn có chắc chắn muốn từ chối bài viết này?'}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Hủy
                    </Button>
                    <Button
                        variant={modalAction === 'approve' ? 'success' : 'danger'}
                        onClick={confirmAction}
                    >
                        {modalAction === 'approve' ? 'Duyệt' : 'Từ chối'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Toast thông báo */}
            <ToastContainer position="top-end" className="p-3">
                <Toast
                    show={showToast}
                    onClose={() => setShowToast(false)}
                    delay={3000}
                    autohide
                    bg={toastVariant}
                >
                    <Toast.Header>
                        <strong className="me-auto">Thông báo</strong>
                    </Toast.Header>
                    <Toast.Body className={toastVariant === 'danger' ? 'text-white' : ''}>
                        {toastMessage}
                    </Toast.Body>
                </Toast>
            </ToastContainer>
        </div>
    );
}

export default PendingBlogTab;