import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { Table, Button, Toast, ToastContainer, Modal } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";

// Dùng forwardRef để Tab khác gọi reload
const BlogManagementTab = forwardRef((props, ref) => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastVariant, setToastVariant] = useState('success');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [blogToDelete, setBlogToDelete] = useState(null);

    // Hàm hiển thị toast
    const showToastMessage = (message, variant = 'success') => {
        setToastMessage(message);
        setToastVariant(variant);
        setShowToast(true);
    };

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('userToken');
            const res = await fetch('/api/BlogAdmin/list', {
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

    // Xử lý xóa blog
    const handleDelete = (blogId) => {
        setBlogToDelete(blogId);
        setShowDeleteModal(true);
    };

    // Xác nhận xóa blog
    const confirmDelete = async () => {
        if (!blogToDelete) return;

        try {
            const token = localStorage.getItem('userToken');
            const res = await fetch(`/api/BlogAdmin/delete/${blogToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error("Lỗi xóa blog");
            showToastMessage("Đã xóa blog thành công!", "success");
            // Reload lại danh sách sau khi xoá
            fetchBlogs();
        } catch (err) {
            showToastMessage("Xóa blog thất bại!", "danger");
        }
        setShowDeleteModal(false);
        setBlogToDelete(null);
    };

    // Expose reload function
    useImperativeHandle(ref, () => ({
        reload: fetchBlogs
    }));

    useEffect(() => {
        fetchBlogs();
    }, []);

    return (
        <div>
            <h5 className="mb-3">View</h5>
            <Table bordered hover>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Tiêu đề</th>
                        <th>Ảnh</th>
                        <th>Tác giả</th>
                        <th>Ngày tạo</th>
                        <th>Trạng thái</th>
                        <th>Likes</th>
                        <th>Dislikes</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={9} className="text-center">Đang tải...</td>
                        </tr>
                    ) : blogs.length === 0 ? (
                        <tr>
                            <td colSpan={9} className="text-center text-secondary">Không có bài viết nào.</td>
                        </tr>
                    ) : (
                        blogs.map((blog, idx) => (
                            <tr key={blog.blogId}>
                                <td>{idx + 1}</td>
                                <td>{blog.title}</td>
                                <td>
                                    {blog.imageUrl && blog.imageUrl.startsWith('data:image') ? (
                                        <img src={blog.imageUrl} alt="blog" style={{ maxWidth: 60, maxHeight: 40, objectFit: 'cover' }} />
                                    ) : null}
                                </td>
                                <td>{blog.authorName}</td>
                                <td>{blog.createdDate ? new Date(blog.createdDate).toLocaleString('vi-VN') : ''}</td>
                                <td>{blog.status}</td>
                                <td>{blog.likes}</td>
                                <td>{blog.dislikes}</td>
                                <td>
                                    <Button variant="link" size="sm" className="me-2"><FaEdit /></Button>
                                    <Button variant="link" size="sm" onClick={() => handleDelete(blog.blogId)}><FaTrash /></Button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>

            {/* Modal xác nhận xóa */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận xóa</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Bạn có chắc chắn muốn xóa blog này? Hành động này không thể hoàn tác.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Hủy
                    </Button>
                    <Button variant="danger" onClick={confirmDelete}>
                        Xóa
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
});

export default BlogManagementTab;