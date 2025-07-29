import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Row, Col, InputGroup } from "react-bootstrap";
import { FaPlus, FaEdit, FaTrash, FaMinus } from "react-icons/fa";
import { toast } from "react-toastify";

function QuestionnaireTab() {
    // Toàn bộ state liên quan đến kế hoạch được chuyển vào đây
    const [questions, setQuestions] = useState([]);
    const [planModalShow, setPlanModalShow] = useState(false);
    const [editPlan, setEditPlan] = useState(null); // Lưu object câu hỏi đang sửa
    const [formPlan, setFormPlan] = useState({
        questionText: "",
        questionType: "",
    });
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    // State này giờ sẽ lưu mảng các object: { answerOptionID, answerText, displayOrder }
    const [mcAnswers, setMcAnswers] = useState([]);

    const fetchQuestions = () => {
        const token = localStorage.getItem("userToken");
        if (!token) {
            // Không cần toast ở đây vì useEffect ban đầu sẽ xử lý
            return;
        }
        const apiUrl = "/api/admin/AdminQuestionnaire/all";
        fetch(apiUrl, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.ok ? res.json() : Promise.reject(res))
            .then(data => {
                setQuestions(data); // Cập nhật state với dữ liệu mới nhất
            })
            .catch(error => {
                console.error('Lỗi tải danh sách câu hỏi:', error);
                toast.error('Không thể tải lại danh sách câu hỏi.');
            });
    };


    // useEffect để gọi API lấy danh sách câu hỏi
    // CẬP NHẬT LẠI useEffect NÀY
    useEffect(() => {
        fetchQuestions(); // Chỉ cần gọi hàm đã tạo
    }, []); // Mảng rỗng đảm bảo nó chỉ chạy 1 lần khi component được gắn vào

    // ==== Logic CRUD cho Kế hoạch (Toàn bộ được chuyển vào đây) ====

    const openAddPlanModal = () => {
        setEditPlan(null);
        setFormPlan({ questionText: "", questionType: "" });
        setMcAnswers([{ answerOptionID: 0, answerText: '', displayOrder: 1 }]);
        setPlanModalShow(true);
    };

    const openEditPlanModal = (question) => {
        setEditPlan(question);
        setFormPlan({
            questionText: question.questionText,
            questionType: question.questionType,
        });
        if (question.questionType === 'SingleChoice' || question.questionType === 'MultipleChoice') {
            if (question.answerOptions && question.answerOptions.length > 0) {
                setMcAnswers(JSON.parse(JSON.stringify(question.answerOptions)));
            } else {
                setMcAnswers([{ answerOptionID: 0, answerText: '', displayOrder: 1 }]);
            }
        } else {
            setMcAnswers([]);
        }
        setPlanModalShow(true);
    };

    // ... (Thêm các hàm handle... khác vào đây: handlePlanTypeChange, handleAddMcAnswer, handleRemoveMcAnswer, handleMcAnswerChange, handleDeletePlan, handlePlanModalSave)
    // Tôi sẽ thêm lại bản hoàn chỉnh nhất ở dưới cho bạn copy
    // Xử lý khi người dùng thay đổi Loại đáp án trong dropdown
    const handlePlanTypeChange = (value) => {
        setFormPlan(prevForm => ({ ...prevForm, questionType: value }));
        if (value !== "SingleChoice" && value !== "MultipleChoice") {
            setMcAnswers([]);
        }
        else if (mcAnswers.length === 0) {
            setMcAnswers([{ answerOptionID: 0, answerText: '', displayOrder: 1 }]);
        }
    };

    const handleAddMcAnswer = () => {
        setMcAnswers([...mcAnswers, { answerOptionID: 0, answerText: '', displayOrder: mcAnswers.length + 1 }]);
    };

    const handleRemoveMcAnswer = (idx) => {
        if (mcAnswers.length > 1) {
            const newArr = [...mcAnswers];
            newArr.splice(idx, 1);
            setMcAnswers(newArr);
        }
    };

    const handleMcAnswerChange = (idx, value) => {
        const newArr = [...mcAnswers];
        newArr[idx].answerText = value;
        setMcAnswers(newArr);
    };

    // THAY THẾ TOÀN BỘ HÀM NÀY
    const handlePlanModalSave = () => {
        const token = localStorage.getItem("userToken");
        if (!token) { toast.error("Vui lòng đăng nhập lại."); return; }

        // Validation
        if (!formPlan.questionText.trim() || !formPlan.questionType) {
            toast.error("Vui lòng điền đầy đủ thông tin câu hỏi và loại đáp án.");
            return;
        }

        // Chế độ Sửa
        if (editPlan) {
            const payload = {
                questionID: editPlan.questionID,
                questionText: formPlan.questionText,
                questionType: formPlan.questionType,
                displayOrder: editPlan.displayOrder,
                isActive: editPlan.isActive,
                answerOptions: mcAnswers
            };
            const apiUrl = `/api/admin/AdminQuestionnaire/update/${editPlan.questionID}`;

            fetch(apiUrl, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
                .then(res => res.ok ? res.json() : res.json().then(err => Promise.reject(err)))
                .then(data => {
                    toast.success(data.message || "Cập nhật thành công!");
                    setPlanModalShow(false);
                    fetchQuestions(); // <-- GỌI HÀM LOAD LẠI BẢNG
                })
                .catch(err => { toast.error(err.message || "Cập nhật thất bại."); console.error(err); });
        }
        // Chế độ Thêm mới
        else {
            const newQuestionPayload = {
                questionID: 0,
                questionText: formPlan.questionText,
                questionType: formPlan.questionType,
                displayOrder: questions.length + 1,
                isActive: true,
                answerOptions: mcAnswers.map((ans, index) => ({ ...ans, displayOrder: index + 1 }))
            };
            const apiUrl = `/api/admin/AdminQuestionnaire/create`;

            fetch(apiUrl, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(newQuestionPayload)
            })
                .then(res => res.ok ? res.json() : res.json().then(err => Promise.reject(err)))
                .then(() => { // Không cần dùng data trả về nữa
                    toast.success("Thêm câu hỏi mới thành công!");
                    setPlanModalShow(false);
                    fetchQuestions(); // <-- GỌI HÀM LOAD LẠI BẢNG
                })
                .catch(err => { toast.error(err.message || "Thêm mới thất bại."); console.error(err); });
        }
    };
    // TÌM VÀ THAY THẾ TOÀN BỘ HÀM NÀY

    const handleDeletePlan = (questionId) => {
        setItemToDelete(questionId); // Lưu lại ID của câu hỏi sắp bị xóa
        setShowConfirmModal(true);   // Hiển thị Modal xác nhận
    };
    const handleConfirmDelete = () => {
        const token = localStorage.getItem("userToken");
        if (!token || !itemToDelete) {
            toast.error("Có lỗi xảy ra, không thể xác định mục cần xóa.");
            return;
        }

        const apiUrl = `/api/admin/AdminQuestionnaire/delete/${itemToDelete}`;

        fetch(apiUrl, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                if (response.ok) {
                    return response.json().catch(() => ({ message: "Xóa câu hỏi thành công!" }));
                } else {
                    return response.json().then(err => { throw new Error(err.message || 'Xóa thất bại') });
                }
            })
            .then(data => {
                toast.success(data.message);
                fetchQuestions(); // Tải lại bảng
            })
            .catch(error => {
                console.error('Lỗi khi xóa câu hỏi:', error);
                toast.error(error.message || 'Đã có lỗi xảy ra khi xóa.');
            })
            .finally(() => {
                // Đóng modal và reset ID sau khi hoàn tất
                setShowConfirmModal(false);
                setItemToDelete(null);
            });
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Kế hoạch khảo sát</h5>
                <Button variant="outline-primary" className="rounded-pill px-4" onClick={openAddPlanModal}>
                    Thêm <FaPlus />
                </Button>
            </div>
            <Table bordered hover>
                <thead>
                    <tr className="text-center">
                        <th style={{ width: '5%' }}>questionID</th>
                        <th style={{ width: '35%' }}>Câu hỏi</th>
                        <th style={{ width: '15%' }}>Loại đáp án</th>
                        <th>Đáp án (nếu là trắc nghiệm)</th>
                        <th style={{ width: '10%' }}>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {questions.length > 0 ? questions.map((question, idx) => (
                        <tr key={question.questionID} className="align-middle">
                            <td className="text-center">{question.questionID}</td>
                            <td>{question.questionText}</td>
                            <td className="text-center">{question.questionType}</td>
                            <td>
                                {question.answerOptions && question.answerOptions.length > 0
                                    ? (<ul className="list-unstyled mb-0">{question.answerOptions.map(opt => (<li key={opt.answerOptionID}>- {opt.answerText}</li>))}</ul>)
                                    : "Không có đáp án trắc nghiệm"
                                }
                            </td>
                            <td className="text-center">
                                <Button variant="link" size="sm" title="Sửa" onClick={() => openEditPlanModal(question)}><FaEdit /></Button>
                                <Button variant="link" size="sm" title="Xoá" onClick={() => handleDeletePlan(question.questionID)}><FaTrash /></Button>
                            </td>
                        </tr>
                    )) : (
                        <tr key="no-plan"><td colSpan={5} className="text-center text-secondary">Chưa có dữ liệu hoặc đang tải...</td></tr>
                    )}
                </tbody>
            </Table>

            {/* Modal cho Kế hoạch */}
            <Modal show={planModalShow} onHide={() => setPlanModalShow(false)} centered backdrop="static">
                <Modal.Header className="bg-info-subtle" style={{ borderBottom: 0, justifyContent: "center" }}>
                    <Modal.Title className="w-100 text-center fst-italic">
                        {editPlan ? "Sửa kế hoạch" : "Thêm kế hoạch"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {/* Phần Form JSX đã hoàn thiện từ trước */}
                    <Form>
                        <Form.Group as={Row} className="mb-3 align-items-center"><Form.Label column sm={4} className="fst-italic">Câu hỏi</Form.Label><Col sm={8}><Form.Control as="textarea" rows={3} value={formPlan.questionText} onChange={e => setFormPlan(prev => ({ ...prev, questionText: e.target.value }))} placeholder="Nhập nội dung câu hỏi" /></Col></Form.Group>
                        <Form.Group as={Row} className="mb-3 align-items-center"><Form.Label column sm={4} className="fst-italic">Loại đáp án</Form.Label><Col sm={8}><Form.Select value={formPlan.questionType} onChange={e => handlePlanTypeChange(e.target.value)} className="rounded-pill"><option value="">Chọn loại đáp án</option><option value="SingleChoice">SingleChoice (Chọn 1)</option><option value="MultipleChoice">MultipleChoice (Chọn nhiều)</option><option value="Tự luận">Tự luận</option></Form.Select></Col></Form.Group>
                        {(formPlan.questionType === 'SingleChoice' || formPlan.questionType === 'MultipleChoice') && (<Form.Group as={Row} className="mb-3 align-items-center"><Form.Label column sm={4} className="fst-italic">Các lựa chọn</Form.Label><Col sm={8}>{mcAnswers.map((ans, idx) => (<InputGroup className="mb-2" key={idx}><Form.Control value={ans.answerText} onChange={e => handleMcAnswerChange(idx, e.target.value)} className="rounded-pill" placeholder={`Lựa chọn ${idx + 1}`} /><Button variant="outline-danger" onClick={() => handleRemoveMcAnswer(idx)} disabled={mcAnswers.length === 1} style={{ borderRadius: "50%", marginLeft: 8, padding: "0 10px" }}><FaMinus /></Button></InputGroup>))}<Button variant="success" size="sm" className="rounded-pill fw-semibold mt-1" onClick={handleAddMcAnswer}><FaPlus /> Thêm lựa chọn</Button></Col></Form.Group>)}
                        <div className="d-flex justify-content-end gap-2"><Button variant="secondary" className="rounded-pill px-4 fw-semibold" onClick={() => setPlanModalShow(false)}>Hủy</Button><Button variant="primary" className="rounded-pill px-4 fw-semibold" onClick={handlePlanModalSave}>{editPlan ? "Lưu thay đổi" : "Thêm mới"}</Button></div>
                    </Form>
                </Modal.Body>
            </Modal>
            {/* THÊM MODAL XÁC NHẬN XÓA NÀY VÀO */}
            <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="text-danger">
                        <FaTrash className="me-2" /> Xác nhận xóa
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Bạn có chắc chắn muốn xóa câu hỏi <strong>#{itemToDelete}</strong> không?
                    <br />
                    Hành động này không thể hoàn tác.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
                        Hủy
                    </Button>
                    <Button variant="danger" onClick={handleConfirmDelete}>
                        Xác nhận Xóa
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default QuestionnaireTab;