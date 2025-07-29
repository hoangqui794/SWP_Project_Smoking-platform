import React, { useState, useEffect, useRef } from "react";
import "../../styles/BlogPage.scss";
import { Container, Row, Col, Form, Button, Card, Modal, Dropdown, Spinner } from "react-bootstrap";
import {
    FaUserCircle, FaPlus, FaHeart, FaRegHeart, FaEllipsisV,
    FaEdit, FaTrash, FaFlag, FaSearch, FaBlog, FaClock, FaComments,
    FaShare, FaImage, FaPaperPlane
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";

// Lấy user từ localStorage hoặc bạn tuỳ chỉnh lại tuỳ hệ thống login
const CURRENT_USER = localStorage.getItem("userName") || "Tài khoản của bạn";

function UserBlog() {
    const [blogs, setBlogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showEdit, setShowEdit] = useState(false);
    const [editingBlog, setEditingBlog] = useState(null);
    const [editContent, setEditContent] = useState("");
    const [editImagePreview, setEditImagePreview] = useState("");
    const [search, setSearch] = useState("");
    const [showCreate, setShowCreate] = useState(false);
    const [newTitle, setNewTitle] = useState(""); // Thêm trường tiêu đề
    const [newContent, setNewContent] = useState("");
    const [newImagePreview, setNewImagePreview] = useState("");
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState("");
    const fileInputRef = useRef();
    const fileEditInputRef = useRef();

    // Gọi API lấy danh sách blog (sử dụng Bearer token nếu cần)
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    useEffect(() => {
        const fetchBlogs = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem("userToken");
                const res = await fetch("/api/UserBlog/all", {
                    headers: token ? { "Authorization": `Bearer ${token}` } : {},
                });
                if (!res.ok) throw new Error("Lỗi tải blog");
                const data = await res.json();

                // Tải số lượng like/dislike cho từng blog
                const blogsWithCounts = await Promise.all(
                    data.map(async (blog) => {
                        try {
                            const countRes = await fetch(`/api/UserBlog/reaction-count/${blog.blogId}`, {
                                method: "GET",
                                headers: {
                                    "Accept": "*/*",
                                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                                },
                            });

                            if (countRes.ok) {
                                const countData = await countRes.json();
                                return {
                                    ...blog,
                                    likes: countData.likes || 0,
                                    dislikes: countData.dislikes || 0,
                                };
                            }
                        } catch (error) {
                            console.error(`Error fetching count for blog ${blog.blogId}:`, error);
                        }

                        // Fallback nếu không lấy được count
                        return {
                            ...blog,
                            likes: blog.likes || 0,
                            dislikes: blog.dislikes || 0,
                        };
                    })
                );

                setBlogs(blogsWithCounts);
            } catch (err) {
                toast.error("Không thể tải dữ liệu blog");
            } finally {
                setIsLoading(false);
            }
        };
        fetchBlogs();
    }, []);

    // Tìm kiếm đơn giản
    const filteredBlogs = blogs.filter(
        (b) =>
        (b.content?.toLowerCase().includes(search.toLowerCase()) ||
            b.authorName?.toLowerCase().includes(search.toLowerCase()) ||
            b.title?.toLowerCase().includes(search.toLowerCase()))
    );

    // Like/Unlike bài viết (đồng bộ với API)
    const handleToggleLike = async (blogId) => {
        const token = localStorage.getItem("userToken");

        try {
            // Bước 1: Gọi API toggle like trước
            const toggleRes = await fetch(`/api/UserBlog/toggle-like/${blogId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            if (!toggleRes.ok) {
                throw new Error("Không thể thực hiện thao tác like");
            }

            // Bước 2: Sau khi toggle thành công, lấy số lượng like/dislike mới
            const countRes = await fetch(`/api/UserBlog/reaction-count/${blogId}`, {
                method: "GET",
                headers: {
                    "Accept": "*/*",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            if (countRes.ok) {
                const countData = await countRes.json();

                // Cập nhật UI với dữ liệu thực từ API
                setBlogs((prev) =>
                    prev.map((b) =>
                        b.blogId === blogId
                            ? {
                                ...b,
                                likes: countData.likes || 0,
                                dislikes: countData.dislikes || 0,
                                // Toggle trạng thái liked ở UI
                                liked: !b.liked,
                            }
                            : b
                    )
                );

                toast.success("Đã cập nhật trạng thái like!");
            } else {
                // Fallback: cập nhật chỉ ở UI nếu không lấy được count
                setBlogs((prev) =>
                    prev.map((b) =>
                        b.blogId === blogId
                            ? {
                                ...b,
                                liked: !b.liked,
                                likes: b.liked ? (b.likes || 0) - 1 : (b.likes || 0) + 1,
                            }
                            : b
                    )
                );
            }
        } catch (error) {
            console.error("Error toggling like:", error);
            toast.error("Không thể thực hiện thao tác like. Vui lòng thử lại!");

            // Không thay đổi UI nếu API thất bại
        }
    };

    // Mở modal chỉnh sửa
    const handleShowEdit = (blog) => {
        setEditingBlog(blog);
        setEditContent(blog.content || "");
        setEditImagePreview(blog.imageUrl || "");
        setShowEdit(true);
    };

    // Lưu chỉnh sửa (chỉ làm ở UI, muốn gọi API thì thêm call PATCH/PUT)
    const handleSaveEdit = async () => {
        const token = localStorage.getItem("userToken");
        const payload = {
            title: editingBlog.title, // hoặc cho phép sửa title luôn
            content: editContent,
            categoryName: editingBlog.categoryName || "", // hoặc cho phép sửa
            blogType: editingBlog.blogType || "",
            imageUrl: editImagePreview,
        };

        try {
            const res = await fetch(`/api/UserBlog/edit/${editingBlog.blogId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error("Sửa bài thất bại!");

            // Có thể lấy lại bài viết mới từ API nếu trả về
            // Hoặc chỉ update ở UI như sau:
            setBlogs((prev) =>
                prev.map((b) =>
                    b.blogId === editingBlog.blogId
                        ? { ...b, ...payload }
                        : b
                )
            );
            setShowEdit(false);
            toast.success("Đã lưu chỉnh sửa!");
        } catch (err) {
            toast.error("Sửa bài thất bại!");
        }
    };

    // Mở modal tạo bài viết mới
    const handleShowCreate = () => {
        setShowCreate(true);
        setNewTitle("");
        setNewContent("");
        setNewImagePreview("");
    };

    // Lưu bài viết mới (GỌI API THẬT)
    const handleSaveCreate = async () => {
        const token = localStorage.getItem("userToken");
        const payload = {
            title: newTitle,
            content: newContent,
            categoryName: "",
            blogType: "",
            imageUrl: newImagePreview,
        };

        try {
            const res = await fetch("/api/UserBlog/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error("Đăng bài thất bại!");

            const newBlog = await res.json();
            // Fix: nếu thiếu tên user thì tự thêm vào
            if (!newBlog.authorName) {
                newBlog.authorName = CURRENT_USER;
            }
            setBlogs(prev => [newBlog, ...prev]);
            setShowCreate(false);
            toast.success("Đã đăng bài thành công!");
        } catch (err) {
            toast.error("Đăng bài thất bại!");
        }
    };

    // Xoá bài viết của mình (chỉ xóa ở UI demo)
    const handleDeleteBlog = async (blogId) => {
        const token = localStorage.getItem("userToken");
        try {
            const res = await fetch(`/api/UserBlog/delete/${blogId}`, {
                method: "DELETE",
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });
            if (!res.ok) throw new Error("Xóa bài thất bại!");

            setBlogs((prev) => prev.filter((b) => b.blogId !== blogId));
            toast.success("Đã xóa bài viết!");
        } catch (err) {
            toast.error("Xóa bài thất bại!");
        }
    };
    // Upload ảnh (base64 preview)
    const handleFileChange = (e, setPreview) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            setPreview(ev.target.result);
        };
        reader.readAsDataURL(file);
    };

    // Báo cáo bài viết - Nhận blog làm tham số
    const handleSendReport = async (blog) => {
        if (!blog || !blog.blogId) {
            toast.error("Không xác định được bài viết để báo cáo!");
            return;
        }
        try {
            const token = localStorage.getItem("userToken");
            const res = await fetch(`/api/UserBlog/report/${blog.blogId}`, {
                method: "POST",
                headers: {
                    "accept": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                }
            });
            if (!res.ok) throw new Error("Báo cáo thất bại!");
            setBlogs((prev) =>
                prev.map((b) =>
                    b.blogId === blog.blogId
                        ? { ...b, reportCount: (b.reportCount || 0) + 1, reported: true }
                        : b
                )
            );
            toast.success("Đã gửi báo cáo bài viết!");
        } catch (err) {
            toast.error("Gửi báo cáo thất bại!");
        }
    };
    return (
        <div className="social-blog-page">
            <ToastContainer position="top-right" />

            {/* Top Navigation Bar */}
            <div className="top-nav">
                <Container>
                    <div className="nav-content">
                        <div className="logo-section">
                            <FaBlog className="logo-icon" />
                            <span className="logo-text">QuitTogether</span>
                        </div>

                        {/* Search Bar */}
                        <div className="search-section">
                            <div className="search-container">
                                <FaSearch className="search-icon" />
                                <Form.Control
                                    type="text"
                                    placeholder="Tìm kiếm bài viết..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="search-input"
                                />
                            </div>
                        </div>

                        {/* Create Post Button */}
                        <Button
                            className="create-post-btn"
                            onClick={handleShowCreate}
                        >
                            <FaPlus className="me-2" />
                            Đăng bài
                        </Button>
                    </div>
                </Container>
            </div>

            {/* Main Content */}
            <Container className="main-content">
                <Row>
                    {/* Left Sidebar */}
                    <Col lg={3} className="sidebar-left d-none d-lg-block">
                        <div className="sidebar-content">
                            <div className="user-profile-card">
                                <div className="profile-avatar">
                                    <FaUserCircle size={60} />
                                </div>
                                <h5>{CURRENT_USER}</h5>
                                <p className="profile-subtitle">Thành viên cộng đồng</p>
                            </div>

                            <div className="stats-card">
                                <h6>Thống kê của bạn</h6>
                                <div className="stat-item">
                                    <span>Bài viết</span>
                                    <span className="stat-number">
                                        {blogs.filter(b => b.authorName === CURRENT_USER).length}
                                    </span>
                                </div>
                                <div className="stat-item">
                                    <span>Lượt thích</span>
                                    <span className="stat-number">
                                        {blogs.filter(b => b.authorName === CURRENT_USER)
                                            .reduce((sum, b) => sum + (b.likes || 0), 0)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Col>

                    {/* Main Feed */}
                    <Col lg={6} className="main-feed">
                        {/* Create Post Card */}
                        <Card className="create-post-card mb-4">
                            <Card.Body>
                                <div className="create-post-header">
                                    <FaUserCircle size={40} className="me-3" />
                                    <Button
                                        variant="outline-secondary"
                                        className="create-post-input"
                                        onClick={handleShowCreate}
                                    >
                                        Bạn đang nghĩ gì?
                                    </Button>
                                </div>
                                <div className="create-post-actions">
                                    <Button
                                        variant="link"
                                        onClick={handleShowCreate}
                                        className="action-btn"
                                    >
                                        <FaImage className="me-2" />
                                        Ảnh
                                    </Button>
                                    <Button
                                        variant="link"
                                        onClick={handleShowCreate}
                                        className="action-btn"
                                    >
                                        <FaPaperPlane className="me-2" />
                                        Chia sẻ
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>

                        {/* Posts Feed */}
                        {isLoading ? (
                            <div className="loading-container">
                                <Spinner animation="border" className="loading-spinner" />
                                <p>Đang tải bài viết...</p>
                            </div>
                        ) : filteredBlogs.length === 0 ? (
                            <div className="empty-feed">
                                <FaBlog size={80} className="empty-icon" />
                                <h4>Chưa có bài viết nào</h4>
                                <p>Hãy là người đầu tiên chia sẻ trong cộng đồng!</p>
                                <Button variant="primary" onClick={handleShowCreate}>
                                    <FaPlus className="me-2" />
                                    Tạo bài viết đầu tiên
                                </Button>
                            </div>
                        ) : (
                            filteredBlogs.map((blog) => (
                                <Card key={blog.blogId} className="post-card mb-4">
                                    {/* Post Header */}
                                    <Card.Header className="post-header">
                                        <div className="author-section">
                                            <FaUserCircle size={45} className="author-avatar" />
                                            <div className="author-info">
                                                <h6 className="author-name">{blog.authorName}</h6>
                                                <p className="post-time">
                                                    <FaClock className="me-1" />
                                                    {new Date(blog.createdDate).toLocaleDateString('vi-VN')}
                                                </p>
                                            </div>
                                        </div>

                                        {blog.authorName === CURRENT_USER && (
                                            <Dropdown>
                                                <Dropdown.Toggle variant="link" className="post-menu">
                                                    <FaEllipsisV />
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu>
                                                    <Dropdown.Item onClick={() => handleShowEdit(blog)}>
                                                        <FaEdit className="me-2" />
                                                        Chỉnh sửa
                                                    </Dropdown.Item>
                                                    <Dropdown.Item
                                                        onClick={() => handleDeleteBlog(blog.blogId)}
                                                        className="text-danger"
                                                    >
                                                        <FaTrash className="me-2" />
                                                        Xóa
                                                    </Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        )}
                                    </Card.Header>

                                    {/* Post Content */}
                                    <Card.Body className="post-content">
                                        {blog.title && (
                                            <h5 className="post-title">{blog.title}</h5>
                                        )}
                                        <p className="post-text">{blog.content}</p>

                                        {blog.imageUrl && (
                                            <div className="post-image">
                                                <img
                                                    src={blog.imageUrl}
                                                    alt="Post content"
                                                    className="content-image"
                                                />
                                            </div>
                                        )}
                                    </Card.Body>

                                    {/* Post Actions */}
                                    <Card.Footer className="post-actions">
                                        <div className="action-stats">
                                            <span className="likes-count">
                                                {blog.likes || 0} lượt thích
                                            </span>
                                        </div>

                                        <div className="action-buttons">
                                            <Button
                                                variant="link"
                                                className={`action-btn like-btn ${blog.liked ? 'liked' : ''}`}
                                                onClick={() => handleToggleLike(blog.blogId)}
                                            >
                                                {blog.liked ? <FaHeart /> : <FaRegHeart />}
                                                <span>Thích ({blog.likes || 0})</span>
                                            </Button>

                                            <Button variant="link" className="action-btn">
                                                <FaComments />
                                                <span>Bình luận</span>
                                            </Button>

                                            <Button variant="link" className="action-btn">
                                                <FaShare />
                                                <span>Chia sẻ</span>
                                            </Button>

                                            {blog.authorName !== CURRENT_USER && (
                                                <Button
                                                    variant="link"
                                                    className={`action-btn report-btn ${blog.reported ? 'reported' : ''}`}
                                                    onClick={() => blog.reported ? null : handleSendReport(blog)}
                                                    disabled={blog.reported}
                                                >
                                                    <FaFlag />
                                                    <span>{blog.reported ? 'Đã báo cáo' : 'Báo cáo'}</span>
                                                </Button>
                                            )}
                                        </div>
                                    </Card.Footer>
                                </Card>
                            ))
                        )}
                    </Col>

                    {/* Right Sidebar */}
                    <Col lg={3} className="sidebar-right d-none d-lg-block">
                        <div className="sidebar-content">
                            <div className="trending-card">
                                <h6>Xu hướng</h6>
                                <div className="trending-item">
                                    <span className="hashtag">#CaiThuocLa</span>
                                    <small>1,234 bài viết</small>
                                </div>
                                <div className="trending-item">
                                    <span className="hashtag">#SucKhoe</span>
                                    <small>892 bài viết</small>
                                </div>
                                <div className="trending-item">
                                    <span className="hashtag">#DongLuc</span>
                                    <small>567 bài viết</small>
                                </div>
                            </div>

                            <div className="suggestions-card">
                                <h6>Gợi ý kết nối</h6>
                                <div className="suggestion-item">
                                    <FaUserCircle size={35} />
                                    <div className="suggestion-info">
                                        <span className="suggestion-name">Nguyễn Văn A</span>
                                        <small>Thành viên mới</small>
                                    </div>
                                </div>
                                <div className="suggestion-item">
                                    <FaUserCircle size={35} />
                                    <div className="suggestion-info">
                                        <span className="suggestion-name">Trần Thị B</span>
                                        <small>Hoạt động tích cực</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>

            {/* Modal chỉnh sửa bài viết */}
            <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="d-flex align-items-center">
                        <FaEdit className="me-2 text-primary" />
                        Chỉnh sửa bài viết
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Nội dung</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Hình ảnh</Form.Label>
                            <Form.Control
                                type="file"
                                accept="image/*"
                                ref={fileEditInputRef}
                                onChange={(e) =>
                                    handleFileChange(e, setEditImagePreview)
                                }
                            />
                            {editImagePreview && (
                                <div className="preview-container mt-3">
                                    <img
                                        src={editImagePreview}
                                        alt="preview"
                                        className="img-fluid rounded shadow-sm"
                                    />
                                </div>
                            )}
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={() => setShowEdit(false)}>
                        Hủy
                    </Button>
                    <Button variant="primary" onClick={handleSaveEdit}>
                        <FaEdit className="me-1" />
                        Lưu thay đổi
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal tạo bài viết mới */}
            <Modal show={showCreate} onHide={() => setShowCreate(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="d-flex align-items-center">
                        <FaPlus className="me-2 text-success" />
                        Tạo bài viết mới
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Tiêu đề</Form.Label>
                            <Form.Control
                                type="text"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                placeholder="Nhập tiêu đề bài viết"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Nội dung</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                value={newContent}
                                onChange={(e) => setNewContent(e.target.value)}
                                placeholder="Chia sẻ câu chuyện của bạn..."
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Hình ảnh</Form.Label>
                            <Form.Control
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={(e) =>
                                    handleFileChange(e, setNewImagePreview)
                                }
                            />
                            {newImagePreview && (
                                <div className="preview-container mt-3">
                                    <img
                                        src={newImagePreview}
                                        alt="preview"
                                        className="img-fluid rounded shadow-sm"
                                    />
                                </div>
                            )}
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={() => setShowCreate(false)}>
                        Hủy
                    </Button>
                    <Button
                        variant="success"
                        onClick={handleSaveCreate}
                        disabled={!newTitle.trim() || !newContent.trim()}
                    >
                        <FaPlus className="me-1" />
                        Đăng bài
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal báo cáo */}
            <Modal
                show={showReportModal}
                onHide={() => setShowReportModal(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title className="d-flex align-items-center text-warning">
                        <FaFlag className="me-2" />
                        Báo cáo bài viết
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>Lý do báo cáo</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={reportReason}
                                onChange={(e) => setReportReason(e.target.value)}
                                placeholder="Vui lòng cho biết lý do báo cáo..."
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="outline-secondary"
                        onClick={() => setShowReportModal(false)}
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="warning"
                        onClick={() => handleSendReport(null)}
                        disabled={!reportReason.trim()}
                    >
                        <FaFlag className="me-1" />
                        Gửi báo cáo
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default UserBlog;