import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const API_BASE_URL = import.meta.env.VITE_API_URL;
console.log("🌐 API_BASE_URL:", API_BASE_URL);

const Login = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
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
        phone: password, // ✅ ส่งใน key ชื่อ phone เหมือนเดิม
      });

      if (res.status === 200 || res.status === 201) {
        Swal.fire({
          title: 'Login Successful',
          text: 'Welcome back!',
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
      Swal.fire({
        title: 'Something went wrong',
        text: error.response?.data?.message || 'Please try again.',
        icon: 'error',
        confirmButtonText: 'Retry',
      });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <form onSubmit={handleSubmit} className="w-full max-w-md p-4 bg-white rounded-lg shadow">
        <div className="mb-5">
          <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">
            Nickname:
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your nickname"
            required
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
          />
        </div>

        <div className="mb-5">
          <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">
            Password:
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
          />
        </div>

        <button
          type="submit"
          className="w-full px-5 py-2.5 text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default Login;
