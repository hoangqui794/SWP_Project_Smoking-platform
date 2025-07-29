import { Table, Button, Spinner } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";

const NotificationTable = ({
    notifications,
    loading,
    onEdit,
    onDelete,
    notificationTypeOptions,
    notifyToOptions
}) => (
    loading ? (
        <div className="text-center py-5"><Spinner /></div>
    ) : (
        <Table bordered hover>
            <thead>
                <tr>
                    <th>STT</th>
                    <th>Tên thông báo</th>
                    <th>Nội dung</th>
                    <th>Loại</th>
                    <th>Điều kiện</th>
                    <th>Thông báo cho</th>
                    <th>Ngày gửi</th>
                    <th>Người tạo</th>
                    <th>Hành động</th>
                </tr>
            </thead>
            <tbody>
                {notifications.length === 0 ? (
                    <tr>
                        <td colSpan={9} className="text-center text-secondary">Không có thông báo nào.</td>
                    </tr>
                ) : (
                    notifications.map((item, idx) => (
                        <tr key={item.notificationID}>
                            <td>{idx + 1}</td>
                            <td>{item.notificationName}</td>
                            <td>{item.message}</td>
                            <td>{notificationTypeOptions.find(opt => opt.value === item.notificationType)?.label || item.notificationType}</td>
                            <td>{item.condition}</td>
                            <td>{notifyToOptions.find(opt => opt.value === item.notificationFor)?.label || item.notificationFor}</td>
                            <td>{(item.notificationDate || "").slice(0, 10)}</td>
                            <td>{item.createdBy}</td>
                            <td>
                                <Button variant="link" size="sm" onClick={() => onEdit(item)}><FaEdit /></Button>
                                <Button variant="link" size="sm" onClick={() => onDelete(item.notificationID)}><FaTrash /></Button>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </Table>
    )
);
export default NotificationTable;