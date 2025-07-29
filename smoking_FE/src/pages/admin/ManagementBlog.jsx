import React, { useState, useRef } from "react";
import { Tabs, Tab, Button, Modal, Form, Row, Col } from "react-bootstrap";

import BlogManagementTab from "../../components/Blog/BlogManagementTab";
// import ReportedBlogTab from "../../components/Blog/ReportedBlogTab";
import BlogStatsTab from "../../components/Blog/BlogStatsTab";
import PendingBlogTab from "../../components/Blog/PendingBlogTab";

const CATEGORY_OPTIONS = ['Sức khỏe', 'Thể thao', 'Đời sống', 'Thức ăn', 'Giải trí'];

function ManagementBlog() {
    const [activeTab, setActiveTab] = useState("milestone");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);

    const [newBlog, setNewBlog] = useState({
        title: "",
        content: "",
        authorId: "", // hoặc lấy từ localStorage nếu có
        categoryName: CATEGORY_OPTIONS[0],
        blogType: ""
    });

    const blogTabRef = useRef();

    // Hàm gửi API tạo mới
    const handleCreateBlog = async () => {
        setCreating(true);
        try {
            const token = localStorage.getItem('userToken');
            const res = await fetch("/api/BlogAdmin/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: newBlog.title,
                    content: newBlog.content,
                    authorId: Number(newBlog.authorId),
                    categoryName: newBlog.categoryName,
                    blogType: newBlog.blogType
                })
            });
            if (!res.ok) throw new Error();
            alert("Tạo bài viết thành công!");
            setShowCreateModal(false);
            setNewBlog({
                title: "",
                content: "",
                authorId: "",
                categoryName: CATEGORY_OPTIONS[0],
                blogType: ""
            });
            // Reload lại bảng blog
            if (blogTabRef.current && blogTabRef.current.reload) {
                blogTabRef.current.reload();
            }
        } catch {
            alert("Tạo bài viết thất bại!");
        }
        setCreating(false);
    };

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="mb-0 text-success text-center">Quản lý Blog</h2>
                <Button variant="success" onClick={() => setShowCreateModal(true)}>
                    + Tạo bài viết mới
                </Button>
            </div>

            <Tabs
                activeKey={activeTab}
                onSelect={setActiveTab}
                className="mb-3"
                justify
            >
                <Tab eventKey="milestone" title="View">
                    <BlogManagementTab ref={blogTabRef} />
                </Tab>
                {/* <Tab eventKey="reported" title="Bài viết bị báo cáo">
                    <ReportedBlogTab reloadBlogList={() => blogTabRef.current && blogTabRef.current.reload()} />
                </Tab> */}
                <Tab eventKey="stats" title="Thống kê">
                    <BlogStatsTab />
                </Tab>
                <Tab eventKey="pending" title="Blog chờ duyệt">
                    <PendingBlogTab reloadBlogList={() => blogTabRef.current && blogTabRef.current.reload()} />
                </Tab>


            </Tabs>

            {/* Modal tạo bài viết mới */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Tạo bài viết mới</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group as={Row} className="mb-3" controlId="title">
                            <Form.Label column sm={3}>Tiêu đề</Form.Label>
                            <Col sm={9}>
                                <Form.Control
                                    type="text"
                                    value={newBlog.title}
                                    onChange={e => setNewBlog({ ...newBlog, title: e.target.value })}
                                />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3" controlId="content">
                            <Form.Label column sm={3}>Nội dung</Form.Label>
                            <Col sm={9}>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={newBlog.content}
                                    onChange={e => setNewBlog({ ...newBlog, content: e.target.value })}
                                />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3" controlId="authorId">
                            <Form.Label column sm={3}>Author ID</Form.Label>
                            <Col sm={9}>
                                <Form.Control
                                    type="number"
                                    value={newBlog.authorId}
                                    onChange={e => setNewBlog({ ...newBlog, authorId: e.target.value })}
                                />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3" controlId="categoryName">
                            <Form.Label column sm={3}>Chuyên mục</Form.Label>
                            <Col sm={9}>
                                <Form.Select
                                    value={newBlog.categoryName}
                                    onChange={e => setNewBlog({ ...newBlog, categoryName: e.target.value })}
                                >
                                    {CATEGORY_OPTIONS.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </Form.Select>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3" controlId="blogType">
                            <Form.Label column sm={3}>Loại blog</Form.Label>
                            <Col sm={9}>
                                <Form.Control
                                    type="text"
                                    value={newBlog.blogType}
                                    onChange={e => setNewBlog({ ...newBlog, blogType: e.target.value })}
                                />
                            </Col>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                        Đóng
                    </Button>
                    <Button
                        variant="primary"
                        disabled={creating}
                        onClick={handleCreateBlog}
                    >
                        {creating ? "Đang tạo..." : "Tạo mới"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default ManagementBlog;