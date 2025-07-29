import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Button, Modal, Form, Pagination, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
// Số dòng hiển thị mỗi trang (có thể điều chỉnh thành 20)
const pageSize = 20;

const ManagementPackage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [view, setView] = useState('packages'); // 'packages', 'userMemberships', 'transactions'

    // State cho các gói
    const [packages, setPackages] = useState([]);
    const [pkgPage, setPkgPage] = useState(1);

    // State cho danh sách thành viên sử dụng gói
    const [userMemberships, setUserMemberships] = useState([]);
    const [membershipPage, setMembershipPage] = useState(1);
    // State filter ngày cho thành viên premium
    const [membershipDateFrom, setMembershipDateFrom] = useState('');
    const [membershipDateTo, setMembershipDateTo] = useState('');

    // State cho giao dịch
    const [transactions, setTransactions] = useState([]);
    const [txnPage, setTxnPage] = useState(1);
    // State cho filter trạng thái giao dịch
    const [txnStatusFilter, setTxnStatusFilter] = useState('');
    // State cho filter ngày giao dịch
    const [txnDateFrom, setTxnDateFrom] = useState('');
    const [txnDateTo, setTxnDateTo] = useState('');
    // State cho modal chi tiết giao dịch
    const [showTxnDetail, setShowTxnDetail] = useState(false);
    const [txnDetail, setTxnDetail] = useState([]);
    const [txnDetailLoading, setTxnDetailLoading] = useState(false);
    const [txnDetailUser, setTxnDetailUser] = useState(null);

    // State cho Modal gói (chưa dùng chỉnh sửa)
    const [showModal, setShowModal] = useState(false);
    const [currentPkg, setCurrentPkg] = useState({
        packageID: null, packageName: '', packageType: '', price: '', duration: '', description: ''
    });

    // Modal "Cấp gói"
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [assignment, setAssignment] = useState({ userId: '', packageId: '' });

    // State cho modal xác nhận xóa
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [pkgIdToDelete, setPkgIdToDelete] = useState(null);

    // Tải dữ liệu khi view thay đổi
    useEffect(() => {
        const token = localStorage.getItem('userToken');
        if (!token) {
            toast.error("Vui lòng đăng nhập.");
            setIsLoading(false);
            return;
        }

        const fetchDataForView = async () => {
            setIsLoading(true);
            try {
                // Luôn tải danh sách các gói cho modal
                const packagesResponse = await fetch('/api/admin/memberships/packages', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!packagesResponse.ok) throw new Error('Không tải được danh sách gói.');
                const packagesData = await packagesResponse.json();
                setPackages(packagesData);

                if (view === 'userMemberships') {
                    const usersResponse = await fetch('/api/admin/memberships/users', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (!usersResponse.ok) throw new Error('Không tải được danh sách thành viên.');
                    const usersData = await usersResponse.json();
                    setUserMemberships(usersData);
                }

                if (view === 'transactions') {
                    // Lấy danh sách giao dịch thanh toán
                    const txnResponse = await fetch('/api/admin/payments/all', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (!txnResponse.ok) throw new Error('Không tải được danh sách giao dịch.');
                    const txnData = await txnResponse.json();
                    // Chuẩn hóa dữ liệu cho bảng
                    setTransactions(Array.isArray(txnData) ? txnData : []);
                }
            } catch (error) {
                toast.error(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDataForView();
    }, [view]);

    // Phân trang
    const paginate = (data, page) => {
        const start = (page - 1) * pageSize;
        return data.slice(start, start + pageSize);
    };

    // Tổng số trang
    const totalPkgPages = Math.ceil(packages.length / pageSize);
    const totalMembershipPages = Math.ceil(userMemberships.length / pageSize);
    const totalTxnPages = Math.ceil(transactions.length / pageSize);

    // Modal "Cấp gói"
    const handleCloseAssignModal = () => {
        setShowAssignModal(false);
        setAssignment({ userId: '', packageId: '' });
    };
    const handleShowAssignModal = () => setShowAssignModal(true);

    const handleAssignmentChange = e => {
        const { name, value } = e.target;
        setAssignment(prev => ({ ...prev, [name]: value }));
    };

    // Xử lý API: Cấp gói cho user
    const handleAssignSubmit = async (e) => {
        e.preventDefault();
        if (!assignment.userId || !assignment.packageId) {
            toast.warn("Vui lòng nhập ID người dùng và chọn một gói.");
            return;
        }
        const token = localStorage.getItem('userToken');
        try {
            const response = await fetch('/api/admin/memberships/assign', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: parseInt(assignment.userId),
                    packageId: parseInt(assignment.packageId)
                })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Cấp gói thất bại.');
            }
            const result = await response.json();
            toast.success(result.message || "Cấp gói thành công!");
            handleCloseAssignModal();
            if (view === 'userMemberships') {
                // Reload lại danh sách thành viên
                const usersResponse = await fetch('/api/admin/memberships/users', { headers: { 'Authorization': `Bearer ${token}` } });
                const usersData = await usersResponse.json();
                setUserMemberships(usersData);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Xử lý API: Xóa gói
    const handleDeletePkg = async (pkgId) => {
        setPkgIdToDelete(pkgId);
        setShowDeleteModal(true);
    };

    // Hàm xác nhận xóa thật sự
    const confirmDeletePkg = async () => {
        const pkgId = pkgIdToDelete;
        setShowDeleteModal(false);
        setPkgIdToDelete(null);
        const token = localStorage.getItem('userToken');
        toast.info(`Đang xóa gói ID: ${pkgId}...`);
        try {
            const response = await fetch(`/api/admin/memberships/packages/${pkgId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.status === 404) {
                toast.error('Không tìm thấy gói.');
                return;
            }
            if (response.status === 400) {
                const data = await response.json();
                toast.error(data.message || 'Không thể xoá vì có người dùng đang sử dụng gói này.');
                return;
            }
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Xóa gói thất bại.');
            }
            const data = await response.json();
            toast.success(data.message || "Xóa gói thành công!");
            setPackages(prev => prev.filter(p => p.packageId !== pkgId && p.packageID !== pkgId));
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Hàm mở modal chỉnh sửa gói (chưa xử lý API)
    const handleEditPkg = (pkg) => {
        setCurrentPkg(pkg);
        setShowModal(true);
    };

    if (isLoading) {
        const loadingText = view === 'packages'
            ? "Đang tải danh sách gói..."
            : "Đang tải danh sách thành viên...";
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                <Spinner animation="border" variant="success" />
                <h4 className="ms-3">{loadingText}</h4>
            </Container>
        );
    }

    return (
        <Container fluid className="mt-4">
            <h2 className="text-center text-success"> Quản lý gói thành viên  </h2>
            {/* Nút chuyển giữa các bảng */}
            <Row className="mb-4">
                <Col className="d-flex justify-content-start gap-3">
                    <Button
                        variant={view === 'packages' ? 'primary' : 'outline-primary'}
                        onClick={() => setView('packages')}
                    >
                        Các gói thành viên
                    </Button>
                    <Button
                        variant={view === 'userMemberships' ? 'primary' : 'outline-primary'}
                        onClick={() => setView('userMemberships')}
                    >
                        Thành viên PREMIUM
                    </Button>
                    <Button
                        variant={view === 'transactions' ? 'primary' : 'outline-primary'}
                        onClick={() => setView('transactions')}
                    >
                        Các giao dịch thanh toán
                    </Button>
                </Col>
            </Row>

            {/* Bảng gói thành viên */}
            {view === 'packages' && (
                <>
                    <Row className="align-items-center mb-3">
                        <Col><h2>Các gói thành viên</h2></Col>
                        <Col className="text-end">
                            <Button variant="outline-primary" className="rounded-pill px-4" onClick={handleShowAssignModal}>
                                + Thêm gói
                            </Button>
                        </Col>
                    </Row>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tên gói</th>
                                <th>Thời hạn (tháng)</th>
                                <th>Giá (VND)</th>
                                <th>Số lượt mua</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginate(packages, pkgPage).map(pkg => (
                                <tr key={pkg.packageId || pkg.packageID}>
                                    <td>{pkg.packageId || pkg.packageID}</td>
                                    <td>{pkg.packageName}</td>
                                    <td>{pkg.duration}</td>
                                    <td>{pkg.price?.toLocaleString?.('vi-VN') || pkg.price}</td>
                                    <td>{pkg.purchasedCount ?? 0}</td>
                                    <td>
                                        <Button variant="warning" size="sm" className="me-2" onClick={() => handleEditPkg(pkg)}>Sửa</Button>
                                        <Button variant="danger" size="sm" onClick={() => handleDeletePkg(pkg.packageId || pkg.packageID)}>Xóa</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    <Pagination>
                        {Array.from({ length: totalPkgPages }, (_, i) => (
                            <Pagination.Item
                                key={i + 1}
                                active={pkgPage === i + 1}
                                onClick={() => setPkgPage(i + 1)}
                            >{i + 1}</Pagination.Item>
                        ))}
                    </Pagination>
                </>
            )}

            {/* Bảng thành viên */}
            {view === 'userMemberships' && (
                <>
                    <h2 className="mt-4">Thành viên đang sử dụng gói</h2>
                    <div className="mb-3 d-flex align-items-center gap-3 flex-wrap">
                        <span>Lọc theo ngày bắt đầu:</span>
                        <span>Từ ngày:</span>
                        <input type="date" className="form-control w-auto" value={membershipDateFrom} onChange={e => { setMembershipDateFrom(e.target.value); setMembershipPage(1); }} />
                        <span>Đến ngày:</span>
                        <input type="date" className="form-control w-auto" value={membershipDateTo} onChange={e => { setMembershipDateTo(e.target.value); setMembershipPage(1); }} />
                    </div>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>ID Đăng ký</th>
                                <th>Tên người dùng</th>
                                <th>Email</th>
                                <th>Tên gói</th>
                                <th>Ngày bắt đầu</th>
                                <th>Ngày kết thúc</th>
                                <th>Trạng thái TT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginate(
                                (membershipDateFrom || membershipDateTo
                                    ? userMemberships.filter(item => {
                                        let ok = true;
                                        if (membershipDateFrom) {
                                            const start = item.startDate ? new Date(item.startDate) : null;
                                            const from = new Date(membershipDateFrom);
                                            if (!start || start < from) ok = false;
                                        }
                                        if (membershipDateTo) {
                                            const start = item.startDate ? new Date(item.startDate) : null;
                                            const to = new Date(membershipDateTo);
                                            to.setHours(23, 59, 59, 999);
                                            if (!start || start > to) ok = false;
                                        }
                                        return ok;
                                    }) : userMemberships)
                                    .slice()
                                    .sort((a, b) => {
                                        const dateA = a.startDate ? new Date(a.startDate) : new Date(0);
                                        const dateB = b.startDate ? new Date(b.startDate) : new Date(0);
                                        return dateB - dateA;
                                    }),
                                membershipPage
                            ).map(item => (
                                <tr key={item.userMembershipID || item.userMembershipId}>
                                    <td>{item.userMembershipID || item.userMembershipId}</td>
                                    <td>{item.fullName}</td>
                                    <td>{item.email}</td>
                                    <td>{item.packageName}</td>
                                    <td>{item.startDate ? new Date(item.startDate).toLocaleDateString('vi-VN') : ''}</td>
                                    <td>{item.endDate ? new Date(item.endDate).toLocaleDateString('vi-VN') : ''}</td>
                                    <td>
                                        <span className={`badge bg-${item.paymentStatus === 'Completed' ? 'success' : 'warning'}`}>
                                            {item.paymentStatus}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    <Pagination>
                        {Array.from({
                            length: Math.ceil(((membershipDateFrom || membershipDateTo)
                                ? userMemberships.filter(item => {
                                    let ok = true;
                                    if (membershipDateFrom) {
                                        const start = item.startDate ? new Date(item.startDate) : null;
                                        const from = new Date(membershipDateFrom);
                                        if (!start || start < from) ok = false;
                                    }
                                    if (membershipDateTo) {
                                        const start = item.startDate ? new Date(item.startDate) : null;
                                        const to = new Date(membershipDateTo);
                                        to.setHours(23, 59, 59, 999);
                                        if (!start || start > to) ok = false;
                                    }
                                    return ok;
                                }).length : userMemberships.length) / pageSize)
                        }, (_, i) => (
                            <Pagination.Item
                                key={i + 1}
                                active={membershipPage === i + 1}
                                onClick={() => setMembershipPage(i + 1)}
                            >{i + 1}</Pagination.Item>
                        ))}
                    </Pagination>
                </>
            )}

            {/* Bảng giao dịch */}
            {view === 'transactions' && (
                <>
                    <h2 className="mt-5">Các giao dịch thanh toán</h2>
                    <div className="mb-3 d-flex align-items-center gap-3 flex-wrap">
                        <span>Lọc theo trạng thái:</span>
                        <select className="form-select w-auto" value={txnStatusFilter} onChange={e => { setTxnStatusFilter(e.target.value); setTxnPage(1); }}>
                            <option value="">Tất cả</option>
                            <option value="Success">Thành công</option>
                            <option value="Pending">Chờ xử lý</option>
                            <option value="Failed">Thất bại</option>
                        </select>
                        <span className="ms-3">Từ ngày:</span>
                        <input type="date" className="form-control w-auto" value={txnDateFrom} onChange={e => { setTxnDateFrom(e.target.value); setTxnPage(1); }} />
                        <span>Đến ngày:</span>
                        <input type="date" className="form-control w-auto" value={txnDateTo} onChange={e => { setTxnDateTo(e.target.value); setTxnPage(1); }} />
                    </div>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Người dùng</th>
                                <th>Email</th>
                                <th>Gói đã mua</th>
                                <th>Số tiền</th>
                                <th>Phương thức</th>
                                <th>Thời gian thanh toán</th>
                                <th>Ngày hết hạn</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginate(
                                ((txnStatusFilter || txnDateFrom || txnDateTo)
                                    ? transactions.filter(txn => {
                                        let ok = true;
                                        if (txnStatusFilter) ok = ok && (txn.status || '').toLowerCase() === txnStatusFilter.toLowerCase();
                                        if (txnDateFrom) {
                                            const created = txn.createdAt ? new Date(txn.createdAt) : null;
                                            const from = new Date(txnDateFrom);
                                            if (!created || created < from) ok = false;
                                        }
                                        if (txnDateTo) {
                                            const created = txn.createdAt ? new Date(txn.createdAt) : null;
                                            const to = new Date(txnDateTo);
                                            to.setHours(23, 59, 59, 999);
                                            if (!created || created > to) ok = false;
                                        }
                                        return ok;
                                    })
                                    : transactions)
                                    .slice() // clone array
                                    .sort((a, b) => {
                                        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
                                        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
                                        return dateB - dateA; // mới nhất lên đầu
                                    }),
                                txnPage
                            ).map((txn, idx) => (
                                <tr key={txn.paymentId || idx}>
                                    <td>{(txnPage - 1) * pageSize + idx + 1}</td>
                                    <td>{txn.userName}</td>
                                    <td>{txn.email}</td>
                                    <td>{txn.packageName}</td>
                                    <td>{txn.amount?.toLocaleString?.('vi-VN') || txn.amount}</td>
                                    <td>{txn.method}</td>
                                    <td>{txn.createdAt ? new Date(txn.createdAt).toLocaleString('vi-VN') : ''}</td>
                                    <td>{txn.endDate ? new Date(txn.endDate).toLocaleString('vi-VN') : ''}</td>
                                    <td>
                                        <span className={`badge bg-${txn.status === 'Success' ? 'success' : 'warning'}`}>{txn.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    <Pagination>
                        {Array.from({
                            length: Math.ceil(((txnStatusFilter || txnDateFrom || txnDateTo)
                                ? transactions.filter(txn => {
                                    let ok = true;
                                    if (txnStatusFilter) ok = ok && (txn.status || '').toLowerCase() === txnStatusFilter.toLowerCase();
                                    if (txnDateFrom) {
                                        const created = txn.createdAt ? new Date(txn.createdAt) : null;
                                        const from = new Date(txnDateFrom);
                                        if (!created || created < from) ok = false;
                                    }
                                    if (txnDateTo) {
                                        const created = txn.createdAt ? new Date(txn.createdAt) : null;
                                        const to = new Date(txnDateTo);
                                        to.setHours(23, 59, 59, 999);
                                        if (!created || created > to) ok = false;
                                    }
                                    return ok;
                                }).length : transactions.length) / pageSize)
                        }, (_, i) => (
                            <Pagination.Item
                                key={i + 1}
                                active={txnPage === i + 1}
                                onClick={() => setTxnPage(i + 1)}
                            >{i + 1}</Pagination.Item>
                        ))}
                    </Pagination>
                </>
            )}

            {/* Modal chi tiết giao dịch */}
            <Modal show={showTxnDetail} onHide={() => setShowTxnDetail(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Chi tiết giao dịch của {txnDetailUser}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {txnDetailLoading ? (
                        <div className="d-flex align-items-center gap-2"><Spinner animation="border" size="sm" /> Đang tải...</div>
                    ) : txnDetail.length === 0 ? (
                        <div>Không có giao dịch nào.</div>
                    ) : (
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Gói đã mua</th>
                                    <th>Số tiền</th>
                                    <th>Phương thức</th>
                                    <th>Thời gian thanh toán</th>
                                    <th>Ngày hết hạn</th>
                                    <th>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {txnDetail.map((item, idx) => (
                                    <tr key={item.paymentId || idx}>
                                        <td>{idx + 1}</td>
                                        <td>{item.packageName}</td>
                                        <td>{item.amount?.toLocaleString?.('vi-VN') || item.amount}</td>
                                        <td>{item.method}</td>
                                        <td>{item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : ''}</td>
                                        <td>{item.endDate ? new Date(item.endDate).toLocaleString('vi-VN') : ''}</td>
                                        <td><span className={`badge bg-${item.status === 'Success' ? 'success' : 'warning'}`}>{item.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowTxnDetail(false)}>Đóng</Button>
                </Modal.Footer>
            </Modal>

            {/* Modal "Cấp gói" */}
            <Modal show={showAssignModal} onHide={handleCloseAssignModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Cấp gói thành viên cho người dùng</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleAssignSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>ID Người dùng (UserID)</Form.Label>
                            <Form.Control
                                type="number"
                                name="userId"
                                value={assignment.userId}
                                onChange={handleAssignmentChange}
                                placeholder="Nhập ID của người dùng cần cấp gói"
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Chọn gói thành viên</Form.Label>
                            <Form.Select
                                name="packageId"
                                value={assignment.packageId}
                                onChange={handleAssignmentChange}
                                required
                            >
                                <option value="">-- Vui lòng chọn một gói --</option>
                                {packages.map(pkg => (
                                    <option key={pkg.packageId || pkg.packageID} value={pkg.packageId || pkg.packageID}>
                                        {pkg.packageName} ({pkg.price?.toLocaleString?.('vi-VN') || pkg.price} VND)
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseAssignModal}>Hủy</Button>
                        <Button variant="primary" type="submit">Xác nhận cấp gói</Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Modal xác nhận xóa gói */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận xóa gói</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Bạn có chắc chắn muốn xóa gói có ID: <b>{pkgIdToDelete}</b>?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Hủy</Button>
                    <Button variant="danger" onClick={confirmDeletePkg}>Xóa</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default ManagementPackage;