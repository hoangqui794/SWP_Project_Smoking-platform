import React, { useEffect, useState } from "react";
import { Table, Button, Toast, ToastContainer, Modal } from "react-bootstrap";
import { FaCheck, FaTimes } from "react-icons/fa";

function ReportedBlogTab({ reloadBlogList }) {
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

    // Fetch reported blogs
    // Fetch reported blogs
    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('userToken');
            const res = await fetch('/api/BlogAdmin/reported', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            setBlogs(data);
        } catch (e) {
            setBlogs([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    // Approve or reject
    const handleApprove = (blogId) => {
        setBlogToAction(blogId);
        setModalAction('approve');
        setShowModal(true);
    };

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
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error();

            const successMessage = modalAction === 'approve' ? 'Blog đã được duyệt.' : 'Blog đã bị từ chối.';
            showToastMessage(successMessage, 'success');
            setBlogs(blogs.filter(b => b.blogId !== blogToAction));
            if (reloadBlogList) reloadBlogList();
        } catch {
            const errorMessage = modalAction === 'approve' ? 'Duyệt blog thất bại!' : 'Từ chối blog thất bại!';
            showToastMessage(errorMessage, 'danger');
        }

        setShowModal(false);
        setBlogToAction(null);
        setModalAction('');
    };

    return (
        <div>
            <h5 className="mb-3">Duyệt bài viết bị báo cáo</h5>
            <Table bordered hover>
                <thead>
                    <tr>
                        <th>BlogID</th>
                        <th>Tiêu đề</th>
                        {/* <th>Nội dung</th> */}
                        <th>Bị báo cáo</th>
                        <th>Tác giả</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={6} className="text-center">Đang tải...</td>
                        </tr>
                    ) : blogs.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="text-center text-secondary">Không có bài viết nào bị báo cáo.</td>
                        </tr>
                    ) : (
                        blogs.map((blog, idx) => (
                            <tr key={blog.blogId}>
                                <td>{blog.blogId}</td>
                                <td>{blog.title}</td>
                                {/* <td style={{ maxWidth: 200, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                    {blog.content}
                                </td> */}
                                <td>
                                    {blog.reportCount > 0 ? `Bị báo cáo (${blog.reportCount})` : ""}
                                </td>
                                <td>{blog.authorName}</td>
                                <td>
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
                        {modalAction === 'approve' ? 'Xác nhận duyệt' : 'Xác nhận từ chối'}
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

export default ReportedBlogTab;