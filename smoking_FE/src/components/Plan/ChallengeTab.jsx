import React, { useState, useEffect, useCallback } from "react";
import { Table, Button, Modal, Form, Row, Col, Spinner, Pagination, InputGroup } from "react-bootstrap";
import { FaPlus, FaEdit, FaTrash, FaSync, FaSearch, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";

function ChallengeTab() {
    const [challenges, setChallenges] = useState([]);
    const [filteredChallenges, setFilteredChallenges] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 0,
        totalPages: 0
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [challengeModalShow, setChallengeModalShow] = useState(false);
    const [editChallenge, setEditChallenge] = useState(null);

    // State cho modal xác nhận xóa
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [challengeToDelete, setChallengeToDelete] = useState(null);

    const [formChallenge, setFormChallenge] = useState({
        title: "",
        description: "",
        notesSuggestion: "",
        stage: 1,
        stageTitle: ""
    });

    // Helper function to check API health
    const checkApiHealth = async () => {
        try {
            const response = await fetch('/api/admin/challenge-templates/all', {
                method: 'HEAD',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("userToken")}`
                }
            });
            console.log('API Health Check:', response.status, response.statusText);
            return response.status;
        } catch (error) {
            console.error('API Health Check Failed:', error);
            return 0;
        }
    };

    // Search function
    const performSearch = useCallback(() => {
        if (!searchTerm.trim()) {
            setFilteredChallenges(challenges);
        } else {
            const filtered = challenges.filter(challenge =>
                challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                challenge.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                challenge.stageTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                challenge.notesSuggestion?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredChallenges(filtered);
        }
    }, [challenges, searchTerm]);

    // Pagination helpers - now works with filtered data
    const getCurrentPageChallenges = () => {
        const dataToUse = searchTerm.trim() ? filteredChallenges : challenges;
        const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
        const endIndex = startIndex + pagination.itemsPerPage;
        return dataToUse.slice(startIndex, endIndex);
    };

    const updatePagination = useCallback(() => {
        const dataToUse = searchTerm.trim() ? filteredChallenges : challenges;
        setPagination(prev => ({
            ...prev,
            totalItems: dataToUse.length,
            totalPages: Math.ceil(dataToUse.length / prev.itemsPerPage)
        }));
    }, [challenges, filteredChallenges, searchTerm]);

    const handlePageChange = (pageNumber) => {
        setPagination(prev => ({
            ...prev,
            currentPage: pageNumber
        }));
    };

    const handleItemsPerPageChange = (newItemsPerPage) => {
        setPagination(prev => ({
            ...prev,
            itemsPerPage: newItemsPerPage,
            currentPage: 1,
            totalItems: challenges.length,
            totalPages: Math.ceil(challenges.length / newItemsPerPage)
        }));
    };

    // Update pagination when challenges change
    useEffect(() => {
        updatePagination();
    }, [updatePagination]);

    // Perform search when searchTerm or challenges change
    useEffect(() => {
        performSearch();
    }, [performSearch]);

    // Reset to first page when search results change
    useEffect(() => {
        if (searchTerm.trim()) {
            setPagination(prev => ({ ...prev, currentPage: 1 }));
        }
    }, [filteredChallenges, searchTerm]);

    // API Functions
    const fetchChallenges = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("userToken");

            console.log('Fetching challenges...');
            console.log('Token:', token ? 'Present' : 'Missing');

            const response = await fetch('/api/admin/challenge-templates/all', {
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Fetch response status:', response.status);

            if (response.ok) {
                const result = await response.json();
                console.log('Fetch response body:', result);

                if (result.success) {
                    setChallenges(result.data || []);
                    setFilteredChallenges(result.data || []);
                } else {
                    console.error('API returned success: false', result);
                    toast.error('Lỗi khi tải danh sách thử thách');
                }
            } else {
                console.error('HTTP Error:', response.status, response.statusText);
                toast.error('Không thể tải danh sách thử thách');
            }
        } catch (error) {
            console.error('Error fetching challenges:', error);
            toast.error('Có lỗi xảy ra khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const createChallenge = async (challengeData) => {
        try {
            const token = localStorage.getItem("userToken");

            // Convert to PascalCase for backend compatibility
            const backendData = {
                Title: challengeData.title,
                Description: challengeData.description,
                NotesSuggestion: challengeData.notesSuggestion,
                Stage: challengeData.stage,
                StageTitle: challengeData.stageTitle
            };

            console.log('Creating challenge with data:', backendData);
            console.log('Token:', token ? 'Present' : 'Missing');

            const response = await fetch('/api/admin/challenge-templates/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(backendData)
            });

            console.log('Response status:', response.status);

            // Handle non-JSON responses
            let result;
            try {
                result = await response.json();
            } catch (parseError) {
                console.error('Failed to parse JSON response:', parseError);
                const textResponse = await response.text();
                console.error('Response text:', textResponse);
                toast.error('Server returned invalid response');
                return false;
            }

            console.log('Response body:', result);

            if (response.ok && result.success) {
                toast.success(result.message || 'Thêm thử thách mới thành công!');
                await fetchChallenges(); // Reload data
                return true;
            } else {
                console.error('API Error:', result);
                toast.error(result.message || 'Lỗi khi tạo thử thách');
                return false;
            }
        } catch (error) {
            console.error('Error creating challenge:', error);
            toast.error('Có lỗi xảy ra khi tạo thử thách');
            return false;
        }
    };

    const updateChallenge = async (id, challengeData) => {
        try {
            const token = localStorage.getItem("userToken");

            // Convert to PascalCase for backend compatibility
            const backendData = {
                Title: challengeData.title,
                Description: challengeData.description,
                NotesSuggestion: challengeData.notesSuggestion,
                Stage: challengeData.stage,
                StageTitle: challengeData.stageTitle
            };

            console.log('Updating challenge with data:', backendData);

            const response = await fetch(`/api/admin/challenge-templates/update/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(backendData)
            });

            const result = await response.json();
            console.log('Update response:', result);

            if (response.ok && result.success) {
                toast.success(result.message || 'Cập nhật thử thách thành công!');
                await fetchChallenges(); // Reload data
                return true;
            } else {
                console.error('Update API Error:', result);
                toast.error(result.message || 'Lỗi khi cập nhật thử thách');
                return false;
            }
        } catch (error) {
            console.error('Error updating challenge:', error);
            toast.error('Có lỗi xảy ra khi cập nhật thử thách');
            return false;
        }
    };

    const deleteChallenge = async (id) => {
        try {
            const token = localStorage.getItem("userToken");
            const response = await fetch(`/api/admin/challenge-templates/delete/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (response.ok && result.success) {
                toast.success(result.message || 'Xóa thử thách thành công!');
                await fetchChallenges(); // Reload data
                return true;
            } else {
                toast.error(result.message || 'Lỗi khi xóa thử thách');
                return false;
            }
        } catch (error) {
            console.error('Error deleting challenge:', error);
            toast.error('Có lỗi xảy ra khi xóa thử thách');
            return false;
        }
    };

    useEffect(() => {
        // Check API health first, then fetch data
        const initializeData = async () => {
            await checkApiHealth();
            await fetchChallenges();
        };

        initializeData();
    }, []);

    const openAddChallengeModal = () => {
        setEditChallenge(null);
        setFormChallenge({
            title: "",
            description: "",
            notesSuggestion: "",
            stage: 1,
            stageTitle: ""
        });
        setChallengeModalShow(true);
    };

    const openEditChallengeModal = (challenge) => {
        setEditChallenge(challenge.challengeTemplateID);
        setFormChallenge({
            title: challenge.title,
            description: challenge.description,
            notesSuggestion: challenge.notesSuggestion || "",
            stage: challenge.stage,
            stageTitle: challenge.stageTitle || ""
        });
        setChallengeModalShow(true);
    };

    const handleDeleteChallenge = (id) => {
        setChallengeToDelete(id);
        setShowDeleteModal(true);
    };

    // Xác nhận xóa thử thách
    const confirmDeleteChallenge = async () => {
        if (!challengeToDelete) return;

        const success = await deleteChallenge(challengeToDelete);
        setShowDeleteModal(false);
        setChallengeToDelete(null);
    };

    const handleChallengeModalSave = async () => {
        // Validation
        if (!formChallenge.title.trim() || !formChallenge.description.trim()) {
            toast.error('Vui lòng nhập đầy đủ tên và mô tả thử thách');
            return;
        }

        setSaving(true);
        let success = false;

        if (editChallenge) {
            success = await updateChallenge(editChallenge, formChallenge);
        } else {
            success = await createChallenge(formChallenge);
        }

        setSaving(false);

        if (success) {
            setChallengeModalShow(false);
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Danh sách mẫu thử thách</h5>
                <div className="d-flex align-items-center gap-3">
                    {/* Search Bar */}
                    <div className="d-flex align-items-center">
                        <InputGroup style={{ width: '300px' }}>
                            <Form.Control
                                type="text"
                                placeholder="Tìm kiếm thử thách..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                size="sm"
                            />
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => setSearchTerm('')}
                                disabled={!searchTerm.trim()}
                                title="Xóa tìm kiếm"
                            >
                                {searchTerm.trim() ? <FaTimes /> : <FaSearch />}
                            </Button>
                        </InputGroup>
                    </div>

                    <div className="d-flex align-items-center">
                        <small className="text-muted me-2">Hiển thị:</small>
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
                    <div className="d-flex gap-2">
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={fetchChallenges}
                            disabled={loading}
                            title="Làm mới dữ liệu"
                        >
                            <FaSync className={loading ? 'fa-spin' : ''} />
                        </Button>
                        <Button variant="outline-primary" className="rounded-pill px-4" onClick={openAddChallengeModal}>
                            Thêm <FaPlus />
                        </Button>
                    </div>
                </div>
            </div>
            {/* Summary info */}
            {!loading && (
                <div className="mb-3">
                    <small className="text-muted">
                        {searchTerm.trim() ? (
                            <span>
                                Tìm thấy <strong>{filteredChallenges.length}</strong> kết quả cho "{searchTerm}"
                                trong tổng số <strong>{challenges.length}</strong> mẫu thử thách
                            </span>
                        ) : (
                            <span>Tổng cộng: <strong>{challenges.length}</strong> mẫu thử thách</span>
                        )}
                    </small>
                </div>
            )}

            <Table bordered hover>
                <thead>
                    <tr className="text-center">
                        <th>Tên thử thách</th>
                        <th>Mô tả</th>
                        <th>Giai đoạn</th>
                        <th>Tiêu đề giai đoạn</th>
                        <th>Ghi chú gợi ý</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={6} className="text-center py-4">
                                <Spinner animation="border" variant="primary" />
                                <div className="mt-2">Đang tải dữ liệu...</div>
                            </td>
                        </tr>
                    ) : challenges.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="text-center text-muted py-4">
                                Chưa có mẫu thử thách nào
                            </td>
                        </tr>
                    ) : searchTerm.trim() && filteredChallenges.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="text-center text-muted py-4">
                                <div>
                                    <p className="mb-1">Không tìm thấy kết quả nào cho "{searchTerm}"</p>
                                    <Button
                                        variant="link"
                                        size="sm"
                                        onClick={() => setSearchTerm('')}
                                        className="text-decoration-none"
                                    >
                                        Xóa tìm kiếm
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ) : getCurrentPageChallenges().length === 0 ? (
                        <tr>
                            <td colSpan={6} className="text-center text-muted py-4">
                                Không có dữ liệu để hiển thị ở trang này
                            </td>
                        </tr>
                    ) : getCurrentPageChallenges().map((c, index) => (
                        <tr key={c.challengeTemplateID} className="align-middle">
                            <td className="fw-bold">{c.title}</td>
                            <td>
                                <div
                                    style={{ maxWidth: '250px' }}
                                    title={c.description}
                                >
                                    {c.description.length > 100
                                        ? `${c.description.substring(0, 100)}...`
                                        : c.description
                                    }
                                </div>
                            </td>
                            <td className="text-center">
                                <span className="badge bg-primary">Giai đoạn {c.stage}</span>
                            </td>
                            <td className="text-center">{c.stageTitle || '-'}</td>
                            <td>
                                <div
                                    style={{ maxWidth: '200px' }}
                                    title={c.notesSuggestion}
                                >
                                    {c.notesSuggestion
                                        ? (c.notesSuggestion.length > 80
                                            ? `${c.notesSuggestion.substring(0, 80)}...`
                                            : c.notesSuggestion)
                                        : '-'
                                    }
                                </div>
                            </td>
                            <td className="text-center">
                                <div className="d-flex justify-content-center gap-1">
                                    <Button
                                        variant="link"
                                        size="sm"
                                        onClick={() => openEditChallengeModal(c)}
                                        className="text-warning p-1"
                                        title="Chỉnh sửa"
                                    >
                                        <FaEdit />
                                    </Button>
                                    <Button
                                        variant="link"
                                        size="sm"
                                        onClick={() => handleDeleteChallenge(c.challengeTemplateID)}
                                        className="text-danger p-1"
                                        title="Xóa"
                                    >
                                        <FaTrash />
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Pagination */}
            {(searchTerm.trim() ? filteredChallenges : challenges).length > 0 && pagination.totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                    <small className="text-muted">
                        {searchTerm.trim() && (
                            <span className="me-2">
                                <strong>Tìm kiếm:</strong> "{searchTerm}" •
                            </span>
                        )}
                        Hiển thị {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} - {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} trong tổng số {pagination.totalItems} {searchTerm.trim() ? 'kết quả' : 'mẫu thử thách'}
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

            {/* Modal thêm/sửa Challenge */}
            <Modal show={challengeModalShow} onHide={() => setChallengeModalShow(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {editChallenge ? "Sửa mẫu thử thách" : "Thêm mẫu thử thách mới"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Row>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Tên thử thách <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        value={formChallenge.title}
                                        onChange={e => setFormChallenge({ ...formChallenge, title: e.target.value })}
                                        placeholder="Nhập tên thử thách..."
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Giai đoạn</Form.Label>
                                    <Form.Select
                                        value={formChallenge.stage}
                                        onChange={e => setFormChallenge({ ...formChallenge, stage: parseInt(e.target.value) })}
                                    >
                                        <option value={1}>Giai đoạn 1</option>
                                        <option value={2}>Giai đoạn 2</option>
                                        <option value={3}>Giai đoạn 3</option>
                                        <option value={4}>Giai đoạn 4</option>
                                        <option value={5}>Giai đoạn 5</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Tiêu đề giai đoạn</Form.Label>
                                    <Form.Control
                                        value={formChallenge.stageTitle}
                                        onChange={e => setFormChallenge({ ...formChallenge, stageTitle: e.target.value })}
                                        placeholder="VD: Chuẩn bị, Thực hiện..."
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Mô tả <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={formChallenge.description}
                                onChange={e => setFormChallenge({ ...formChallenge, description: e.target.value })}
                                placeholder="Mô tả chi tiết về thử thách..."
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Ghi chú gợi ý</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                value={formChallenge.notesSuggestion}
                                onChange={e => setFormChallenge({ ...formChallenge, notesSuggestion: e.target.value })}
                                placeholder="Các ghi chú, mẹo hoặc gợi ý để hoàn thành thử thách..."
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setChallengeModalShow(false)} disabled={saving}>
                        Hủy
                    </Button>
                    <Button variant="primary" onClick={handleChallengeModalSave} disabled={saving}>
                        {saving ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                {editChallenge ? 'Đang cập nhật...' : 'Đang tạo...'}
                            </>
                        ) : (
                            editChallenge ? 'Cập nhật' : 'Tạo mới'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal xác nhận xóa */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận xóa thử thách</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Bạn có chắc chắn muốn xóa thử thách này? Hành động này không thể hoàn tác.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Hủy
                    </Button>
                    <Button variant="danger" onClick={confirmDeleteChallenge}>
                        Xóa
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default ChallengeTab;