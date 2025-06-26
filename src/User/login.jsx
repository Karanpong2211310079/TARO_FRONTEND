import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const Login = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (password.length < 6) {
      setIsLoading(false);
      Swal.fire({
        title: 'Invalid Password',
        text: 'รหัสผ่านควรมีอย่างน้อย 6 ตัวอักษร',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }

    try {
      const res = await axios.post(`${API_BASE_URL}login`, {
        name,
        phone: password,
      });

      if (res.status === 200 || res.status === 201) {
        Swal.fire({
          title: 'Login Successful',
          text: 'เข้าสู่ระบบเพื่อรับคำทำนาย',
          icon: 'success',
          confirmButtonText: 'OK',
        }).then(() => {
          localStorage.setItem('user', JSON.stringify(res.data));
          if (res.data.user.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/home');
          }
        });
      } else {
        Swal.fire({
          title: 'Login Failed',
          text: 'Please check your credentials.',
          icon: 'error',
          confirmButtonText: 'Retry',
        });
      }
    } catch (error) {
      if (error.response?.data?.message === 'Username already exists with a different password') {
        Swal.fire({
          title: 'Username Taken',
          text: 'ชื่อนี้มีคนใช้แล้ว ลองรหัสผ่านอื่นนะ',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      } else if (error.response?.data?.message === 'Username already in use') {
        Swal.fire({
          title: 'Duplicate Username',
          text: 'ชื่อนี้ถูกใช้งานแล้ว กรุณาใช้ชื่ออื่น',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      } else {
        Swal.fire({
          title: 'Something went wrong',
          text: error.response?.data?.message || 'Please try again.',
          icon: 'error',
          confirmButtonText: 'Retry',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#FFDB6E] to-[#D497FF]">
      <div className="w-full max-w-md p-8 bg-white bg-opacity-90 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl">
        <div className="flex justify-center mb-6">
          <img
            src="https://i.postimg.cc/sD3GQsnb/IMG-0866.jpg"
            alt="Logo"
            className="h-16 w-auto object-contain"
          />
        </div>
        <h2 className="text-2xl font-bold text-center mb-6 text-[#D497FF]">เข้าสู่ระบบเพื่อรับคำทำนาย</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-700">
              ชื่อเล่น:
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="กรอกชื่อเล่นของคุณ"
              required
              className="w-full p-3 border border-[#FFDB6E] rounded-lg focus:ring-2 focus:ring-[#D497FF] focus:border-[#D497FF] transition-colors"
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">
              รหัสผ่าน:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="กรอกรหัสผ่านของคุณ"
              required
              className="w-full p-3 border border-[#FFDB6E] rounded-lg focus:ring-2 focus:ring-[#D497FF] focus:border-[#D497FF] transition-colors"
            />
            <p className="mt-2 text-sm text-red-500">ไม่ใช่โค้ดดูดวง</p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-5 text-white bg-[#D497FF] rounded-lg hover:bg-[#c07eff] focus:ring-4 focus:ring-[#FFDB6E] transition-colors duration-200 flex items-center justify-center ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <svg
                className="animate-spin h-5 w-5 mr-3 text-white"
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
            {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;