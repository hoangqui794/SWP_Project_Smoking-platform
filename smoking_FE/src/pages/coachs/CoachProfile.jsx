import React, { useEffect, useState } from 'react';
import { Container, Button, Modal, Form, Spinner } from 'react-bootstrap';
import { FaCrown, FaUserEdit, FaUser, FaTransgender, FaGem, FaPhoneAlt, FaEnvelope, FaTrashAlt, FaBirthdayCake } from "react-icons/fa";
import { toast } from 'react-toastify';
import styles from '../../styles/profileCoach.module.scss';
const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [editInfo, setEditInfo] = useState({
        fullName: '',
        phoneNumber: '',
        profilePicture: '',
        description: '',
        gender: '',
        dateOfBirth: '',
    });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    // --- BẮT ĐẦU THÊM HÀM MỚI TẠI ĐÂY ---

    // Đổi ảnh đại diện
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarPreview(URL.createObjectURL(file));
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditInfo(prev => ({
                    ...prev,
                    profilePicture: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Lưu profile
    const handleSaveProfile = async () => {
        try {
            const token = localStorage.getItem('userToken');
            let isoDateOfBirth = '';
            if (editInfo.dateOfBirth) {
                isoDateOfBirth = new Date(editInfo.dateOfBirth).toISOString();
            }
            const body = {
                email: user.email,
                fullName: editInfo.fullName,
                phoneNumber: editInfo.phoneNumber,
                profilePicture: editInfo.profilePicture,
                description: editInfo.description,
                gender: editInfo.gender,
                dateOfBirth: isoDateOfBirth || '',
            };
            const res = await fetch('/api/user/update-profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (res.ok) {
                // Lưu lại các trường vừa chỉnh sửa vào localStorage
                if (editInfo.profilePicture) {
                    localStorage.setItem('profilePicture', editInfo.profilePicture);
                }
                if (editInfo.fullName) {
                    localStorage.setItem('userName', editInfo.fullName);
                }
                if (editInfo.phoneNumber) {
                    localStorage.setItem('phoneNumber', editInfo.phoneNumber);
                }
                if (editInfo.gender) {
                    localStorage.setItem('gender', editInfo.gender);
                }
                if (editInfo.dateOfBirth) {
                    localStorage.setItem('dateOfBirth', editInfo.dateOfBirth);
                }
                // Thêm những trường khác nếu muốn

                toast.success('Cập nhật hồ sơ thành công!', {
                    onClose: () => window.location.reload()
                });
                setShowEditModal(false);
            } else {
                toast.error(data.error || data.message || 'Cập nhật thất bại!');
            }
        } catch (err) {
            toast.error('Có lỗi xảy ra khi kết nối tới máy chủ!');
        }
    };
    // Lấy profile
    const fetchUserProfile = async (showPageLoading = true) => {
        if (showPageLoading) {
            setIsLoading(true);
        }
        try {
            const token = localStorage.getItem('userToken');
            const res = await fetch('/api/user/profile', {
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' }
            });
            if (!res.ok) throw new Error('Không lấy được thông tin người dùng');
            const data = await res.json();
            let memberPackage = "Basic";
            if (data.user.membership && data.user.membership.packageType) {
                memberPackage = data.user.membership.packageType;
            }
            setUser({
                userID: data.user.userID,
                avatar: data.user.profilePicture || 'https://github.com/THQuis/SWP391_Group5/blob/main/image/user.png?raw=true',
                fullName: data.user.fullName,
                email: data.user.email,
                gender: data.user.gender,
                dateOfBirth: data.user.dateOfBirth ? data.user.dateOfBirth.slice(0, 10) : '', // Chỉ lấy phần ngày
                memberSince: data.user.registrationDate,
                memberPackage: memberPackage,
                phoneNumber: data.user.phoneNumber,
                status: data.user.status,
                description: data.user.description,
                membership: data.user.membership,
            });
        } catch (e) {
            toast.error(e.message);
        } finally {
            if (showPageLoading) {
                setIsLoading(false);
            }
        }
    };

    // Mở modal sửa
    const handleOpenEditModal = () => {
        setEditInfo({
            fullName: user.fullName || '',
            phoneNumber: user.phoneNumber || '',
            profilePicture: user.avatar || '',
            description: user.description || '',
            gender: user.gender || '',  //thêm sau 
            dateOfBirth: user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '', // Chỉ lấy phần ngày
        });
        setAvatarPreview(null);
        setShowEditModal(true);
    };

    useEffect(() => {
        fetchUserProfile();
    }, []);

    // Xử lý khi nhấn nút xóa (chỉ mở modal xác nhận)
    const handleClickDeleteAccount = () => {
        setShowDeleteModal(true);
    };

    // Thực sự xóa tài khoản khi xác nhận trong modal
    const handleConfirmDeleteAccount = async () => {
        console.log("!!! CẢNH BÁO: ĐANG CHẠY HÀM XÓA TÀI KHOẢN !!!");
        try {
            const token = localStorage.getItem('userToken');
            const email = user.email;
            const response = await fetch('/api/user/delete-user', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ email }),
            });
            const resText = await response.text();
            if (response.ok) {
                localStorage.removeItem('userToken');
                localStorage.removeItem('userRole');
                localStorage.removeItem('userName');
                localStorage.removeItem('userEmail');

                // CẢI TIỆN 2: Hiển thị toast và chỉ chuyển trang sau khi toast đóng
                toast.success('Xóa tài khoản thành công!', {
                    onClose: () => window.location.href = '/'
                });
            } else {
                toast.error('Xóa tài khoản thất bại! ' + resText);
            }
        } catch (error) {
            toast.error('Lỗi kết nối mạng, không thể xóa tài khoản!');
        } finally {
            setShowDeleteModal(false);
        }
    };
    if (isLoading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                <Spinner animation="border" variant="success" />
                <h4 className="ms-3">Đang tải thông tin người dùng...</h4>
            </Container>
        );
    }

    if (!user) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', flexDirection: 'column', textAlign: 'center' }}>
                <h4>Không thể tải được thông tin cá nhân.</h4>
                <p>Vui lòng thử tải lại trang hoặc đăng nhập lại.</p>
                <Button variant="success" onClick={() => window.location.reload()}>Tải lại trang</Button>
            </div>
        )
    }

    return (
        <div className={styles.profilePage}>
            <div className={styles.profileHeader}>
                <div className={styles.headerContent}>
                    <div className={styles.avatarSection}>
                        <div className={styles.avatarWrapper}>
                            <img
                                src={avatarPreview || editInfo.profilePicture || user.avatar}
                                alt={user.fullName}
                                className={`${styles.avatar} ${user.memberPackage === 'Premium' ? styles.premium : ''}`}
                            />
                            {user.memberPackage === 'Premium' && (
                                <div className={styles.premiumBadge}>
                                    <FaCrown />
                                </div>
                            )}
                            <Button
                                className={styles.editButton}
                                onClick={handleOpenEditModal}
                                title="Chỉnh sửa hồ sơ"
                            >
                                <FaUserEdit />
                            </Button>
                        </div>
                        <h1 className={styles.userName}>{user.fullName}</h1>
                        <p className={styles.userBio}>{user.description || "Chưa có tiểu sử"}</p>
                        {user.memberPackage === 'Premium' && (
                            <div className={styles.membershipBadge}>
                                <FaGem /> Premium
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Phần content */}
            <div className={styles.contentSection}>
                <div className={styles.mainContent}>
                    {/* Card thông tin cá nhân */}
                    <div className={styles.infoCard}>
                        <div className={styles.cardHeader}>
                            <FaUser /> Thông tin cá nhân
                        </div>
                        <div className={styles.cardContent}>
                            <div className={styles.infoGrid}>
                                <div className={styles.infoItem}>
                                    <FaEnvelope />
                                    <div>
                                        <span className={styles.label}>Email</span>
                                        <span className={styles.value}>{user.email}</span>
                                    </div>
                                </div>
                                <div className={styles.infoItem}>
                                    <FaPhoneAlt />
                                    <div>
                                        <span className={styles.label}>Số điện thoại</span>
                                        <span className={styles.value}>{user.phoneNumber}</span>
                                    </div>
                                </div>
                                <div className={styles.infoItem}>
                                    <FaTransgender />
                                    <div>
                                        <span className={styles.label}>Giới tính</span>
                                        <span className={styles.value}>
                                            {user.gender === 'Male' ? 'Nam' : user.gender === 'Female' ? 'Nữ' : ''}
                                        </span>
                                    </div>
                                </div>
                                <div className={styles.infoItem}>
                                    <FaBirthdayCake />
                                    <div>
                                        <span className={styles.label}>Ngày sinh</span>
                                        <span className={styles.value}>
                                            {user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : ''}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Nút xóa tài khoản */}
                <div className={styles.deleteSection}>
                    <Button
                        className={styles.deleteAccountBtn}
                        onClick={handleClickDeleteAccount}
                    >
                        <FaTrashAlt /> Xóa tài khoản
                    </Button>
                </div>
            </div>

            {/* Modal xác nhận xóa tài khoản */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận xóa tài khoản</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Bạn có chắc chắn muốn xóa tài khoản không? Hành động này <b>không thể hoàn tác</b>.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Hủy
                    </Button>
                    <Button variant="danger" onClick={handleConfirmDeleteAccount}>
                        Xác nhận xóa
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal chỉnh sửa */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Chỉnh sửa hồ sơ</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="text-center mb-3">
                        <h6>Ảnh đại diện</h6>
                        <img
                            src={avatarPreview || editInfo.profilePicture || user.avatar}
                            alt="avatar"
                            className="rounded-circle mb-2 border border-2 border-success"
                            style={{ width: '110px', height: '110px', objectFit: 'cover' }}
                        />
                        <Form.Group controlId="formAvatar" className="mt-2">
                            <Form.Control type="file" accept="image/*" onChange={handleAvatarChange} />
                        </Form.Group>
                    </div>
                    <hr />
                    <Form.Group className="mb-3">
                        <Form.Label>Họ và tên</Form.Label>
                        <Form.Control
                            type="text"
                            value={editInfo.fullName}
                            onChange={(e) => setEditInfo({ ...editInfo, fullName: e.target.value })}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Tiểu sử</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={editInfo.description}
                            onChange={e => setEditInfo({ ...editInfo, description: e.target.value })}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Ngày sinh</Form.Label>
                        <Form.Control
                            type="date"
                            value={editInfo.dateOfBirth}// chỉnh sửa date of birth
                            onChange={(e) => setEditInfo({ ...editInfo, dateOfBirth: e.target.value })}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Giới tính</Form.Label>
                        <Form.Select
                            value={editInfo.gender}
                            onChange={(e) => setEditInfo({ ...editInfo, gender: e.target.value })}
                        >
                            <option value="">Chọn giới tính</option>
                            <option value="Male">Nam</option>
                            <option value="Female">Nữ</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Số điện thoại</Form.Label>
                        <Form.Control
                            type="text"
                            value={editInfo.phoneNumber}
                            onChange={(e) => setEditInfo({ ...editInfo, phoneNumber: e.target.value })}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>Đóng</Button>
                    <Button variant="primary" onClick={handleSaveProfile}>
                        Lưu thay đổi
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default UserProfile;