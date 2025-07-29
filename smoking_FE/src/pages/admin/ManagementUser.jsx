import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Row,
    Col,
    Card,
    InputGroup,
    FormControl,
    Dropdown,
    Button,
    Table,
    Modal,
    Form,
    Pagination
} from 'react-bootstrap';
import { FaSearch, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
// Giúp chuyển đổi giữa tên Role (ví dụ: 'Admin') và Role ID (ví dụ: '1')
const roleNameToIdMap = {
    'Admin': '1',
    'Member': '2',
    'Coach': '3'
};
const roleIdToNameMap = {
    '1': 'Admin',
    '2': 'Member',
    '3': 'Coach'
};

const ManagementUser = () => {
    // state
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('Tất cả vai trò');
    const [showModal, setShowModal] = useState(false);

    // State phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // *** CẢI TIẾN 1: Cập nhật state cho người dùng mới để bao gồm tất cả các trường trong form ***
    const [newUser, setNewUser] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        password: "",
        registrationDate: '',
        status: '',
        roleID: '',


        confirm: '' // Thêm trường confirm password
    });

    const [showEditModal, setShowEditModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [selectedRoleId, setSelectedRoleId] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');

    // State cho modal xác nhận xóa
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    // Hàm lấy danh sách người dùng, được tách ra để tái sử dụng
    const fetchUsers = async () => {
        try {
            const res = await axios.get('/api/Admin/ListUsers', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('userToken')}`,
                },
            });

            const usersWithRoles = res.data.map(user => ({
                ...user,
                // Giả sử API trả về user.role là ID, chúng ta chuyển nó thành tên
                roleName: roleIdToNameMap[user.role] || user.role
            }));

            // Sắp xếp users theo userID giảm dần để user mới nhất lên đầu
            const sortedUsers = usersWithRoles.sort((a, b) => b.userID - a.userID);

            setUsers(sortedUsers);
        } catch (err) {
            console.error('Lỗi khi lấy danh sách người dùng:', err);
            toast.error('Không thể tải danh sách người dùng. Vui lòng thử lại.');
        }
    };

    // 1) Lấy danh sách users khi component được mount
    useEffect(() => {
        fetchUsers();
    }, []);

    // --- BẮT ĐẦU: LOGIC LỌC DỮ LIỆU ĐỂ TÌM KIẾM ---
    const filteredUsers = useMemo(() => {
        const lowercasedSearchTerm = searchTerm.toLowerCase().trim();

        return users.filter((user) => {
            // -- Điều kiện lọc theo Vai trò (Role) --
            // Match nếu người dùng chọn "Tất cả vai trò" HOẶC role của user khớp với role được chọn
            const roleMatch = filterRole === 'Tất cả vai trò' || user.roleName === filterRole;

            // Nếu vai trò không khớp, bỏ qua ngay, không cần kiểm tra tìm kiếm
            if (!roleMatch) {
                return false;
            }

            // -- Điều kiện lọc theo Ô tìm kiếm (Search Term) --
            // Nếu không có từ khóa tìm kiếm, coi như khớp
            if (!lowercasedSearchTerm) {
                return true;
            }

            // Kiểm tra khớp trên các trường ID, Tên, Gói
            const idMatch = user.userID.toString().includes(lowercasedSearchTerm);
            const nameMatch = user.fullName.toLowerCase().includes(lowercasedSearchTerm);
            const packageMatch = user.package && user.package.toLowerCase().includes(lowercasedSearchTerm);
            const roleNameMatch = user.roleName.toLowerCase().includes(lowercasedSearchTerm);

            // Chỉ trả về true nếu cả điều kiện role và điều kiện search đều khớp
            return idMatch || nameMatch || packageMatch || roleNameMatch;
        });
    }, [searchTerm, users, filterRole]);

    // Logic phân trang
    const totalUsers = filteredUsers.length;
    const totalPages = Math.ceil(totalUsers / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentPageUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

    // Helper functions cho phân trang
    const handlePageChange = useCallback((pageNumber) => {
        setCurrentPage(pageNumber);
    }, []);

    const handleItemsPerPageChange = useCallback((newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1); // Reset về trang đầu tiên
    }, []);

    // Cập nhật currentPage khi search/filter thay đổi
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterRole]);

    // *** CẢI TIẾN 2: Hoàn thiện hàm handleAddUser ***
    const handleAddUser = async () => {
        // a) Validation cơ bản
        if (!newUser.fullName || !newUser.email || !newUser.roleID || !newUser.password || !newUser.phoneNumber) {
            toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc.');
            return;
        }

        // Validation email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newUser.email)) {
            toast.error('Vui lòng nhập email đúng định dạng (ví dụ: example@domain.com)');
            return;
        }

        if (newUser.password !== newUser.confirm) {
            toast.error('Mật khẩu và xác nhận mật khẩu không khớp.');
            return;
        }

        // b) Chuẩn bị payload để gửi lên API (loại bỏ trường 'confirm')
        const payload = {
            fullName: newUser.fullName, // Đảm bảo key khớp với API (ví dụ: fullName thay vì username)
            email: newUser.email,// Đảm bảo key và value khớp với API (ví dụ: 'Member' hoặc roleId)
            phoneNumber: newUser.phoneNumber,
            password: newUser.password,
            status: newUser.status,
            roleID: newUser.roleID

        };



        try {
            // c) Thêm Authorization Header vào request
            await axios.post('/api/Admin/AddUser', payload, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('userToken')}`,
                }
            });

            // d) Đóng modal và reset form
            setShowModal(false);
            setNewUser({
                fullName: '',
                email: '',
                phoneNumber: '',
                password: '',
                registrationDate: '',
                status: '',
                roleID: '',
                confirm: ''
            });

            // e) Lấy lại danh sách người dùng mới nhất từ server
            await fetchUsers();
            toast.success('Thêm người dùng thành công!');

        } catch (err) {
            // f) Xử lý lỗi và thông báo cho người dùng
            console.error('Add user failed:', err);
            const errorMessage = err.response?.data?.message || 'Thêm người dùng thất bại. Vui lòng thử lại.';
            toast.error(errorMessage);
        }
    };

    // Modal chỉnh sửa
    const handleEdit = (user) => {
        setEditingUser(user); // Lưu thông tin người dùng đang được chỉnh sửa
        // Chuyển đổi tên vai trò hiện tại (ví dụ: "Admin") thành ID (ví dụ: "1") để hiển thị đúng trong dropdown
        const currentRoleId = roleNameToIdMap[user.roleName];
        setSelectedRoleId(currentRoleId);
        setSelectedStatus(user.status);
        setShowEditModal(true); // Mở modal chỉnh sửa
    };

    const handleSaveEdit = async () => {
        if (!editingUser) {
            toast.error('Không có thông tin người dùng để cập nhật.');
            return;
        }

        const originalRoleId = roleNameToIdMap[editingUser.roleName];
        const originalStatus = editingUser.status;

        // Tạo một mảng chứa các promise của các API call cần thực hiện
        const updatePromises = [];

        // 1. Kiểm tra nếu Role đã thay đổi thì thêm promise cập nhật Role
        if (selectedRoleId && selectedRoleId !== originalRoleId) {
            const updateRolePromise = axios.put(
                '/api/Admin/UpdateRole',
                selectedRoleId,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
                        'Content-Type': 'application/json'
                    },
                    params: { id: editingUser.userID }
                }
            );
            updatePromises.push(updateRolePromise);
        }

        // 2. Kiểm tra nếu Status đã thay đổi thì thêm promise cập nhật Status
        if (selectedStatus && selectedStatus !== originalStatus) {
            const updateStatusPromise = axios.put(
                '/api/Admin/UpdateStatus',
                `"${selectedStatus}"`, // Gửi status dưới dạng một chuỗi JSON hợp lệ
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
                        'Content-Type': 'application/json'
                    },
                    params: { id: editingUser.userID }
                }
            );
            updatePromises.push(updateStatusPromise);
        }

        // Nếu không có gì thay đổi, chỉ cần đóng modal
        if (updatePromises.length === 0) {
            setShowEditModal(false);
            toast.info('Không có thay đổi nào để lưu.');
            return;
        }

        try {
            // Thực thi tất cả các promise cùng lúc
            await Promise.all(updatePromises);

            setShowEditModal(false);
            await fetchUsers(); // Tải lại dữ liệu mới
            toast.success('Cập nhật người dùng thành công!');

        } catch (err) {
            console.error('Lỗi khi cập nhật người dùng:', err);
            const errorMessage = err.response?.data?.message || 'Cập nhật thất bại. Vui lòng thử lại.';
            toast.error(errorMessage);
        }
    };


    // xóa người dùng
    const handleDelete = (userId) => {
        setUserToDelete(userId);
        setShowDeleteModal(true);
    };

    // Xác nhận xóa người dùng
    const confirmDelete = async () => {
        if (!userToDelete) return;

        try {
            // Gọi API DELETE với URL và params chính xác
            await axios.delete('/api/Admin/DeleteUser', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('userToken')}`,
                },
                params: { // Gửi ID dưới dạng query parameter
                    id: userToDelete
                }
            });

            // Cập nhật lại danh sách sau khi xóa thành công
            await fetchUsers();
            toast.success('Xóa người dùng thành công!');

        } catch (err) {
            // Xử lý lỗi và thông báo cho người dùng
            console.error('Delete user failed:', err);
            const errorMessage = err.response?.data?.message || 'Xóa người dùng thất bại. Vui lòng thử lại.';
            toast.error(errorMessage);
        }

        setShowDeleteModal(false);
        setUserToDelete(null);
    };

    // Phần JSX giữ nguyên như của bạn
    return (
        <div className="user-management">
            <h2 className="text-center text-success"> Quản lý người dùng </h2>
            {/* ROW 1: Search + Filter + Add Button */}
            <Row className="align-items-center mb-4 controls">
                <Col md="4">
                    <InputGroup className="search-input">
                        <FormControl
                            placeholder="Tìm theo ID, Tên, Gói..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        <Button variant="outline-secondary">
                            <FaSearch />
                        </Button>
                    </InputGroup>
                </Col>
                <Col md="3">
                    <Dropdown className="role-dropdown">
                        <Dropdown.Toggle variant="light" >
                            {filterRole}
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="w-100">
                            <Dropdown.Item
                                key="all"
                                active={"Tất cả vai trò" === filterRole}
                                onClick={() => setFilterRole('Tất cả vai trò')}
                            >
                                Tất cả vai trò
                            </Dropdown.Item>
                            {['Admin', 'Member', 'Coach'].map(r => (
                                <Dropdown.Item
                                    key={r}
                                    active={r === filterRole}
                                    onClick={() => setFilterRole(r)}
                                >
                                    {r}
                                </Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
                </Col>
                <Col md="5" className="d-flex justify-content-end">
                    <Button
                        className="add-user-btn"
                        variant='primary'
                        onClick={() => setShowModal(true)}
                    >
                        <FaPlus /> Thêm người dùng
                    </Button>
                </Col>
            </Row>

            {/* ROW 2: Table trong Card */}
            <Row>
                <Col>
                    <Card className="user-table">
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <h5>Danh sách người dùng</h5>
                            <div className="d-flex align-items-center gap-3">
                                <span>Hiển thị {startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalUsers)} của {totalUsers} người dùng</span>
                                <div className="d-flex align-items-center gap-2">
                                    <span>Hiển thị:</span>
                                    <Dropdown size="sm">
                                        <Dropdown.Toggle variant="outline-secondary" size="sm">
                                            {itemsPerPage}
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            {[5, 10, 25, 50].map(size => (
                                                <Dropdown.Item
                                                    key={size}
                                                    active={itemsPerPage === size}
                                                    onClick={() => handleItemsPerPageChange(size)}
                                                >
                                                    {size}
                                                </Dropdown.Item>
                                            ))}
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table responsive hover className="mb-0">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Tên tài khoản</th>
                                        <th>Email</th>
                                        <th>Vai trò</th>
                                        <th>Trạng thái</th>
                                        <th>Ngày đăng ký</th>
                                        <th>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentPageUsers.length > 0 ? (
                                        currentPageUsers.map(u => (
                                            <tr key={u.userID}>
                                                <td>{u.userID}</td>
                                                <td>{u.fullName}</td>
                                                <td>{u.email}</td>
                                                <td>{u.role}</td>
                                                <td>{u.status}</td>
                                                <td>{u.registrationDate}</td>
                                                <td className="text-center">
                                                    <Button variant="link" size="sm" onClick={() => handleEdit(u)}>
                                                        <FaEdit />
                                                    </Button>
                                                    {/* Cập nhật hàm xóa để truyền userID */}
                                                    <Button variant="link" size="sm" onClick={() => handleDelete(u.userID)}>
                                                        <FaTrash />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="text-center py-5 text-muted">
                                                {searchTerm || filterRole !== 'Tất cả vai trò'
                                                    ? 'Không tìm thấy người dùng nào phù hợp'
                                                    : 'Chưa có người dùng nào'
                                                }
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </Card.Body>
                        {totalPages > 1 && (
                            <Card.Footer className="d-flex justify-content-center">
                                <Pagination>
                                    <Pagination.First
                                        disabled={currentPage === 1}
                                        onClick={() => handlePageChange(1)}
                                    />
                                    <Pagination.Prev
                                        disabled={currentPage === 1}
                                        onClick={() => handlePageChange(currentPage - 1)}
                                    />

                                    {/* Hiển thị các trang */}
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNumber;
                                        if (totalPages <= 5) {
                                            pageNumber = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNumber = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNumber = totalPages - 4 + i;
                                        } else {
                                            pageNumber = currentPage - 2 + i;
                                        }

                                        return (
                                            <Pagination.Item
                                                key={pageNumber}
                                                active={pageNumber === currentPage}
                                                onClick={() => handlePageChange(pageNumber)}
                                            >
                                                {pageNumber}
                                            </Pagination.Item>
                                        );
                                    })}

                                    <Pagination.Next
                                        disabled={currentPage === totalPages}
                                        onClick={() => handlePageChange(currentPage + 1)}
                                    />
                                    <Pagination.Last
                                        disabled={currentPage === totalPages}
                                        onClick={() => handlePageChange(totalPages)}
                                    />
                                </Pagination>
                            </Card.Footer>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Modal Thêm Người Dùng  */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton className="p-3">
                    <Modal.Title className="w-100 text-center">Thêm người dùng</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <Form>
                        <Form.Group as={Row} className="align-items-center mb-3">
                            <Form.Label column sm={4} className="text-sm-right">
                                Họ và tên:
                            </Form.Label>
                            <Col sm={8}>
                                <Form.Control
                                    type="text"
                                    value={newUser.fullName}
                                    onChange={e => setNewUser({ ...newUser, fullName: e.target.value })}
                                />
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} className="align-items-center mb-3">
                            <Form.Label column sm={4} className="text-sm-right">
                                Email:
                            </Form.Label>
                            <Col sm={8}>
                                <Form.Control
                                    type="email"
                                    value={newUser.email}
                                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                    placeholder="example@domain.com"
                                    pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                                    required
                                />
                                {newUser.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email) && (
                                    <Form.Text className="text-danger">
                                        Email phải có định dạng: example@domain.com
                                    </Form.Text>
                                )}
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} className="align-items-center mb-3">
                            <Form.Label column sm={4} className="text-sm-right">
                                Role:
                            </Form.Label>
                            <Col sm={8}>
                                <Form.Control
                                    as="select"
                                    value={newUser.roleID}
                                    onChange={e => setNewUser({ ...newUser, roleID: e.target.value })}
                                >
                                    <option value="">Chọn vai trò</option>
                                    <option value="1">Admin</option>

                                    <option value="2">Member</option>
                                    <option value="3">Coach</option>
                                </Form.Control>
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} className="align-items-center mb-3">
                            <Form.Label column sm={4} className="text-sm-right">
                                Phone:
                            </Form.Label>
                            <Col sm={8}>
                                <Form.Control
                                    type="text"
                                    value={newUser.phoneNumber}
                                    onChange={e => setNewUser({ ...newUser, phoneNumber: e.target.value })}
                                />
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} className="align-items-center mb-3">
                            <Form.Label column sm={4} className="text-sm-right">
                                Mật khẩu:
                            </Form.Label>
                            <Col sm={8}>
                                <Form.Control
                                    type="password"
                                    value={newUser.password}
                                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                />
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} className="align-items-center mb-4">
                            <Form.Label column sm={4} className="text-sm-right">
                                Xác nhận mật khẩu:
                            </Form.Label>
                            <Col sm={8}>
                                <Form.Control
                                    type="password"
                                    value={newUser.confirm}
                                    onChange={e => setNewUser({ ...newUser, confirm: e.target.value })}
                                />
                            </Col>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="p-3">
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Hủy
                    </Button>
                    <Button variant="primary" onClick={handleAddUser}>
                        Lưu
                    </Button>
                </Modal.Footer>
            </Modal>


            {/* --- BẮT ĐẦU: MODAL CHỈNH SỬA VAI TRÒ --- */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
                <Modal.Header closeButton className="p-3">
                    <Modal.Title className="w-100 text-center">Chỉnh sửa người dùng</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {editingUser && (
                        <Form>
                            <p className="mb-4">
                                Đang chỉnh sửa: <strong>{editingUser.fullName}</strong>
                            </p>

                            {/* Form Group cho Vai trò */}
                            <Form.Group as={Row} className="align-items-center mb-3">
                                <Form.Label column sm={4} className="text-sm-right">
                                    Vai trò:
                                </Form.Label>
                                <Col sm={8}>
                                    <Form.Control as="select" value={selectedRoleId} onChange={e => setSelectedRoleId(e.target.value)}>
                                        <option value="1">Admin</option>
                                        <option value="2">Member</option>
                                        <option value="3">Coach</option>
                                    </Form.Control>
                                </Col>
                            </Form.Group>

                            {/* Form Group cho Trạng thái */}
                            <Form.Group as={Row} className="align-items-center mb-3">
                                <Form.Label column sm={4} className="text-sm-right">
                                    Trạng thái:
                                </Form.Label>
                                <Col sm={8}>
                                    <Form.Control as="select" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
                                        {/* Giả định các trạng thái có thể có */}
                                        <option value="Active">Active</option>
                                        <option value="InActive">InActive</option>
                                    </Form.Control>
                                </Col>
                            </Form.Group>

                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer className="p-3">
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                        Hủy
                    </Button>
                    <Button variant="primary" onClick={handleSaveEdit}>
                        Lưu thay đổi
                    </Button>
                </Modal.Footer>
            </Modal>
            {/* --- KẾT THÚC: MODAL CHỈNH SỬA VAI TRÒ --- */}

            {/* Modal xác nhận xóa người dùng */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận xóa người dùng</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.
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

        </div>
    );
};

export default ManagementUser;