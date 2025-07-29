import React, { useEffect, useState } from "react";
import { Card, Table, Spinner, Button, Modal, Form, Badge } from "react-bootstrap";
import {
    FaStar,
    FaRegStar,
    FaComment,
    FaEdit,
    FaTrashAlt,
    FaCalendarAlt
} from "react-icons/fa";
import { toast } from 'react-toastify';
import '../../styles/MyConsultations.scss';

// API functions
const getMyFeedbacks = async () => {
    const token = localStorage.getItem('userToken');
    const response = await fetch('/api/UserFeedback/my-feedback', {
        headers: {
            "Accept": "*/*",
            "Authorization": "Bearer " + token,
        },
    });
    if (!response.ok) return [];
    return await response.json();
};

const updateFeedback = async (id, feedbackData) => {
    const token = localStorage.getItem('userToken');
    const response = await fetch(`/api/UserFeedback/edit/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Accept": "*/*",
            "Authorization": "Bearer " + token,
        },
        body: JSON.stringify(feedbackData)
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Cập nhật đánh giá thất bại.");
    }
    return data;
};

const deleteFeedback = async (id) => {
    const token = localStorage.getItem('userToken');
    const response = await fetch(`/api/UserFeedback/delete/${id}`, {
        method: "DELETE",
        headers: {
            "Accept": "*/*",
            "Authorization": "Bearer " + token,
        },
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Xóa đánh giá thất bại.");
    }
    return data;
};

const MyFeedbacks = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Edit modal states
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [editRating, setEditRating] = useState(0);
    const [editContent, setEditContent] = useState("");
    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState(null);

    useEffect(() => {
        loadFeedbacks();
    }, []);

    const loadFeedbacks = async () => {
        setLoading(true);
        const data = await getMyFeedbacks();
        setFeedbacks(data);
        setLoading(false);
    };

    const handleEditFeedback = (feedback) => {
        setSelectedFeedback(feedback);
        setEditRating(feedback.rating);
        setEditContent(feedback.feedbackContent);
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setSelectedFeedback(null);
        setEditRating(0);
        setEditContent("");
    };

    const handleUpdateFeedback = async () => {
        if (editRating === 0) {
            toast.error("Vui lòng chọn số sao đánh giá.");
            return;
        }
        if (!editContent.trim()) {
            toast.error("Vui lòng nhập nội dung đánh giá.");
            return;
        }

        setUpdating(true);
        try {
            await updateFeedback(selectedFeedback.feedbackID, {
                FeedbackContent: editContent,
                Rating: editRating
            });
            toast.success("Cập nhật đánh giá thành công!");
            handleCloseEditModal();
            loadFeedbacks();
        } catch (err) {
            toast.error(err.message || "Cập nhật thất bại.");
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteFeedback = async (feedbackId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) {
            return;
        }

        setDeleting(feedbackId);
        try {
            await deleteFeedback(feedbackId);
            toast.success("Xóa đánh giá thành công!");
            loadFeedbacks();
        } catch (err) {
            toast.error(err.message || "Xóa thất bại.");
        } finally {
            setDeleting(null);
        }
    };

    const renderStars = (rating) => {
        return (
            <div className="star-display">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="star-icon">
                        {star <= rating ? <FaStar color="#ffc107" /> : <FaRegStar color="#dee2e6" />}
                    </span>
                ))}
            </div>
        );
    };

    return (
        <div className="consultations-page">
            <div className="consultations-container">
                {/* Header Section */}
                <div className="consultations-header">
                    <div className="header-content">
                        <div className="title-section">
                            <h1 className="main-title">
                                <FaComment />
                                Đánh giá của tôi
                            </h1>
                            <p className="subtitle">Quản lý các đánh giá bạn đã gửi</p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <Card className="consultations-card">
                    <div className="card-body">
                        {loading ? (
                            <div className="loading-container">
                                <Spinner animation="border" className="spinner-border" />
                            </div>
                        ) : feedbacks.length === 0 ? (
                            <div className="empty-state">
                                <FaComment className="empty-icon" />
                                <h3 className="empty-title">Chưa có đánh giá nào</h3>
                                <p className="empty-subtitle">Bạn chưa có đánh giá nào. Hãy hoàn thành buổi tư vấn và gửi đánh giá!</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <Table className="modern-table">
                                    <thead>
                                        <tr>
                                            <th>STT</th>
                                            <th><FaStar className="me-2" />Đánh giá</th>
                                            <th><FaComment className="me-2" />Nội dung</th>
                                            <th><FaCalendarAlt className="me-2" />Ngày tạo</th>
                                            <th>Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {feedbacks.map((feedback, idx) => (
                                            <tr key={feedback.feedbackID} className="data-row">
                                                <td>
                                                    <div className="index-cell">
                                                        <span className="index-number">{idx + 1}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="rating-cell">
                                                        {renderStars(feedback.rating)}
                                                        <Badge bg="warning" className="ms-2">
                                                            {feedback.rating}/5
                                                        </Badge>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="content-cell">
                                                        <p className="feedback-content">{feedback.feedbackContent}</p>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="date-cell">
                                                        <FaCalendarAlt className="me-1" />
                                                        {new Date(feedback.feedbackDate).toLocaleDateString('vi-VN')}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <Button
                                                            size="sm"
                                                            className="edit-btn me-2"
                                                            onClick={() => handleEditFeedback(feedback)}
                                                        >
                                                            <FaEdit className="me-1" />
                                                            Sửa
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="danger"
                                                            onClick={() => handleDeleteFeedback(feedback.feedbackID)}
                                                            disabled={deleting === feedback.feedbackID}
                                                        >
                                                            {deleting === feedback.feedbackID ? (
                                                                <>
                                                                    <Spinner animation="border" size="sm" className="me-1" />
                                                                    Đang xóa...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <FaTrashAlt className="me-1" />
                                                                    Xóa
                                                                </>
                                                            )}
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Edit Feedback Modal */}
                <Modal show={showEditModal} onHide={handleCloseEditModal} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            <FaEdit className="me-2" />
                            Chỉnh sửa đánh giá
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {selectedFeedback && (
                            <div className="feedback-form">
                                <Form.Group className="mb-3">
                                    <Form.Label>Đánh giá số sao</Form.Label>
                                    <div className="star-rating">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <span
                                                key={star}
                                                className={`star ${star <= editRating ? 'filled' : ''}`}
                                                onClick={() => setEditRating(star)}
                                                style={{ cursor: 'pointer', fontSize: '24px', marginRight: '5px' }}
                                            >
                                                {star <= editRating ? <FaStar color="#ffc107" /> : <FaRegStar color="#dee2e6" />}
                                            </span>
                                        ))}
                                    </div>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Nội dung đánh giá</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        placeholder="Chia sẻ trải nghiệm của bạn..."
                                    />
                                </Form.Group>
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseEditModal}>
                            Hủy
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleUpdateFeedback}
                            disabled={updating}
                        >
                            {updating ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Đang cập nhật...
                                </>
                            ) : (
                                <>
                                    <FaEdit className="me-2" />
                                    Cập nhật
                                </>
                            )}
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </div>
    );
};

export default MyFeedbacks;
