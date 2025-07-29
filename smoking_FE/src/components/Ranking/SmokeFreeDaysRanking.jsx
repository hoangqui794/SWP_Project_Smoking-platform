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
import { FaCrown, FaCalendarAlt } from "react-icons/fa";
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

const USERS_PER_PAGE = 10;

function SmokeFreeDaysRanking() {
    const [ranking, setRanking] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchRanking = async () => {
            try {
                setLoading(true);
                const userToken = localStorage.getItem('userToken'); // Lấy token từ localStorage
                const response = await fetch('/api/ranking/top-smoke-free-days?top=50', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userToken}` // Token động từ localStorage
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('Smoke Free Days Ranking API Response:', data);

                    // API trả về đúng format rồi, không cần convert
                    setRanking(data || []);
                } else {
                    console.error('API Error:', response.status, response.statusText);
                    setRanking([]);
                }
            } catch (error) {
                console.error('Network Error:', error);
                setRanking([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRanking();
    }, []);

    // Filter based on search
    const filteredRanking = ranking.filter(u =>
        u.fullName && u.fullName.toLowerCase().includes(search.toLowerCase())
    );

    const maxDays = ranking.length > 0 ? Math.max(...ranking.map(u => u.smokeFreeDays)) : 1;
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
            "Ngày không hút thuốc": user.smokeFreeDays,
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Ngày không hút thuốc");

        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        saveAs(
            new Blob([excelBuffer], { type: "application/octet-stream" }),
            "bang_xep_hang_ngay_khong_hut_thuoc.xlsx"
        );
    };

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h4 className="mb-1">🚭 Bảng xếp hạng theo ngày không hút thuốc</h4>
                    <p className="text-muted mb-0">Những người kiên trì nhất trong việc cai thuốc</p>
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
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3 text-muted">Đang tải...</p>
                </div>
            ) : (
                <>
                    <Table hover responsive style={{ background: "transparent" }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8f9fa' }}>
                                <th className="text-center py-3" style={{ width: 80 }}>#</th>
                                <th className="py-3" style={{ minWidth: 200 }}>Thành viên</th>
                                <th className="text-center py-3" style={{ width: 150 }}>Ngày không hút</th>
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
                                            style={realIdx === 0 ? { background: "#fff8dc" } : {}}
                                        >
                                            <td className="text-center fw-bold py-3" style={{ fontSize: 18 }}>
                                                {getCrown(realIdx)}
                                                {realIdx + 1}
                                            </td>
                                            <td className="py-3">
                                                <div className="d-flex align-items-center gap-3">
                                                    <Image
                                                        src={user.profilePicture || "https://via.placeholder.com/40"}
                                                        alt={user.fullName}
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
                                                            {user.fullName || "Không có tên"}
                                                        </div>
                                                        {realIdx === 0 && (
                                                            <Badge bg="warning" text="dark" className="mt-1">
                                                                👑 Nhà vô địch
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-center py-3">
                                                <div className="d-flex align-items-center justify-content-center gap-2">
                                                    <FaCalendarAlt color="#28a745" size={18} />
                                                    <span className="fw-bold" style={{ fontSize: 18, color: "#28a745" }}>
                                                        {user.smokeFreeDays || 0}
                                                    </span>
                                                    <span className="text-muted">ngày</span>
                                                </div>
                                            </td>
                                            <td className="text-center py-3">
                                                <ProgressBar
                                                    now={maxDays > 0 ? Math.min(100, (user.smokeFreeDays / maxDays) * 100) : 0}
                                                    variant="success"
                                                    style={{ height: 8, minWidth: 120 }}
                                                />
                                                <small className="text-muted mt-1 d-block">
                                                    {maxDays > 0 ? ((user.smokeFreeDays / maxDays) * 100).toFixed(1) : 0}%
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
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = idx + 1;
                                    } else if (page <= 3) {
                                        pageNum = idx + 1;
                                    } else if (page >= totalPages - 2) {
                                        pageNum = totalPages - 4 + idx;
                                    } else {
                                        pageNum = page - 2 + idx;
                                    }

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

export default SmokeFreeDaysRanking;