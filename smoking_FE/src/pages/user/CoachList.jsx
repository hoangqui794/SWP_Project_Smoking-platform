import React, { useState, useEffect } from "react";
import {
    Container,
    Avatar,
    Typography,
    Chip,
    Button,
    CircularProgress,
    Alert,
    Box,
    Badge,
    Divider,
    Paper,
} from "@mui/material";
import {
    Phone,
    Email,
    PersonAdd,
    Star,
    Verified,
    Support,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/CoachList.module.scss";

// Component avatar với badge coach
const CoachAvatar = ({ src, name, isSelected, size = 100 }) => {
    return (
        <Box className={styles.avatarContainer}>
            <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                    <Box className={styles.coachBadge}>
                        <Support sx={{ fontSize: 20, color: 'white' }} />
                    </Box>
                }
            >
                <Avatar
                    src={src || "https://github.com/THQuis/SWP391_Group5/blob/main/image/user.png?raw=true"}
                    alt={name}
                    className={`${styles.avatar} ${isSelected ? styles.selectedAvatar : ''}`}
                    sx={{ width: size, height: size }}
                />
            </Badge>
        </Box>
    );
};


// Component mô tả có thể cắt ngắn với styling mới
const TruncatedDescription = ({ description, maxLength = 120 }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!description) return null;

    const shouldTruncate = description.length > maxLength;
    const displayText = isExpanded || !shouldTruncate
        ? description
        : `${description.substring(0, maxLength)}...`;

    return (
        <Box className={styles.descriptionContainer}>
            <Typography
                variant="body2"
                className={styles.description}
            >
                {displayText}
            </Typography>
            {shouldTruncate && (
                <Button
                    size="small"
                    variant="text"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={styles.expandButton}
                >
                    {isExpanded ? 'Thu gọn' : 'Xem thêm'}
                </Button>
            )}
        </Box>
    );
};

