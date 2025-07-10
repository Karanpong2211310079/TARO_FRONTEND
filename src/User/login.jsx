import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
const API_BASE_URL = import.meta.env.VITE_API_URL;

const Login = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Preload images on mount (for background & logo)
  useEffect(() => {
    [
      'https://i.postimg.cc/XNgSymzG/IMG-0869.webp',
      'https://i.postimg.cc/sX987Gwd/IMG-0870.webp',
    ].forEach(src => {
      const img = new window.Image();
      img.src = src;
    });
  }, []);

  // Main login handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    if (!navigator.onLine) {
      Swal.fire({
        title: 'ไม่มีการเชื่อมต่ออินเทอร์เน็ต',
        text: 'กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตของคุณ',
        icon: 'warning',
        confirmButtonText: 'ตกลง',
      });
      return;
    }
    if (!API_BASE_URL) {
      Swal.fire({
        title: 'ข้อผิดพลาด',
        text: 'ไม่พบที่อยู่เซิร์ฟเวอร์ กรุณาติดต่อแอดมิน',
        icon: 'error',
        confirmButtonText: 'ตกลง',
      });
      return;
    }
    if (password.length < 6) {
      Swal.fire({
        title: 'รหัสผ่านไม่ถูกต้อง',
        text: 'รหัสผ่านควรมีอย่างน้อย 6 ตัวอักษรนะจ๊ะ',
        icon: 'warning',
        confirmButtonText: 'ตกลง',
      });
      return;
    }
    setIsLoading(true);
    // Retry login 0 times if error (no retry)
    const attemptLogin = async (retries = 0) => {
      try {
        const res = await axios.post(
          `${API_BASE_URL}login`,
          { name, phone: password },
          {
            timeout: 5000, // ลด timeout เหลือ 5000ms
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
            },
          }
        );
        if ((res.status === 200 || res.status === 201) && res.data?.user?.role) {
          localStorage.setItem('user', JSON.stringify(res.data));
          localStorage.setItem('lastLogin', Date.now().toString());
          navigate(res.data.user.role === 'admin' ? '/admin' : '/home', { replace: true });
          return true;
        } else {
          Swal.fire({
            title: 'ล็อกอินไม่สำเร็จ',
            text: 'กรุณาตรวจสอบชื่อผู้ใช้และรหัสผ่าน',
            icon: 'error',
            confirmButtonText: 'ลองใหม่',
          });
          return false;
        }
      } catch (error) {
        // รวม error message ที่เกี่ยวกับรหัสผิด
        const msg = error.response?.data?.message || '';
        if (
          error.response?.status === 401 ||
          msg.includes('Invalid') ||
          msg.includes('incorrect') ||
          msg.includes('Phone number does not match the registered name')
        ) {
          Swal.fire({
            title: 'รหัสไม่ถูกต้อง',
            text: 'กรุณาตรวจสอบชื่อผู้ใช้และรหัสผ่าน',
            icon: 'error',
            confirmButtonText: 'ลองใหม่',
          });
          return false;
        }
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 500));
          return attemptLogin(retries - 1);
        }
        let errorMessage = 'กรุณาลองใหม่';
        if (error.code === 'ECONNABORTED') {
          errorMessage = 'เซิร์ฟเวอร์ไม่ตอบสนอง กรุณาลองใหม่';
        } else if (msg.includes('Username already exists with a different password')) {
          errorMessage = 'ชื่อนี้มีคนใช้แล้ว ลองรหัสผ่านอื่นนะ';
        } else if (msg.includes('Username already in use')) {
          errorMessage = 'ชื่อนี้ถูกใช้งานแล้ว กรุณาใช้ชื่ออื่น';
        } else if (error.message?.includes('Network Error')) {
          errorMessage = 'ไม่สามารถเชื่อมต่ออินเทอร์เน็ตได้ กรุณาตรวจสอบการเชื่อมต่อ';
        }
        Swal.fire({
          title: 'เกิดข้อผิดพลาด',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'ลองใหม่',
        });
        return false;
      }
    };
    await attemptLogin();
    setIsLoading(false);
  };

  return (
    <>
      <style>{`
        .login-background {
          background-image: url('https://i.postimg.cc/XNgSymzG/IMG-0869.webp');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }
        .password-container { position: relative; }
        .password-toggle {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
          color: #6B7280;
        }
        .password-toggle:hover { color: #4B5563; }
      `}</style>
      <div className="flex justify-center items-center min-h-screen login-background px-4">
        <div className="w-full max-w-md sm:max-w-sm xs:max-w-xs p-6 sm:p-4 bg-white bg-opacity-90 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl">
          <div className="flex justify-center mb-4">
            <img
              src="https://i.postimg.cc/sX987Gwd/IMG-0870.webp"
              alt="โลโก้"
              loading="eager"
              className="h-28 sm:h-24 xs:h-18 w-auto object-contain"
              onError={e => (e.target.style.display = 'none')}
            />
          </div>
          <h2 className="text-xl sm:text-lg font-bold text-center mb-4 text-purple-900">
            🔮Loginเพื่อรับคำทำนาย
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
                onChange={e => setName(e.target.value)}
                placeholder="กรอกชื่อผู้ใช้ของคุณ"
                required
                autoComplete="username"
                className="w-full p-2 sm:p-1.5 text-sm border border-[#FFDB6E] rounded-lg focus:ring-2 focus:ring-[#D497FF] focus:border-[#D497FF] transition-all duration-200"
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
                  onChange={e => setPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่านของคุณ"
                  required
                  autoComplete="current-password"
                  className="w-full p-2 sm:p-1.5 text-sm border border-[#FFDB6E] rounded-lg focus:ring-2 focus:ring-[#D497FF] focus:border-[#D497FF] transition-all duration-200"
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
                **รหัสสำหรับ Login ไม่ใช่โค้ดดูดวง ให้ตั้งรหัสผ่านของคุณเพื่อนำไปใช้ในครั้งถัดไป<br />
                **หากลืมรหัสผ่านหรือเว็ปไซด์มีปัญหา ติดต่อแอดมินที่ IG:
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
              className={`w-full py-2 sm:py-1.5 px-4 text-sm text-purple-900 bg-[#FFDB6E] rounded-lg hover:bg-[#e6c563] focus:ring-4 focus:ring-[#D497FF] transition-all duration-200 flex items-center justify-center ${isLoading ? 'opacity-70 cursor-not-allowed scale-95' : 'hover:scale-105'}`}
            >
              {isLoading ? (
                <>
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
                  กำลังเชื่อมจิตนะจ๊ะ...
                </>
              ) : (
                '✨เชื่อมจิต✨'
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
export default Login;