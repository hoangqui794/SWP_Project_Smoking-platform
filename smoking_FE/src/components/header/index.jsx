import React, { useState, useEffect, useCallback } from 'react';
import { Navbar, Nav, Container, Dropdown, Image, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ROUTERS } from '../../utils/router';
import "../header/header.scss";
import { toast } from 'react-toastify';
import NotificationBell from '../../components/Notification/NotificationBell';
import { performanceUtils, useComponentLifecycle } from '../../utils/performance';

const Header = () => {
  // Monitor component lifecycle
  useComponentLifecycle('Header');

  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('userToken'));
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole'));
  const [userName, setUserName] = useState(localStorage.getItem('userName'));
  const [profilePicture, setProfilePicture] = useState(localStorage.getItem('profilePicture'));

  // Lắng nghe thay đổi localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem('userToken'));
      setUserRole(localStorage.getItem('userRole'));
      setUserName(localStorage.getItem('userName'));
      setProfilePicture(localStorage.getItem('profilePicture'));
    };

    // Lắng nghe storage event
    window.addEventListener('storage', handleStorageChange);

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Optimized logout function với useCallback
  const handleLogoutOptimized = useCallback(async () => {
    try {
      // Disable các tương tác khác để tránh race condition
      const logoutBtn = document.querySelector('[onClick*="handleLogout"]');
      if (logoutBtn) logoutBtn.disabled = true;

      const response = await fetch('/api/Auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });

      if (response.ok) {
        // Sử dụng performanceUtils để clear data
        performanceUtils.clearUserData();

        // Update state immediately
        setIsLoggedIn(false);
        setUserRole(null);
        setUserName(null);
        setProfilePicture(null);

        toast.success('Đăng xuất thành công! Hẹn gặp lại bạn.', {
          autoClose: 500,
          onClose: () => {
            // Force reload để đảm bảo state được reset hoàn toàn
            window.location.replace('/');
          }
        });
      } else {
        const errorData = await response.json().catch(() => null);
        toast.error(errorData?.message || 'Có lỗi xảy ra khi đăng xuất.');

        // Re-enable button nếu có lỗi
        const logoutBtn = document.querySelector('[onClick*="handleLogout"]');
        if (logoutBtn) logoutBtn.disabled = false;
      }
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
      toast.error('Không thể kết nối với máy chủ. Vui lòng thử lại!');

      // Re-enable button nếu có lỗi
      const logoutBtn = document.querySelector('[onClick*="handleLogout"]');
      if (logoutBtn) logoutBtn.disabled = false;
    }
  }, []);

  // Avatar fallback function với useCallback
  const getAvatarUrl = useCallback(() => {
    if (profilePicture) return profilePicture;
    const defaultName = userName || 'User';
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(defaultName)}&backgroundColor=4CAF50&textColor=ffffff`;
  }, [profilePicture, userName]);

  return (
    <Navbar expand="lg" className="sticky-navbar">
      <Container>
        {/* Modern Brand */}
        <Navbar.Brand as={Link} to={ROUTERS.USER.HOME} className="modern-navbar-brand">
          <Image
            src="https://github.com/THQuis/SWP391_Group5/blob/main/image/logo.png?raw=true"
            alt="Breath Again Logo"
          />
          <span className="brand-text">BreathAgain</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="modern-navbar-nav" />

        <Navbar.Collapse id="modern-navbar-nav" className="justify-content-between">
          {/* Navigation Links */}
          <Nav className="me-auto modern-nav">
            {(!isLoggedIn || userRole === "2") && (
              <>
                {isLoggedIn ? (
                  <>
                    <Nav.Link as={Link} to={ROUTERS.USER.HOME} className="nav-item-custom">
                      🏠 Trang chủ
                    </Nav.Link>
                    <Nav.Link as={Link} to={ROUTERS.USER.PROGRESS} className="nav-item-custom">
                      📊 Tiến trình
                    </Nav.Link>
                    <Nav.Link as={Link} to={ROUTERS.USER.QUITPLAN} className="nav-item-custom">
                      📋 Kế hoạch
                    </Nav.Link>
                    <Nav.Link as={Link} to={ROUTERS.USER.BLOG} className="nav-item-custom">
                      👥 Cộng đồng
                    </Nav.Link>
                    <Nav.Link as={Link} to={ROUTERS.USER.MILESTONES} className="nav-item-custom">
                      📖 Cẩm nang
                    </Nav.Link>
                    <Nav.Link as={Link} to={ROUTERS.USER.CHALENGE} className="nav-item-custom">
                      🎯 Thử Thách
                    </Nav.Link>
                  </>
                ) : (
                  <>
                    <Nav.Link onClick={() => window.location.href = ROUTERS.USER.HOME} className="nav-item-custom">
                      🏠 Trang chủ
                    </Nav.Link>
                    <Nav.Link onClick={() => window.location.href = ROUTERS.AUTH.LOGIN} className="nav-item-custom">
                      📊 Dashboard
                    </Nav.Link>
                    <Nav.Link onClick={() => window.location.href = ROUTERS.AUTH.LOGIN} className="nav-item-custom">
                      📋 Kế hoạch
                    </Nav.Link>
                    <Nav.Link onClick={() => window.location.href = ROUTERS.AUTH.LOGIN} className="nav-item-custom">
                      👥 Cộng đồng
                    </Nav.Link>
                    <Nav.Link onClick={() => window.location.href = ROUTERS.AUTH.LOGIN} className="nav-item-custom">
                      📊 Tiến trình
                    </Nav.Link>
                    <Nav.Link onClick={() => window.location.href = ROUTERS.AUTH.LOGIN} className="nav-item-custom">
                      🎯 Thử Thách
                    </Nav.Link>
                  </>
                )}
              </>
            )}

            {userRole === "3" && (
              <>
                <Nav.Link as={Link} to={ROUTERS.USER.HOME} className="nav-item-custom">
                  🏠 Trang chủ
                </Nav.Link>
                <Nav.Link as={Link} to={ROUTERS.COACH.MEMBER} className="nav-item-custom">
                  👥 Quản lý thành viên
                </Nav.Link>
                <Nav.Link as={Link} to={ROUTERS.COACH.BOOKING} className="nav-item-custom">
                  📅 Lịch tư vấn
                </Nav.Link>
              </>
            )}
          </Nav>

          {/* User Section */}
          <Nav className="modern-user-section">
            {isLoggedIn && (
              <div className="notification-bell">
                <NotificationBell />
              </div>
            )}

            {isLoggedIn ? (
              <Dropdown align="end" className="user-dropdown">
                <Dropdown.Toggle id="dropdown-user">
                  <Image
                    src={getAvatarUrl()}
                    width={28}
                    height={28}
                    roundedCircle
                    className="user-avatar"
                    alt="User Avatar"
                    onError={(e) => {
                      e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName || 'User')}&backgroundColor=4CAF50&textColor=ffffff`;
                    }}
                  />
                  {userName || 'Tài khoản'}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  {userRole === "2" && (
                    <>
                      <Dropdown.Item as={Link} to={ROUTERS.USER.PROFILE}>
                        👤 Hồ sơ cá nhân
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to={ROUTERS.USER.RANKING}>
                        🏆 Bảng xếp hạng
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to={ROUTERS.USER.COACH}>
                        🧑‍⚕️ Coach
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to={ROUTERS.USER.PACKAGE}>
                        💎 Gói thành viên
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to={ROUTERS.USER.ACHIVE}>
                        🏅 Huy hiệu và thành tích
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to={ROUTERS.USER.MYCONSUL}>
                        📅 Lịch tư vấn
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item as={Link} to={ROUTERS.USER.HOME}>
                        ℹ️ Về Chúng Tôi
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item as="button" onClick={handleLogoutOptimized}>
                        🚪 Đăng xuất
                      </Dropdown.Item>
                    </>
                  )}
                  {(userRole === "3" || userRole === "1") && (
                    <>
                      <Dropdown.Item as={Link} to={ROUTERS.COACH.PROFILE}>
                        👤 Hồ sơ Coach
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to={ROUTERS.COACH.MANAGE}>
                        👥 Quản lý thành viên
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to={ROUTERS.COACH.SCHEDULE}>
                        📅 Lịch tư vấn
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item as={Link} to={ROUTERS.COACH.HOME}>
                        ℹ️ Về Chúng Tôi
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item as="button" onClick={handleLogoutOptimized}>
                        🚪 Đăng xuất
                      </Dropdown.Item>
                    </>
                  )}
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <Button as={Link} to={ROUTERS.AUTH.LOGIN} className="login-button">
                🔐 Đăng nhập
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;