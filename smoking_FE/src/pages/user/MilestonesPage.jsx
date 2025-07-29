import React, { useState, useEffect, useMemo } from 'react';
import { Container, Card, Spinner, Button, Badge, Modal, Row, Col, ProgressBar } from 'react-bootstrap';
import { FaHeart, FaLeaf, FaTrophy } from 'react-icons/fa';
import '../../styles/MilestonesPage.scss';




// Component Progress Circle để hiển thị %
const ProgressCircle = ({ percentage, isCompleted = false, size = '60px' }) => {
    const color = isCompleted || percentage >= 100 ? '#4caf50' : '#2196f3';
    const background = `conic-gradient(${color} ${percentage}%, #e9ecef ${percentage}%)`;

    return (
        <div
            className="d-flex justify-content-center align-items-center rounded-circle"
            style={{
                width: size,
                height: size,
                background: background,
                flexShrink: 0
            }}
        >
            <div
                className="d-flex justify-content-center align-items-center rounded-circle"
                style={{
                    width: `calc(${size} - 10px)`,
                    height: `calc(${size} - 10px)`,
                    backgroundColor: 'white'
                }}
            >
                <span className="fw-bold" style={{ color: color }}>{percentage}%</span>
            </div>
        </div>
    );
};

// Component mới để xử lý mô tả dài
const MilestoneDescription = ({ text, isExpanded, onToggle }) => {
    const TRUNCATE_LENGTH = 120; // Số ký tự tối đa hiển thị
    const isLongText = text.length > TRUNCATE_LENGTH;

    if (!isLongText) {
        return <p className="text-muted mb-0 small">{text}</p>;
    }

    return (
        <div>
            <p className="text-muted mb-1 small" style={{ transition: 'all 0.3s ease' }}>
                {isExpanded ? text : `${text.substring(0, TRUNCATE_LENGTH)}...`}
            </p>
            <Button variant="link" size="sm" onClick={onToggle} className="p-0 text-decoration-none read-more-btn">
                {isExpanded ? 'Thu gọn' : 'Xem thêm'}
            </Button>
        </div>
    );
};

// Utility function để detect và report API duplicates
const detectAndReportDuplicates = (items, source = 'API') => {
    const duplicateMap = new Map();
    const duplicates = [];

    items.forEach((item, index) => {
        const key = item.milestoneID;
        if (duplicateMap.has(key)) {
            duplicates.push({
                originalIndex: duplicateMap.get(key).index,
                duplicateIndex: index,
                milestoneID: item.milestoneID,
                name: item.milestoneName,
                data: item
            });
        } else {
            duplicateMap.set(key, { index, item });
        }
    });

    if (duplicates.length > 0) {
        console.group(`🚨 ${source} DUPLICATE DETECTION REPORT`);
        console.error(`Found ${duplicates.length} duplicate milestones:`, duplicates);
        console.error('This indicates a BACKEND API issue that should be fixed!');
        console.error('API Endpoint: /api/user/milestones/list');
        console.error('Issue: Same milestoneID returned multiple times');
        console.groupEnd();

        // Có thể gửi report về monitoring system ở đây
        // sendErrorReport('API_DUPLICATES', { source, duplicates });
    }

    return duplicates;
};

