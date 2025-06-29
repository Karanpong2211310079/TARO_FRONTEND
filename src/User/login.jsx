import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

// ใช้ environment variable สำหรับ API URL
const API_BASE_URL = import.meta.env.VITE_API_URL;

const Login = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // สถานะสำหรับแสดง/ซ่อนรหัสผ่าน

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (password.length < 6) {
      setIsLoading(false);
      Swal.fire({
        title: 'รหัสผ่านไม่ถูกต้อง',
        text: 'รหัสผ่านควรมีอย่างน้อย 6 ตัวอักษรนะจ๊ะ',
        icon: 'warning',
        confirmButtonText: 'ตกลง',
      });
      return;
    }

    try {
      const res = await axios.post(`${API_BASE_URL}login`, {
        name,
        phone: password,
      });

      if (res.status === 200 || res.status === 201) {
        // บันทึกข้อมูลผู้ใช้และเปลี่ยนหน้าโดยไม่มี popup
        localStorage.setItem('user', JSON.stringify(res.data));
        if (res.data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/home');
        }
      } else {
        Swal.fire({
          title: 'ล็อกอินไม่สำเร็จ',
          text: 'กรุณาตรวจสอบชื่อผู้ใช้และรหัสผ่าน',
          icon: 'error',
          confirmButtonText: 'ลองใหม่',
        });
      }
    } catch (error) {
      if (error.response?.data?.message === 'Username already exists with a different password') {
        Swal.fire({
          title: 'ชื่อผู้ใช้ถูกใช้แล้ว',
          text: 'ชื่อนี้มีคนใช้แล้ว ลองรหัสผ่านอื่นนะ',
          icon: 'error',
          confirmButtonText: 'ตกลง',
        });
      } else if (error.response?.data?.message === 'Username already in use') {
        Swal.fire({
          title: 'ชื่อผู้ใช้ซ้ำ',
          text: 'ชื่อนี้ถูกใช้งานแล้ว กรุณาใช้ชื่ออื่น',
          icon: 'error',
          confirmButtonText: 'ตกลง',
        });
      } else {
        Swal.fire({
          title: 'เกิดข้อผิดพลาด',
          text: error.response?.data?.message || 'กรุณาลองใหม่',
          icon: 'error',
          confirmButtonText: 'ลองใหม่',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Preload รูปพื้นหลังเพื่อให้โหลดเร็วขึ้น */}
      <link
        rel="preload"
        href="https://i.postimg.cc/XNgSymzG/IMG-0869.webp"
        as="image"
      />
      {/* CSS รวมอยู่ในไฟล์เดียว */}
      <style>
        {`
          .login-background {
            background-image: url('https://i.postimg.cc/XNgSymzG/IMG-0869.webp');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
          }
          .password-container {
            position: relative;
          }
          .password-toggle {
            position: absolute;
            right: 15px; /* ขยับไปทางซ้ายจาก 10px เป็น 15px */
            top: 50%;
            transform: translateY(-50%);
            cursor: pointer;
            color: #6B7280;
          }
          .password-toggle:hover {
            color: #4B5563;
          }
        `}
      </style>
      <div className="flex justify-center items-center min-h-screen login-background px-4">
        <div className="w-full max-w-md sm:max-w-sm xs:max-w-xs p-6 sm:p-4 bg-white bg-opacity-90 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl">
          <div className="flex justify-center mb-4">
            <img
              src="https://i.postimg.cc/sX987Gwd/IMG-0870.webp"
              alt="โลโก้"
              loading="lazy"
              className="h-24 sm:h-20 xs:h-16 w-auto object-contain"
            />
          </div>
          <h2 className="text-xl sm:text-lg font-bold text-center mb-4 text-purple-900">
            เข้าสู่ระบบเพื่อรับคำทำนาย
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block mb-1 text-sm font-medium text-gray-700">
                ชื่อผู้ใช้:
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="กรอกชื่อผู้ใช้ของคุณ"
                required
                className="w-full p-2 sm:p-1.5 text-sm border border-[#FFDB6E] rounded-lg focus:ring-2 focus:ring-[#D497FF] focus:border-[#D497FF] transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-700">
                รหัสผ่าน:
              </label>
              <div className="password-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่านของคุณ"
                  required
                  className="w-full p-2 sm:p-1.5 text-sm border border-[#FFDB6E] rounded-lg focus:ring-2 focus:ring-[#D497FF] focus:border-[#D497FF] transition-colors"
                />
                <svg
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {showPassword ? (
                    <>
                      <path
                        d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </>
                  ) : (
                    <>
                      <path
                        d="M2.99902 3L20.999 21M9.84302 9.913C10.3304 9.39511 10.9926 9.0355 11.7498 8.98734C12.5071 8.93917 13.2475 9.20527 13.8003 9.73883C14.3532 10.2724 14.6814 10.9337 14.7176 11.6397C14.7538 12.3457 14.4957 13.0287 13.999 13.536M9.99902 5C8.75602 5.328 7.67202 6 6.75702 7C4.99602 8.486 3.55702 10.486 2.75202 12C3.55702 13.514 4.99602 15.514 6.75702 17C7.67202 18 8.75602 18.672 9.99902 19M13.999 16.486C15.263 17.172 16.665 18 18.242 19C19.003 18.486 19.669 17.822 20.247 17"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </>
                  )}
                </svg>
              </div>
              <p className="mt-1 text-xs text-red-500">
                **รหัสสำหรับ Login ไม่ใช่โค้ดดูดวง ให้ตั้งรหัสผ่านของคุณเพื่อนำไปใช้ในครั้งถัดไป<br />**หากลืมรหัสผ่าน ติดต่อแอดมินที่ IG:
                <a
                  href="https://www.instagram.com/_moodma_?igsh=NGZvZTNmZWJtNjln"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-600"
                >
                  @_moodma_
                </a>
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 sm:py-1.5 px-4 text-sm text-purple-900 bg-[#FFDB6E] rounded-lg hover:bg-[#e6c563] focus:ring-4 focus:ring-[#D497FF] transition-colors duration-200 flex items-center justify-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-4 w-4 sm:h-3 sm:w-3 mr-2 text-purple-900"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
              ) : null}
              {isLoading ? 'กำลังเข้าสู่ระบบจ๊ะ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;