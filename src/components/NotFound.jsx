import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-gray-600 text-white p-4">
            <div className="text-center">
                <h1 className="text-6xl font-bold mb-4">404</h1>
                <h2 className="text-2xl font-bold mb-4">ไม่พบหน้าเว็บ</h2>
                <p className="text-gray-300 mb-8">ขออภัย หน้าที่คุณค้นหาไม่มีอยู่</p>
                <Link
                    to="/home"
                    className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition-colors inline-block"
                >
                    กลับหน้าหลัก
                </Link>
            </div>
        </div>
    );
};

export default NotFound; 