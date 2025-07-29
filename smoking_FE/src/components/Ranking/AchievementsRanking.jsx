import React, { useEffect, useState } from "react";
import {
    Table,
    Image,
    Spinner,
    Badge,
    ProgressBar,
    Pagination,
    Form,
    Button,
} from "react-bootstrap";
import { FaCrown, FaTrophy } from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function getCrown(idx) {
    if (idx === 0)
        return (
            <FaCrown
                style={{ color: "#FFD700", fontSize: 22, marginRight: 3 }}
                title="Hạng nhất"
            />
        );
    if (idx === 1)
        return (
            <FaCrown
                style={{ color: "#C0C0C0", fontSize: 20, marginRight: 3 }}
                title="Hạng nhì"
            />
        );
    if (idx === 2)
        return (
            <FaCrown
                style={{ color: "#cd7f32", fontSize: 18, marginRight: 3 }}
                title="Hạng ba"
            />
        );
    return null;
}

const USERS_PER_PAGE = 5;

function AchievementsRanking() {
    const [ranking, setRanking] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchRanking = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/ranking/top-achievements-cigarettes?top=50', {
                    headers: {
                        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiIxIiwidW5pcXVlX25hbWUiOiJDYW8gSOG7r3UgVHLDrSIsImVtYWlsIjoiY2FvaHV1dHJpdGwxMjM0QGdtYWlsLmNvbSIsInJvbGUiOiIxIiwibmJmIjoxNzUxMzc1Njk3LCJleHAiOjE3NTEzNzkyOTcsImlhdCI6MTc1MTM3NTY5NywiaXNzIjoiU21va2luZ0FQSSIsImF1ZCI6IlNtb2tpbmdDbGllbnRzIn0.sgKdFiafEqRonwhg24w5oRaWik8eP1hhQj-LCzH-c0g'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('Achievements Ranking:', data);
                    setRanking(data);
                } else {
                    console.error('Failed to fetch ranking');
                    setRanking([]);
                }
            } catch (error) {
                console.error('Error fetching ranking:', error);
                setRanking([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRanking();
    }, []);

    // Filter based on search
    const filteredRanking = ranking.filter(u =>
        u.fullName.toLowerCase().includes(search.toLowerCase())
    );

    const maxAchievements = ranking.length > 0 ? ranking[0].totalCigarettesByAchievement : 1;
    const totalPages = Math.ceil(filteredRanking.length / USERS_PER_PAGE);
    const currentPageData = filteredRanking.slice((page - 1) * USERS_PER_PAGE, page * USERS_PER_PAGE);

    useEffect(() => {
        setPage(1);
    }, [search]);

    const handlePageChange = (number) => setPage(number);

    const handleExportExcel = () => {
        const data = filteredRanking.map((user, index) => ({
            "STT": index + 1,
            "Tên thành viên": user.fullName,
            "Điểm Achievement": user.totalCigarettesByAchievement,
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Achievement");

        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        saveAs(
            new Blob([excelBuffer], { type: "application/octet-stream" }),
            "bang_xep_hang_achievement.xlsx"
        );
    };

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h4 className="mb-1">🏅 Bảng xếp hạng theo Thành tích thuốc lá</h4>
                    <p className="text-muted mb-0">Những người có nhiều thành tích cao nhất</p>
                </div>
                <div style={{ maxWidth: 300 }}>
                    <Form.Control
                        type="text"
                        placeholder="Tìm kiếm thành viên..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center my-5">
                    <Spinner animation="border" variant="warning" />
                    <p className="mt-3 text-muted">Đang tải ...</p>
                </div>
            ) : (
                <>
                    <Table hover responsive style={{ background: "transparent" }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8f9fa' }}>
                                <th className="text-center py-3" style={{ width: 80 }}>#</th>
                                <th className="py-3" style={{ minWidth: 200 }}>Thành viên</th>
                                <th className="text-center py-3" style={{ width: 180 }}>Điểm Achievement</th>
                                <th className="text-center py-3" style={{ width: 200 }}>Tiến trình</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentPageData.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center text-secondary py-5">
                                        {search ? "Không tìm thấy thành viên nào." : "Chưa có dữ liệu xếp hạng."}
                                    </td>
                                </tr>
                            ) : (
                                currentPageData.map((user, index) => {
                                    const realIdx = (page - 1) * USERS_PER_PAGE + index;
                                    return (
                                        <tr
                                            key={user.userID}
                                            style={realIdx === 0 ? { background: "#fffacd" } : {}}
                                        >
                                            <td className="text-center fw-bold py-3" style={{ fontSize: 18 }}>
                                                {getCrown(realIdx)}
                                                {realIdx + 1}
                                            </td>
                                            <td className="py-3">
                                                <div className="d-flex align-items-center gap-3">
                                                    <Image
                                                        src={user.profilePicture || "https://via.placeholder.com/40"}
                                                        title={user.fullName}
                                                        roundedCircle
                                                        width={realIdx === 0 ? 50 : 40}
                                                        height={realIdx === 0 ? 50 : 40}
                                                        style={{
                                                            objectFit: "cover",
                                                            border: realIdx === 0 ? "3px solid #FFD700" : "2px solid #e9e9e9",
                                                        }}
                                                    />
                                                    <div>
                                                        <div className="fw-semibold" style={{ fontSize: realIdx === 0 ? 18 : 16 }}>
                                                            {user.fullName}
                                                        </div>
                                                        {realIdx === 0 && (
                                                            <Badge bg="warning" text="dark" className="mt-1">
                                                                🏆 Achievement Master
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-center py-3">
                                                <div className="d-flex align-items-center justify-content-center gap-2">
                                                    <FaTrophy color="#ffc107" size={18} />
                                                    <span className="fw-bold" style={{ fontSize: 18, color: "#ffc107" }}>
                                                        {user.totalCigarettesByAchievement}
                                                    </span>
                                                    <span className="text-muted">điểm</span>
                                                </div>
                                            </td>
                                            <td className="text-center py-3">
                                                <ProgressBar
                                                    now={Math.min(100, (user.totalCigarettesByAchievement / maxAchievements) * 100)}
                                                    variant="warning"
                                                    style={{ height: 8, minWidth: 120 }}
                                                />
                                                <small className="text-muted mt-1 d-block">
                                                    {((user.totalCigarettesByAchievement / maxAchievements) * 100).toFixed(1)}%
                                                </small>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </Table>

                    {totalPages > 1 && (
                        <div className="d-flex justify-content-center my-4">
                            <Pagination>
                                <Pagination.First
                                    onClick={() => handlePageChange(1)}
                                    disabled={page === 1}
                                />
                                <Pagination.Prev
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 1}
                                />
                                {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                                    const pageNum = Math.max(1, Math.min(page - 2 + idx, totalPages - 4 + idx));
                                    return (
                                        <Pagination.Item
                                            key={pageNum}
                                            active={page === pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                        >
                                            {pageNum}
                                        </Pagination.Item>
                                    );
                                })}
                                <Pagination.Next
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page === totalPages}
                                />
                                <Pagination.Last
                                    onClick={() => handlePageChange(totalPages)}
                                    disabled={page === totalPages}
                                />
                            </Pagination>
                        </div>
                    )}

                    <div className="d-flex justify-content-between align-items-center mt-4">
                        <div className="text-muted">
                            Hiển thị {((page - 1) * USERS_PER_PAGE) + 1} - {Math.min(page * USERS_PER_PAGE, filteredRanking.length)}
                            trong tổng số {filteredRanking.length} thành viên
                        </div>
                        <Button variant="success" onClick={handleExportExcel} disabled={filteredRanking.length === 0}>
                            📊 Xuất Excel
                        </Button>
                    </div>
                </>
            )}
        </>
    );
}

export default AchievementsRanking;
