import React from 'react';
import { Outlet } from 'react-router-dom'; // QUAN TRỌNG: Import Outlet
import Header from "../components/header/index"; // Giả sử bạn có Header
import Footer from "../components/footer/index"; // Giả sử bạn có Footer

const UserLayout = () => { // Bỏ {children}
    return (
        <>
            <Header />
            <main style={{
                // background: "linear-gradient(135deg, #e8f5e8 0%, #d4edd4 50%, #c1e6c1 100%)",
                minHeight: "calc(100vh - 120px)", // Ví dụ: trừ đi chiều cao của header và footer
            }}>
                <Outlet /> {/* <-- Sửa thành Outlet */}
            </main>
            <Footer />
        </>
    );
};

export default UserLayout;