// Component thông tin liên hệ
const ContactInfo = ({ email, phone }) => {
    return (
        <Box className={styles.contactInfo}>
            <Box className={styles.contactItem}>
                <Email sx={{ fontSize: 16, color: '#666' }} />
                <Typography variant="body2" className={styles.contactText}>
                    {email}
                </Typography>
            </Box>
            {phone && (
                <Box className={styles.contactItem}>
                    <Phone sx={{ fontSize: 16, color: '#666' }} />
                    <Typography variant="body2" className={styles.contactText}>
                        {phone}
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

const fetchCoaches = async (token) => {
    try {
        const response = await fetch("/api/user/coach/list", {
            method: "GET",
            headers: {
                "Accept": "*/*",
                "Authorization": `Bearer ${token}`, // dùng template string
            },
        });
        if (!response.ok) {
            throw new Error("Không thể tải danh sách coach");
        }
        const data = await response.json();
        return data.map((coach) => ({
            UserID: coach.coachId,
            FullName: coach.fullName,
            Email: coach.email,
            PhoneNumber: coach.phone,
            ProfilePicture: coach.profilePicture
                ? (coach.profilePicture.startsWith("data:image/")
                    ? coach.profilePicture
                    : `data:image/png;base64,${coach.profilePicture}`)
                : null,
            Status: "Active",
            Description: coach.description,
            Gender: coach.gender,
            DateOfBirth: coach.dateOfBirth,
            Rating: 5,
            Experience: 10,
        }));
    } catch (err) {
        throw err;
    }
};



const CoachList = () => {
    const [coaches, setCoaches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [myCoach, setMyCoach] = useState(null);
    const [myCoachLoading, setMyCoachLoading] = useState(true);
    const [myCoachError, setMyCoachError] = useState("");
    const navigate = useNavigate();
    const token = localStorage.getItem("userToken");

    // Auto scroll to top when page loads
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    // Lấy coach hiện tại của user
    useEffect(() => {
        const fetchMyCoach = async () => {
            setMyCoachLoading(true);
            setMyCoachError("");
            try {
                const response = await fetch("/api/user/coach/my-coach", {
                    method: "GET",
                    headers: {
                        "Accept": "*/*",
                        "Authorization": `Bearer ${token}`,
                    },
                });
                if (!response.ok) throw new Error("Không thể tải coach hiện tại");
                const coach = await response.json();
                setMyCoach({
                    UserID: coach.coachId,
                    FullName: coach.fullName,
                    Email: coach.email,
                    PhoneNumber: coach.phone,
                    ProfilePicture: coach.profilePicture
                        ? (coach.profilePicture.startsWith("data:image/")
                            ? coach.profilePicture
                            : `data:image/png;base64,${coach.profilePicture}`)
                        : null,
                    Status: "Active",
                    Description: coach.description,
                    Gender: coach.gender,
                    DateOfBirth: coach.dateOfBirth,
                    Rating: 5,
                    Experience: 10,
                });
            } catch (err) {
                setMyCoachError(err.message || "Lỗi khi tải coach hiện tại.");
            } finally {
                setMyCoachLoading(false);
            }
        };
        if (token) fetchMyCoach();
        else setMyCoachError("Bạn chưa đăng nhập hoặc token không hợp lệ.");
    }, [token]);

    // Lấy danh sách coach
    useEffect(() => {
        const getCoaches = async () => {
            setLoading(true);
            setError("");
            try {
                const data = await fetchCoaches(token);
                setCoaches(data);
            } catch (err) {
                setError(err.message || "Lỗi khi tải danh sách coach.");
            } finally {
                setLoading(false);
            }
        };
        if (token) getCoaches();
        else setError("Bạn chưa đăng nhập hoặc token không hợp lệ.");
    }, [token]);

    // Lấy id coach hiện tại
    const selectedCoachId = myCoach?.UserID;

    return (
        <div className={styles.pageContainer}>
            {/* Hero Section */}
            <div className={styles.heroSection}>
                <div className={styles.heroContent}>
                    <h1>🌟 Đội ngũ Chuyên gia tư vấn</h1>
                    <p>Khám phá và kết nối với những chuyên gia tận tâm</p>
                </div>
            </div>

            <Container maxWidth="lg">
                {/* My Coach Section */}
                <div className={styles.myCoachSection}>
                    <h2 className={styles.myCoachTitle}>Chuyên gia tư vấn của tôi</h2>
                    {myCoachLoading ? (
                        <div className={styles.loadingState}>
                            <CircularProgress size={30} />
                            <span>Đang tải coach của bạn...</span>
                        </div>
                    ) : myCoachError ? (
                        <Alert severity="warning" className={styles.alert}>{myCoachError}</Alert>
                    ) : myCoach ? (
                        <div className={styles.coachGrid}>
                            <div className={styles.coachCard} style={{ width: '100%' }}>
                                <div className={styles.cardContent}>
                                    <div className={styles.profileSection}>
                                        <div className={styles.avatarWrapper}>
                                            <img
                                                src={myCoach.ProfilePicture || "https://github.com/THQuis/SWP391_Group5/blob/main/image/user.png?raw=true"}
                                                alt={myCoach.FullName}
                                                className={styles.avatar}
                                            />
                                            <div className={styles.verifiedBadge}>
                                                <Verified />
                                            </div>
                                        </div>
                                        <div className={styles.nameSection}>
                                            <h2>{myCoach.FullName}</h2>
                                            <span className={styles.currentCoach}>
                                                <Star /> Chuyên gia của bạn
                                            </span>
                                        </div>
                                    </div>
                                    <div className={styles.infoSection}>
                                        <div className={styles.contactRow}>
                                            <div className={styles.contactItem}>
                                                <Email className={styles.icon} />
                                                <span>{myCoach.Email}</span>
                                            </div>
                                            <div className={styles.contactItem}>
                                                <Phone className={styles.icon} />
                                                <span>{myCoach.PhoneNumber}</span>
                                            </div>
                                        </div>
                                        <div className={styles.statusRow}>
                                            <Chip
                                                label={myCoach.Status === "Active" ? "Hoạt Động" : "Busy"}
                                                className={myCoach.Status === "Active" ? styles.activeChip : styles.busyChip}
                                            />
                                            <Chip
                                                label="Đã xác minh"
                                                className={styles.verifiedChip}
                                                icon={<Verified />}
                                            />
                                        </div>
                                        <p className={styles.description}>
                                            {myCoach.Description || "Chưa có thông tin giới thiệu."}
                                        </p>
                                    </div>
                                    <div className={styles.actionSection}>
                                        <Button
                                            className={styles.viewProfileBtn}
                                            onClick={() => navigate(`/User/coach/profile/${myCoach.UserID}`)}
                                            startIcon={<PersonAdd />}
                                        >
                                            Xem hồ sơ
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Danh sách coach */}
                <h2 className={styles.listCoachTitle} style={{ marginTop: 32, marginBottom: 16 }}>Danh sách các chuyên gia tư vấn</h2>
                {loading ? (
                    <div className={styles.loadingState}>
                        <CircularProgress size={50} />
                        <p>Đang tải danh sách chuyên gia...</p>
                    </div>
                ) : error ? (
                    <Alert severity="error" className={styles.alert}>
                        {error}
                    </Alert>
                ) : (
                    <div className={styles.coachGrid}>
                        {coaches.map((coach) => (
                            <div key={coach.UserID} className={styles.coachCard}>
                                <div className={styles.cardContent}>
                                    <div className={styles.profileSection}>
                                        <div className={styles.avatarWrapper}>
                                            <img
                                                src={coach.ProfilePicture || "https://github.com/THQuis/SWP391_Group5/blob/main/image/user.png?raw=true"}
                                                alt={coach.FullName}
                                                className={styles.avatar}
                                            />
                                            {coach.UserID === selectedCoachId && (
                                                <div className={styles.verifiedBadge}>
                                                    <Verified />
                                                </div>
                                            )}
                                        </div>
                                        <div className={styles.nameSection}>
                                            <h2>{coach.FullName}</h2>
                                            {coach.UserID === selectedCoachId && (
                                                <span className={styles.currentCoach}>
                                                    <Star /> Chuyên gia của bạn
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className={styles.infoSection}>
                                        <div className={styles.contactRow}>
                                            <div className={styles.contactItem}>
                                                <Email className={styles.icon} />
                                                <span>{coach.Email}</span>
                                            </div>
                                            <div className={styles.contactItem}>
                                                <Phone className={styles.icon} />
                                                <span>{coach.PhoneNumber}</span>
                                            </div>
                                        </div>

                                        <div className={styles.statusRow}>
                                            <Chip
                                                label={coach.Status === "Active" ? "Hoạt Động" : "Busy"}
                                                className={coach.Status === "Active" ? styles.activeChip : styles.busyChip}
                                            />
                                            <Chip
                                                label="Đã xác minh"
                                                className={styles.verifiedChip}
                                                icon={<Verified />}
                                            />
                                        </div>

                                        <p className={styles.description}>
                                            {coach.Description || "Chưa có thông tin giới thiệu."}
                                        </p>
                                    </div>

                                    <div className={styles.actionSection}>
                                        <Button
                                            className={styles.viewProfileBtn}
                                            onClick={() => navigate(`/User/coach/profile/${coach.UserID}`)}
                                            startIcon={<PersonAdd />}
                                        >
                                            Xem hồ sơ
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Container>
        </div>
    );
};

export default CoachList;