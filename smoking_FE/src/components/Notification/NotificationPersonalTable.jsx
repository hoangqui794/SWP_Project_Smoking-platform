import { Table, Spinner } from "react-bootstrap";
const NotificationPersonalTable = ({ notifications, loading }) => (
    loading ? (
        <div className="text-center py-5"><Spinner /></div>
    ) : (
        <Table bordered hover>
            <thead>
                <tr>
                    <th>STT</th>
                    <th>Nội dung</th>
                    <th>Loại</th>
                    <th>Ngày gửi</th>
                    <th>Người tạo</th>
                    <th>Role</th>
                </tr>
            </thead>
            <tbody>
                {notifications.length === 0 ? (
                    <tr>
                        <td colSpan={6} className="text-center text-secondary">
                            Không có thông báo nào.
                        </td>
                    </tr>
                ) : (
                    notifications.map((item, idx) => (
                        <tr key={item.notificationID}>
                            <td>{idx + 1}</td>
                            <td>{item.message}</td>
                            <td>{item.notificationType}</td>
                            <td>{(item.notificationDate || "").slice(0, 10)}</td>
                            <td>{item.authorName}</td>
                            <td>{item.roleName}</td>
                        </tr>
                    ))
                )}
            </tbody>
        </Table>
    )
);
export default NotificationPersonalTable;