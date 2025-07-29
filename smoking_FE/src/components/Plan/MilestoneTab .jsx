import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Row, Col, InputGroup, Card, Badge, Pagination } from "react-bootstrap";
import { FaPlus, FaEdit, FaTrash, FaClock, FaHeart, FaLungs, FaBrain, FaLeaf } from "react-icons/fa";
import { toast } from "react-toastify";


function MilestoneTab() {
    const [milestones, setMilestones] = useState([]);
    const [milestoneModalShow, setMilestoneModalShow] = useState(false);
    const [editMilestone, setEditMilestone] = useState(null);
    const [milestoneForm, setMilestoneForm] = useState({ label: "", status: [{ type: "", content: "", percent: 0 }] });
    const [loading, setLoading] = useState(true);


    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5); // 5 milestones per page
    const [totalItems, setTotalItems] = useState(0);
    const token = localStorage.getItem('userToken');

    useEffect(() => {
        const fetchMilestones = async () => {
            try {
                setLoading(true);
                const res = await fetch('/api/admin/milestones/list', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });


                if (res.ok) {
                    const data = await res.json();
                    console.log('Dữ liệu milestones từ API:', data);


                    // Chuyển đổi dữ liệu từ API sang format của component
                    const convertedMilestones = [];
                    let milestoneId = 1;


                    data.forEach(group => {
                        group.milestones.forEach(milestone => {
                            // Tìm milestone với cùng time hoặc tạo mới
                            let existingMilestone = convertedMilestones.find(m => m.label === milestone.time);


                            if (existingMilestone) {
                                // Thêm status vào milestone đã có
                                existingMilestone.status.push({
                                    type: group.groupName,
                                    content: milestone.description,
                                    percent: milestone.percent
                                });
                            } else {
                                // Tạo milestone mới
                                convertedMilestones.push({
                                    id: milestoneId++,
                                    label: milestone.time,
                                    status: [{
                                        type: group.groupName,
                                        content: milestone.description,
                                        percent: milestone.percent
                                    }]
                                });
                            }
                        });
                    });


                    setMilestones(convertedMilestones);
                    setTotalItems(convertedMilestones.length);
                    console.log('Dữ liệu milestones đã chuyển đổi:', convertedMilestones);
                } else {
                    console.error('Lỗi khi tải milestones:', res.status, res.statusText);
                    toast.error('Không thể tải dữ liệu milestones');
                    setMilestones([]);
                    setTotalItems(0);
                }
            } catch (err) {
                console.error('Lỗi khi gọi API milestones:', err);
                toast.error('Lỗi kết nối API');
                setMilestones([]);
                setTotalItems(0);
            } finally {
                setLoading(false);
            }
        };


        fetchMilestones();
    }, []);


    const openAddMilestoneModal = () => {
        setEditMilestone(null);
        setMilestoneForm({ label: "", status: [{ type: "", content: "", percent: 0 }] });
        setMilestoneModalShow(true);
    };


    const openEditMilestoneModal = (ms) => {
        setEditMilestone(ms.id);
        setMilestoneForm(JSON.parse(JSON.stringify(ms))); // Deep copy
        setMilestoneModalShow(true);
    };


    const handleDeleteMilestone = async (id) => {
        try {
            const res = await fetch(`/api/admin/milestones/delete?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                setMilestones(milestones.filter(ms => ms.id !== id));
                toast.success("Xóa mốc thành công!");
            } else {
                toast.error("Xóa mốc thất bại!");
            }
        } catch (err) {
            toast.error("Lỗi kết nối khi xóa mốc!");
        }
    };


    const handleMilestoneModalSave = async () => {
        if (editMilestone) {
            // Gọi API PUT để cập nhật milestone
            try {
                const res = await fetch(`/api/admin/milestones/update`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        id: editMilestone,
                        label: milestoneForm.label,
                        status: milestoneForm.status
                    })
                });
                if (res.ok) {
                    setMilestones(milestones.map(ms => ms.id === editMilestone ? { ...milestoneForm, id: editMilestone } : ms));
                    toast.success("Cập nhật mốc thành công!");
                } else {
                    toast.error("Cập nhật mốc thất bại!");
                }
            } catch (err) {
                toast.error("Lỗi kết nối khi cập nhật mốc!");
            }
        } else {
            // TODO: Gọi API POST để thêm mới
            setMilestones([...milestones, { ...milestoneForm, id: Date.now() }]);
            toast.success("Thêm mốc mới thành công!");
        }
        setMilestoneModalShow(false);
    };


    const handleMilestoneFormStatusChange = (idx, field, value) => {
        const newStatus = [...milestoneForm.status];
        newStatus[idx][field] = value;
        setMilestoneForm({ ...milestoneForm, status: newStatus });
    };


    const handleAddMilestoneStatusRow = () => {
        setMilestoneForm({ ...milestoneForm, status: [...milestoneForm.status, { type: "", content: "", percent: 0 }] });
    };


    const handleRemoveMilestoneStatusRow = (idx) => {
        if (milestoneForm.status.length > 1) {
            const newStatus = [...milestoneForm.status];
            newStatus.splice(idx, 1);
            setMilestoneForm({ ...milestoneForm, status: newStatus });
        }
    };


    // Pagination functions
    const getCurrentPageData = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return milestones.slice(startIndex, endIndex);
    };


    const getTotalPages = () => {
        return Math.ceil(totalItems / itemsPerPage);
    };


    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);


        // Scroll to top when changing page
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };


    const renderPagination = () => {
        const totalPages = getTotalPages();
        if (totalPages <= 1) return null;


        const items = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);


        // Adjust start page if we're near the end
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }


        // Previous button
        items.push(
            <Pagination.Prev
                key="prev"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
            />
        );


        // First page
        if (startPage > 1) {
            items.push(
                <Pagination.Item
                    key={1}
                    active={currentPage === 1}
                    onClick={() => handlePageChange(1)}
                >
                    1
                </Pagination.Item>
            );
            if (startPage > 2) {
                items.push(<Pagination.Ellipsis key="ellipsis1" />);
            }
        }


        // Page numbers
        for (let page = startPage; page <= endPage; page++) {
            items.push(
                <Pagination.Item
                    key={page}
                    active={currentPage === page}
                    onClick={() => handlePageChange(page)}
                >
                    {page}
                </Pagination.Item>
            );
        }


        // Last page
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                items.push(<Pagination.Ellipsis key="ellipsis2" />);
            }
            items.push(
                <Pagination.Item
                    key={totalPages}
                    active={currentPage === totalPages}
                    onClick={() => handlePageChange(totalPages)}
                >
                    {totalPages}
                </Pagination.Item>
            );
        }


        // Next button
        items.push(
            <Pagination.Next
                key="next"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
            />
        );


        return (
            <div className="d-flex justify-content-between align-items-center mt-4 px-3">
                <div className="text-muted small">
                    Hiển thị {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} trong tổng số {totalItems} mốc
                </div>
                <Pagination className="mb-0" size="sm">
                    {items}
                </Pagination>
            </div>
        );
    };


    // Hàm lấy icon theo loại
    const getStatusIcon = (type) => {
        switch (type.toLowerCase()) {
            case 'thể trạng':
                return <FaHeart className="text-danger me-2" />;
            case 'sức khỏe':
                return <FaLungs className="text-success me-2" />;
            case 'sinh thái':
                return <FaLeaf className="text-success me-2" />;
            case 'thời gian':
                return <FaClock className="text-primary me-2" />;
            case 'tiết kiệm':
                return <FaBrain className="text-warning me-2" />;
            default:
                return <FaHeart className="text-secondary me-2" />;
        }
    };


    // Hàm lấy màu badge theo loại
    const getBadgeColor = (type) => {
        switch (type.toLowerCase()) {
            case 'thể trạng':
                return 'danger';
            case 'sức khỏe':
                return 'success';
            case 'sinh thái':
                return 'info';
            case 'thời gian':
                return 'primary';
            case 'tiết kiệm':
                return 'warning';
            default:
                return 'secondary';
        }
    };


    return (
        <div>
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <p className="mt-3 text-muted">Đang tải dữ liệu milestones...</p>
                </div>
            ) : (
                <>
                    <div className="d-flex justify-content-between align-items-center mt-4 px-3">
                        <div>
                            <h4 className="mb-1">Các mốc tiến trình</h4>
                            {/* <p className="text-muted mb-0">
                                Quản lý các mốc thời gian và trạng thái sức khỏe
                                {totalItems > 0 && <span className="badge bg-primary ms-2">{totalItems} mốc</span>}
                            </p> */}
                        </div>
                        <Button variant="outline-primary" onClick={openAddMilestoneModal}>
                            <FaPlus className="me-2" /> Thêm mốc mới
                        </Button>
                    </div>


                    {/* Table View */}
                    {getCurrentPageData().length > 0 ? (
                        <>
                            <Card className="shadow-sm border-0">
                                <Table responsive hover className="mb-0">
                                    <thead>
                                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                                            <th className="py-3 px-4 fw-semibold text-muted" style={{ width: '80px', fontSize: '0.85rem' }}>#</th>
                                            <th className="py-3 px-4 fw-semibold text-muted" style={{ width: '160px', fontSize: '0.85rem' }}>Mốc thời gian</th>
                                            <th className="py-3 px-4 fw-semibold text-muted" style={{ width: '200px', fontSize: '0.85rem' }}>Group Milestone</th>
                                            <th className="py-3 px-4 fw-semibold text-muted" style={{ fontSize: '0.85rem' }}>Description</th>
                                            <th className="py-3 px-4 fw-semibold text-muted text-center" style={{ width: '120px', fontSize: '0.85rem' }}>Phần trăm</th>
                                            <th className="py-3 px-4 fw-semibold text-muted text-center" style={{ width: '140px', fontSize: '0.85rem' }}>Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getCurrentPageData().map((ms, msIdx) =>
                                            ms.status.map((s, statusIdx) => (
                                                <tr key={`${ms.id}-${statusIdx}`} className="border-bottom">
                                                    <td className="py-3 px-4 text-center">
                                                        {statusIdx === 0 && (
                                                            <span className="badge bg-primary px-2 py-1">
                                                                {((currentPage - 1) * itemsPerPage) + msIdx + 1}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        {statusIdx === 0 && (
                                                            <div className="d-flex align-items-center">
                                                                <FaClock className="text-primary me-2" size={14} />
                                                                <span className="fw-semibold text-dark">{ms.label}</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="d-flex align-items-center">
                                                            {getStatusIcon(s.type)}
                                                            <Badge bg={getBadgeColor(s.type)} className="px-2 py-1">
                                                                {s.type}
                                                            </Badge>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className="text-dark" style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                                                            {s.content}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        <Badge bg="light" text="dark" className="px-2 py-1 fs-6">
                                                            {s.percent}%
                                                        </Badge>
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        {statusIdx === 0 && (
                                                            <div className="d-flex justify-content-center gap-2">
                                                                <Button
                                                                    variant="outline-success"
                                                                    size="sm"
                                                                    className="px-3"
                                                                    onClick={() => openEditMilestoneModal(ms)}
                                                                    title="Chỉnh sửa"
                                                                >
                                                                    <FaEdit size={12} />
                                                                </Button>
                                                                <Button
                                                                    variant="outline-danger"
                                                                    size="sm"
                                                                    className="px-3"
                                                                    onClick={() => handleDeleteMilestone(ms.id)}
                                                                    title="Xóa"
                                                                >
                                                                    <FaTrash size={12} />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </Table>
                            </Card>
                            {renderPagination()}
                        </>
                    ) : (
                        <div className="text-center py-5">
                            <FaClock size={48} className="text-muted mb-3" />
                            <h5 className="text-muted">Chưa có mốc tiến trình nào</h5>
                            <p className="text-muted">Thêm mốc tiến trình đầu tiên để bắt đầu</p>
                            <Button variant="primary" onClick={openAddMilestoneModal}>
                                <FaPlus className="me-2" /> Thêm mốc đầu tiên
                            </Button>
                        </div>
                    )}


                    {/* Card View - Removed */}


                    {/* Modal thêm/sửa Milestone */}
                    <Modal show={milestoneModalShow} onHide={() => setMilestoneModalShow(false)} centered size="lg">
                        <Modal.Header closeButton>
                            <Modal.Title>
                                {editMilestone ? "Chỉnh sửa mốc tiến trình" : "Thêm mốc tiến trình mới"}
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form>
                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-bold">
                                        <FaClock className="me-2" />
                                        Tên mốc thời gian
                                    </Form.Label>
                                    <Form.Control
                                        value={milestoneForm.label}
                                        onChange={e => setMilestoneForm({ ...milestoneForm, label: e.target.value })}
                                        placeholder="VD: 1 phút, 1 tiếng, 1 ngày..."
                                        size="lg"
                                    />
                                </Form.Group>


                                <div className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <Form.Label className="fw-bold mb-0">Danh sách trạng thái</Form.Label>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={handleAddMilestoneStatusRow}
                                        >
                                            <FaPlus className="me-1" /> Thêm trạng thái
                                        </Button>
                                    </div>


                                    {milestoneForm.status.map((s, idx) => (
                                        <Card key={idx} className="mb-3">
                                            <Card.Body className="p-3">
                                                <Row className="align-items-center">
                                                    <Col md={3}>
                                                        <Form.Label className="small text-muted">Loại trạng thái</Form.Label>
                                                        <Form.Select
                                                            value={s.type}
                                                            onChange={e => handleMilestoneFormStatusChange(idx, "type", e.target.value)}
                                                            size="sm"
                                                        >
                                                            <option value="">Chọn loại</option>
                                                            <option value="Thể trạng">Thể trạng</option>
                                                            <option value="Sức khỏe">Sức khỏe</option>
                                                            <option value="Sinh thái">Sinh thái</option>
                                                            <option value="Thời gian">Thời gian</option>
                                                            <option value="Tiết kiệm">Tiết kiệm</option>
                                                        </Form.Select>
                                                    </Col>
                                                    <Col md={2}>
                                                        <Form.Label className="small text-muted">Phần trăm</Form.Label>
                                                        <InputGroup size="sm">
                                                            <Form.Control
                                                                type="number"
                                                                value={s.percent}
                                                                onChange={e => handleMilestoneFormStatusChange(idx, "percent", parseInt(e.target.value) || 0)}
                                                                min="0"
                                                                max="100"
                                                            />
                                                            <InputGroup.Text>%</InputGroup.Text>
                                                        </InputGroup>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Label className="small text-muted">Mô tả</Form.Label>
                                                        <Form.Control
                                                            as="textarea"
                                                            rows={2}
                                                            value={s.content}
                                                            onChange={e => handleMilestoneFormStatusChange(idx, "content", e.target.value)}
                                                            placeholder="Mô tả chi tiết về trạng thái này..."
                                                            size="sm"
                                                        />
                                                    </Col>
                                                    <Col md={1} className="text-center">
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            onClick={() => handleRemoveMilestoneStatusRow(idx)}
                                                            disabled={milestoneForm.status.length === 1}
                                                            className="mt-3"
                                                        >
                                                            <FaTrash />
                                                        </Button>
                                                    </Col>
                                                </Row>
                                            </Card.Body>
                                        </Card>
                                    ))}
                                </div>
                            </Form>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setMilestoneModalShow(false)}>
                                Hủy
                            </Button>
                            <Button variant="primary" onClick={handleMilestoneModalSave}>
                                <FaPlus className="me-2" />
                                {editMilestone ? "Cập nhật" : "Thêm mới"}
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </>
            )}
        </div>
    );
}
export default MilestoneTab;