import React, { useEffect, useState, useCallback } from 'react';
import { Row, Col, Card, Alert, Table, Button, Badge, Modal, Spinner, Form, Pagination } from 'react-bootstrap';
import { FaUsers, FaUserTie, FaStar, FaEye, FaTrashAlt, FaComment, FaChartBar, FaDollarSign, FaCalendarAlt, FaSearch, FaFilter } from 'react-icons/fa';
import { toast } from 'react-toastify';
import '../../styles/AdminDashboard.scss';


const AdminDashboard = () => {
    const [stats, setStats] = useState({
        memberCount: 0,
        coachCount: 0,
        revenue: 0,
        totalFeedbacks: 0,
        averageRating: 0,
        activeConsultations: 0,
        totalConsultations: 0,
    });

    const [feedbacks, setFeedbacks] = useState([]);
    const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [ratingFilter, setRatingFilter] = useState('all');
    const [pagination, setPagination] = useState({
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 0,
        totalPages: 0
    });
    const [revenueData, setRevenueData] = useState({
        currentMonthRevenue: 0,
        yearlyRevenue: [],
        selectedYear: new Date().getFullYear(),
        selectedMonth: new Date().getMonth() + 1
    });
    const [loading, setLoading] = useState(true);
    const [feedbackLoading, setFeedbackLoading] = useState(false);
    const [revenueLoading, setRevenueLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showFeedbackDetail, setShowFeedbackDetail] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState(null);

    // API functions
    const fetchAllFeedbacks = async () => {
        setFeedbackLoading(true);
        try {
            const token = localStorage.getItem("userToken");
            const response = await fetch('/api/AdminFeedback/all', {
                method: 'GET',
                headers: {
                    'accept': '*/*',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setFeedbacks(data);
            } else {
                toast.error('Lỗi khi tải danh sách feedback');
            }
        } catch (err) {
            console.error('Lỗi khi tải feedbacks:', err);
            toast.error('Có lỗi xảy ra khi tải feedbacks');
        } finally {
            setFeedbackLoading(false);
        }
    };

    const fetchFeedbackStats = async () => {
        try {
            const token = localStorage.getItem("userToken");
            const response = await fetch('/api/AdminFeedback/stats', {
                method: 'GET',
                headers: {
                    'accept': '*/*',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setStats(prevStats => ({
                    ...prevStats,
                    totalFeedbacks: data.totalFeedbacks,
                    averageRating: data.averageRating
                }));
            }
        } catch (err) {
            console.error('Lỗi khi tải thống kê feedback:', err);
        }
    };

    const fetchFeedbackDetail = async (id) => {
        try {
            const token = localStorage.getItem("userToken");
            const response = await fetch(`/api/AdminFeedback/${id}`, {
                method: 'GET',
                headers: {
                    'accept': '*/*',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSelectedFeedback(data);
                setShowFeedbackDetail(true);
            } else {
                toast.error('Lỗi khi tải chi tiết feedback');
            }
        } catch (err) {
            console.error('Lỗi khi tải chi tiết feedback:', err);
            toast.error('Có lỗi xảy ra khi tải chi tiết feedback');
        }
    };

    const deleteFeedback = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa feedback này?')) {
            return;
        }

        try {
            const token = localStorage.getItem("userToken");
            const response = await fetch(`/api/AdminFeedback/delete/${id}`, {
                method: 'DELETE',
                headers: {
                    'accept': '*/*',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                toast.success('Xóa feedback thành công');
                fetchAllFeedbacks();
                fetchFeedbackStats();
            } else {
                toast.error('Lỗi khi xóa feedback');
            }
        } catch (err) {
            console.error('Lỗi khi xóa feedback:', err);
            toast.error('Có lỗi xảy ra khi xóa feedback');
        }
    };

    // Revenue API functions
    const fetchMonthlyRevenue = useCallback(async (year = revenueData.selectedYear, month = revenueData.selectedMonth) => {
        try {
            const token = localStorage.getItem("userToken");
            const response = await fetch(`/api/Revenue/month?year=${year}&month=${month}`, {
                method: 'GET',
                headers: {
                    'accept': '*/*',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setRevenueData(prev => ({
                    ...prev,
                    currentMonthRevenue: data.total
                }));
                setStats(prevStats => ({
                    ...prevStats,
                    revenue: data.total
                }));
            } else {
                console.error('Lỗi khi tải doanh thu tháng:', response.status);
                toast.error('Lỗi khi tải doanh thu tháng');
            }
        } catch (err) {
            console.error('Lỗi khi tải doanh thu tháng:', err);
            toast.error('Có lỗi xảy ra khi tải doanh thu tháng');
        }
    }, [revenueData.selectedYear, revenueData.selectedMonth]);

    const fetchYearlyRevenue = useCallback(async (year = revenueData.selectedYear) => {
        setRevenueLoading(true);
        try {
            const token = localStorage.getItem("userToken");
            const response = await fetch(`/api/Revenue/year?year=${year}`, {
                method: 'GET',
                headers: {
                    'accept': '*/*',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Revenue API Response:', data); // Debug log
                setRevenueData(prev => ({
                    ...prev,
                    yearlyRevenue: data.revenue,
                    selectedYear: data.year
                }));

                // Cập nhật tổng số member và coach từ API này
                setStats(prevStats => ({
                    ...prevStats,
                    memberCount: data.totalMembers,
                    coachCount: data.totalCoaches
                }));
            } else {
                console.error('Lỗi khi tải doanh thu năm:', response.status);
                toast.error('Lỗi khi tải doanh thu năm');
            }
        } catch (err) {
            console.error('Lỗi khi tải doanh thu năm:', err);
            toast.error('Có lỗi xảy ra khi tải doanh thu năm');
        } finally {
            setRevenueLoading(false);
        }
    }, [revenueData.selectedYear]);


    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                setError(null);

                const token = localStorage.getItem("userToken");

                if (!token) {
                    setError("Không tìm thấy token xác thực");
                    setLoading(false);
                    return;
                }

                // Gọi API để lấy doanh thu năm (sẽ trả về cả memberCount và coachCount)
                await fetchYearlyRevenue();

                // Tải doanh thu tháng hiện tại
                await fetchMonthlyRevenue();

                // Tải thống kê feedback
                await fetchFeedbackStats();

                // Tải danh sách feedbacks
                await fetchAllFeedbacks();

            } catch (err) {
                console.error('Lỗi khi tải thống kê:', err);
                setError('Có lỗi xảy ra khi tải dữ liệu');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [fetchMonthlyRevenue, fetchYearlyRevenue]);

    // useEffect riêng cho việc thay đổi năm
    useEffect(() => {
        if (revenueData.selectedYear) {
            fetchYearlyRevenue(revenueData.selectedYear);
        }
    }, [revenueData.selectedYear, fetchYearlyRevenue]);

    // useEffect riêng cho việc thay đổi tháng
    useEffect(() => {
        if (revenueData.selectedMonth && revenueData.selectedYear) {
            fetchMonthlyRevenue(revenueData.selectedYear, revenueData.selectedMonth);
        }
    }, [revenueData.selectedMonth, revenueData.selectedYear, fetchMonthlyRevenue]);

    // Pagination helpers
    const applyFilters = useCallback(() => {
        let filtered = [...feedbacks];

        // Search filter
        if (searchTerm.trim()) {
            filtered = filtered.filter(feedback =>
                feedback.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                feedback.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                feedback.feedbackContent.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Rating filter
        if (ratingFilter !== 'all') {
            filtered = filtered.filter(feedback => feedback.rating === parseInt(ratingFilter));
        }

        setFilteredFeedbacks(filtered);

        // Reset to page 1 when filters change
        setPagination(prev => ({
            ...prev,
            currentPage: 1,
            totalItems: filtered.length,
            totalPages: Math.ceil(filtered.length / prev.itemsPerPage)
        }));
    }, [feedbacks, searchTerm, ratingFilter]);

    const getCurrentPageFeedbacks = () => {
        const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
        const endIndex = startIndex + pagination.itemsPerPage;
        return filteredFeedbacks.slice(startIndex, endIndex);
    };

    const updatePagination = (newPage) => {
        setPagination(prev => ({
            ...prev,
            currentPage: newPage,
            totalItems: filteredFeedbacks.length,
            totalPages: Math.ceil(filteredFeedbacks.length / prev.itemsPerPage)
        }));
    };

    const handlePageChange = (pageNumber) => {
        updatePagination(pageNumber);
    };

    const handleItemsPerPageChange = (newItemsPerPage) => {
        setPagination(prev => ({
            ...prev,
            itemsPerPage: newItemsPerPage,
            currentPage: 1,
            totalItems: filteredFeedbacks.length,
            totalPages: Math.ceil(filteredFeedbacks.length / newItemsPerPage)
        }));
    };

    // Update filtered feedbacks when feedbacks or filters change
    useEffect(() => {
        applyFilters();
    }, [applyFilters]);

    // Update pagination when filteredFeedbacks change
    useEffect(() => {
        setPagination(prev => ({
            ...prev,
            totalItems: filteredFeedbacks.length,
            totalPages: Math.ceil(filteredFeedbacks.length / prev.itemsPerPage)
        }));
    }, [filteredFeedbacks]);

    const renderStars = (rating) => {
        return (
            <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                        key={star}
                        className={star <= rating ? 'text-warning' : 'text-muted'}
                        size={16}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="admin-dashboard">
            {error && (
                <Alert variant="danger" className="mb-3">
                    <strong>Lỗi:</strong> {error}
                </Alert>
            )}

            {/* Hàng ngang thống kê tổng quan */}
            <div className="stats-row">
                <div className="stat-card">
                    <div className="stat-icon">
                        <FaUsers />
                    </div>
                    <div className="stat-content">
                        <div className="label">Thành viên</div>
                        <div className="value">
                            {loading ? '...' : stats.memberCount}
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <FaUserTie />
                    </div>
                    <div className="stat-content">
                        <div className="label">Huấn luyện viên</div>
                        <div className="value">
                            {loading ? '...' : stats.coachCount}
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <FaComment />
                    </div>
                    <div className="stat-content">
                        <div className="label">Tổng đánh giá</div>
                        <div className="value">
                            {loading ? '...' : stats.totalFeedbacks}
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <FaChartBar />
                    </div>
                    <div className="stat-content">
                        <div className="label">Điểm trung bình</div>
                        <div className="value">
                            {loading ? '...' : (stats.averageRating || 0).toFixed(1)}/5
                        </div>
                    </div>
                </div>
            </div>

            <br />

            {/* Revenue Management */}
            <Row className="mb-4">
                <Col md={6}>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">
                                <FaDollarSign className="me-2" />
                                Doanh thu tháng hiện tại
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="revenue-current">
                                <div className="d-flex align-items-center">
                                    <FaCalendarAlt className="text-primary me-2" size={20} />
                                    <span>Tháng {revenueData.selectedMonth}/{revenueData.selectedYear}</span>
                                </div>
                                <div className="revenue-amount mt-2">
                                    <h3 className="text-success mb-0">
                                        {revenueLoading ? (
                                            <Spinner animation="border" size="sm" />
                                        ) : (
                                            `${(stats.revenue || 0).toLocaleString('vi-VN')} VNĐ`
                                        )}
                                    </h3>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">
                                <FaChartBar className="me-2" />
                                Doanh thu theo năm
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="year-selector mb-3">
                                <Form.Select
                                    value={revenueData.selectedYear}
                                    onChange={(e) => {
                                        const newYear = parseInt(e.target.value);
                                        setRevenueData(prev => ({ ...prev, selectedYear: newYear }));
                                    }}
                                >
                                    {[2023, 2024, 2025].map(year => (
                                        <option key={year} value={year}>Năm {year}</option>
                                    ))}
                                </Form.Select>
                            </div>
                            <div className="yearly-summary">
                                {revenueLoading ? (
                                    <div className="text-center">
                                        <Spinner animation="border" size="sm" />
                                    </div>
                                ) : (
                                    <div>
                                        <p className="mb-1 text-muted">Tổng doanh thu năm {revenueData.selectedYear}:</p>
                                        <h4 className="text-primary">
                                            {revenueData.yearlyRevenue && Array.isArray(revenueData.yearlyRevenue)
                                                ? revenueData.yearlyRevenue.reduce((sum, month) => sum + (month?.total || 0), 0).toLocaleString('vi-VN')
                                                : '0'
                                            } VNĐ
                                        </h4>
                                        {revenueData.yearlyRevenue && revenueData.yearlyRevenue.length > 0 && (
                                            <small className="text-muted">
                                                Tháng cao nhất: {Math.max(...revenueData.yearlyRevenue.map(m => m?.total || 0)).toLocaleString('vi-VN')} VNĐ
                                            </small>
                                        )}
                                    </div>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Chi tiết doanh thu theo tháng */}
            {revenueData.yearlyRevenue && revenueData.yearlyRevenue.length > 0 && (
                <Row className="mb-4">
                    <Col>
                        <Card>
                            <Card.Header>
                                <h5 className="mb-0">
                                    <FaChartBar className="me-2" />
                                    Chi tiết doanh thu từng tháng năm {revenueData.selectedYear}
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                <div className="table-responsive">
                                    <Table striped hover className="mb-0">
                                        <thead className="table-dark">
                                            <tr>
                                                <th>Tháng</th>
                                                <th>Doanh thu</th>
                                                <th>Tỷ lệ</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {revenueData.yearlyRevenue.map((monthData, index) => {
                                                // Safe checks for undefined properties
                                                const monthTotal = monthData?.total || 0;
                                                const monthNumber = monthData?.month || (index + 1);

                                                const totalYearRevenue = revenueData.yearlyRevenue.reduce((sum, m) => sum + (m?.total || 0), 0);
                                                const percentage = totalYearRevenue > 0 ? ((monthTotal / totalYearRevenue) * 100).toFixed(1) : 0;

                                                return (
                                                    <tr key={index}>
                                                        <td>
                                                            <strong>Tháng {monthNumber}</strong>
                                                        </td>
                                                        <td>
                                                            <span className={monthTotal > 0 ? 'text-success' : 'text-muted'}>
                                                                {monthTotal.toLocaleString('vi-VN')} VNĐ
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div className="d-flex align-items-center">
                                                                <div
                                                                    className="bg-primary me-2"
                                                                    style={{
                                                                        width: `${percentage}%`,
                                                                        height: '8px',
                                                                        minWidth: '2px',
                                                                        maxWidth: '100px'
                                                                    }}
                                                                ></div>
                                                                <small>{percentage}%</small>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </Table>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Quản lý Feedback */}
            <Row className="mb-4">
                <Col>
                    <Card>
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <h4 className="mb-0">
                                <FaComment className="me-2" />
                                Quản lý đánh giá từ người dùng
                            </h4>
                            <div className="d-flex align-items-center gap-3">
                                <Badge bg="primary">
                                    {feedbacks.length} đánh giá
                                </Badge>
                                <Form.Select
                                    size="sm"
                                    value={pagination.itemsPerPage}
                                    onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
                                    style={{ width: 'auto' }}
                                >
                                    <option value={5}>5/trang</option>
                                    <option value={10}>10/trang</option>
                                    <option value={20}>20/trang</option>
                                    <option value={50}>50/trang</option>
                                </Form.Select>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            {/* Search và Filter Controls */}
                            <Row className="mb-3">
                                <Col md={6}>
                                    <div className="position-relative">
                                        <FaSearch className="position-absolute" style={{
                                            top: '50%',
                                            left: '12px',
                                            transform: 'translateY(-50%)',
                                            color: '#6c757d'
                                        }} />
                                        <Form.Control
                                            type="text"
                                            placeholder="Tìm kiếm theo tên, email hoặc nội dung đánh giá..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            style={{ paddingLeft: '40px' }}
                                        />
                                    </div>
                                </Col>
                                <Col md={3}>
                                    <div className="d-flex align-items-center">
                                        <FaFilter className="me-2 text-muted" />
                                        <Form.Select
                                            value={ratingFilter}
                                            onChange={(e) => setRatingFilter(e.target.value)}
                                        >
                                            <option value="all">Tất cả đánh giá</option>
                                            <option value="5">5 sao</option>
                                            <option value="4">4 sao</option>
                                            <option value="3">3 sao</option>
                                            <option value="2">2 sao</option>
                                            <option value="1">1 sao</option>
                                        </Form.Select>
                                    </div>
                                </Col>
                                <Col md={3}>
                                    <div className="text-end d-flex justify-content-end align-items-center gap-2">
                                        {(searchTerm || ratingFilter !== 'all') && (
                                            <Button
                                                variant="outline-secondary"
                                                size="sm"
                                                onClick={() => {
                                                    setSearchTerm('');
                                                    setRatingFilter('all');
                                                }}
                                                title="Xóa bộ lọc"
                                            >
                                                Xóa lọc
                                            </Button>
                                        )}
                                        <small className="text-muted">
                                            {filteredFeedbacks.length} / {feedbacks.length} đánh giá
                                        </small>
                                    </div>
                                </Col>
                            </Row>

                            {feedbackLoading ? (
                                <div className="text-center py-4">
                                    <Spinner animation="border" variant="primary" />
                                    <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
                                </div>
                            ) : filteredFeedbacks.length === 0 ? (
                                <div className="text-center py-4">
                                    <FaComment className="text-muted mb-3" size={48} />
                                    <h5 className="text-muted">
                                        {feedbacks.length === 0 ? 'Chưa có đánh giá nào' : 'Không tìm thấy đánh giá phù hợp'}
                                    </h5>
                                    <p className="text-muted">
                                        {feedbacks.length === 0
                                            ? 'Hệ thống chưa có đánh giá từ người dùng.'
                                            : 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.'
                                        }
                                    </p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <Table striped hover className="mb-0">
                                        <thead className="table-dark">
                                            <tr>
                                                <th>#</th>
                                                <th>Người dùng</th>
                                                <th>Email</th>
                                                <th>Đánh giá</th>
                                                <th>Nội dung</th>
                                                <th>Ngày tạo</th>
                                                <th>Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {getCurrentPageFeedbacks().map((feedback, index) => (
                                                <tr key={feedback.feedbackID}>
                                                    <td>{(pagination.currentPage - 1) * pagination.itemsPerPage + index + 1}</td>
                                                    <td>
                                                        <div>
                                                            <strong>{feedback.userName}</strong>
                                                            <br />
                                                            <Badge bg="secondary" className="text-uppercase">
                                                                {feedback.userRole}
                                                            </Badge>
                                                        </div>
                                                    </td>
                                                    <td>{feedback.userEmail}</td>
                                                    <td>
                                                        {renderStars(feedback.rating)}
                                                        <span className="ms-2 text-muted">
                                                            ({feedback.rating}/5)
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="feedback-content" style={{ maxWidth: '200px' }}>
                                                            {feedback.feedbackContent.length > 50
                                                                ? `${feedback.feedbackContent.substring(0, 50)}...`
                                                                : feedback.feedbackContent
                                                            }
                                                        </div>
                                                    </td>
                                                    <td>
                                                        {new Date(feedback.feedbackDate).toLocaleDateString('vi-VN')}
                                                    </td>
                                                    <td>
                                                        <div className="d-flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline-info"
                                                                onClick={() => fetchFeedbackDetail(feedback.feedbackID)}
                                                                title="Xem chi tiết"
                                                            >
                                                                <FaEye />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline-danger"
                                                                onClick={() => deleteFeedback(feedback.feedbackID)}
                                                                title="Xóa đánh giá"
                                                            >
                                                                <FaTrashAlt />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            )}

                            {/* Pagination */}
                            {filteredFeedbacks.length > 0 && pagination.totalPages > 1 && (
                                <div className="d-flex justify-content-between align-items-center mt-3">
                                    <small className="text-muted">
                                        Hiển thị {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} - {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} trong tổng số {pagination.totalItems} đánh giá
                                    </small>
                                    <Pagination className="mb-0">
                                        <Pagination.First
                                            onClick={() => handlePageChange(1)}
                                            disabled={pagination.currentPage === 1}
                                        />
                                        <Pagination.Prev
                                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                                            disabled={pagination.currentPage === 1}
                                        />

                                        {/* Render page numbers */}
                                        {[...Array(pagination.totalPages)].map((_, i) => {
                                            const pageNumber = i + 1;
                                            const isCurrentPage = pageNumber === pagination.currentPage;

                                            // Show first, last, current, and adjacent pages
                                            if (
                                                pageNumber === 1 ||
                                                pageNumber === pagination.totalPages ||
                                                (pageNumber >= pagination.currentPage - 1 && pageNumber <= pagination.currentPage + 1)
                                            ) {
                                                return (
                                                    <Pagination.Item
                                                        key={pageNumber}
                                                        active={isCurrentPage}
                                                        onClick={() => handlePageChange(pageNumber)}
                                                    >
                                                        {pageNumber}
                                                    </Pagination.Item>
                                                );
                                            }

                                            // Show ellipsis
                                            if (
                                                pageNumber === pagination.currentPage - 2 ||
                                                pageNumber === pagination.currentPage + 2
                                            ) {
                                                return <Pagination.Ellipsis key={pageNumber} disabled />;
                                            }

                                            return null;
                                        })}

                                        <Pagination.Next
                                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                                            disabled={pagination.currentPage === pagination.totalPages}
                                        />
                                        <Pagination.Last
                                            onClick={() => handlePageChange(pagination.totalPages)}
                                            disabled={pagination.currentPage === pagination.totalPages}
                                        />
                                    </Pagination>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Modal chi tiết feedback */}
            <Modal show={showFeedbackDetail} onHide={() => setShowFeedbackDetail(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <FaComment className="me-2" />
                        Chi tiết đánh giá
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedFeedback && (
                        <div>
                            <div className="mb-3">
                                <strong>Người gửi:</strong>
                                <div className="mt-1">
                                    <Badge bg="primary" className="me-2">{selectedFeedback.userName}</Badge>
                                    <Badge bg="secondary">{selectedFeedback.userRole}</Badge>
                                </div>
                                <small className="text-muted">{selectedFeedback.userEmail}</small>
                            </div>

                            <div className="mb-3">
                                <strong>Đánh giá:</strong>
                                <div className="mt-1">
                                    {renderStars(selectedFeedback.rating)}
                                    <span className="ms-2">({selectedFeedback.rating}/5)</span>
                                </div>
                            </div>

                            <div className="mb-3">
                                <strong>Nội dung:</strong>
                                <div className="mt-1 p-3 bg-light rounded">
                                    {selectedFeedback.feedbackContent}
                                </div>
                            </div>

                            <div>
                                <strong>Ngày tạo:</strong>
                                <div className="text-muted">
                                    {new Date(selectedFeedback.feedbackDate).toLocaleString('vi-VN')}
                                </div>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowFeedbackDetail(false)}>
                        Đóng
                    </Button>
                    {selectedFeedback && (
                        <Button
                            variant="danger"
                            onClick={() => {
                                deleteFeedback(selectedFeedback.feedbackID);
                                setShowFeedbackDetail(false);
                            }}
                        >
                            <FaTrashAlt className="me-1" />
                            Xóa đánh giá
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminDashboard;