const MilestonesPage = () => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState(null);
    const [expandedId, setExpandedId] = useState(null); // State để theo dõi mục được mở rộng

    // State cho Modal
    const [showModal, setShowModal] = useState(false);
    const [selectedMilestone, setSelectedMilestone] = useState(null);

    // Hàm xử lý cho Modal
    const handleShowModal = (milestone) => {
        setSelectedMilestone(milestone);
        setShowModal(true);
    };
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedMilestone(null);
    };

    // Hàm xử lý cho việc mở rộng/thu gọn mô tả
    const handleToggleExpand = (milestoneId) => {
        setExpandedId(prevId => (prevId === milestoneId ? null : milestoneId));
    };

    // Scroll to top when component mounts
    useEffect(() => {
        // Cuộn lên đầu trang ngay lập tức
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

        // Đảm bảo scroll lại sau khi DOM render xong (fallback)
        const scrollTimeout = setTimeout(() => {
            window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        }, 100);

        return () => clearTimeout(scrollTimeout);
    }, []);

    useEffect(() => {
        const fetchMilestones = async () => {
            setIsLoading(true);
            try {
                // NOTE: API /api/user/milestones/list có vấn đề trả về duplicate data
                // Frontend phải filter để loại bỏ duplicates dựa trên milestoneID
                const token = localStorage.getItem('userToken');
                const res = await fetch('/api/user/milestones/list', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('Không thể tải danh sách cột mốc');
                const progressList = await res.json();
                console.log("MilestonesPage API response progressList:", progressList);
                console.log("MilestonesPage API total items:", progressList.length);

                // Sử dụng utility function để detect duplicates
                detectAndReportDuplicates(progressList, 'MilestonesPage API');

                // Loại bỏ duplicates dựa trên milestoneID
                const uniqueProgressList = progressList.filter((item, index, array) =>
                    array.findIndex(m => m.milestoneID === item.milestoneID) === index
                );

                // Thêm filter bổ sung để loại bỏ duplicates theo tên và thời gian (phòng trường hợp milestoneID khác nhau nhưng cùng nội dung)
                const fullyUniqueList = uniqueProgressList.filter((item, index, array) => {
                    const key = `${item.milestoneName}-${item.milestoneTime}-${item.timeUnit}-${item.milestoneGroupID}`;
                    return array.findIndex(m =>
                        `${m.milestoneName}-${m.milestoneTime}-${m.timeUnit}-${m.milestoneGroupID}` === key
                    ) === index;
                });

                if (fullyUniqueList.length !== uniqueProgressList.length) {
                    console.warn('MilestonesPage: Removed additional content duplicates:', {
                        afterIdFilter: uniqueProgressList.length,
                        afterContentFilter: fullyUniqueList.length,
                        additionalRemoved: uniqueProgressList.length - fullyUniqueList.length
                    });
                }

                if (fullyUniqueList.length !== progressList.length) {
                    console.warn('MilestonesPage: Total duplicates removed:', {
                        originalCount: progressList.length,
                        finalUniqueCount: fullyUniqueList.length,
                        totalRemoved: progressList.length - fullyUniqueList.length
                    });
                }

                // Group milestones by groupId
                const groupMap = {};

                // Helper function để convert thời gian thành phút để sắp xếp đúng
                const parseTimeToMinutes = (time, unit) => {
                    const timeNum = parseInt(time) || 0;
                    const unitLower = unit?.toLowerCase() || '';
                    switch (unitLower) {
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

                fullyUniqueList.forEach(item => {
                    console.log(`MilestonesPage milestone ${item.milestoneID}:`, {
                        name: item.milestoneName,
                        progressPercent: item.progressPercent,
                        achievedDate: item.achievedDate,
                        achieved: item.achieved
                    });

                    const groupId = item.milestoneGroupID ?? 0;
                    if (!groupMap[groupId]) {
                        groupMap[groupId] = {
                            groupId,
                            groupName: item.milestoneGroupName ?? "Nhóm khác",
                            milestones: [],
                        }
                    }
                    groupMap[groupId].milestones.push({
                        milestoneId: item.milestoneID,
                        name: item.milestoneName,
                        description: item.description,
                        timeToAchieve: `${item.milestoneTime ?? ''} ${item.timeUnit ?? ''}`.trim(),
                        progressPercent: typeof item.progressPercent === 'number' ? item.progressPercent : 0,
                        achieved: item.achieved || false,
                        // Thêm unique key để tránh React render issues
                        uniqueKey: `${item.milestoneID}-${item.milestoneName.replace(/\s/g, '')}-${item.milestoneTime}${item.timeUnit}`,
                        // Thêm timeInMinutes để sắp xếp
                        timeInMinutes: parseTimeToMinutes(item.milestoneTime, item.timeUnit),
                        rawTime: item.milestoneTime,
                        rawUnit: item.timeUnit
                    });
                });

                // Sắp xếp milestones trong mỗi group theo thời gian từ nhỏ đến lớn
                Object.values(groupMap).forEach(group => {
                    group.milestones.sort((a, b) => a.timeInMinutes - b.timeInMinutes);

                    // Debug log để kiểm tra thứ tự sắp xếp
                    console.log(`📋 ${group.groupName} milestones sorted by time:`,
                        group.milestones.map(m => ({
                            name: m.name,
                            time: m.timeToAchieve,
                            timeInMinutes: m.timeInMinutes,
                            progressPercent: m.progressPercent,
                            completed: m.achieved || m.progressPercent >= 100
                        }))
                    );
                });

                const milestoneGroups = Object.values(groupMap).sort((a, b) => a.groupId - b.groupId);

                // Sử dụng progressPercent >= 100 hoặc achieved để đếm cột mốc hoàn thành
                const achievementsUnlocked = fullyUniqueList.filter(item => {
                    const progressPercent = typeof item.progressPercent === 'number' ? item.progressPercent : 0;
                    const isCompleted = item.achieved || progressPercent >= 100;
                    console.log(`MilestonesPage counting milestone ${item.milestoneID}:`, {
                        name: item.milestoneName,
                        progressPercent,
                        achieved: item.achieved,
                        isCompleted
                    });
                    return isCompleted;
                }).length;

                // Debug: Đếm lại từ grouped data để đảm bảo consistency
                const groupedCompletedCount = milestoneGroups.reduce((total, group) => {
                    return total + group.milestones.filter(m => m.achieved || m.progressPercent >= 100).length;
                }, 0);

                console.log('🔍 MilestonesPage counting verification:', {
                    totalMilestones: fullyUniqueList.length,
                    achievementsUnlockedFromAPI: achievementsUnlocked,
                    achievementsUnlockedFromGroups: groupedCompletedCount,
                    difference: Math.abs(achievementsUnlocked - groupedCompletedCount),
                    percentageComplete: Math.round((achievementsUnlocked / fullyUniqueList.length) * 100)
                });

                // Sử dụng số đếm từ grouped data để đảm bảo consistency
                const finalAchievementsUnlocked = groupedCompletedCount;

                console.log('MilestonesPage final summary calculation:', {
                    totalMilestones: fullyUniqueList.length,
                    finalAchievementsUnlocked,
                    percentageComplete: Math.round((finalAchievementsUnlocked / fullyUniqueList.length) * 100)
                });

                const apiData = {
                    summary: {
                        timeSinceQuit: '', // Có thể lấy từ API khác hoặc bổ sung backend
                        cigarettesAvoided: 0,
                        moneySaved: 0,
                        achievementsUnlocked: finalAchievementsUnlocked,
                    },
                    milestoneGroups
                };

                setData(apiData);
                if (milestoneGroups.length > 0)
                    setActiveFilter(milestoneGroups[0].groupId);
            } catch (err) {
                setData(null);
                alert(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMilestones();
    }, []);
    const filteredMilestones = useMemo(() => {
        if (!data || !activeFilter) return [];
        const activeGroup = data.milestoneGroups.find(group => group.groupId === activeFilter);
        return activeGroup ? activeGroup.milestones : [];
    }, [data, activeFilter]);


    if (isLoading) {
        return (
            <Container className="text-center d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                <div>
                    <Spinner animation="border" variant="success" />
                    <h4 className="ms-3 mt-3">Đang tải các cột mốc...</h4>
                    <p className="text-muted">Chúng tôi đang chuẩn bị hành trình sức khỏe của bạn</p>
                </div>
            </Container>
        );
    }

    if (!data || !data.milestoneGroups || data.milestoneGroups.length === 0) {
        return (
            <Container className="text-center" style={{ minHeight: '50vh', paddingTop: '100px' }}>
                <div>
                    <FaHeart size={48} className="text-muted mb-3" />
                    <h4 className="text-muted mb-3">Chưa có dữ liệu cột mốc</h4>
                    <p className="text-muted">
                        Hệ thống đang chuẩn bị các cột mốc sức khỏe cho bạn.<br />
                        Vui lòng quay lại sau hoặc liên hệ hỗ trợ nếu cần thiết.
                    </p>
                    <Button variant="primary" onClick={() => window.location.reload()}>
                        Thử lại
                    </Button>
                </div>
            </Container>
        );
    }

    return (
        <div className="milestones-page">
            <Container>
                {/* Header với thống kê tổng quan */}
                <div className="mb-4 pt-4">
                    <div className="text-center mb-3">
                        <h2 className="fw-bold text-primary mb-2">Cột mốc sức khỏe</h2>
                        <p className="text-muted">Theo dõi những cải thiện tuyệt vời trong hành trình bỏ thuốc của bạn</p>
                    </div>

                    {/* Thống kê tổng quan */}
                    <Row className="mb-4 stats-overview">
                        <Col md={4}>
                            <Card className="text-center border-0 shadow-sm stat-card success text-white">
                                <Card.Body>
                                    <FaTrophy size={24} className="mb-2" />
                                    <h4 className="mb-1">{data.summary.achievementsUnlocked}</h4>
                                    <small>Cột mốc đã đạt</small>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className="text-center border-0 shadow-sm stat-card info text-white">
                                <Card.Body>
                                    <FaHeart size={24} className="mb-2" />
                                    <h4 className="mb-1">{data.milestoneGroups.reduce((total, group) => total + group.milestones.length, 0)}</h4>
                                    <small>Tổng cột mốc</small>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className="text-center border-0 shadow-sm stat-card warning text-white">
                                <Card.Body>
                                    <FaLeaf size={24} className="mb-2" />
                                    <h4 className="mb-1">{Math.round((data.summary.achievementsUnlocked / data.milestoneGroups.reduce((total, group) => total + group.milestones.length, 0)) * 100)}%</h4>
                                    <small>Tiến độ hoàn thành</small>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </div>

                {/* --- Phần Nút Lọc --- */}
                <div className="text-center mb-4 d-flex flex-wrap justify-content-center">
                    {data.milestoneGroups.map(group => (
                        <Button
                            key={group.groupId}
                            variant={activeFilter === group.groupId ? "primary" : "outline-secondary"}
                            onClick={() => setActiveFilter(group.groupId)}
                            className={`rounded-pill m-1 px-3 group-filter-btn ${activeFilter === group.groupId ? 'active' : ''}`}
                        >
                            <span className="me-2">{group.groupName}</span>
                            <Badge bg={activeFilter === group.groupId ? "light" : "secondary"}
                                text={activeFilter === group.groupId ? "dark" : "light"}>
                                {group.milestones.length}
                            </Badge>
                        </Button>
                    ))}
                </div>

                {/* Progress bar cho group hiện tại */}
                {filteredMilestones.length > 0 && (
                    <Card className="mb-4 border-0 shadow-sm">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <h6 className="mb-0">Tiến độ {data.milestoneGroups.find(g => g.groupId === activeFilter)?.groupName}</h6>
                                <small className="text-muted">
                                    {filteredMilestones.filter(m => m.achieved || m.progressPercent >= 100).length}/{filteredMilestones.length} hoàn thành
                                </small>
                            </div>
                            <ProgressBar
                                now={(filteredMilestones.filter(m => m.achieved || m.progressPercent >= 100).length / filteredMilestones.length) * 100}
                                variant="success"
                                className="mb-0"
                                style={{ height: '8px' }}
                            />
                        </Card.Body>
                    </Card>
                )}

                {/* --- Phần Danh sách Cột mốc --- */}
                <div>
                    {filteredMilestones.map(milestone => (
                        <Card
                            key={milestone.uniqueKey || `fallback-${milestone.milestoneId}`}
                            className={`mb-3 shadow-sm border-0 milestone-card ${milestone.achieved || milestone.progressPercent >= 100 ? 'completed' : ''}`}
                        >
                            <Card.Body
                                className="d-flex align-items-center p-3"
                                onClick={() => handleShowModal(milestone)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className={`progress-circle ${milestone.achieved || milestone.progressPercent >= 100 ? 'completed' : ''}`}>
                                    <ProgressCircle
                                        percentage={milestone.progressPercent}
                                        isCompleted={milestone.achieved || milestone.progressPercent >= 100}
                                    />
                                </div>
                                <div className="flex-grow-1 ms-3">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <h6 className="fw-bold mb-1 d-flex align-items-center">
                                            {(milestone.achieved || milestone.progressPercent >= 100) && <FaTrophy className="text-warning me-2" size={16} />}
                                            {milestone.name}
                                        </h6>
                                        <Badge pill bg={(milestone.achieved || milestone.progressPercent >= 100) ? "success" : "light"}
                                            text={(milestone.achieved || milestone.progressPercent >= 100) ? "light" : "dark"}
                                            className="ms-2">
                                            {milestone.timeToAchieve}
                                        </Badge>
                                    </div>
                                    <div className="milestone-description">
                                        <MilestoneDescription
                                            text={milestone.description}
                                            isExpanded={expandedId === milestone.milestoneId}
                                            onToggle={(e) => {
                                                e.stopPropagation(); // Ngăn modal mở ra khi nhấn nút "Xem thêm"
                                                handleToggleExpand(milestone.milestoneId);
                                            }}
                                        />
                                    </div>
                                </div>
                            </Card.Body>
                            <div style={{
                                height: '4px',
                                width: `${milestone.progressPercent}%`,
                                backgroundColor: (milestone.achieved || milestone.progressPercent >= 100) ? '#28a745' : '#17a2b8',
                                transition: 'all 0.3s ease'
                            }}></div>
                        </Card>
                    ))}
                </div>
            </Container>

            {/* --- Modal hiển thị chi tiết --- */}
            <Modal show={showModal} onHide={handleCloseModal} centered scrollable size="lg" className="modal-milestone">
                {selectedMilestone && (
                    <>
                        <Modal.Header closeButton className="border-0 pb-2">
                            <Modal.Title className="fw-bold h4 d-flex align-items-center">
                                {(selectedMilestone.achieved || selectedMilestone.progressPercent >= 100) && <FaTrophy className="text-warning me-2" />}
                                {selectedMilestone.name}
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="text-center p-4">
                            <div className="mb-4">
                                <ProgressCircle
                                    percentage={selectedMilestone.progressPercent}
                                    isCompleted={selectedMilestone.achieved || selectedMilestone.progressPercent >= 100}
                                    size="120px"
                                />
                            </div>

                            <div className="mb-4">
                                <Badge pill bg={(selectedMilestone.achieved || selectedMilestone.progressPercent >= 100) ? "success" : "primary"} className="px-3 py-2 mb-3">
                                    {(selectedMilestone.achieved || selectedMilestone.progressPercent >= 100) ? "✅ Đã hoàn thành" : `${selectedMilestone.progressPercent}% hoàn thành`}
                                </Badge>
                                <h5 className="mb-3">{selectedMilestone.name}</h5>
                                <p className="text-muted px-3 text-start lead">
                                    {selectedMilestone.description}
                                </p>
                            </div>

                            <div className="row text-center">
                                <div className="col-6">
                                    <div className="p-3 bg-light rounded">
                                        <FaHeart className="text-danger mb-2" size={20} />
                                        <div className="small text-muted">Thời gian</div>
                                        <div className="fw-bold">{selectedMilestone.timeToAchieve}</div>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="p-3 bg-light rounded">
                                        <FaLeaf className="text-success mb-2" size={20} />
                                        <div className="small text-muted">Tiến độ</div>
                                        <div className="fw-bold">{selectedMilestone.progressPercent}%</div>
                                    </div>
                                </div>
                            </div>
                        </Modal.Body>
                        <Modal.Footer className="border-0 pt-0">
                            <Button variant="outline-secondary" onClick={handleCloseModal} className="flex-fill">
                                Đóng
                            </Button>
                            {!(selectedMilestone.achieved || selectedMilestone.progressPercent >= 100) && (
                                <Button variant="primary" onClick={handleCloseModal} className="flex-fill ms-2">
                                    <FaHeart className="me-1" />
                                    Tiếp tục cố gắng
                                </Button>
                            )}
                        </Modal.Footer>
                    </>
                )}
            </Modal>
        </div>
    );
};

export default MilestonesPage;
