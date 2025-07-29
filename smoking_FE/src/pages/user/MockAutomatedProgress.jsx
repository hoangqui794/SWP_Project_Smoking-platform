import React, { useState, useEffect, useCallback } from 'react'; //useCallback để tránh re-render không cần thiết
import { FaFire, FaSmoking, FaLeaf, FaPiggyBank, FaTrophy, FaChartLine, FaCalendarAlt, FaHeart, FaClock } from "react-icons/fa";
import { Container, Row, Col, Card, Spinner, Button, Modal, Form, OverlayTrigger, Tooltip, ProgressBar, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../../styles/ProgressDashboard.scss';
const ProgressDashboardPage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [relapseCount, setRelapseCount] = useState(1);
    const [progress, setProgress] = useState(null);// // Dữ liệu tiến trình chính
    const [progressHistory, setProgressHistory] = useState([]);// Lịch sử tiến trình hàng ngày
    const [milestoneData, setMilestoneData] = useState(null); // Dữ liệu các cột mốc sức khỏe
    const [milestoneError, setMilestoneError] = useState(null); // Lỗi khi tải cột mốc

    // Thêm state cho timeline UX improvements
    const [showAllMilestones, setShowAllMilestones] = useState(false);// Mở rộng/thu gọn timeline
    const [isTimelineExpanding, setIsTimelineExpanding] = useState(false);
    const [showRelapseModal, setShowRelapseModal] = useState(false);// Hiển thị modal ghi nhận tái nghiện
    // Thêm state cho scroll features
    const [showBackToTop, setShowBackToTop] = useState(false);// Hiển thị nút "Cuộn lên đầu"
    const [scrollProgress, setScrollProgress] = useState(0);// % thanh cuộn trang
    const [timelineSticky, setTimelineSticky] = useState(false);// Trạng thái "dính" của header timeline

    const [showCalendarModal, setShowCalendarModal] = useState(false); // Hiển thị modal Lịch
    const [expandedDate, setExpandedDate] = useState(null);


    // Các biến và state lấy từ Local Storage
    const userId = localStorage.getItem("userId");
    const navigate = useNavigate();

    // Chuyển memberPackage thành state để có thể cập nhật real-time
    const [memberPackage, setMemberPackage] = useState(() => {
        const stored = localStorage.getItem('memberPackage');
        console.log('🔍 Initial memberPackage from localStorage:', stored);
        return stored || 'Basic'; // Default là Basic
    });

    // Debug log mỗi khi component render
    console.log('🎬 MockAutomatedProgress render - memberPackage:', memberPackage);
    console.log('🔍 All localStorage premium info:');
    console.log('  - memberPackage:', localStorage.getItem('memberPackage'));
    console.log('  - isPremium:', localStorage.getItem('isPremium'));
    console.log('  - membershipType:', localStorage.getItem('membershipType'));

    // Debug help: Nếu cần reset để test
    if (window.location.hash === '#reset-premium') {
        console.log('🔄 Resetting premium status for testing...');
        localStorage.setItem('memberPackage', 'Basic');
        setMemberPackage('Basic');
        window.location.hash = '';
    }

    // Thêm useEffect để check và update memberPackage từ localStorage
    //đảm bảo trạng thái memberPackage (gói thành viên) của component luôn được đồng bộ hóa một cách real-time
    useEffect(() => {
        const checkMemberPackage = async () => {
            // Lấy giá trị hiện tại từ localStorage
            const currentPackage = localStorage.getItem('memberPackage');
            // Logic 1: Đồng bộ hóa State
            if (currentPackage && currentPackage !== memberPackage) {
                console.log('🔄 Updating memberPackage:', memberPackage, '->', currentPackage);
                setMemberPackage(currentPackage);
            }

            // Logic 2: Kiểm tra gỡ lỗi (Backup Check)
            // Vì có thể gây ra false positive (set Premium cho user không đủ điều kiện)
            if (currentPackage === 'Basic' || !currentPackage) {
                try {
                    const token = localStorage.getItem('userToken');
                    const response = await fetch('/api/membership/packages', {
                        headers: {
                            "Authorization": "Bearer " + token,
                            "Accept": "*/*",
                        },
                    });

                    if (response.ok) {
                        const data = await response.json();

                        // CHỈ LOG để debug, không tự động sửa
                        if (data.currentPackagePrice && data.currentPackagePrice > 0) {
                            console.log('� DEBUG: User có package trả phí (currentPackagePrice:', data.currentPackagePrice, ') nhưng memberPackage là Basic');
                            console.log('📋 Membership data:', data);
                            console.log('❗ Cần kiểm tra tại sao API login không trả về đúng membership info');
                        } else {
                            console.log('✅ User có Basic package và currentPackagePrice = 0, logic đúng');
                        }
                    }
                } catch (err) {
                    console.log('Cannot check membership status:', err);
                }
            }
        };
        // Check ngay khi mount
        checkMemberPackage();
        // Set up interval để check định kỳ (trong trường hợp localStorage thay đổi)
        const interval = setInterval(checkMemberPackage, 1000);

        // Event listener cho storage changes
        const handleStorageChange = (e) => {
            if (e.key === 'memberPackage') {
                console.log('📦 Storage change detected for memberPackage:', e.newValue);
                setMemberPackage(e.newValue || 'Basic');
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            clearInterval(interval);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [memberPackage]);

    // Fix scroll issue - scroll to top when component mounts
    useEffect(() => {
        // Cuộn lên đầu trang ngay lập tức
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

        // Đảm bảo scroll lại sau khi DOM render xong (fallback)
        const scrollTimeout = setTimeout(() => {
            window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        }, 100);

        return () => clearTimeout(scrollTimeout);
    }, []);

    // Handle scroll events để thêm tính năng scroll auto-appear
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.pageYOffset;// Lấy vị trí scroll hiện tại
            // Tính toán chiều cao tài liệu và phần hiển thị hiện tại
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;// Tính phần trăm đã scroll
            // Update scroll progress
            setScrollProgress(scrollPercent);//State này được dùng để điều khiển chiều rộng của thanh tiến trình ở đầu trang.

            // Show back to top button khi scroll xuống 20% trang
            setShowBackToTop(scrollTop > window.innerHeight * 0.2);// Hiển thị nút "Cuộn lên đầu" khi scroll xuống 20% trang    

            // Check nếu timeline header cần sticky
            const timelineElement = document.querySelector('.health-timeline-card');// Lấy phần tử timeline
            // Kiểm tra vị trí của timelineElement-vị trí và kích thước của phần tử  so với viewport-khung nhìn
            if (timelineElement) {
                const rect = timelineElement.getBoundingClientRect();
                setTimelineSticky(rect.top <= 0 && rect.bottom > 100);
            }
        };

        // Throttle scroll events để tránh quá tải
        // Sử dụng setTimeout để giới hạn tần suất gọi handleScroll
        let timeoutId = null;
        const throttledHandleScroll = () => {
            if (timeoutId === null) {
                timeoutId = setTimeout(() => {
                    handleScroll();
                    timeoutId = null;
                }, 16); // ~60fps
            }
        };

        window.addEventListener('scroll', throttledHandleScroll);
        // Initial call
        handleScroll();
        return () => {
            window.removeEventListener('scroll', throttledHandleScroll);
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, []);

    // Function để scroll smooth lên đầu trang
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    // Function để scroll đến timeline
    const scrollToTimeline = () => {
        const timelineElement = document.querySelector('.health-timeline-card');
        if (timelineElement) {
            timelineElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
                inline: 'nearest'
            });
        }
    };

    // Đưa fetch logic ra ngoài useEffect để tái sử dụng sau khi cập nhật relapse
    const fetchProgressData = useCallback(async () => {
        try {
            const response = await fetch(`/api/AchievementAndProgress/user/ProgressInformation?userId=${userId}`, {
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("userToken"),
                    "accept": "*/*"
                }
            });
            if (!response.ok) {
                // Nếu API trả về lỗi (ví dụ user chưa có plan), không cần báo lỗi mà chỉ cần set progress là null
                setProgress(null);
                return;
            }
            const data = await response.json();

            // Tính toán thời gian chính xác từ ngày bắt đầu
            const startDate = data.startDate ? new Date(data.startDate) : null;
            const currentDate = new Date();
            const timeDiff = startDate ? currentDate - startDate : 0;// Tính thời gian từ ngày bắt đầu đến hiện tại
            const totalMinutes = Math.floor(timeDiff / (1000 * 60)); // Tổng số phút
            const totalHours = Math.floor(timeDiff / (1000 * 60 * 60)); // Tổng số giờ

            // 5. Cập nhật state với dữ liệu đã xử lý
            setProgress({
                achievementsUnlocked: data.totalAchievements,
                cigarettesAvoided: data.totalCigarettesDropped,
                moneySaved: data.totalMoneySaved,
                daysSinceStart: data.totalProgressDays,
                startDate: startDate,
                totalMinutes: totalMinutes,
                totalHours: totalHours
            });
        } catch (error) {
            console.error("Failed to fetch progress data:", error);
            setProgress(null);
        } finally {
            // 7. Luôn luôn tắt trạng thái tải
            setIsLoading(false);
        }
    }, [userId]);

    const fetchProgressHistory = useCallback(async () => {
        try {
            const response = await fetch(`/api/AchievementAndProgress/user/showAllProgress?userId=${userId}`, {
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("userToken"),
                    "accept": "*/*"
                }
            });
            // Nếu API trả về lỗi, không cần báo lỗi mà chỉ cần set progressHistory là mảng rỗng
            const data = await response.json();

            const allProgress = data
                .flatMap(plan => plan.progressList || [])
                .sort((a, b) => new Date(b.progressDate) - new Date(a.progressDate));
            setProgressHistory(allProgress); // Lưu trữ lịch sử tiến trình đã sắp xếp theo ngày giảm dần
        } catch (error) {
            console.error("Failed to fetch progress history:", error);
            setProgressHistory([]);// Nếu có lỗi, set progressHistory là mảng rỗng omponent Calendar khi nhận mảng rỗng này sẽ chỉ đơn giản là không hiển thị icon nào
        }
    }, [userId]);

    // NOTE: API /api/user/milestones/list có vấn đề trả về duplicate data
    // Frontend phải filter để loại bỏ duplicates dựa trên milestoneID
    const fetchMilestoneData = useCallback(async () => {
        try {
            setMilestoneError(null); // Reset lỗi trước khi fetch mới
            const token = localStorage.getItem('userToken');
            const res = await fetch('/api/user/milestones/list', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Không thể tải danh sách cột mốc');
            const progressList = await res.json();
            console.log('MockAutomatedProgress API total items:', progressList.length);

            // Group milestones by groupId, chỉ lấy nhóm sức khỏe (groupId = 2)
            const healthMilestones = progressList.filter(item => item.milestoneGroupID === 2);

            // Kiểm tra duplicate milestones chi tiết cho health group
            const duplicateCheck = {};
            const duplicateDetails = [];
            healthMilestones.forEach((milestone, index) => { //Nó sẽ duyệt qua từng mục một trong danh sách 
                // Tạo key duy nhất cho mỗi milestone dựa trên ID, tên và thời gian
                const key = `${milestone.milestoneID}-${milestone.milestoneName}-${milestone.milestoneTime}${milestone.timeUnit}`;
                if (duplicateCheck[key]) {
                    duplicateDetails.push({ // Lưu thông tin duplicate để debug , Thêm một mục mới vào mảng 
                        duplicate: {
                            index,
                            milestoneID: milestone.milestoneID,
                            userMilestoneID: milestone.userMilestoneID,
                            name: milestone.milestoneName,
                            time: `${milestone.milestoneTime} ${milestone.timeUnit}`,
                            progressPercent: milestone.progressPercent
                        },
                        original: duplicateCheck[key] // Lưu thông tin gốc để so sánh
                    });
                } else {
                    duplicateCheck[key] = {
                        index,
                        milestoneID: milestone.milestoneID,
                        userMilestoneID: milestone.userMilestoneID,
                        name: milestone.milestoneName,
                        time: `${milestone.milestoneTime} ${milestone.timeUnit}`,
                        progressPercent: milestone.progressPercent
                    };
                }
            });
            //giai đoạn "dọn dẹp" và "chuẩn bị" dữ liệu trước khi hiển thị cho người dùng.
            // Kiểm tra duplicate milestones
            const duplicates = healthMilestones.reduce((acc, milestone, index) => { // Duyệt qua từng milestone
                // Kiểm tra xem có healthMilestones nào trùng lặp không
                const duplicateIndex = healthMilestones.findIndex((m, i) =>
                    // Tìm chỉ số của milestone trùng lặp
                    i !== index &&
                    m.milestoneTime === milestone.milestoneTime &&
                    m.timeUnit === milestone.timeUnit &&
                    m.milestoneName === milestone.milestoneName
                );
                if (duplicateIndex !== -1) { // Nếu tìm thấy duplicate
                    acc.push({ // Lưu thông tin duplicate để debug
                        original: { index, id: milestone.milestoneID, name: milestone.milestoneName },
                        duplicate: { index: duplicateIndex, id: healthMilestones[duplicateIndex].milestoneID }
                    });
                }
                return acc;
            }, []);

            if (duplicates.length > 0) {
                console.warn('DEBUG: Found duplicate milestones:', duplicates);
            }

            // Loại bỏ duplicates dựa trên milestoneID (giữ unique milestones)
            const uniqueMilestones = healthMilestones.filter((milestone, index, array) =>
                array.findIndex(m => m.milestoneID === milestone.milestoneID) === index
            );

            // Thêm filter bổ sung để loại bỏ duplicates theo tên và thời gian
            const fullyUniqueMilestones = uniqueMilestones.filter((milestone, index, array) => {
                const key = `${milestone.milestoneName}-${milestone.milestoneTime}-${milestone.timeUnit}`;
                return array.findIndex(m =>
                    `${m.milestoneName}-${m.milestoneTime}-${m.timeUnit}` === key
                ) === index;
            });

            // Sắp xếp theo thời gian để hiển thị timeline (từ 1 phút lên)
            const sortedMilestones = fullyUniqueMilestones.sort((a, b) => {
                const timeA = parseTimeToMinutes(a.milestoneTime, a.timeUnit);
                const timeB = parseTimeToMinutes(b.milestoneTime, b.timeUnit);
                return timeA - timeB;
            });

            setMilestoneData(sortedMilestones);// Lưu trữ dữ liệu cột mốc đã sắp xếp
            // Auto-scroll to timeline nếu có milestone mới được complete
            const completedMilestones = sortedMilestones.filter(m => m.achieved || m.progressPercent >= 100);
            if (completedMilestones.length > 0) {
                // Delay 1 giây để đảm bảo UI đã render xong
                setTimeout(() => { // Thực hiện cuộn sau 1 giây
                    const timelineElement = document.querySelector('.health-timeline-card');// Lấy phần tử timeline
                    if (timelineElement && window.scrollY < timelineElement.offsetTop - 100) {// Chỉ cuộn nếu chưa ở gần timeline
                        timelineElement.scrollIntoView({ // Cuộn đến phần tử timeline
                            behavior: 'smooth', // Cuộn mượt mà
                            block: 'start', // Đặt phần tử ở đầu viewport
                            inline: 'nearest'// Đặt phần tử gần nhất với đầu viewport
                        });
                    }
                }, 1000);
            }
        } catch (err) {
            console.error('Error fetching milestone data:', err);
            setMilestoneError(err.message); // Lưu lỗi để hiển thị cho người dùng
            setMilestoneData([]); // Nếu có lỗi, set milestoneData là mảng rỗng
        }
    }, []);

    // Helper function để chuyển đổi thời gian thành phút
    const parseTimeToMinutes = (time, unit) => { // Hàm này chuyển đổi thời gian từ chuỗi sang số phút
        const timeNum = parseInt(time) || 0; // Chuyển đổi chuỗi sang số, nếu không hợp lệ thì mặc định là 0
        switch (unit?.toLowerCase()) {// Chuyển đổi đơn vị thời gian thành phút
            case 'phút':
            case 'minute':
                return timeNum;
            case 'giờ':
            case 'hour':
                return timeNum * 60;
            case 'ngày':
            case 'day':
                return timeNum * 24 * 60;
            case 'tuần':
            case 'week':
                return timeNum * 7 * 24 * 60;
            case 'tháng':
            case 'month':
                return timeNum * 30 * 24 * 60;
            case 'năm':
            case 'year':
                return timeNum * 365 * 24 * 60;
            default:
                return timeNum;
        }
    };

    // useEffect chỉ gọi khi userId đổi
    useEffect(() => {
        // 1. Báo hiệu bắt đầu tải dữ liệu
        setIsLoading(true);

        // 2. Gọi tất cả các hàm fetch cùng một lúc
        Promise.all([fetchProgressData(), fetchProgressHistory(), fetchMilestoneData()]);

        // 3. Thiết lập tự động cập nhật
        const progressInterval = setInterval(fetchProgressData, 60000); //  Cập nhật tiến trình mỗi phút
        const milestoneInterval = setInterval(fetchMilestoneData, 60000); // Cập nhật cột mốc mỗi phút

        // 4. Hàm dọn dẹp
        return () => {
            clearInterval(progressInterval);
            clearInterval(milestoneInterval);
        };
    }, [userId, fetchProgressData, fetchProgressHistory, fetchMilestoneData]);

    const navigateToCreatePlan = () => {
        navigate('/User/quitplan');
    };

    // Hàm toggle timeline để cải thiện UX khi danh sách dài
    const handleToggleTimeline = async () => {
        setIsTimelineExpanding(true);
        setShowAllMilestones(!showAllMilestones);

        // Scroll smooth để tạo hiệu ứng mượt mà
        setTimeout(() => {
            if (!showAllMilestones) {
                // Khi mở rộng, scroll đến timeline
                const timelineElement = document.querySelector('.health-timeline-card');
                if (timelineElement) {
                    timelineElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                        inline: 'nearest'
                    });
                }
            } else {
                // Khi thu gọn, scroll lên đầu timeline để người dùng thấy overview
                const timelineHeader = document.querySelector('.health-timeline-card .card-header');
                if (timelineHeader) {
                    timelineHeader.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                        inline: 'nearest'
                    });
                }
            }
            setIsTimelineExpanding(false);
        }, 300);
    };

    // Logic để ưu tiên hiển thị milestones quan trọng
    const getDisplayMilestones = (milestones) => {
        if (!milestones || milestones.length === 0) return [];

        const INITIAL_DISPLAY_COUNT = 6; // Số milestone hiển thị ban đầu

        if (showAllMilestones) {
            return milestones; // Hiển thị tất cả
        }

        // Sắp xếp theo độ ưu tiên: đang progress > completed > pending
        const prioritized = [...milestones].sort((a, b) => {
            const aProgressPercent = typeof a.progressPercent === 'number' ? a.progressPercent : 0;
            const bProgressPercent = typeof b.progressPercent === 'number' ? b.progressPercent : 0;

            const aCompleted = a.achieved || aProgressPercent >= 100;
            const bCompleted = b.achieved || bProgressPercent >= 100;

            const aInProgress = !a.achieved && aProgressPercent > 0 && aProgressPercent < 100;
            const bInProgress = !b.achieved && bProgressPercent > 0 && bProgressPercent < 100;

            // Ưu tiên: in-progress > completed > pending
            if (aInProgress && !bInProgress) return -1;
            if (!aInProgress && bInProgress) return 1;
            if (aCompleted && !bCompleted && !bInProgress) return -1;
            if (!aCompleted && bCompleted && !aInProgress) return 1;

            // Nếu cùng loại, sắp xếp theo thời gian
            const aMinutes = parseTimeToMinutes(a.milestoneTime, a.timeUnit);
            const bMinutes = parseTimeToMinutes(b.milestoneTime, b.timeUnit);
            return aMinutes - bMinutes;
        });

        return prioritized.slice(0, INITIAL_DISPLAY_COUNT);
    };

    const handleCloseRelapseModal = () => setShowRelapseModal(false);

    const handleLogRelapse = async () => {
        try {
            const response = await fetch(`/api/AchievementAndProgress/user/UpdateProgress?userId=${userId}`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("userToken")
                },
                body: JSON.stringify({
                    cigarettesSmokedToday: relapseCount
                })
            });

            if (response.ok) {
                toast.info(`Cảm ơn bạn đã ghi nhận. Đừng nản lòng, hãy tiếp tục cố gắng nhé! Đã ghi nhận: ${relapseCount} điếu hôm nay.`);

                setIsLoading(true); // Hiển thị loading trong khi tải lại dữ liệu
                await Promise.all([fetchProgressData(), fetchProgressHistory(), fetchMilestoneData()]);
            } else {
                const errorMessage = await response.text();
                toast.error(`Không thể ghi nhận: ${errorMessage}`);
            }
        } catch (error) {
            console.error("Failed to log relapse:", error);
            toast.error("Đã xảy ra lỗi khi ghi nhận. Vui lòng thử lại sau.");
        } finally {
            handleCloseRelapseModal();
        }
    };


    // THÊM MỚI: Hàm để đánh dấu các ngày có sai sót trên lịch
    const handleDayClick = (date) => {
        const dateString = date.toISOString();
        // Nếu nhấn vào ô đang mở, thì đóng lại. Ngược lại, mở ô mới.
        if (expandedDate === dateString) {
            setExpandedDate(null);
        } else {
            setExpandedDate(dateString);
        }
    };

    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            // --- SỬA LỖI TẠI ĐÂY ---
            // Tạo ngày mới đã được điều chỉnh theo múi giờ địa phương để tránh lỗi `toISOString`
            const userTimezoneOffset = date.getTimezoneOffset() * 60000; // Chuyển phút sang mili giây
            const correctedDate = new Date(date.getTime() - userTimezoneOffset);
            const dateString = correctedDate.toISOString().slice(0, 10);
            // --- KẾT THÚC SỬA LỖI ---

            const historyEntry = progressHistory.find(entry => entry.progressDate.slice(0, 10) === dateString);

            // Kiểm tra xem ô này có đang được mở rộng không
            const isExpanded = expandedDate === date.toISOString();

            // Nếu đang mở rộng và có dữ liệu, hiển thị chi tiết
            if (isExpanded && historyEntry) {
                return (
                    <div className="expanded-content">
                        <div className="expanded-item">
                            <FaSmoking color="#e53e3e" />
                            <span>Đã hút: <strong>{historyEntry.cigarettesSmokedToday || 0} điếu</strong></span>
                        </div>
                        <div className="expanded-item">
                            <FaLeaf color="#28a745" />
                            <span>Bỏ được: <strong>{historyEntry.cigarettesDropped || 0} điếu</strong></span>
                        </div>
                        <div className="expanded-item">
                            <FaPiggyBank color="#f7b801" />
                            <span>Tiết kiệm: <strong>{historyEntry.moneySaved ? historyEntry.moneySaved.toLocaleString('vi-VN') : 0} đ</strong></span>
                        </div>
                    </div>
                );
            }

            // Nếu không mở rộng, chỉ hiển thị icon nếu có sai sót
            if (historyEntry && historyEntry.cigarettesSmokedToday > 0) {
                const renderTooltip = (props) => (
                    <Tooltip id={`tooltip-${dateString}`} {...props} className="calendar-tooltip">
                        Đã hút: {historyEntry.cigarettesSmokedToday} điếu
                    </Tooltip>
                );

                return (
                    <OverlayTrigger placement="top" overlay={renderTooltip}>
                        <div className="relapse-indicator">
                            <FaFire color="#e53e3e" />
                        </div>
                    </OverlayTrigger>
                );
            }
        }
        return <div style={{ height: '24px' }}></div>; // Giữ chỗ để các ô không bị nhảy layout
    };
    const tileClassName = ({ date, view }) => {
        if (view === 'month') {
            const classNames = [];
            // Thêm class nếu là ô đang mở rộng
            if (expandedDate === date.toISOString()) {
                classNames.push('expanded-tile');
            }
            return classNames.join(' ');
        }
        return null;
    }


    if (isLoading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                <Spinner animation="border" variant="success" />
                <h4 className="ms-3">Đang tải tiến trình của bạn...</h4>
            </Container>
        );
    }

    if (!progress) {
        return (
            <div className="no-plan-container">
                <Card className="no-plan-card">
                    <Card.Body className="text-center">
                        <div className="no-plan-icon">📋</div>
                        <h4 className="no-plan-title">Bạn chưa có kế hoạch nào</h4>
                        <p className="no-plan-text">Hãy tạo một kế hoạch để bắt đầu hành trình của bạn!</p>
                        <Button className="create-plan-btn" onClick={navigateToCreatePlan}>Tạo kế hoạch mới</Button>
                    </Card.Body>
                </Card>
            </div>
        );
    }

    return (
        <div className="dashboard-wrapper">
            {/* Header với gradient */}
            <div className="dashboard-header">
                <Container>
                    <Row className="align-items-center">
                        <Col>
                            <h1 className="header-title">Dashboard Tiến Trình</h1>
                            <div className="status-indicator">
                                <div className="status-dot"></div>
                                <span className="status-text">Đang hoạt động</span>
                            </div>
                        </Col>
                        <Col xs="auto">
                            <Badge bg="success" className="px-3 py-2">
                                <FaHeart className="me-1" />
                                {memberPackage || 'Basic'}
                            </Badge>
                        </Col>
                    </Row>
                </Container>
            </div>

            <Container className="dashboard-content">
                {/* Hero Stats Row */}
                <Row className="mb-4">
                    <Col lg={8}>
                        {/* Main Progress Card */}
                        <Card className="main-progress-card h-100">
                            <Card.Body>
                                <div className="progress-card-content">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <div className="journey-header">
                                            <h2 className="progress-subtitle mb-1">🚀 Hành trình của bạn</h2>
                                            <p className="journey-description text-muted mb-0">
                                                Mỗi ngày không hút thuốc là một chiến thắng!
                                            </p>
                                        </div>
                                        <div className="journey-badges">
                                            <Badge bg="light" text="dark" className="px-3 py-2 mb-2 d-block">
                                                <FaClock className="me-1" />
                                                Ngày {progress.daysSinceStart}
                                            </Badge>
                                            <Badge bg="success" className="px-3 py-2 d-block">
                                                <FaHeart className="me-1" />
                                                Sức khỏe cải thiện
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Enhanced Main Circle */}
                                    <div className="main-circle-container">
                                        <div className="main-circle position-relative">
                                            <div className="circle-inner">
                                                <div className="days-number">{progress.daysSinceStart}</div>
                                                <div className="days-label">NGÀY</div>
                                                <div className="circle-subtitle">Không hút thuốc</div>

                                                {/* Thêm thông tin ngày bắt đầu */}
                                                {progress.startDate && (
                                                    <div className="start-date">
                                                        <small className="text-muted">
                                                            Bắt đầu: {new Date(progress.startDate).toLocaleDateString('vi-VN')}
                                                        </small>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Thêm floating badges xung quanh circle */}
                                            <div className="floating-badge floating-badge-1">
                                                <Badge bg="warning" className="pulse-animation">
                                                    <FaTrophy className="me-1" />
                                                    {progress.achievementsUnlocked}
                                                </Badge>
                                            </div>
                                            <div className="floating-badge floating-badge-2">
                                                <Badge bg="info" className="pulse-animation">
                                                    <FaLeaf className="me-1" />
                                                    {Math.floor(progress.daysSinceStart / 7)}w
                                                </Badge>
                                            </div>
                                            <div className="floating-badge floating-badge-3">
                                                <Badge bg="danger" className="pulse-animation">
                                                    <FaHeart className="me-1" />
                                                    {Math.floor(progress.daysSinceStart / 30)}m
                                                </Badge>
                                            </div>

                                            <div className="circle-glow"></div>
                                            {/* Enhanced Progress ring với multiple colors */}
                                            <svg className="progress-ring" width="220" height="220">
                                                <defs>
                                                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                        <stop offset="0%" stopColor="#00b894" />
                                                        <stop offset="50%" stopColor="#55d6aa" />
                                                        <stop offset="100%" stopColor="#74b9ff" />
                                                    </linearGradient>
                                                    <filter id="glow">
                                                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                                        <feMerge>
                                                            <feMergeNode in="coloredBlur" />
                                                            <feMergeNode in="SourceGraphic" />
                                                        </feMerge>
                                                    </filter>
                                                </defs>
                                                <circle
                                                    className="progress-ring-background"
                                                    cx="110"
                                                    cy="110"
                                                    r="100"
                                                />
                                                <circle
                                                    className="progress-ring-progress"
                                                    cx="110"
                                                    cy="110"
                                                    r="100"
                                                    filter="url(#glow)"
                                                    style={{
                                                        strokeDasharray: `${Math.min(progress.daysSinceStart * 2, 628)} 628`,
                                                        strokeDashoffset: 0
                                                    }}
                                                />
                                            </svg>
                                        </div>
                                    </div>                                    {/* Enhanced Quick Stats với thêm thông tin */}
                                    <Row className="quick-stats mt-4">
                                        <Col xs={6} md={4}>
                                            <div className="quick-stat-item">
                                                <div className="stat-icon-mini text-warning">
                                                    <FaTrophy />
                                                </div>
                                                <span className="stat-number">{progress.achievementsUnlocked}</span>
                                                <span className="stat-text">Thành tích</span>
                                            </div>
                                        </Col>
                                        <Col xs={6} md={4}>
                                            <div className="quick-stat-item">
                                                <div className="stat-icon-mini text-info">
                                                    <FaChartLine />
                                                </div>
                                                <span className="stat-number">{Math.floor(progress.daysSinceStart / 7)}</span>
                                                <span className="stat-text">Tuần</span>
                                            </div>
                                        </Col>
                                        <Col xs={6} md={4}>
                                            <div className="quick-stat-item">
                                                <div className="stat-icon-mini text-danger">
                                                    <FaHeart />
                                                </div>
                                                <span className="stat-number">{((progress.daysSinceStart / 365) * 100).toFixed(0)}%</span>
                                                <span className="stat-text">Năm đầu</span>
                                            </div>
                                        </Col>
                                    </Row>

                                    {/* Thêm Journey Milestones */}
                                    <div className="journey-milestones mt-4">
                                        <h6 className="mb-3 d-flex align-items-center">
                                            <FaClock className="me-2 text-primary" />
                                            Mốc thời gian quan trọng
                                        </h6>
                                        <Row className="g-2">
                                            <Col xs={6}>
                                                <div className={`milestone-badge ${progress.daysSinceStart >= 1 ? 'achieved' : 'pending'}`}>
                                                    <div className="milestone-icon">1️⃣</div>
                                                    <div className="milestone-text">
                                                        <div className="milestone-title">Ngày đầu</div>
                                                        <div className="milestone-desc">Bước đầu can đảm</div>
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col xs={6}>
                                                <div className={`milestone-badge ${progress.daysSinceStart >= 7 ? 'achieved' : 'pending'}`}>
                                                    <div className="milestone-icon">🗓️</div>
                                                    <div className="milestone-text">
                                                        <div className="milestone-title">1 tuần</div>
                                                        <div className="milestone-desc">Thói quen mới</div>
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>

                                    {/* Motivational Quote với dynamic content */}
                                    <div className="motivation-quote mt-4 p-3 rounded" style={{
                                        background: 'linear-gradient(135deg, rgba(0, 184, 148, 0.1), rgba(116, 185, 255, 0.1))',
                                        border: '1px solid rgba(0, 184, 148, 0.2)'
                                    }}>
                                        <div className="d-flex align-items-center">
                                            <div className="quote-icon me-3">
                                                {progress.daysSinceStart <= 7 ? "🌱"
                                                    : progress.daysSinceStart <= 30 ? "🌿"
                                                        : progress.daysSinceStart <= 90 ? "🌳"
                                                            : "🏆"}
                                            </div>
                                            <div className="flex-grow-1">
                                                <div className="quote-text fw-semibold text-primary">
                                                    {progress.daysSinceStart <= 7
                                                        ? "Mỗi ngày bạn vượt qua là một chiến thắng!"
                                                        : progress.daysSinceStart <= 30
                                                            ? "Bạn đang làm rất tốt! Tiếp tục như vậy!"
                                                            : progress.daysSinceStart <= 90
                                                                ? "Thật tuyệt vời! Sức khỏe của bạn đang cải thiện đáng kể!"
                                                                : "Bạn là nguồn cảm hứng cho nhiều người! Tuyệt vời!"
                                                    }
                                                </div>
                                                <small className="text-muted">
                                                    Hành trình {progress.daysSinceStart} ngày không hút thuốc
                                                </small>
                                            </div>

                                            {/* Thêm progress percentage */}
                                            <div className="journey-progress-percent">
                                                <div className="text-center">
                                                    <div className="h5 mb-0 text-primary fw-bold">
                                                        {progress.daysSinceStart >= 365 ? "100" : Math.floor((progress.daysSinceStart / 365) * 100)}%
                                                    </div>
                                                    <small className="text-muted">Năm đầu</small>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Thêm fun facts với 2 items */}
                                        <div className="fun-facts mt-3 pt-3" style={{ borderTop: '1px dashed rgba(0, 184, 148, 0.3)' }}>
                                            <Row className="g-3">
                                                <Col xs={6} md={6}>
                                                    <div className="fun-fact-item text-center">
                                                        <div className="fun-fact-number text-info fw-bold">
                                                            {Math.floor(progress.cigarettesAvoided / 20)}
                                                        </div>
                                                        <div className="fun-fact-label">
                                                            <small>Gói tránh được</small>
                                                        </div>
                                                    </div>
                                                </Col>
                                                <Col xs={6} md={6}>
                                                    <div className="fun-fact-item text-center">
                                                        <div className="fun-fact-number text-danger fw-bold">
                                                            {Math.floor(progress.daysSinceStart / 7)}
                                                        </div>
                                                        <div className="fun-fact-label">
                                                            <small>Tuần hoàn thành</small>
                                                        </div>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </div>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg={4}>
                        {/* Achievement Stats */}
                        <div className="stats-grid">
                            <Card className="stat-card achievement-card">
                                <Card.Body className="text-center">
                                    <div className="stat-icon">🏆</div>
                                    <div className="stat-value">{progress.achievementsUnlocked}</div>
                                    <div className="stat-label">Thành tích mở khóa</div>
                                    <ProgressBar
                                        now={Math.min((progress.achievementsUnlocked / 10) * 100, 100)}
                                        className="stat-progress mt-2"
                                        variant="warning"
                                    />
                                </Card.Body>
                            </Card>

                            <Card className="stat-card cigarettes-card">
                                <Card.Body className="text-center">
                                    <div className="stat-icon">🚭</div>
                                    <div className="stat-value">{progress.cigarettesAvoided}</div>
                                    <div className="stat-label">Điếu đã tránh</div>
                                    <div className="stat-description">
                                        Tương đương {Math.floor(progress.cigarettesAvoided / 20)} gói
                                    </div>
                                </Card.Body>
                            </Card>

                            <Card className="stat-card money-card">
                                <Card.Body className="text-center">
                                    <div className="stat-icon">💰</div>
                                    <div className="stat-value">{progress.moneySaved.toLocaleString('vi-VN')}đ</div>
                                    <div className="stat-label">Tiền tiết kiệm</div>
                                </Card.Body>
                            </Card>
                        </div>
                    </Col>
                </Row>

                {/* Health Benefits Timeline */}
                <Card className={`health-timeline-card mb-4 ${timelineSticky ? 'timeline-sticky' : ''}`}>
                    <Card.Header className={`bg-transparent border-0 d-flex justify-content-between align-items-center ${timelineSticky ? 'sticky-header' : ''}`}>
                        <h5 className="mb-0 d-flex align-items-center">
                            <FaHeart className="text-danger me-2" />
                            Lợi ích sức khỏe theo thời gian
                            {milestoneData && milestoneData.length > 6 && (
                                <Badge bg="info" className="ms-2">{milestoneData.length} cột mốc</Badge>
                            )}
                            {timelineSticky && (
                                <Badge bg="success" className="ms-2 pulse-animation">Đang xem</Badge>
                            )}
                        </h5>
                        <div className="d-flex gap-2">
                            {milestoneData && milestoneData.length > 6 && (
                                <Button
                                    variant={showAllMilestones ? "outline-secondary" : "outline-info"}
                                    size="sm"
                                    onClick={handleToggleTimeline}
                                    disabled={isTimelineExpanding}
                                    className="d-flex align-items-center"
                                >
                                    {isTimelineExpanding ? (
                                        <Spinner size="sm" className="me-1" />
                                    ) : (
                                        <FaChartLine className="me-1" />
                                    )}
                                    {showAllMilestones ? 'Thu gọn' : 'Xem tất cả'}
                                </Button>
                            )}
                            <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => navigate('/User/milestones')}
                            >
                                Xem chi tiết
                            </Button>
                            {/* Quick scroll to timeline button */}
                            {!timelineSticky && (
                                <Button
                                    variant="outline-info"
                                    size="sm"
                                    onClick={scrollToTimeline}
                                    className="d-none d-md-block"
                                    title="Cuộn đến timeline"
                                >
                                    <FaClock />
                                </Button>
                            )}
                        </div>
                    </Card.Header>
                    <Card.Body>
                        <div className="health-timeline">
                            {milestoneData && milestoneData.length > 0 ? (
                                <>
                                    {getDisplayMilestones(milestoneData).map((milestone, index) => {
                                        const currentMinutes = progress?.totalMinutes || 0;
                                        const milestoneMinutes = parseTimeToMinutes(milestone.milestoneTime, milestone.timeUnit);

                                        // Sử dụng progressPercent trực tiếp từ API với kiểm tra chặt chẽ
                                        const progressPercent = typeof milestone.progressPercent === 'number' ? milestone.progressPercent : 0;                                    // Determine status based on API data
                                        const isCompleted = milestone.achieved || progressPercent >= 100;
                                        const isInProgress = !milestone.achieved && progressPercent > 0 && progressPercent < 100;
                                        const isPending = !milestone.achieved && progressPercent === 0;

                                        // Debug log để kiểm tra dữ liệu
                                        console.log('Debug milestone calculation:', {
                                            milestoneName: milestone.milestoneName,
                                            currentMinutes,
                                            milestoneMinutes,
                                            apiProgressPercent: milestone.progressPercent,
                                            apiAchieved: milestone.achieved,
                                            finalProgressPercent: progressPercent,
                                            isCompleted,
                                            isInProgress,
                                            isPending
                                        });

                                        // Format time display
                                        const formatTimeDisplay = (time, unit) => {
                                            if (!time || !unit) return 'Đang cập nhật';
                                            const unitLower = unit.toLowerCase();
                                            if (unitLower === 'phút' || unitLower === 'minute') return `${time} phút`;
                                            if (unitLower === 'giờ' || unitLower === 'hour') return `${time} giờ`;
                                            if (unitLower === 'ngày' || unitLower === 'day') return `${time} ngày`;
                                            if (unitLower === 'tuần' || unitLower === 'week') return `${time} tuần`;
                                            if (unitLower === 'tháng' || unitLower === 'month') return `${time} tháng`;
                                            if (unitLower === 'năm' || unitLower === 'year') return `${time} năm`;
                                            return `${time} ${unit}`;
                                        };

                                        // Format current progress display
                                        const formatProgressDisplay = (current, target, unit) => {
                                            if (!unit) return `${current}/${target}`;
                                            const unitLower = unit.toLowerCase();
                                            if (unitLower === 'phút' || unitLower === 'minute') {
                                                return `${current}/${target} phút`;
                                            }
                                            if (unitLower === 'giờ' || unitLower === 'hour') {
                                                const currentHours = Math.floor(current / 60);
                                                return `${currentHours}/${target} giờ`;
                                            }
                                            if (unitLower === 'ngày' || unitLower === 'day') {
                                                const currentDays = Math.floor(current / (24 * 60));
                                                return `${currentDays}/${target} ngày`;
                                            }
                                            if (unitLower === 'tuần' || unitLower === 'week') {
                                                const currentWeeks = Math.floor(current / (7 * 24 * 60));
                                                return `${currentWeeks}/${target} tuần`;
                                            }
                                            if (unitLower === 'tháng' || unitLower === 'month') {
                                                const currentMonths = Math.floor(current / (30 * 24 * 60));
                                                return `${currentMonths}/${target} tháng`;
                                            }
                                            if (unitLower === 'năm' || unitLower === 'year') {
                                                const currentYears = Math.floor(current / (365 * 24 * 60));
                                                return `${currentYears}/${target} năm`;
                                            }
                                            return `${current}/${target}`;
                                        };

                                        return (
                                            <div
                                                key={`milestone-${milestone.milestoneID}-${milestone.userMilestoneID || 'default'}`}
                                                className={`timeline-item ${isCompleted ? 'completed' : isInProgress ? 'in-progress' : ''}`}
                                            >
                                                <div className="timeline-marker"></div>
                                                <div className="timeline-content">
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <h6>{formatTimeDisplay(milestone.milestoneTime, milestone.timeUnit)}</h6>

                                                        {isPending && (
                                                            <Badge bg="warning" text="dark" size="sm">
                                                                Chờ bắt đầu
                                                            </Badge>
                                                        )}

                                                        {isInProgress && (
                                                            <div className="d-flex align-items-center gap-2">
                                                                <Badge bg="info" size="sm">
                                                                    {formatProgressDisplay(currentMinutes, milestone.milestoneTime, milestone.timeUnit)}
                                                                </Badge>
                                                                <small className="text-info">
                                                                    {progressPercent}%
                                                                </small>
                                                            </div>
                                                        )}

                                                        {isCompleted && (
                                                            <Badge bg="success" size="sm">
                                                                ✓ Hoàn thành ({progressPercent}%)
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="mb-0">{milestone.description || milestone.milestoneName}</p>

                                                    {/* Progress bar for in-progress milestones */}
                                                    {isInProgress && (
                                                        <div className="mt-2">
                                                            <ProgressBar
                                                                now={progressPercent}
                                                                className="timeline-progress"
                                                                variant="info"
                                                                style={{ height: '4px' }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Thông báo khi có milestones bị ẩn */}
                                    {milestoneData && milestoneData.length > 6 && !showAllMilestones && (
                                        <div className="text-center py-3 border-top mt-3">
                                            <div className="d-flex align-items-center justify-content-center text-muted">
                                                <FaClock className="me-2" />
                                                <small>
                                                    Đang hiển thị {Math.min(6, milestoneData.length)} cột mốc quan trọng nhất.
                                                    <span className="text-info ms-1">
                                                        Còn {milestoneData.length - 6} cột mốc khác.
                                                    </span>
                                                </small>
                                            </div>
                                            <small className="text-muted">
                                                Nhấn "Xem tất cả" để xem toàn bộ timeline
                                            </small>
                                        </div>
                                    )}
                                </>
                            ) : milestoneError ? (
                                <div className="text-center py-4">
                                    <div className="text-danger mb-2">
                                        <FaHeart size={24} />
                                    </div>
                                    <p className="text-muted mb-2">Không thể tải cột mốc sức khỏe</p>
                                    <small className="text-muted">{milestoneError}</small>
                                    <div className="mt-2">
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={fetchMilestoneData}
                                        >
                                            Thử lại
                                        </Button>
                                    </div>
                                </div>
                            ) : milestoneData === null ? (
                                <div className="text-center py-4">
                                    <Spinner animation="border" size="sm" className="mb-2" />
                                    <p className="text-muted mb-0">Đang tải cột mốc sức khỏe...</p>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <div className="text-info mb-2">
                                        <FaHeart size={24} />
                                    </div>
                                    <p className="text-muted mb-0">Chưa có cột mốc sức khỏe nào</p>
                                </div>
                            )}
                        </div>
                        <div className="mt-3 p-3 bg-light rounded">
                            <div className="row">
                                <div className="col-md-8">
                                    <small className="text-muted d-flex align-items-center">
                                        <FaHeart className="text-danger me-1" />
                                        Xem danh sách đầy đủ các cột mốc sức khỏe và tiến trình chi tiết tại trang "Cột mốc"
                                    </small>
                                </div>
                                <div className="col-md-4 text-end">
                                    <small className="text-info d-flex align-items-center justify-content-end">
                                        <FaClock className="me-1" />
                                        Ngày {progress.daysSinceStart} trong hành trình
                                    </small>
                                </div>
                            </div>
                        </div>
                    </Card.Body>
                </Card>

                {/* Action Buttons Row */}
                <Row className="action-buttons-row">
                    <Col md={6}>
                        <Card className="action-card relapse-card">
                            <Card.Body className="text-center">
                                <div className="action-icon">😔</div>
                                <h6>Gặp khó khăn?</h6>
                                <p className="text-muted mb-3">Đừng lo, hãy ghi nhận để tiếp tục</p>
                                <Button
                                    variant="outline-warning"
                                    className="action-btn"
                                    onClick={() => {
                                        setShowRelapseModal(true);
                                    }}
                                >
                                    <FaSmoking className="me-2" />
                                    Tôi đã hút thuốc hôm nay
                                </Button>
                                {/* {memberPackage === 'Basic' && (
                                    <small className="text-warning d-block mt-2">
                                        Cần gói Premium để sử dụng
                                        <br />
                                    </small>
                                )} */}
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6}>
                        <Card className="action-card calendar-card">
                            <Card.Body className="text-center">
                                <div className="action-icon">📅</div>
                                <h6>Xem nhật ký</h6>
                                <p className="text-muted mb-3">Theo dõi tiến trình hàng ngày</p>
                                <Button
                                    variant="outline-primary"
                                    className="action-btn"
                                    onClick={() => {
                                        if (memberPackage === 'Basic') {
                                            navigate('/User/package');
                                        } else {
                                            setShowCalendarModal(true);
                                        }
                                    }}
                                >
                                    <FaCalendarAlt className="me-2" />
                                    Mở lịch theo dõi
                                </Button>
                                {memberPackage === 'Basic' && (
                                    <small className="text-warning d-block mt-2">
                                        Cần gói Premium để sử dụng
                                    </small>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
            {/* Relapse Modal với thiết kế mới */}
            <Modal
                show={showRelapseModal}
                onHide={handleCloseRelapseModal}
                centered
                className="relapse-modal modern-modal"
            >
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="w-100 text-center">
                        <div className="modal-icon-header">🤗</div>
                        <h4 className="mt-3 mb-0">Một chút chệch hướng?</h4>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="px-4 py-3">
                    <p className="text-center text-muted mb-4">
                        Không sao cả, đây là một phần của quá trình. Việc ghi nhận lại sẽ giúp
                        hệ thống tính toán chính xác hơn cho hành trình của bạn.
                    </p>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold mb-2">
                            Hôm nay bạn đã hút bao nhiêu điếu?
                        </Form.Label>
                        <div className="input-group">
                            <Form.Control
                                type="number"
                                value={relapseCount}
                                onChange={(e) => setRelapseCount(parseInt(e.target.value) || 0)}
                                min="0"
                                className="form-control-lg text-center"
                                placeholder="0"
                            />
                            <span className="input-group-text">điếu</span>
                        </div>
                    </Form.Group>
                    <div className="encouragement-message p-3 bg-light rounded">
                        <FaHeart className="text-danger me-2" />
                        <small className="text-muted">
                            Đừng nản lòng! Mỗi bước đều quan trọng trong hành trình này.
                        </small>
                    </div>
                </Modal.Body>
                <Modal.Footer className="border-0 pt-0">
                    <Button
                        variant="outline-secondary"
                        onClick={handleCloseRelapseModal}
                        className="flex-fill me-2"
                    >
                        Hủy bỏ
                    </Button>
                    <Button
                        variant="success"
                        onClick={handleLogRelapse}
                        className="flex-fill"
                    >
                        <FaSmoking className="me-1" />
                        Ghi nhận
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Calendar Modal với thiết kế cải tiến */}
            <Modal
                show={showCalendarModal}
                onHide={() => setShowCalendarModal(false)}
                centered
                size="xl"
                className="calendar-modal"
            >
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="d-flex align-items-center">
                        <FaCalendarAlt className="text-primary me-2" />
                        Nhật ký Tiến trình
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="calendar-modal-body">
                    <div className="calendar-container">
                        <Calendar
                            tileContent={tileContent}
                            tileClassName={tileClassName}
                            onClickDay={handleDayClick}
                            locale="vi-VN"
                            selectRange={false}
                            value={null}
                        />
                    </div>
                    <div className="calendar-legend mt-4">
                        <div className="d-flex justify-content-center gap-4">
                            <div className="legend-item">
                                <FaFire className="text-danger me-1" />
                                <small>Ngày có ghi nhận hút thuốc</small>
                            </div>
                            <div className="legend-item">
                                <FaLeaf className="text-success me-1" />
                                <small>Ngày thành công</small>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="outline-secondary" onClick={() => setShowCalendarModal(false)}>
                        <FaCalendarAlt className="me-1" />
                        Đóng lịch
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Scroll Progress Indicator */}
            <div
                className="scroll-progress-bar"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: `${scrollProgress}%`,
                    height: '3px',
                    backgroundColor: '#00b894',
                    zIndex: 1000,
                    transition: 'width 0.1s ease-out',
                    background: 'linear-gradient(90deg, #00b894 0%, #55d6aa 100%)'
                }}
            />

            {/* Back to Top Button */}
            {showBackToTop && (
                <Button
                    className="back-to-top-btn"
                    variant="primary"
                    onClick={scrollToTop}
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        transition: 'all 0.3s ease',
                        animation: 'fadeInUp 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.1)';
                        e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                    }}
                    title="Cuộn lên đầu trang"
                >
                    <FaChartLine style={{ transform: 'rotate(-90deg)' }} />
                </Button>
            )}

            {/* Floating Timeline Quick Access */}
            {!timelineSticky && milestoneData && milestoneData.length > 0 && (
                <Button
                    className="timeline-quick-access"
                    variant="outline-info"
                    onClick={scrollToTimeline}
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        left: '20px',
                        borderRadius: '25px',
                        zIndex: 999,
                        display: 'flex',
                        alignItems: 'center',
                        padding: '8px 16px',
                        fontSize: '14px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(23, 162, 184, 0.3)',
                        transition: 'all 0.3s ease',
                        animation: 'slideInLeft 0.5s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.transform = 'translateX(5px)';
                        e.target.style.backgroundColor = 'rgba(23, 162, 184, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.transform = 'translateX(0)';
                        e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                    }}
                    title="Xem timeline sức khỏe"
                >
                    <FaHeart className="me-2 text-danger" />
                    <span>Timeline sức khỏe</span>
                </Button>
            )}
        </div>
    );
};

export default ProgressDashboardPage;