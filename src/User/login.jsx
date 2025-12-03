import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  // เปิดเว็บด้วยหน้า home.jsx โดยไม่ต้อง login
  useEffect(() => {
    navigate('/home', { replace: true });
  }, [navigate]);

  // ไม่แสดง UI ของ login หน้านี้
  return null;
};

export default Login;