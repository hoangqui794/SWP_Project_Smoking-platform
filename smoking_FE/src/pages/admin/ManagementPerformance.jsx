import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Table, Modal, Form, InputGroup, Pagination, Spinner, Container } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import axios from 'axios';
import { FaHandsClapping } from 'react-icons/fa6';
import { toast } from 'react-toastify';

const ManagementPerformance = () => {
    const [badges, setBadges] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newBadge, setNewBadge] = useState({ achievementName: '', badgeImage: '', criteria: '', description: '', packageType: 'Basic' });
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingBadge, setEditingBadge] = useState(null);
    const [search, setSearch] = useState('');

    // Thêm state cho tùy chọn "Khác"
    const [showCustomPackageType, setShowCustomPackageType] = useState(false);
    const [customPackageType, setCustomPackageType] = useState('');
    const [showEditCustomPackageType, setShowEditCustomPackageType] = useState(false);
    const [editCustomPackageType, setEditCustomPackageType] = useState('');

    // State cho việc chọn loại điều kiện (chỉ chọn một)
    const [selectedConditionType, setSelectedConditionType] = useState('');
    const [editSelectedConditionType, setEditSelectedConditionType] = useState('');

    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Hiển thị 10 huy hiệu mỗi trang
    // Lấy dữ liệu huy hiệu từ API mới (ListAchievement)
    useEffect(() => {
        fetchBadges();
    }, []);

    useEffect(() => {
        // Cuộn lên đầu trang một cách mượt mà
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage]);

    const fetchBadges = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('userToken');
            const res = await axios.get('/api/admin/achievements/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBadges(res.data.data || []);
            setCurrentPage(1);
        } catch (err) {
            console.error('Error fetching data', err);
            toast.error("Không thể tải danh sách thành tích.");
        } finally {
            setIsLoading(false);
        }
    };

    // Xử lý tìm kiếm local không dùng API
    const handleSearch = (e) => {
        e.preventDefault();
        if (!search.trim()) {
            fetchBadges();
            return;
        }
        // Lọc local trên badges hiện tại
        const keyword = search.trim().toLowerCase();
        const filtered = badges.filter(badge =>
            (badge.achievementName && badge.achievementName.toLowerCase().includes(keyword)) ||
            (badge.description && badge.description.toLowerCase().includes(keyword)) ||
            (badge.criteria && badge.criteria.toLowerCase().includes(keyword))
        );
        setBadges(filtered);
        setCurrentPage(1);
    };

    // Sửa huy hiệu
    const handleEdit = (badge) => {
        setEditingBadge({ ...badge });

        // Kiểm tra xem có phải là loại gói tùy chỉnh không
        const standardTypes = ['Streak', 'Superstar', 'JoinDays', 'CheckIn', 'Basic', 'Premium'];
        if (!standardTypes.includes(badge.packageType)) {
            setShowEditCustomPackageType(true);
            setEditCustomPackageType(badge.packageType);
        } else {
            setShowEditCustomPackageType(false);
            setEditCustomPackageType('');
        }

        // Xác định loại điều kiện hiện tại
        if (badge.smokeFreeDaysRequired && badge.smokeFreeDaysRequired > 0) {
            setEditSelectedConditionType('smokeFreeDays');
        } else if (badge.moneySavedRequired && badge.moneySavedRequired > 0) {
            setEditSelectedConditionType('moneySaved');
        } else if (badge.cigarettesDroppedRequired && badge.cigarettesDroppedRequired > 0) {
            setEditSelectedConditionType('cigarettesDropped');
        } else if (badge.checkinDaysRequired && badge.checkinDaysRequired > 0) {
            setEditSelectedConditionType('checkinDays');
        } else {
            setEditSelectedConditionType('');
        }

        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        try {
            const token = localStorage.getItem('userToken');

            // Sử dụng loại gói tùy chỉnh nếu có
            let finalPackageType = editingBadge.packageType;
            if (showEditCustomPackageType && editCustomPackageType.trim()) {
                finalPackageType = editCustomPackageType.trim();
            }

            // Chuẩn hóa dữ liệu gửi đi đúng với API mới
            const payload = {
                achievementName: editingBadge.achievementName,
                description: editingBadge.description,
                criteria: editingBadge.criteria,
                badgeImage: editingBadge.badgeImage,
                packageType: finalPackageType,
                smokeFreeDaysRequired: Number(editingBadge.smokeFreeDaysRequired) || 0,
                moneySavedRequired: Number(editingBadge.moneySavedRequired) || 0,
                cigarettesDroppedRequired: Number(editingBadge.cigarettesDroppedRequired) || 0,
                checkinDaysRequired: Number(editingBadge.checkinDaysRequired) || 0
            };
            await axios.put(
                `/api/admin/achievements/update/${editingBadge.achievementID}`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );
            await fetchBadges();
            handleCloseEditModal(); // Sử dụng hàm reset
            toast.success('Cập nhật huy hiệu thành công!');
        } catch (err) {
            console.error('Lỗi khi sửa huy hiệu:', err);
            toast.error('Lỗi khi cập nhật huy hiệu!');
        }
    };

    // Xóa huy hiệu
    const handleDelete = (badgeId) => {
        setBadgeToDelete(badgeId);
        setShowDeleteModal(true);
    };

    // Xác nhận xóa
    const confirmDelete = async () => {
        if (!badgeToDelete) return;

        try {
            const token = localStorage.getItem('userToken');
            await axios.delete(`/api/Admin/Achievement/Delete/${badgeToDelete}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchBadges();
            toast.success('Xóa huy hiệu thành công!');
        } catch (err) {
            console.error('Lỗi khi xóa huy hiệu:', err);
            toast.error('Lỗi khi xóa huy hiệu!');
        }

        setShowDeleteModal(false);
        setBadgeToDelete(null);
    };

    // Hàm xử lý thay đổi loại gói
    const handlePackageTypeChange = (value, isEdit = false) => {
        if (value === 'other') {
            if (isEdit) {
                setShowEditCustomPackageType(true);
                setEditingBadge({ ...editingBadge, packageType: '' });
            } else {
                setShowCustomPackageType(true);
                setNewBadge({ ...newBadge, packageType: '' });
            }
        } else {
            if (isEdit) {
                setShowEditCustomPackageType(false);
                setEditCustomPackageType('');
                setEditingBadge({ ...editingBadge, packageType: value });
            } else {
                setShowCustomPackageType(false);
                setCustomPackageType('');
                setNewBadge({ ...newBadge, packageType: value });
            }
        }
    };

    // Hàm xử lý chọn loại điều kiện
    const handleConditionTypeChange = (type, value, isEdit = false) => {
        if (isEdit) {
            setEditSelectedConditionType(type);
            // Reset tất cả điều kiện khác về 0
            setEditingBadge({
                ...editingBadge,
                smokeFreeDaysRequired: type === 'smokeFreeDays' ? value : '',
                moneySavedRequired: type === 'moneySaved' ? value : '',
                cigarettesDroppedRequired: type === 'cigarettesDropped' ? value : '',
                checkinDaysRequired: type === 'checkinDays' ? value : ''
            });
        } else {
            setSelectedConditionType(type);
            // Reset tất cả điều kiện khác về 0
            setNewBadge({
                ...newBadge,
                smokeFreeDaysRequired: type === 'smokeFreeDays' ? value : '',
                moneySavedRequired: type === 'moneySaved' ? value : '',
                cigarettesDroppedRequired: type === 'cigarettesDropped' ? value : '',
                checkinDaysRequired: type === 'checkinDays' ? value : ''
            });
        }
    };

    // Hàm reset form khi đóng modal
    const handleCloseModal = () => {
        setShowModal(false);
        setNewBadge({ achievementName: '', badgeImage: '', criteria: '', description: '', packageType: 'Basic', smokeFreeDaysRequired: '', moneySavedRequired: '', cigarettesDroppedRequired: '', checkinDaysRequired: '' });
        setShowCustomPackageType(false);
        setCustomPackageType('');
        setSelectedConditionType('');
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setEditingBadge(null);
        setShowEditCustomPackageType(false);
        setEditCustomPackageType('');
        setEditSelectedConditionType('');
    };

    // Thêm huy hiệu mới
    const handleAddBadge = async () => {
        try {
            const token = localStorage.getItem('userToken');

            // Sử dụng loại gói tùy chỉnh nếu có
            let finalPackageType = newBadge.packageType;
            if (showCustomPackageType && customPackageType.trim()) {
                finalPackageType = customPackageType.trim();
            }

            // Chuẩn hóa dữ liệu gửi đi đúng với API mới
            const payload = {
                achievementName: newBadge.achievementName,
                description: newBadge.description,
                criteria: newBadge.criteria,
                badgeImage: newBadge.badgeImage,
                packageType: finalPackageType,
                smokeFreeDaysRequired: Number(newBadge.smokeFreeDaysRequired) || 0,
                moneySavedRequired: Number(newBadge.moneySavedRequired) || 0,
                cigarettesDroppedRequired: Number(newBadge.cigarettesDroppedRequired) || 0,
                checkinDaysRequired: Number(newBadge.checkinDaysRequired) || 0
            };
            const res = await axios.post('/api/admin/achievements/create', payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            // Sau khi tạo thành công, reload lại danh sách
            await fetchBadges();
            handleCloseModal(); // Sử dụng hàm reset
            toast.success('Thêm huy hiệu thành công!');
        } catch (err) {
            console.error('Lỗi khi thêm huy hiệu:', err);
            toast.error('Lỗi khi thêm huy hiệu!');
        }
    };

    const indexOfLastBadge = currentPage * itemsPerPage;
    const indexOfFirstBadge = indexOfLastBadge - itemsPerPage;
    const currentBadges = badges.slice(indexOfFirstBadge, indexOfLastBadge);
    const totalPages = Math.ceil(badges.length / itemsPerPage);


    // State cho modal xem chi tiết (đặt ở đầu component, không đặt sau return hoặc điều kiện)
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailBadge, setDetailBadge] = useState(null);

    // State cho modal xác nhận xóa
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [badgeToDelete, setBadgeToDelete] = useState(null);

    const handleShowDetail = (badge) => {
        setDetailBadge(badge);
        setShowDetailModal(true);
    };

    if (isLoading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                <Spinner animation="border" variant="success" />
                <h4 className="ms-3">Đang tải danh sách thành tích...</h4>
            </Container>
        );
    }

    return (
        <div className="badge-management">
            <h2 className="text-center text-success">Quản lý Thành tích - Huy hiệu</h2>

            {/* Thanh tìm kiếm */}
            <Row className="mb-3">
                <Col xs={12} sm={6} md={4} lg={3}>
                    <Form onSubmit={handleSearch}>
                        <InputGroup>
                            <Form.Control
                                type="text"
                                placeholder="Tìm kiếm theo tên, mô tả..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                            <Button variant="primary" type="submit">
                                <FaSearch />
                            </Button>
                        </InputGroup>
                    </Form>
                </Col>
            </Row>

            {/* Bảng huy hiệu */}
            <Row className="mb-4">
                <Col className="d-flex justify-content-end">
                    <Button variant="outline-primary" onClick={() => setShowModal(true)}>
                        <FaPlus /> Tạo huy hiệu
                    </Button>
                </Col>
            </Row>

            <Row className="mb-4">
                <Col>
                    <Card>
                        <Card.Body>
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Tên huy hiệu</th>
                                        <th>Mô tả</th>
                                        <th>Biểu tượng</th>
                                        <th>Điều kiện</th>
                                        <th>Loại gói</th>
                                        <th>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentBadges.map((badge) => (
                                        <tr key={badge.achievementID}>
                                            <td>{badge.achievementID}</td>
                                            <td>{badge.achievementName}</td>
                                            <td>{badge.description}</td>
                                            <td>
                                                {badge.badgeImage ?
                                                    <img src={badge.badgeImage} alt={badge.achievementName} width="30" /> :
                                                    <FaHandsClapping color="#f7b801" size={22} />
                                                }
                                            </td>
                                            <td>
                                                {/* Xử lý điều kiện hiển thị */}
                                                {badge.smokeFreeDaysRequired
                                                    ? `Không hút thuốc ${badge.smokeFreeDaysRequired} ngày`
                                                    : badge.cigarettesDroppedRequired
                                                        ? `Không hút ${badge.cigarettesDroppedRequired} điếu`
                                                        : badge.checkinDaysRequired
                                                            ? `Check-in ${badge.checkinDaysRequired} lần`
                                                            : badge.criteria
                                                }
                                            </td>
                                            <td>{badge.packageType}</td>
                                            <td>
                                                <Button variant="link" size="sm" onClick={() => handleShowDetail(badge)} title="Xem chi tiết">
                                                    <FaSearch color="#0d6efd" />
                                                </Button>
                                                <Button variant="link" size="sm" onClick={() => handleEdit(badge)}><FaEdit /></Button>
                                                <Button variant="link" size="sm" onClick={() => handleDelete(badge.achievementID)}><FaTrash /></Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                            {/* THÊM MỚI: Component Pagination */}
                            {totalPages > 1 && (
                                <Pagination className="justify-content-center">
                                    {Array.from({ length: totalPages }, (_, index) => (
                                        <Pagination.Item
                                            key={index + 1}
                                            active={index + 1 === currentPage}
                                            onClick={() => setCurrentPage(index + 1)}
                                        >
                                            {index + 1}
                                        </Pagination.Item>
                                    ))}
                                </Pagination>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Modal xác nhận xóa */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận xóa huy hiệu</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Bạn có chắc chắn muốn xóa huy hiệu này? Hành động này không thể hoàn tác.
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

            {/* Modal xem chi tiết huy hiệu */}
            <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Chi tiết huy hiệu</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {detailBadge && (
                        <div>
                            <div className="text-center mb-3">
                                {detailBadge.badgeImage && <img src={detailBadge.badgeImage} alt={detailBadge.achievementName} style={{ maxWidth: 100 }} />}
                            </div>
                            <h5>{detailBadge.achievementName}</h5>
                            <p><b>Mô tả:</b> {detailBadge.description}</p>
                            <p><b>Tiêu chí:</b> {detailBadge.criteria}</p>
                            <p><b>Loại gói:</b> {detailBadge.packageType}</p>
                            {detailBadge.smokeFreeDaysRequired ? <p><b>Số ngày không hút thuốc:</b> {detailBadge.smokeFreeDaysRequired}</p> : null}
                            {detailBadge.moneySavedRequired ? <p><b>Số tiền tiết kiệm:</b> {detailBadge.moneySavedRequired}</p> : null}
                            {detailBadge.cigarettesDroppedRequired ? <p><b>Số điếu không hút:</b> {detailBadge.cigarettesDroppedRequired}</p> : null}
                            {detailBadge.checkinDaysRequired ? <p><b>Số ngày check-in:</b> {detailBadge.checkinDaysRequired}</p> : null}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal tạo huy hiệu */}
            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Tạo huy hiệu</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formName">
                            <Form.Label>Tên huy hiệu:</Form.Label>
                            <Form.Control
                                type="text"
                                value={newBadge.achievementName}
                                onChange={e => setNewBadge({ ...newBadge, achievementName: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="formDescription">
                            <Form.Label>Mô tả:</Form.Label>
                            <Form.Control
                                as="textarea"
                                value={newBadge.description}
                                onChange={e => setNewBadge({ ...newBadge, description: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="formCriteria">
                            <Form.Label>Tiêu chí:</Form.Label>
                            <Form.Control
                                type="text"
                                value={newBadge.criteria}
                                onChange={e => setNewBadge({ ...newBadge, criteria: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="formImage">
                            <Form.Label>Ảnh (URL):</Form.Label>
                            <Form.Control
                                type="text"
                                value={newBadge.badgeImage}
                                onChange={e => setNewBadge({ ...newBadge, badgeImage: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="formPackageType">
                            <Form.Label>Loại gói:</Form.Label>
                            <Form.Select
                                value={newBadge.packageType}
                                onChange={e => handlePackageTypeChange(e.target.value)}
                            >
                                <option value="Streak">Streak</option>
                                <option value="Superstar">Superstar</option>
                                <option value="JoinDays">JoinDays</option>
                                <option value="CheckIn">CheckIn</option>
                                <option value="Basic">Basic</option>
                                <option value="Premium">Premium</option>
                                <option value="other">Khác (vui lòng nhập bên dưới)</option>
                            </Form.Select>
                        </Form.Group>
                        {showCustomPackageType && (
                            <Form.Group controlId="formCustomPackageType">
                                <Form.Label>Nhập loại gói tùy chỉnh:</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={customPackageType}
                                    onChange={e => setCustomPackageType(e.target.value)}
                                    placeholder="VD: Gói cơ bản, Gói nâng cao..."
                                />
                            </Form.Group>
                        )}

                        <Form.Group>
                            <Form.Label>Chọn loại điều kiện (chỉ chọn một):</Form.Label>
                            <div className="d-flex flex-wrap gap-3 mt-2">
                                <Form.Check
                                    type="radio"
                                    id="smokeFreeDays"
                                    name="conditionType"
                                    label="Số ngày không hút thuốc"
                                    checked={selectedConditionType === 'smokeFreeDays'}
                                    onChange={() => handleConditionTypeChange('smokeFreeDays', newBadge.smokeFreeDaysRequired)}
                                />
                                <Form.Check
                                    type="radio"
                                    id="moneySaved"
                                    name="conditionType"
                                    label="Số tiền tiết kiệm"
                                    checked={selectedConditionType === 'moneySaved'}
                                    onChange={() => handleConditionTypeChange('moneySaved', newBadge.moneySavedRequired)}
                                />
                                <Form.Check
                                    type="radio"
                                    id="cigarettesDropped"
                                    name="conditionType"
                                    label="Số điếu không hút"
                                    checked={selectedConditionType === 'cigarettesDropped'}
                                    onChange={() => handleConditionTypeChange('cigarettesDropped', newBadge.cigarettesDroppedRequired)}
                                />
                                <Form.Check
                                    type="radio"
                                    id="checkinDays"
                                    name="conditionType"
                                    label="Số ngày check-in"
                                    checked={selectedConditionType === 'checkinDays'}
                                    onChange={() => handleConditionTypeChange('checkinDays', newBadge.checkinDaysRequired)}
                                />
                            </div>
                        </Form.Group>

                        {selectedConditionType === 'smokeFreeDays' && (
                            <Form.Group controlId="formSmokeFreeDaysRequired">
                                <Form.Label>Số ngày không hút thuốc:</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={newBadge.smokeFreeDaysRequired || ''}
                                    onChange={e => handleConditionTypeChange('smokeFreeDays', e.target.value)}
                                    placeholder="VD: 7, 30, 90..."
                                />
                            </Form.Group>
                        )}

                        {selectedConditionType === 'moneySaved' && (
                            <Form.Group controlId="formMoneySavedRequired">
                                <Form.Label>Số tiền tiết kiệm (VNĐ):</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={newBadge.moneySavedRequired || ''}
                                    onChange={e => handleConditionTypeChange('moneySaved', e.target.value)}
                                    placeholder="VD: 100000, 500000..."
                                />
                            </Form.Group>
                        )}

                        {selectedConditionType === 'cigarettesDropped' && (
                            <Form.Group controlId="formCigarettesDroppedRequired">
                                <Form.Label>Số điếu không hút:</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={newBadge.cigarettesDroppedRequired || ''}
                                    onChange={e => handleConditionTypeChange('cigarettesDropped', e.target.value)}
                                    placeholder="VD: 20, 100, 500..."
                                />
                            </Form.Group>
                        )}

                        {selectedConditionType === 'checkinDays' && (
                            <Form.Group controlId="formCheckinDaysRequired">
                                <Form.Label>Số ngày check-in:</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={newBadge.checkinDaysRequired || ''}
                                    onChange={e => handleConditionTypeChange('checkinDays', e.target.value)}
                                    placeholder="VD: 7, 30, 100..."
                                />
                            </Form.Group>
                        )}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Hủy
                    </Button>
                    <Button variant="primary" onClick={handleAddBadge}>
                        Lưu
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal chỉnh sửa huy hiệu */}
            <Modal show={showEditModal} onHide={handleCloseEditModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Sửa huy hiệu</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formName">
                            <Form.Label>Tên huy hiệu:</Form.Label>
                            <Form.Control
                                type="text"
                                value={editingBadge?.achievementName}
                                onChange={e => setEditingBadge({ ...editingBadge, achievementName: e.target.value })}
                            />
                        </Form.Group>

                        <Form.Group controlId="formImage">
                            <Form.Label>Ảnh:</Form.Label>
                            <Form.Control
                                type="text"
                                value={editingBadge?.badgeImage}
                                onChange={e => setEditingBadge({ ...editingBadge, badgeImage: e.target.value })}
                            />
                        </Form.Group>

                        <Form.Group controlId="formCondition">
                            <Form.Label>Điều kiện:</Form.Label>
                            <Form.Control
                                type="text"
                                value={editingBadge?.criteria}
                                onChange={e => setEditingBadge({ ...editingBadge, criteria: e.target.value })}
                            />
                        </Form.Group>

                        <Form.Group controlId="formDescription">
                            <Form.Label>Mô tả:</Form.Label>
                            <Form.Control
                                as="textarea"
                                value={editingBadge?.description}
                                onChange={e => setEditingBadge({ ...editingBadge, description: e.target.value })}
                            />
                        </Form.Group>

                        <Form.Group controlId="formEditPackageType">
                            <Form.Label>Loại gói:</Form.Label>
                            <Form.Select
                                value={editingBadge?.packageType}
                                onChange={e => handlePackageTypeChange(e.target.value, true)}
                            >
                                <option value="Streak">Streak</option>
                                <option value="Superstar">Superstar</option>
                                <option value="JoinDays">JoinDays</option>
                                <option value="CheckIn">CheckIn</option>
                                <option value="Basic">Basic</option>
                                <option value="Premium">Premium</option>
                                <option value="other">Khác (vui lòng nhập bên dưới)</option>
                            </Form.Select>
                        </Form.Group>
                        {showEditCustomPackageType && (
                            <Form.Group controlId="formEditCustomPackageType">
                                <Form.Label>Nhập loại gói tùy chỉnh:</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={editCustomPackageType}
                                    onChange={e => setEditCustomPackageType(e.target.value)}
                                    placeholder="VD: Gói cơ bản, Gói nâng cao..."
                                />
                            </Form.Group>
                        )}

                        <Form.Group>
                            <Form.Label>Chọn loại điều kiện (chỉ chọn một):</Form.Label>
                            <div className="d-flex flex-wrap gap-3 mt-2">
                                <Form.Check
                                    type="radio"
                                    id="editSmokeFreeDays"
                                    name="editConditionType"
                                    label="Số ngày không hút thuốc"
                                    checked={editSelectedConditionType === 'smokeFreeDays'}
                                    onChange={() => handleConditionTypeChange('smokeFreeDays', editingBadge?.smokeFreeDaysRequired, true)}
                                />
                                <Form.Check
                                    type="radio"
                                    id="editMoneySaved"
                                    name="editConditionType"
                                    label="Số tiền tiết kiệm"
                                    checked={editSelectedConditionType === 'moneySaved'}
                                    onChange={() => handleConditionTypeChange('moneySaved', editingBadge?.moneySavedRequired, true)}
                                />
                                <Form.Check
                                    type="radio"
                                    id="editCigarettesDropped"
                                    name="editConditionType"
                                    label="Số điếu không hút"
                                    checked={editSelectedConditionType === 'cigarettesDropped'}
                                    onChange={() => handleConditionTypeChange('cigarettesDropped', editingBadge?.cigarettesDroppedRequired, true)}
                                />
                                <Form.Check
                                    type="radio"
                                    id="editCheckinDays"
                                    name="editConditionType"
                                    label="Số ngày check-in"
                                    checked={editSelectedConditionType === 'checkinDays'}
                                    onChange={() => handleConditionTypeChange('checkinDays', editingBadge?.checkinDaysRequired, true)}
                                />
                            </div>
                        </Form.Group>

                        {editSelectedConditionType === 'smokeFreeDays' && (
                            <Form.Group controlId="formEditSmokeFreeDaysRequired">
                                <Form.Label>Số ngày không hút thuốc:</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={editingBadge?.smokeFreeDaysRequired || ''}
                                    onChange={e => handleConditionTypeChange('smokeFreeDays', e.target.value, true)}
                                    placeholder="VD: 7, 30, 90..."
                                />
                            </Form.Group>
                        )}

                        {editSelectedConditionType === 'moneySaved' && (
                            <Form.Group controlId="formEditMoneySavedRequired">
                                <Form.Label>Số tiền tiết kiệm (VNĐ):</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={editingBadge?.moneySavedRequired || ''}
                                    onChange={e => handleConditionTypeChange('moneySaved', e.target.value, true)}
                                    placeholder="VD: 100000, 500000..."
                                />
                            </Form.Group>
                        )}

                        {editSelectedConditionType === 'cigarettesDropped' && (
                            <Form.Group controlId="formEditCigarettesDroppedRequired">
                                <Form.Label>Số điếu không hút:</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={editingBadge?.cigarettesDroppedRequired || ''}
                                    onChange={e => handleConditionTypeChange('cigarettesDropped', e.target.value, true)}
                                    placeholder="VD: 20, 100, 500..."
                                />
                            </Form.Group>
                        )}

                        {editSelectedConditionType === 'checkinDays' && (
                            <Form.Group controlId="formEditCheckinDaysRequired">
                                <Form.Label>Số ngày check-in:</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={editingBadge?.checkinDaysRequired || ''}
                                    onChange={e => handleConditionTypeChange('checkinDays', e.target.value, true)}
                                    placeholder="VD: 7, 30, 100..."
                                />
                            </Form.Group>
                        )}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseEditModal}>
                        Hủy
                    </Button>
                    <Button variant="primary" onClick={handleSaveEdit}>
                        Lưu
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ManagementPerformance;