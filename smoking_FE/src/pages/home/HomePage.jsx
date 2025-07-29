import { memo, useState, useEffect } from "react";
import { Carousel, Image } from 'react-bootstrap';
import "../../styles/home.scss";
import { Link, useNavigate } from 'react-router-dom';
import { ROUTERS } from "../../utils/router";

const HomePage = () => {
    const navigate = useNavigate();
    const [topUsers, setTopUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeRankingType, setActiveRankingType] = useState("smoke-free-days");
    const handleStartJourney = () => {
        // Kiểm tra xem user đã đăng nhập chưa
        const userToken = localStorage.getItem('userToken');

        if (userToken) {
            // Đã đăng nhập -> chuyển đến trang tiến trình (quit plan)
            navigate(ROUTERS.USER.PROGRESS);
        } else {
            // Chưa đăng nhập -> chuyển đến trang login
            navigate(ROUTERS.USER.LOGIN);
        }
    };
    useEffect(() => {
        const fetchTopRanking = async () => {
            try {
                setLoading(true);
                const userToken = localStorage.getItem('userToken');

                let endpoint = '';
                switch (activeRankingType) {
                    case 'smoke-free-days':
                        endpoint = '/api/ranking/top-smoke-free-days?top=3';
                        break;
                    case 'money-saved':
                        endpoint = '/api/ranking/top-money-saved?top=3';
                        break;
                    case 'cigarettes-dropped':
                        endpoint = '/api/ranking/top-cigarettes-dropped?top=3';
                        break;
                    default:
                        endpoint = '/api/ranking/top-smoke-free-days?top=3';
                }

                const response = await fetch(endpoint, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userToken}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log(`Top 3 ${activeRankingType} Ranking API Response:`, data);
                    setTopUsers(data || []);
                } else {
                    console.error('❌ API Error:', response.status, response.statusText);
                    console.error('🔍 API Endpoint:', endpoint);
                    console.error('🔑 Token exists:', !!userToken);
                    // Fallback to empty array when API fails
                    setTopUsers([]);
                }
            } catch (error) {
                console.error('❌ Network Error:', error);
                console.error(' Hint: Kiểm tra backend có đang chạy không và proxy config');
                // Fallback to empty array when network fails  
                setTopUsers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTopRanking();
    }, [activeRankingType]);

    const getRankingValue = (user, type) => {
        // Kiểm tra user tồn tại trước khi truy cập properties
        if (!user) return '0';

        switch (type) {
            case 'smoke-free-days':
                return `${user.smokeFreeDays || 0} ngày`;
            case 'money-saved':
                return `${(user.totalMoneySaved || 0).toLocaleString('vi-VN')} VNĐ`;
            case 'cigarettes-dropped':
                return `${user.totalCigarettesDropped || 0} điếu`;
            default:
                return `${user.smokeFreeDays || 0} ngày`;
        }
    };

    const getRankingTitle = (type) => {
        switch (type) {
            case 'smoke-free-days':
                return '🚭 Top Ngày Không Hút Thuốc';
            case 'money-saved':
                return '💰 Top Tiền Tiết Kiệm';
            case 'cigarettes-dropped':
                return '🚬 Top Điếu Đã Bỏ';
            default:
                return '🚭 Top Ngày Không Hút Thuốc';
        }
    };

    return (
        <div>
            <section className="hero-carousel" id="home">
                <Carousel fade controls={false} indicators={false} interval={1000}>
                    <Carousel.Item>
                        <img
                            className="d-block w-100"
                            src="https://github.com/THQuis/SWP391_Group5/blob/main/image/bannerFirst.png?raw=true"
                            alt="First slide"
                        />
                    </Carousel.Item>
                    <Carousel.Item>
                        <img
                            className="d-block w-100"
                            src="https://github.com/THQuis/SWP391_Group5/blob/main/image/Thien1.2.jpg?raw=true"
                            alt="Second slide"
                        />
                    </Carousel.Item>
                    <Carousel.Item>
                        <img
                            className="d-block w-100"
                            src="https://github.com/THQuis/SWP391_Group5/blob/main/image/Coach.png?raw=true"
                            alt="Third slide"
                        />
                    </Carousel.Item>
                    <Carousel.Item>
                        <img
                            className="d-block w-100"
                            src="https://github.com/THQuis/SWP391_Group5/blob/main/image/banner1.1.jpg?raw=true"
                            alt="Four slide"
                        />
                    </Carousel.Item>
                </Carousel>
            </section>

            {/* About Section */}
            <section className="about" id="about">
                <div className="container">
                    <h2>Về chúng tôi</h2>
                    <div className="about-content">
                        <div className="about-text">
                            <h3>Breath Again</h3>
                            <p>Hãy để Breath Again đồng hành cùng bạn trên con đường vượt qua sự phụ thuộc vào thuốc lá. Chúng tôi tin rằng mỗi người đều xứng đáng có một cuộc sống khỏe mạnh hơn, tự do hơn và hạnh phúc hơn. Tại đây, bạn sẽ nhận được không chỉ là các công cụ hỗ trợ, mà còn là sự động viên, chia sẻ từ cộng đồng cũng như những lời khuyên tận tâm từ các chuyên gia.</p>
                            <p>
                                Bạn không đơn độc trên hành trình này! Hàng ngàn người đã và đang thành công nhờ sự giúp đỡ của Breath Again. Mỗi bước tiến nhỏ của bạn sẽ được ghi nhận, mỗi thành tựu của bạn sẽ được tôn vinh và lan tỏa để truyền cảm hứng cho những người khác.
                            </p>
                            <p>
                                Hãy bắt đầu thay đổi vì chính bạn, vì những người thân yêu và vì tương lai không còn khói thuốc. Breath Again – Khơi lại một cuộc sống mới, khỏe mạnh hơn từng ngày cùng bạn!
                            </p>
                        </div>
                        <img
                            className="d-block w-100"
                            src="https://github.com/THQuis/SWP391_Group5/blob/main/image/banner1.3.jpg?raw=true"
                            alt="Breath Again - Quit Smoking Support"
                        />
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features" id="features">
                <div className="container">
                    <h2>Sứ mệnh của chúng tôi</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <h3>💚 Sứ mệnh của chúng tôi</h3>
                            <p>
                                Chúng tôi luôn tin rằng, mỗi hành trình thay đổi bắt đầu từ một quyết tâm nhỏ. Breath Again không chỉ đồng hành cùng bạn trên con đường cai nghiện thuốc lá mà còn là người bạn hỗ trợ, cổ vũ bạn mỗi ngày. Mỗi thành tựu dù nhỏ nhất của bạn đều được ghi nhận, mỗi khó khăn bạn gặp phải đều có cộng đồng chia sẻ và động viên.
                            </p>
                            <p>
                                Đừng để thuốc lá lấy đi sức khỏe, hạnh phúc và những khoảnh khắc quý giá bên gia đình. Hãy để chúng tôi giúp bạn sống khỏe mạnh hơn, gắn kết hơn và truyền cảm hứng cho những người xung quanh. Hãy bắt đầu hành trình mới - vì bạn, vì người thân yêu, và vì cả cộng đồng. Breath Again – nơi mọi thay đổi đều được trân trọng và hỗ trợ không ngừng!
                            </p>
                        </div>
                        <div className="feature-card">
                            <h3>🌱 Chúng tôi đồng hành để bạn:</h3>
                            <ul>
                                <li>Sống khỏe mỗi ngày: Bạn sẽ cảm nhận rõ sự thay đổi tích cực của cơ thể và tinh thần sau từng ngày không còn khói thuốc, để mỗi ngày trôi qua là một ngày khỏe mạnh hơn, tươi mới hơn.</li>
                                <li>Gắn kết lại với người thân: Cai nghiện thuốc lá không chỉ vì chính bạn mà còn cho những người bạn yêu thương. Hãy lấy lại những khoảnh khắc quý giá bên gia đình và bạn bè, cùng nhau tận hưởng cuộc sống trọn vẹn.</li>
                                <li>Truyền cảm hứng cho cộng đồng: Câu chuyện thay đổi của bạn sẽ là động lực mạnh mẽ cho những người xung quanh. Chúng tôi khuyến khích bạn chia sẻ thành tựu, kinh nghiệm và lan tỏa niềm tin vào cuộc sống không khói thuốc.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Support Section */}
            <section className="support" id="support">
                <div className="container">
                    <h2>Ở đây chúng tôi sẽ giúp bạn:</h2>
                    <div className="support-cards">
                        <Link to={ROUTERS.USER.QUITPLAN} className="support-card">
                            <div className="icon">📋</div>
                            <h3>Kế hoạch cai nghiện</h3>
                        </Link>
                        <Link to={ROUTERS.USER.BLOG} className="support-card">
                            <div className="icon">📊</div>
                            <h3>Xem các blogger chia sẻ kinh nghiệm</h3>
                        </Link>
                        <Link to={ROUTERS.USER.COACH} className="support-card">
                            <div className="icon">👥</div>
                            <h3>Giao lưu với chuyên môn</h3>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Rankings Section */}
            <section className="rankings" id="rankings">
                <div className="container">
                    <div className="text-center mb-4">
                        <h2 className="fw-bold" style={{ fontSize: 32, color: "green", marginBottom: 16 }}>
                            🏆 Bảng xếp hạng thành viên
                        </h2>
                        <p className="text-muted" style={{ fontSize: 18 }}>
                            {getRankingTitle(activeRankingType)}
                        </p>
                    </div>

                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <div className="card" style={{ borderRadius: 18, boxShadow: "0 6px 30px rgba(0,0,0,0.08)", border: "none" }}>
                                <div className="card-body" style={{ padding: "32px" }}>
                                    {/* Top 3 Rankings */}
                                    {loading ? (
                                        <div className="text-center py-5">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Đang tải...</span>
                                            </div>
                                            <p className="mt-2 text-muted">Đang tải bảng xếp hạng...</p>
                                        </div>
                                    ) : topUsers.length === 0 ? (
                                        <div className="text-center py-5">
                                            <div style={{ fontSize: 48, opacity: 0.3 }}>🏆</div>
                                            <h6 className="text-muted mt-2">Chưa có dữ liệu bảng xếp hạng</h6>
                                            <p className="text-muted mb-0" style={{ fontSize: 14 }}>
                                                Hãy tham gia và trở thành người đầu tiên!
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="row text-center mb-4">
                                            {/* 2nd Place */}
                                            <div className="col-4">
                                                <div className="mb-3">
                                                    <div className="position-relative d-inline-block">
                                                        {topUsers[1]?.profilePicture ? (
                                                            <div className="position-relative">
                                                                <Image
                                                                    src={topUsers[1].profilePicture}
                                                                    alt={topUsers[1].fullName}
                                                                    roundedCircle
                                                                    width={80}
                                                                    height={80}
                                                                    style={{
                                                                        objectFit: "cover",
                                                                        border: "3px solid #6c757d"
                                                                    }}
                                                                />
                                                                <div
                                                                    className="position-absolute d-flex align-items-center justify-content-center text-white fw-bold"
                                                                    style={{
                                                                        top: '-5px',
                                                                        left: '-5px',
                                                                        width: 30,
                                                                        height: 30,
                                                                        backgroundColor: '#6c757d',
                                                                        borderRadius: '50%',
                                                                        fontSize: 14,
                                                                        border: '2px solid white'
                                                                    }}
                                                                >
                                                                    #2
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div
                                                                className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white fw-bold"
                                                                style={{ width: 80, height: 80, fontSize: 24 }}
                                                            >
                                                                #2
                                                            </div>
                                                        )}
                                                        <span
                                                            className="position-absolute top-0 start-100 translate-middle badge"
                                                            style={{ fontSize: 20 }}
                                                        >
                                                            🥈
                                                        </span>
                                                    </div>                                    <h6 className="mt-2 fw-bold">
                                                        {topUsers[1]?.fullName || "Chưa có dữ liệu"}
                                                    </h6>
                                                    <p className="text-muted mb-0" style={{ fontSize: 14 }}>
                                                        {topUsers[1] ? getRankingValue(topUsers[1], activeRankingType) : 'Chưa có dữ liệu'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* 1st Place */}
                                            <div className="col-4">
                                                <div className="mb-3">
                                                    <div className="position-relative d-inline-block">
                                                        {topUsers[0]?.profilePicture ? (
                                                            <div className="position-relative">
                                                                <Image
                                                                    src={topUsers[0].profilePicture}
                                                                    alt={topUsers[0].fullName}
                                                                    roundedCircle
                                                                    width={100}
                                                                    height={100}
                                                                    style={{
                                                                        objectFit: "cover",
                                                                        border: "4px solid #ffd700"
                                                                    }}
                                                                />
                                                                <div
                                                                    className="position-absolute d-flex align-items-center justify-content-center text-white fw-bold"
                                                                    style={{
                                                                        top: '-8px',
                                                                        left: '-8px',
                                                                        width: 35,
                                                                        height: 35,
                                                                        background: "linear-gradient(45deg, #ffd700, #ffed4e)",
                                                                        borderRadius: '50%',
                                                                        fontSize: 16,
                                                                        border: '3px solid white'
                                                                    }}
                                                                >
                                                                    #1
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div
                                                                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                                                                style={{
                                                                    width: 100,
                                                                    height: 100,
                                                                    fontSize: 28,
                                                                    background: "linear-gradient(45deg, #ffd700, #ffed4e)"
                                                                }}
                                                            >
                                                                #1
                                                            </div>
                                                        )}
                                                        <span
                                                            className="position-absolute top-0 start-100 translate-middle badge"
                                                            style={{ fontSize: 24 }}
                                                        >
                                                            🏆
                                                        </span>
                                                    </div>                                    <h5 className="mt-2 fw-bold text-warning">
                                                        {topUsers[0]?.fullName || "Chưa có dữ liệu"}
                                                    </h5>
                                                    <p className="text-muted mb-0" style={{ fontSize: 16 }}>
                                                        {topUsers[0] ? getRankingValue(topUsers[0], activeRankingType) : 'Chưa có dữ liệu'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* 3rd Place */}
                                            <div className="col-4">
                                                <div className="mb-3">
                                                    <div className="position-relative d-inline-block">
                                                        {topUsers[2]?.profilePicture ? (
                                                            <div className="position-relative">
                                                                <Image
                                                                    src={topUsers[2].profilePicture}
                                                                    alt={topUsers[2].fullName}
                                                                    roundedCircle
                                                                    width={80}
                                                                    height={80}
                                                                    style={{
                                                                        objectFit: "cover",
                                                                        border: "3px solid #f0ad4e"
                                                                    }}
                                                                />
                                                                <div
                                                                    className="position-absolute d-flex align-items-center justify-content-center text-white fw-bold"
                                                                    style={{
                                                                        top: '-5px',
                                                                        left: '-5px',
                                                                        width: 30,
                                                                        height: 30,
                                                                        backgroundColor: '#f0ad4e',
                                                                        borderRadius: '50%',
                                                                        fontSize: 14,
                                                                        border: '2px solid white'
                                                                    }}
                                                                >
                                                                    #3
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div
                                                                className="rounded-circle bg-warning d-flex align-items-center justify-content-center text-white fw-bold"
                                                                style={{ width: 80, height: 80, fontSize: 24 }}
                                                            >
                                                                #3
                                                            </div>
                                                        )}
                                                        <span
                                                            className="position-absolute top-0 start-100 translate-middle badge"
                                                            style={{ fontSize: 20 }}
                                                        >
                                                            🥉
                                                        </span>
                                                    </div>
                                                    <h6 className="mt-2 fw-bold">
                                                        {topUsers[2]?.fullName || "Chưa có dữ liệu"}
                                                    </h6>
                                                    <p className="text-muted mb-0" style={{ fontSize: 14 }}>
                                                        {topUsers[2] ? getRankingValue(topUsers[2], activeRankingType) : 'Chưa có dữ liệu'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Stats Cards - Only 3 buttons now */}
                                    <div className="row g-3 mb-4 justify-content-center">
                                        <div className="col-6 col-md-4">
                                            <button
                                                className={`btn w-100 text-center p-3 rounded-3 border-0 ${activeRankingType === 'smoke-free-days' ? 'btn-success' : 'btn-light'}`}
                                                onClick={() => setActiveRankingType('smoke-free-days')}
                                                style={{
                                                    transition: 'all 0.3s ease',
                                                    transform: activeRankingType === 'smoke-free-days' ? 'scale(1.05)' : 'scale(1)'
                                                }}
                                            >
                                                <div style={{ fontSize: 20 }}>🚭</div>
                                                <small className={activeRankingType === 'smoke-free-days' ? 'text-white' : 'text-muted'}>
                                                    Ngày không hút
                                                </small>
                                            </button>
                                        </div>
                                        <div className="col-6 col-md-4">
                                            <button
                                                className={`btn w-100 text-center p-3 rounded-3 border-0 ${activeRankingType === 'money-saved' ? 'btn-success' : 'btn-light'}`}
                                                onClick={() => setActiveRankingType('money-saved')}
                                                style={{
                                                    transition: 'all 0.3s ease',
                                                    transform: activeRankingType === 'money-saved' ? 'scale(1.05)' : 'scale(1)'
                                                }}
                                            >
                                                <div style={{ fontSize: 20 }}>💰</div>
                                                <small className={activeRankingType === 'money-saved' ? 'text-white' : 'text-muted'}>
                                                    Tiền tiết kiệm
                                                </small>
                                            </button>
                                        </div>
                                        <div className="col-6 col-md-4">
                                            <button
                                                className={`btn w-100 text-center p-3 rounded-3 border-0 ${activeRankingType === 'cigarettes-dropped' ? 'btn-success' : 'btn-light'}`}
                                                onClick={() => setActiveRankingType('cigarettes-dropped')}
                                                style={{
                                                    transition: 'all 0.3s ease',
                                                    transform: activeRankingType === 'cigarettes-dropped' ? 'scale(1.05)' : 'scale(1)'
                                                }}
                                            >
                                                <div style={{ fontSize: 20 }}>🚬</div>
                                                <small className={activeRankingType === 'cigarettes-dropped' ? 'text-white' : 'text-muted'}>
                                                    Điếu đã bỏ
                                                </small>
                                            </button>
                                        </div>
                                    </div>

                                    {/* View More Button */}
                                    <div className="text-center">
                                        <Link
                                            to={ROUTERS.USER.RANKING}
                                            className="btn btn-primary px-4 py-2"
                                            style={{
                                                borderRadius: 25,
                                                background: "linear-gradient(90deg, #2563eb 60%, #38bdf8 100%)",
                                                border: "none",
                                                fontSize: 16,
                                                fontWeight: "500"
                                            }}
                                        >
                                            Xem bảng xếp hạng đầy đủ
                                            <i className="ms-2">→</i>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="cta">
                <div className="container">
                    <h2>🌟 Bạn sẵn sàng thở lại chưa?</h2>
                    <p>
                        Hãy để Breath Again đồng hành cùng bạn - không phán xét, không áp buộc,
                        chỉ có hiểu - hỗ trợ - và hy vọng.
                    </p>
                    <p>Vì một ngày không thuốc là một ngày bạn sống trọn vẹn hơn.</p>
                    <button className="cta-button" onClick={handleStartJourney}>
                        Bắt đầu hành trình
                    </button>
                </div>
            </section>
        </div>
    );
};

export default memo(HomePage);