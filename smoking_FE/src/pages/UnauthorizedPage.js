import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const UnauthorizedPage = () => {
    return (
        <Container className="text-center mt-5">
            <h1>403 - Truy cập bị từ chối</h1>
            <p>Bạn không có quyền truy cập vào trang này.</p>
            <Button as={Link} to="/" variant="primary">Quay về trang chủ</Button>
        </Container>
    );
};

export default UnauthorizedPage;