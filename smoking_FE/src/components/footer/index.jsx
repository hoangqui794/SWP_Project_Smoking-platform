import { memo } from "react";
import { Link } from "react-router-dom";
import { ROUTERS } from "../../utils/router";
import "../footer/footer.scss";

const Footer = () => {
    return (
        <footer className="modern-footer">
            <div className="footer-content">
                <div className="container">
                    <div className="footer-sections">
                        {/* Brand Section */}
                        <div className="footer-brand">
                            <img
                                src="https://github.com/THQuis/SWP391_Group5/blob/main/image/logo.png?raw=true"
                                alt="Breath Again Logo"
                                className="footer-logo"
                            />
                            <h3>Breath Again</h3>
                            <p>Đồng hành cùng bạn trên hành trình vượt qua sự phụ thuộc thuốc lá. Mỗi ngày không thuốc là một ngày bạn sống trọn vẹn hơn.</p>
                            <div className="social-links">
                                <button className="social-link" onClick={() => window.open('https://facebook.com', '_blank')}>
                                    <i className="fab fa-facebook-f"></i>
                                </button>
                                <button className="social-link" onClick={() => window.open('https://instagram.com', '_blank')}>
                                    <i className="fab fa-instagram"></i>
                                </button>
                                <button className="social-link" onClick={() => window.open('https://youtube.com', '_blank')}>
                                    <i className="fab fa-youtube"></i>
                                </button>
                                <button className="social-link" onClick={() => window.open('https://tiktok.com', '_blank')}>
                                    <i className="fab fa-tiktok"></i>
                                </button>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="footer-section">
                            <h4>Liên kết nhanh</h4>
                            <ul className="footer-links">
                                <li><Link to={ROUTERS.USER.HOME}>🏠 Trang chủ</Link></li>
                                <li><Link to={ROUTERS.USER.QUITPLAN}>📋 Kế hoạch cai nghiện</Link></li>
                                <li><Link to={ROUTERS.USER.BLOG}>👥 Cộng đồng</Link></li>
                                <li><Link to={ROUTERS.USER.CHALENGE}>🎯 Thử thách</Link></li>
                                <li><Link to={ROUTERS.USER.RANKING}>🏆 Bảng xếp hạng</Link></li>
                            </ul>
                        </div>

                        {/* Support */}
                        <div className="footer-section">
                            <h4>Hỗ trợ</h4>
                            <ul className="footer-links">
                                <li><Link to={ROUTERS.USER.COACH}>🧑‍⚕️ Tìm Coach</Link></li>
                                <li><Link to={ROUTERS.USER.PACKAGE}>💎 Gói thành viên</Link></li>
                                <li><Link to={ROUTERS.USER.ACHIVE}>🏅 Huy hiệu</Link></li>
                                <li><a href="mailto:support@breathagain.com">📧 Liên hệ hỗ trợ</a></li>
                                <li><a href="tel:+84123456789">📞 Hotline: 0123 456 789</a></li>
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div className="footer-section">
                            <h4>Thông tin liên hệ</h4>
                            <div className="contact-info">
                                <p><i className="fas fa-map-marker-alt"></i> Lô E2a-7, Đường D1, Đ. D1, Long Thạnh Mỹ, Thành Phố Thủ Đức, TP.HCM</p>
                                <p><i className="fas fa-envelope"></i> contact@breathagain.com</p>
                                <p><i className="fas fa-phone"></i> +84 123 456 789</p>
                                <p><i className="fas fa-clock"></i> Thứ 2 - Chủ nhật: 8:00 - 22:00</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Bottom */}
            <div className="footer-bottom">
                <div className="container">
                    <div className="footer-bottom-content">
                        <p>© 2024 Breath Again. Tất cả quyền được bảo lưu.</p>
                        <div className="footer-bottom-links">
                            <button onClick={() => console.log('Privacy Policy')}>Chính sách bảo mật</button>
                            <button onClick={() => console.log('Terms of Service')}>Điều khoản sử dụng</button>
                            <button onClick={() => console.log('Cookies Policy')}>Cookies</button>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default memo(Footer);
