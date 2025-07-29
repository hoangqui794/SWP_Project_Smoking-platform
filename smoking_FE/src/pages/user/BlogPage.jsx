import React, { useState, useEffect, useRef } from "react";
import "../../styles/BlogPage.scss";
import { Container, Row, Col, Form, Button, Card, Modal, Dropdown, Spinner } from "react-bootstrap";
import {
    FaPlus, FaHeart, FaEllipsisV,
    FaEdit, FaTrash, FaFlag, FaSearch
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Lấy user từ localStorage hoặc bạn tuỳ chỉnh lại tuỳ hệ thống login
const CURRENT_USER = localStorage.getItem("userName") || "Tài khoản của bạn";
const USER_AVATAR = localStorage.getItem("profilePicture") || null;

// Component Avatar
const Avatar = ({ src, name, avatarUrl, size = 40, className = "" }) => {
    const getInitials = (name) => {
        if (!name) return "U";
        const names = name.split(" ");
        if (names.length >= 2) {
            return (names[0][0] + names[names.length - 1][0]).toUpperCase();
        }
        return name[0].toUpperCase();
    };

    // Generate avatar từ DiceBear API
    const generateAvatar = (name) => {
        if (!name) return null;
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=52c41a`;
    };

    // Ưu tiên: avatarUrl từ BE > src prop > generated avatar > fallback
    // Kiểm tra nếu avatar null, undefined, hoặc empty string
    const hasValidAvatar = avatarUrl && avatarUrl.trim() !== "";
    const hasValidSrc = src && src.trim() !== "";
    const avatarSrc = hasValidAvatar ? avatarUrl : (hasValidSrc ? src : generateAvatar(name));

    const [imageError, setImageError] = React.useState(false);

    const handleImageError = () => {
        setImageError(true);
    };

    if (avatarSrc && !imageError) {
        return (
            <img
                src={avatarSrc}
                alt={name}
                className={`avatar-image ${className}`}
                style={{
                    width: size,
                    height: size,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid #52c41a"
                }}
                onError={handleImageError}
            />
        );
    }

    return (
        <div
            className={`avatar-placeholder ${className}`}
            style={{
                width: size,
                height: size,
                borderRadius: "50%",
                backgroundColor: "#52c41a",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "600",
                fontSize: size > 50 ? "1.5rem" : "1rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
            }}
        >
            {getInitials(name)}
        </div>
    );
};

// Helper function để hiển thị toast an toàn với containerId
const showToast = {
    success: (message) => {
        try {
            toast.success(message, { containerId: 'blog-toast' });
        } catch (error) {
            console.log("Success:", message);
        }
    },
    error: (message) => {
        try {
            toast.error(message, { containerId: 'blog-toast' });
        } catch (error) {
            console.log("Error:", message);
        }
    },
    info: (message) => {
        try {
            toast.info(message, { containerId: 'blog-toast' });
        } catch (error) {
            console.log("Info:", message);
        }
    }
};

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
                            // Lấy số lượng like/dislike
                            const countRes = await fetch(`/api/UserBlog/reaction-count/${blog.blogId}`, {
                                method: "GET",
                                headers: {
                                    "Accept": "*/*",
                                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                                },
                            });

                            // Lấy trạng thái reaction của user
                            const statusRes = await fetch(`/api/UserBlog/reaction-status/${blog.blogId}`, {
                                method: "GET",
                                headers: {
                                    "Accept": "*/*",
                                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                                },
                            });

                            let likes = 0, dislikes = 0, isLiked = false;

                            if (countRes.ok) {
                                const countData = await countRes.json();
                                likes = countData.likes || 0;
                                dislikes = countData.dislikes || 0;
                            }

                            if (statusRes.ok) {
                                const statusData = await statusRes.json();
                                isLiked = statusData.userReaction === true; // true = liked, false = disliked, null = no reaction
                            }

                            return {
                                ...blog,
                                likes,
                                dislikes,
                                isLiked,
                            };
                        } catch (error) {
                            console.error(`Error fetching data for blog ${blog.blogId}:`, error);
                        }

                        // Fallback nếu không lấy được data
                        return {
                            ...blog,
                            likes: blog.likes || 0,
                            dislikes: blog.dislikes || 0,
                            isLiked: false,
                        };
                    })
                );

                setBlogs(blogsWithCounts);
            } catch (err) {
                showToast.error("Không thể tải dữ liệu blog");
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

    // Toggle trái tim - xử lý cả like và dislike
    const handleToggleHeart = async (blogId) => {
        const token = localStorage.getItem("userToken");
        const currentBlog = blogs.find(b => b.blogId === blogId);

        try {
            // Nếu chưa like thì like, nếu đã like thì dislike
            const endpoint = currentBlog?.isLiked ? 'dislike' : 'like';
            const res = await fetch(`/api/UserBlog/${endpoint}/${blogId}`, {
                method: "POST",
                headers: {
                    "Accept": "*/*",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            if (!res.ok) throw new Error(`Không thể thực hiện thao tác ${endpoint}`);

            // Sau khi thành công, cập nhật lại số lượng và trạng thái từ API
            await updateReactionCount(blogId);
        } catch (error) {
            console.error("Error toggling heart:", error);
            showToast.error("Không thể thực hiện thao tác này!");
        }
    };

    // Hàm helper để cập nhật số lượng reaction và trạng thái
    const updateReactionCount = async (blogId) => {
        const token = localStorage.getItem("userToken");

        try {
            // Lấy số lượng like/dislike
            const countRes = await fetch(`/api/UserBlog/reaction-count/${blogId}`, {
                method: "GET",
                headers: {
                    "Accept": "*/*",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            // Lấy trạng thái reaction của user
            const statusRes = await fetch(`/api/UserBlog/reaction-status/${blogId}`, {
                method: "GET",
                headers: {
                    "Accept": "*/*",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            let likes = 0, dislikes = 0, isLiked = false;

            if (countRes.ok) {
                const countData = await countRes.json();
                likes = countData.likes || 0;
                dislikes = countData.dislikes || 0;
            }

            if (statusRes.ok) {
                const statusData = await statusRes.json();
                isLiked = statusData.userReaction === true; // true = liked, false = disliked, null = no reaction
            }

            setBlogs((prev) =>
                prev.map((b) =>
                    b.blogId === blogId
                        ? {
                            ...b,
                            likes,
                            dislikes,
                            isLiked,
                        }
                        : b
                )
            );
        } catch (error) {
            console.error("Error updating reaction count:", error);
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
            showToast.success("Đã lưu chỉnh sửa!");
        } catch (err) {
            showToast.error("Sửa bài thất bại!");
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
            showToast.success("Đã đăng bài thành công!");
        } catch (err) {
            showToast.error("Đăng bài thất bại!");
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
            showToast.success("Đã xóa bài viết!");
        } catch (err) {
            showToast.error("Xóa bài thất bại!");
        }
    };
    // Upload ảnh (base64 preview)
    const handleFileChange = (e, setImage, setPreview) => {
        const file = e.target.files[0];
        if (!file) return;
        setImage(file);
        const reader = new FileReader();
        reader.onload = (ev) => {
            setPreview(ev.target.result);
        };
        reader.readAsDataURL(file);
    };

    // Nhận blog làm tham số
    const handleSendReport = async (blog) => {
        if (!blog || !blog.blogId) {
            showToast.error("Không xác định được bài viết để báo cáo!");
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
            showToast.success("Đã gửi báo cáo bài viết!");
        } catch (err) {
            showToast.error("Gửi báo cáo thất bại!");
        }
    };
    return (
        <div className="blog-quit-style">
            {/* Header Section */}
            <div className="blog-header-section">
                <Container>
                    <div className="header-content">
                        <div className="title-section">
                            <h1 className="main-title">
                                <Avatar
                                    src={USER_AVATAR}
                                    name={CURRENT_USER}
                                    size={32}
                                    className="me-3"
                                />
                                Cộng Đồng Chia Sẻ
                            </h1>
                            <p className="subtitle">Chia sẻ hành trình cai thuốc lá của bạn với cộng đồng</p>
                        </div>

                        {/* Search and Create */}
                        <div className="action-section">
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
                            <Button
                                className="create-btn"
                                onClick={handleShowCreate}
                            >
                                <FaPlus className="me-2" />
                                Chia sẻ câu chuyện
                            </Button>
                        </div>
                    </div>
                </Container>
            </div>

            {/* Main Content */}
            <Container className="main-content-area">
                <Row>
                    {/* Sidebar */}
                    <Col lg={3} className="sidebar-section d-none d-lg-block">
                        <div className="user-info-card">
                            <div className="user-avatar">
                                <Avatar
                                    src={USER_AVATAR}
                                    name={CURRENT_USER}
                                    size={60}
                                />
                            </div>
                            <h5 className="user-name">{CURRENT_USER}</h5>
                            <p className="user-role">Thành viên cộng đồng</p>

                            <div className="stats-grid">
                                <div className="stat-item">
                                    <span className="stat-value">
                                        {blogs.filter(b => b.authorName === CURRENT_USER).length}
                                    </span>
                                    <span className="stat-label">Bài viết</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">
                                        {blogs.filter(b => b.authorName === CURRENT_USER)
                                            .reduce((sum, b) => sum + (b.likes || 0), 0)}
                                    </span>
                                    <span className="stat-label">Lượt thích</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="quick-actions-card">
                            <h6>Hoạt động nhanh</h6>
                            <Button
                                variant="outline-success"
                                className="w-100 mb-2"
                                onClick={handleShowCreate}
                            >
                                <FaPlus className="me-2" />
                                Viết bài mới
                            </Button>
                        </div>
                    </Col>

                    {/* Posts Feed */}
                    <Col lg={9}>
                        <div className="posts-container">
                            {isLoading ? (
                                <div className="loading-section">
                                    <Spinner animation="border" className="loading-spinner" />
                                    <p>Đang tải bài viết...</p>
                                </div>
                            ) : filteredBlogs.length === 0 ? (
                                <div className="empty-section">
                                    <Avatar
                                        src={null}
                                        name="Empty"
                                        size={80}
                                        className="empty-icon"
                                    />
                                    <h4>Chưa có bài viết nào</h4>
                                    <p>Hãy là người đầu tiên chia sẻ câu chuyện của mình!</p>
                                    <Button
                                        variant="success"
                                        size="lg"
                                        onClick={handleShowCreate}
                                    >
                                        <FaPlus className="me-2" />
                                        Tạo bài viết đầu tiên
                                    </Button>
                                </div>
                            ) : (
                                <div className="posts-grid">
                                    {filteredBlogs.map((blog) => (
                                        <Card key={blog.blogId} className="post-card">
                                            {/* Post Header */}
                                            <Card.Header className="post-header">
                                                <div className="author-section">
                                                    <Avatar
                                                        avatarUrl={blog.avatarUrl || blog.authorAvatar || null}
                                                        name={blog.authorName}
                                                        size={40}
                                                        className="author-avatar"
                                                    />
                                                    <div className="author-info">
                                                        <h6 className="author-name">{blog.authorName}</h6>
                                                        <p className="post-date">
                                                            {new Date(blog.createdDate).toLocaleDateString('vi-VN')}
                                                        </p>
                                                    </div>
                                                </div>

                                                {blog.authorName === CURRENT_USER && (
                                                    <Dropdown>
                                                        <Dropdown.Toggle variant="link" className="post-menu-btn">
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
                                            <Card.Body className="post-body">
                                                {blog.title && (
                                                    <h5 className="post-title">{blog.title}</h5>
                                                )}
                                                <p className="post-content">{blog.content}</p>

                                                {blog.imageUrl && (
                                                    <div className="post-image">
                                                        <img
                                                            src={blog.imageUrl}
                                                            alt="Nội dung bài viết"
                                                            className="content-image"
                                                        />
                                                    </div>
                                                )}
                                            </Card.Body>

                                            {/* Post Footer */}
                                            <Card.Footer className="post-footer">
                                                <div className="post-actions">
                                                    <div className="reaction-buttons">
                                                        <Button
                                                            variant="link"
                                                            className={`action-btn heart-btn ${blog.isLiked ? 'liked' : ''}`}
                                                            onClick={() => handleToggleHeart(blog.blogId)}
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '5px',
                                                                padding: '5px 15px',
                                                                borderRadius: '20px',
                                                                textDecoration: 'none',
                                                                transition: 'all 0.2s ease',
                                                                backgroundColor: blog.isLiked ? '#ffe6e6' : 'transparent'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                if (!blog.isLiked) {
                                                                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                                                                }
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                if (!blog.isLiked) {
                                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                                }
                                                            }}
                                                        >
                                                            <FaHeart
                                                                className={blog.isLiked ? 'text-danger' : 'text-secondary'}
                                                                style={{
                                                                    fontSize: '18px',
                                                                    transition: 'color 0.2s ease'
                                                                }}
                                                            />
                                                            <span style={{
                                                                fontWeight: '500',
                                                                color: blog.isLiked ? '#dc3545' : '#6c757d'
                                                            }}>
                                                                {blog.likes || 0}
                                                            </span>
                                                        </Button>
                                                    </div>

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
                                    ))}
                                </div>
                            )}
                        </div>
                    </Col>
                </Row>
            </Container>

            {/* Modals */}
            {/* Edit Modal */}
            <Modal show={showEdit} onHide={() => setShowEdit(false)} size="lg" centered>
                <Modal.Header closeButton className="modal-header-custom">
                    <Modal.Title>
                        <FaEdit className="me-2" />
                        Chỉnh sửa bài viết
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="modal-body-custom">
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Nội dung</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={5}
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="form-control-custom"
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Hình ảnh</Form.Label>
                            <Form.Control
                                type="file"
                                accept="image/*"
                                ref={fileEditInputRef}
                                onChange={(e) => handleFileChange(e, () => { }, setEditImagePreview)}
                                className="form-control-custom"
                            />
                            {editImagePreview && (
                                <div className="image-preview mt-3 text-center">
                                    <div className="position-relative d-inline-block">
                                        <img
                                            src={editImagePreview}
                                            alt="preview"
                                            style={{
                                                maxWidth: '100%',
                                                maxHeight: '200px',
                                                borderRadius: '8px',
                                                objectFit: 'cover',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                border: '2px solid #e8ecf0'
                                            }}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-danger btn-sm position-absolute"
                                            style={{
                                                top: '5px',
                                                right: '5px',
                                                width: '30px',
                                                height: '30px',
                                                borderRadius: '50%',
                                                padding: '0',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '16px',
                                                fontWeight: 'bold',
                                                opacity: '0.9',
                                                transition: 'opacity 0.2s ease'
                                            }}
                                            onMouseEnter={(e) => e.target.style.opacity = '1'}
                                            onMouseLeave={(e) => e.target.style.opacity = '0.9'}
                                            onClick={() => {
                                                setEditImagePreview("");
                                                if (fileEditInputRef.current) {
                                                    fileEditInputRef.current.value = "";
                                                }
                                            }}
                                            title="Xóa ảnh"
                                        >
                                            ×
                                        </button>
                                    </div>
                                    <small className="text-muted d-block mt-2">
                                        Click vào dấu × để xóa ảnh
                                    </small>
                                </div>
                            )}
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="modal-footer-custom">
                    <Button variant="outline-secondary" onClick={() => setShowEdit(false)}>
                        Hủy
                    </Button>
                    <Button variant="success" onClick={handleSaveEdit} className="save-btn">
                        <FaEdit className="me-1" />
                        Lưu thay đổi
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Create Modal */}
            <Modal show={showCreate} onHide={() => setShowCreate(false)} size="lg" centered>
                <Modal.Header closeButton className="modal-header-custom">
                    <Modal.Title>
                        <FaPlus className="me-2" />
                        Chia sẻ bài viết mới
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="modal-body-custom">
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Tiêu đề</Form.Label>
                            <Form.Control
                                type="text"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                placeholder="Nhập tiêu đề bài viết"
                                className="form-control-custom"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Nội dung</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={5}
                                value={newContent}
                                onChange={(e) => setNewContent(e.target.value)}
                                placeholder="Chia sẻ câu chuyện, kinh nghiệm của bạn..."
                                className="form-control-custom"
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Hình ảnh</Form.Label>
                            <Form.Control
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={(e) => handleFileChange(e, () => { }, setNewImagePreview)}
                                className="form-control-custom"
                            />
                            {newImagePreview && (
                                <div className="image-preview mt-3 text-center">
                                    <div className="position-relative d-inline-block">
                                        <img
                                            src={newImagePreview}
                                            alt="preview"
                                            style={{
                                                maxWidth: '100%',
                                                maxHeight: '200px',
                                                borderRadius: '8px',
                                                objectFit: 'cover',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                border: '2px solid #e8ecf0'
                                            }}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-danger btn-sm position-absolute"
                                            style={{
                                                top: '5px',
                                                right: '5px',
                                                width: '30px',
                                                height: '30px',
                                                borderRadius: '50%',
                                                padding: '0',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '16px',
                                                fontWeight: 'bold',
                                                opacity: '0.9',
                                                transition: 'opacity 0.2s ease'
                                            }}
                                            onMouseEnter={(e) => e.target.style.opacity = '1'}
                                            onMouseLeave={(e) => e.target.style.opacity = '0.9'}
                                            onClick={() => {
                                                setNewImagePreview("");
                                                if (fileInputRef.current) {
                                                    fileInputRef.current.value = "";
                                                }
                                            }}
                                            title="Xóa ảnh"
                                        >
                                            ×
                                        </button>
                                    </div>
                                    <small className="text-muted d-block mt-2">
                                        Click vào dấu × để xóa ảnh
                                    </small>
                                </div>
                            )}
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="modal-footer-custom">
                    <Button variant="outline-secondary" onClick={() => setShowCreate(false)}>
                        Hủy
                    </Button>
                    <Button
                        variant="success"
                        onClick={handleSaveCreate}
                        disabled={!newTitle.trim() || !newContent.trim()}
                        className="save-btn"
                    >
                        <FaPlus className="me-1" />
                        Đăng bài
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Report Modal */}
            <Modal show={showReportModal} onHide={() => setShowReportModal(false)} centered>
                <Modal.Header closeButton className="modal-header-custom">
                    <Modal.Title>
                        <FaFlag className="me-2" />
                        Báo cáo bài viết
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="modal-body-custom">
                    <Form>
                        <Form.Group>
                            <Form.Label>Lý do báo cáo</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={reportReason}
                                onChange={(e) => setReportReason(e.target.value)}
                                placeholder="Vui lòng cho biết lý do báo cáo..."
                                className="form-control-custom"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="modal-footer-custom">
                    <Button variant="outline-secondary" onClick={() => setShowReportModal(false)}>
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

            {/* Toast Container - đặt ở cuối để tránh xung đột */}
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                limit={3}
                containerId="blog-toast"
            />
        </div>
    );
}

export default UserBlog;