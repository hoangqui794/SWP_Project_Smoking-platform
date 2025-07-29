import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Modal, Container, Form, Button, Card, Row, Col, Spinner, Badge } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/QuitPlanPage.scss";
import { useNavigate } from "react-router-dom";
import { ROUTERS } from "../../utils/router";
import { FaSmokingBan, FaCoins, FaCalendarAlt, FaChartLine, FaHeart, FaTrophy, FaUsers, FaTrash, FaEdit, FaSave, FaClipboardList, FaQuestionCircle, FaInfoCircle, FaTimes, FaPlay, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

// PHẦN 1: Thói quen hiện tại
const QuitPlanHabitSection = ({ habitData, editable, onChange }) => {
    const dailyCost = useMemo(() => {
        if (!habitData || !habitData.cigarettesPerDayAtStart || !habitData.pricePerPackAtStart || !habitData.cigarettesPerPack || habitData.cigarettesPerPack <= 0)
            return 0;
        return (habitData.pricePerPackAtStart / habitData.cigarettesPerPack) * habitData.cigarettesPerDayAtStart;
    }, [habitData]);

    const data = habitData || { cigarettesPerDayAtStart: '', pricePerPackAtStart: '', cigarettesPerPack: '' };

    return (
        <div className="modern-section">
            <div className="section-header">
                <div className="section-icon">
                    <FaSmokingBan />
                </div>
                <div className="section-title">
                    <h3>Thói quen hiện tại của bạn</h3>
                    <p>Hãy chia sẻ về thói quen hút thuốc hiện tại để chúng tôi tạo kế hoạch phù hợp</p>
                </div>
            </div>

            <div className="form-grid">
                <div className="input-group-modern">
                    <label className="input-label">
                        <FaChartLine className="label-icon" />
                        Số điếu mỗi ngày
                    </label>
                    <div className="input-wrapper">
                        <Form.Control
                            type="number"
                            name="cigarettesPerDayAtStart"
                            value={data.cigarettesPerDayAtStart}
                            onChange={onChange}
                            disabled={!editable}
                            min="0"
                            placeholder="Ví dụ: 10"
                            className="modern-input"
                        />
                        <span className="input-unit">điếu/ngày</span>
                    </div>
                </div>

                <div className="input-group-modern">
                    <label className="input-label">
                        <FaSmokingBan className="label-icon" />
                        Số điếu trong 1 gói
                    </label>
                    <div className="input-wrapper">
                        <Form.Control
                            type="number"
                            name="cigarettesPerPack"
                            value={data.cigarettesPerPack}
                            onChange={onChange}
                            disabled={!editable}
                            min="0"
                            placeholder="Ví dụ: 20"
                            className="modern-input"
                        />
                        <span className="input-unit">điếu/gói</span>
                    </div>
                </div>

                <div className="input-group-modern">
                    <label className="input-label">
                        <FaCoins className="label-icon" />
                        Giá tiền 1 gói
                    </label>
                    <div className="input-wrapper">
                        <Form.Control
                            type="number"
                            name="pricePerPackAtStart"
                            value={data.pricePerPackAtStart}
                            onChange={onChange}
                            disabled={!editable}
                            min="0"
                            placeholder="Ví dụ: 25000"
                            className="modern-input"
                        />
                        <span className="input-unit">VNĐ</span>
                    </div>
                </div>
            </div>

            {dailyCost > 0 && (
                <div className="cost-summary">
                    <h4 className="cost-title">
                        <FaCoins className="me-2" />
                        Chi phí ước tính
                    </h4>
                    <div className="cost-grid">
                        <div className="cost-item daily">
                            <div className="cost-period">Mỗi ngày</div>
                            <div className="cost-amount">{dailyCost.toLocaleString("vi-VN")} ₫</div>
                        </div>
                        <div className="cost-item weekly">
                            <div className="cost-period">Mỗi tuần</div>
                            <div className="cost-amount">{(dailyCost * 7).toLocaleString("vi-VN")} ₫</div>
                        </div>
                        <div className="cost-item monthly">
                            <div className="cost-period">Mỗi tháng</div>
                            <div className="cost-amount">{(dailyCost * 30).toLocaleString("vi-VN")} ₫</div>
                        </div>
                        <div className="cost-item yearly">
                            <div className="cost-period">Mỗi năm</div>
                            <div className="cost-amount">{(dailyCost * 365).toLocaleString("vi-VN")} ₫</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// PHẦN 2: Thiết lập mục tiêu
const QuitPlanGoalSection = ({ formData, onChange, editable, showEndDate }) => (
    <div className="modern-section">
        <div className="section-header">
            <div className="section-icon">
                <FaCalendarAlt />
            </div>
            <div className="section-title">
                <h3>Thiết lập mục tiêu</h3>
                <p>Chọn thời gian bắt đầu và thời lượng cai thuốc phù hợp với bạn</p>
            </div>
        </div>

        <div className="goal-form">
            <div className="input-group-modern">
                <label className="input-label required">
                    <FaCalendarAlt className="label-icon" />
                    Ngày bắt đầu cai thuốc
                </label>
                <div className="input-wrapper">
                    <Form.Control
                        type="date"
                        name="startDate"
                        value={formData.startDate || ''}
                        onChange={onChange}
                        disabled={!editable}
                        className="modern-input"
                    />
                </div>
            </div>

            {!showEndDate ? (
                <div className="duration-selector">
                    <label className="input-label">
                        <FaHeart className="label-icon" />
                        Thời gian cai thuốc mục tiêu
                    </label>
                    <div className="duration-options">
                        {[
                            { value: 3, label: '3 tháng', desc: 'Thử thách ngắn hạn', color: 'primary' },
                            { value: 6, label: '6 tháng', desc: 'Cân bằng và thực tế', color: 'success' },
                            { value: 9, label: '9 tháng', desc: 'Thay đổi bền vững', color: 'warning' },
                            { value: 12, label: '1 năm', desc: 'Mục tiêu dài hạn', color: 'danger' }
                        ].map(option => (
                            <div
                                key={option.value}
                                className={`duration-card ${formData.targetDurationMonths === option.value ? 'active' : ''}`}
                                onClick={() => onChange({ target: { name: 'targetDurationMonths', value: option.value } })}
                            >
                                <div className="duration-main">{option.label}</div>
                                <div className="duration-desc">{option.desc}</div>
                                <Form.Check
                                    type="radio"
                                    name="targetDurationMonths"
                                    value={option.value}
                                    checked={formData.targetDurationMonths === option.value}
                                    onChange={onChange}
                                    disabled={!editable}
                                    className="duration-radio"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="input-group-modern">
                    <label className="input-label">
                        <FaCalendarAlt className="label-icon" />
                        Ngày kết thúc dự kiến
                    </label>
                    <div className="input-wrapper">
                        <Form.Control
                            type="date"
                            name="endDate"
                            value={formData.endDate || ''}
                            disabled
                            className="modern-input disabled"
                        />
                        <Badge className="end-date-badge">
                            Tự động tính toán
                        </Badge>
                    </div>
                </div>
            )}
        </div>
    </div>
);
// PHẦN 3: Khảo sát
const QuitPlanSurveySection = ({
    surveyQuestions,
    dynamicAnswers,
    otherTexts,
    onDynamicChange,
    onOtherTextChange,
    editable,
}) => {
    const mapQuestionTypeToInputType = (type) => type === "SingleChoice" ? "radio" : "checkbox";

    return (
        <Card className="thq-card thq-survey-card mb-4">
            <Card.Header className="thq-card__header">
                <div className="d-flex align-items-center">
                    <FaClipboardList className="me-2" />
                    <div>
                        <h4 className="mb-0">Tìm hiểu về bạn</h4>
                        <p className="mb-0 mt-1 opacity-75">Giúp chúng tôi tạo kế hoạch phù hợp nhất</p>
                    </div>
                </div>
            </Card.Header>
            <Card.Body className="thq-card__body">
                <fieldset disabled={!editable}>
                    {surveyQuestions.length > 0 ? (
                        <Row>
                            {surveyQuestions.map((q, index) => {
                                const otherOption = q.answerOptions.find(opt => opt.answerText.toLowerCase().includes('khác'));
                                const isOtherSelected = otherOption && (dynamicAnswers[q.questionID] || []).includes(otherOption.answerOptionID);

                                return (
                                    <Col key={q.questionID} md={6} className="mb-4">
                                        <div className="thq-question-card">
                                            <Form.Group className="thq-form__group">
                                                <Form.Label as="legend" className="thq-form__label d-flex align-items-start">
                                                    <FaQuestionCircle className="me-2 mt-1 text-primary flex-shrink-0" />
                                                    <span>{q.questionText}</span>
                                                </Form.Label>
                                                <div className="thq-options-container">
                                                    {q.answerOptions.map(opt => {
                                                        const isThisTheOtherOption = opt.answerText.toLowerCase().includes('khác');
                                                        const isChecked = (dynamicAnswers[q.questionID] || []).includes(opt.answerOptionID);

                                                        return (
                                                            <div key={opt.answerOptionID} className="thq-option-item">
                                                                <Form.Check
                                                                    className="thq-form__check"
                                                                    type={mapQuestionTypeToInputType(q.questionType)}
                                                                    id={`q-${q.questionID}-a-${opt.answerOptionID}`}
                                                                    label={opt.answerText}
                                                                    name={`question-${q.questionID}`}
                                                                    value={opt.answerOptionID}
                                                                    checked={isChecked}
                                                                    onChange={(e) => onDynamicChange(e, q.questionID, q.questionType, opt.answerText)}
                                                                />
                                                                {isThisTheOtherOption && isOtherSelected && (
                                                                    <div className="thq-other-input-wrapper mt-2">
                                                                        <Form.Control
                                                                            className="thq-form__control thq-other-input"
                                                                            type="text"
                                                                            placeholder="Vui lòng ghi rõ..."
                                                                            value={otherTexts[q.questionID] || ""}
                                                                            onChange={(e) => onOtherTextChange(q.questionID, e.target.value)}
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </Form.Group>
                                        </div>
                                    </Col>
                                );
                            })}
                        </Row>
                    ) : (
                        <div className="text-center py-5">
                            <FaInfoCircle className="text-muted mb-3" size={48} />
                            <p className="text-muted fs-5">Không có dữ liệu khảo sát.</p>
                        </div>
                    )}
                </fieldset>
            </Card.Body>
        </Card>
    );
};

// COMPONENT CHA: QUẢN LÝ TOÀN BỘ TRANG
const QuitPlanPage = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [planCreated, setPlanCreated] = useState(false);
    const [habitData, setHabitData] = useState(null);
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        targetDurationMonths: null,
        dynamicAnswers: {},
        otherTexts: {}
    });
    const [surveyQuestions, setSurveyQuestions] = useState([]);
    const userId = localStorage.getItem("userId");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const loadInitialData = useCallback(async () => {
        setIsLoading(true);
        const token = "Bearer " + localStorage.getItem("userToken");
        const defaultHabitData = { cigarettesPerDayAtStart: '', pricePerPackAtStart: '', cigarettesPerPack: '' };

        try {
            const [planRes, questionsRes, userAnswersRes] = await Promise.all([
                fetch(`/api/QuitPlan/user/${userId}`, { headers: { "Authorization": token } }),
                fetch('/api/Questionnaire/ListQuestion', { headers: { "Authorization": token } }),
                fetch(`/api/Questionnaire/answers-by-user?userId=${userId}`, { headers: { "Authorization": token } })
            ]);

            if (questionsRes.ok) setSurveyQuestions(await questionsRes.json());
            const planDataArray = await planRes.json().catch(() => null);
            const planData = (planDataArray && planDataArray.length > 0) ? planDataArray[0] : null;

            if (planRes.ok && planData && planData.quitPlanID) {
                setHabitData(planData);
                setFormData(prev => ({
                    ...prev,
                    startDate: planData.startDate?.slice(0, 10) || '',
                    endDate: planData.endDate?.slice(0, 10) || '',
                }));
                setPlanCreated(true);
                setEditMode(false);
            } else {
                setHabitData(defaultHabitData);
                setPlanCreated(false);
                setEditMode(true);
            }

            if (userAnswersRes.ok) {
                const savedAnswers = await userAnswersRes.json();
                if (savedAnswers && savedAnswers.length > 0) {
                    const newDynamicAnswers = {};
                    const newOtherTexts = {};
                    savedAnswers.forEach(ans => {
                        if (!newDynamicAnswers[ans.questionID]) newDynamicAnswers[ans.questionID] = [];
                        newDynamicAnswers[ans.questionID].push(ans.answerOptionID);
                        if (ans.customAnswerText) newOtherTexts[ans.questionID] = ans.customAnswerText;
                    });
                    setFormData(prev => ({ ...prev, dynamicAnswers: newDynamicAnswers, otherTexts: newOtherTexts }));
                }
            }
        } catch (error) {
            console.error("Lỗi tải dữ liệu ban đầu:", error);
            setHabitData(defaultHabitData);
            setPlanCreated(false);
            setEditMode(true);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (userId) loadInitialData();
        else {
            setIsLoading(false);
            toast.error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
        }
    }, [userId, loadInitialData]);

    // Auto scroll to top when page loads
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    const handleHabitChange = (e) => {
        const { name, value } = e.target;
        setHabitData(prev => ({ ...prev, [name]: value ? Number(value) : '' }));
    };

    const handleStaticChange = (e) => {
        const { name, value } = e.target;
        // setFormData(prev => ({ ...prev, [name]: value }));
        setFormData(prev => ({
            ...prev,
            [name]: name === "targetDurationMonths" ? Number(value) : value
        }));
    };


    const handleDynamicChange = (e, questionID, questionType, answerText) => {
        const { value, checked } = e.target;
        const answerId = parseInt(value);
        const isOtherOption = answerText.toLowerCase().includes('khác');
        setFormData(prev => {
            const newDynamicAnswers = { ...prev.dynamicAnswers };
            const newOtherTexts = { ...prev.otherTexts };
            let currentAnswers = newDynamicAnswers[questionID] || [];

            if (questionType === 'MultipleChoice') {
                if (isOtherOption && checked) {
                    newDynamicAnswers[questionID] = [answerId];
                } else {
                    const otherOption = surveyQuestions.find(q => q.questionID === questionID)?.answerOptions.find(opt => opt.answerText.toLowerCase().includes('khác'));
                    let answers = [...currentAnswers];
                    if (otherOption) {
                        answers = answers.filter(id => id !== otherOption.answerOptionID);
                        delete newOtherTexts[questionID];
                    }
                    if (checked) { answers.push(answerId); }
                    else { answers = answers.filter(id => id !== answerId); }
                    newDynamicAnswers[questionID] = answers;
                }
            } else {
                newDynamicAnswers[questionID] = [answerId];
                if (!isOtherOption) { delete newOtherTexts[questionID]; }
            }
            return { ...prev, dynamicAnswers: newDynamicAnswers, otherTexts: newOtherTexts };
        });
    };

    const handleOtherTextChange = (questionID, value) => {
        setFormData(prev => ({ ...prev, otherTexts: { ...prev.otherTexts, [questionID]: value } }));
    };

    // SỬA ĐÚNG Ý MUỐN: scroll lên đầu trang ngay khi LƯU thành công (ngay sau toast.success)
    const handleCreateOrUpdate = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const token = "Bearer " + localStorage.getItem('userToken');


        if (!habitData || !habitData.cigarettesPerDayAtStart || habitData.cigarettesPerDayAtStart <= 0 || !habitData.cigarettesPerPack || habitData.cigarettesPerPack <= 0 || !habitData.pricePerPackAtStart || habitData.pricePerPackAtStart <= 0) {
            toast.error("Vui lòng điền đầy đủ thông tin hợp lệ ở Phần 1.");
            setIsSubmitting(false); return;
        }
        if (!formData.startDate) {
            toast.error('Vui lòng chọn ngày bắt đầu cai thuốc!');
            setIsSubmitting(false); return;
        }

        if (!planCreated) {
            try {
                // Tạo kế hoạch cai thuốc mới
                const quitPlanPayload = {
                    userId: parseInt(userId),
                    cigarettesPerDay: habitData.cigarettesPerDayAtStart,
                    pricePerPack: habitData.pricePerPackAtStart,
                    cigarettesPerPack: habitData.cigarettesPerPack,
                    startDate: formData.startDate,
                    targetDurationInMonths: formData.targetDurationMonths, // <-- ĐÚNG tên
                };

                const createPlanRes = await fetch('/api/QuitPlan/CreateQuitPlan', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': token },
                    body: JSON.stringify(quitPlanPayload),
                });

                if (!createPlanRes.ok) throw new Error("Lỗi khi tạo kế hoạch cơ bản.");

                const responseData = await createPlanRes.json();
                setFormData(prev => ({
                    ...prev,
                    endDate: responseData.endDate, // Cập nhật endDate từ API
                }));

                // Xử lý gửi khảo sát sau khi tạo kế hoạch thành công
                const surveyPayload = [];
                Object.entries(formData.dynamicAnswers).forEach(([qId, aIds]) => {
                    aIds.forEach(aId => {
                        const q = surveyQuestions.find(i => i.questionID === qId);
                        const a = q?.answerOptions.find(o => o.answerOptionID === aId);
                        surveyPayload.push({
                            questionID: parseInt(qId, 10),
                            answerOptionID: aId,
                            customAnswerText: a?.answerText.toLowerCase().ncludes('khác') ? (formData.otherTexts[qId] || "") : ""
                        });
                    });
                });
                if (surveyPayload.length > 0) {
                    const submitAnswerRes = await fetch(`/api/Questionnaire/SubmitAnwser?userId=${userId}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': token },
                        body: JSON.stringify(surveyPayload),
                    });
                    if (!submitAnswerRes.ok) throw new Error("Kế hoạch đã tạo nhưng lỗi nộp khảo sát.");
                }

                toast.success("Tạo kế hoạch thành công!");
                await loadInitialData();
            } catch (error) {
                toast.error(error.message);
            } finally {
                setIsSubmitting(false);
            }
        }
        else {// Cập nhật kế hoạch đã có
            try {
                const updatePlanPayload = { // Chỉ cập nhật những trường cần thiết
                    cigarettesPerDayAtStart: habitData.cigarettesPerDayAtStart,
                    pricePerPackAtStart: habitData.pricePerPackAtStart,
                    cigarettesPerPack: habitData.cigarettesPerPack,
                };

                const updateSurveyPayload = [];// Chỉ cập nhật những câu trả lời đã thay đổi
                Object.entries(formData.dynamicAnswers).forEach(([qId, aIds]) => aIds.forEach(aId => {// Tạo mảng các câu trả lời đã chọn
                    const q = surveyQuestions.find(i => i.questionID === qId); // Tìm câu hỏi tương ứng
                    const a = q?.answerOptions.find(o => o.answerOptionID === aId);//   Tìm đáp án tương ứng
                    updateSurveyPayload.push({
                        questionID: parseInt(qId), // Chuyển đổi ID sang số nguyên
                        answerOptionID: aId,// Chỉ lấy ID của đáp án
                        customAnswerText: a?.answerText.toLowerCase().includes('khác') ? (formData.otherTexts[qId] || "") : ""  // Nếu là đáp án "Khác", lấy giá trị từ ô nhập khác
                    });
                }));

                // Thực hiện song song các yêu cầu cập nhật
                const [planUpdateRes, surveyUpdateRes] = await Promise.all([  // Cập nhật kế hoạch cai thuốc
                    fetch(`/api/QuitPlan/UpdateQuitPlan?userId=${userId}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json", "Authorization": token },
                        body: JSON.stringify(updatePlanPayload)
                    }),
                    fetch(`/api/Questionnaire/update-by-user?userId=${userId}`, {// Cập nhật khảo sát
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', 'Authorization': token },
                        body: JSON.stringify(updateSurveyPayload)
                    })
                ]);

                if (!planUpdateRes.ok || !surveyUpdateRes.ok) {// Nếu có lỗi trong bất kỳ yêu cầu nào
                    throw new Error("Có lỗi xảy ra trong quá trình cập nhật. Vui lòng thử lại.");
                }

                toast.success("Cập nhật thành công!");
                await loadInitialData();//  Tải lại dữ liệu mới
            } catch (error) {
                toast.error(error.message || "Đã có lỗi xảy ra khi cập nhật.");
            } finally {
                setIsSubmitting(false);// Đặt trạng thái đang gửi về false
            }
        }
    };
    const handleDeletePlan = async () => {
        setIsSubmitting(true);
        const token = "Bearer " + localStorage.getItem('userToken');
        try {
            const res = await fetch(`/api/QuitPlan/DeleteQuitPlanAndProgress?userId=${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': token }
            });
            if (!res.ok) throw new Error("Xóa kế hoạch thất bại.");
            toast.success("Đã xóa tất cả kế hoạch và tiến trình!");
            await loadInitialData();
        } catch (error) {
            toast.error(error.message || "Đã có lỗi khi xóa kế hoạch.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return (
        <Container className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
            <Spinner animation="border" variant="success" />
            <h4 className="ms-3">Đang tải dữ liệu...</h4>
        </Container>
    );

    return (
        <div className="thq-quit-plan">
            <Container>
                <Row className="justify-content-center">
                    <Col md={11} lg={10} xl={9}>
                        {/* Modern Header */}
                        <div className="thq-header text-center mb-5 pt-4">
                            <div className="thq-header-icon mb-3">
                                <FaSmokingBan size={48} className="text-primary" />
                            </div>
                            <h1 className="thq-header__title">Lập kế hoạch cai thuốc</h1>
                            <p className="thq-header__subtitle">
                                Trả lời các câu hỏi dưới đây để nhận được lộ trình cai thuốc được cá nhân hóa và phù hợp nhất với bạn
                            </p>
                            {planCreated && (
                                <div className="thq-status-badge">
                                    <Badge bg="success" className="px-3 py-2 fs-6">
                                        <FaCheckCircle className="me-2" />
                                        Kế hoạch đã được tạo
                                    </Badge>
                                </div>
                            )}
                        </div>

                        <Form onSubmit={handleCreateOrUpdate} className="thq-form">
                            {/* Progress Steps */}
                            <div className="thq-progress-steps mb-4">
                                <div className="row">
                                    <div className="col-4">
                                        <div className="thq-step active">
                                            <div className="thq-step-icon">
                                                <FaSmokingBan />
                                            </div>
                                            <div className="thq-step-title">Thói quen hiện tại</div>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="thq-step active">
                                            <div className="thq-step-icon">
                                                <FaCalendarAlt />
                                            </div>
                                            <div className="thq-step-title">Mục tiêu</div>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="thq-step active">
                                            <div className="thq-step-icon">
                                                <FaClipboardList />
                                            </div>
                                            <div className="thq-step-title">Khảo sát</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Props được truyền xuống ở đây */}
                            <QuitPlanHabitSection
                                habitData={habitData}
                                onChange={handleHabitChange}
                                editable={editMode || !planCreated}
                            />
                            <QuitPlanGoalSection
                                formData={formData}
                                onChange={handleStaticChange}
                                editable={!planCreated}
                                showEndDate={planCreated}
                            />
                            <QuitPlanSurveySection
                                surveyQuestions={surveyQuestions}
                                dynamicAnswers={formData.dynamicAnswers}
                                otherTexts={formData.otherTexts}
                                onDynamicChange={handleDynamicChange}
                                onOtherTextChange={handleOtherTextChange}
                                editable={editMode || !planCreated}
                            />

                            {/* Action Buttons */}
                            <div className="thq-actions-section">
                                <div className="thq-form__button-wrapper d-grid mb-4">
                                    <Button
                                        className={`thq-button ${planCreated
                                            ? (editMode ? "thq-button--success" : "thq-button--primary")
                                            : "thq-button--success"
                                            }`}
                                        size="lg"
                                        type={planCreated && !editMode ? "button" : "submit"}
                                        onClick={planCreated && !editMode ? (e) => { e.preventDefault(); setEditMode(true); } : undefined}
                                        disabled={isSubmitting || isLoading}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Spinner as="span" animation="border" size="sm" className="thq-spinner me-2" />
                                                Đang xử lý...
                                            </>
                                        ) : (
                                            <>
                                                {planCreated ? (
                                                    editMode ? (
                                                        <>
                                                            <FaSave className="me-2" />
                                                            Lưu thay đổi
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FaEdit className="me-2" />
                                                            Chỉnh sửa kế hoạch
                                                        </>
                                                    )
                                                ) : (
                                                    <>
                                                        <FaPlay className="me-2" />
                                                        Hoàn thành và Tạo kế hoạch
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </Button>
                                </div>

                                {planCreated && !editMode && (
                                    <div className="thq-quick-actions">
                                        <h5 className="text-center mb-4 text-muted">Tiếp tục hành trình của bạn</h5>
                                        <Row className="g-3">
                                            <Col md={6}>
                                                <Button
                                                    variant="warning"
                                                    size="lg"
                                                    className="thq-quick-action-btn w-100"
                                                    onClick={() => {
                                                        navigate(ROUTERS.USER.CHALENGE);
                                                        window.scrollTo({ top: 0, behavior: "smooth" });
                                                    }}
                                                >
                                                    <div className="d-flex align-items-center justify-content-center">
                                                        <FaTrophy className="me-2" size={20} />
                                                        <div>
                                                            <div className="fw-bold">Thử thách</div>
                                                            <small>Thử thách bản thân</small>
                                                        </div>
                                                    </div>
                                                </Button>
                                            </Col>
                                            <Col md={6}>
                                                <Button
                                                    variant="success"
                                                    size="lg"
                                                    className="thq-quick-action-btn w-100"
                                                    onClick={() => {
                                                        navigate(ROUTERS.USER.COACH);
                                                        window.scrollTo({ top: 0, behavior: "smooth" });
                                                    }}
                                                >
                                                    <div className="d-flex align-items-center justify-content-center">
                                                        <FaUsers className="me-2" size={20} />
                                                        <div>
                                                            <div className="fw-bold">Coach</div>
                                                            <small>Chọn huấn luyện viên</small>
                                                        </div>
                                                    </div>
                                                </Button>
                                            </Col>
                                        </Row>
                                        <div className="text-center mt-4">
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                className="thq-delete-btn"
                                                onClick={() => setShowDeleteConfirm(true)}
                                                disabled={isSubmitting || isLoading}
                                            >
                                                <FaTrash className="me-2" />
                                                Xóa kế hoạch
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Form>
                    </Col>
                </Row>
            </Container>
            <Modal
                show={showDeleteConfirm}
                onHide={() => setShowDeleteConfirm(false)}
                centered
                className="thq-delete-modal"
            >
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="d-flex align-items-center text-danger">
                        <FaTrash className="me-2" />
                        Xác nhận xóa kế hoạch
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="py-4">
                    <div className="text-center">
                        <div className="mb-3">
                            <FaExclamationTriangle size={48} className="text-warning" />
                        </div>
                        <h5 className="mb-3">Bạn có chắc chắn muốn xóa?</h5>
                        <p className="text-muted mb-0">
                            Hành động này sẽ xóa toàn bộ kế hoạch cai thuốc và tiến trình của bạn.
                            Dữ liệu này không thể khôi phục được.
                        </p>
                    </div>
                </Modal.Body>
                <Modal.Footer className="border-0 pt-0">
                    <Button
                        variant="outline-secondary"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-4"
                    >
                        <FaTimes className="me-2" />
                        Hủy bỏ
                    </Button>
                    <Button
                        variant="danger"
                        onClick={async () => {
                            setShowDeleteConfirm(false);
                            await handleDeletePlan();
                        }}
                        className="px-4"
                    >
                        <FaTrash className="me-2" />
                        Xóa vĩnh viễn
                    </Button>
                </Modal.Footer>
            </Modal>
            <ToastContainer position="top-right" autoClose={3000} />


        </div>
    );
};

export default QuitPlanPage;