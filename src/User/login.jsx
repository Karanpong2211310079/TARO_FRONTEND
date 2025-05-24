import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const Login = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); // ป้องกันหน้ารีเฟรช

    try {
      const res = await axios.post('http://localhost:3000/login', {
        name,
        phone,
      });

      if (res.status === 200 || res.status === 201) {
        Swal.fire({
          title: 'Login Successful',
          text: 'Welcome back!',
          icon: 'success',
          confirmButtonText: 'OK',
        }).then(() => {
          localStorage.setItem('user', JSON.stringify(res.data)); // เก็บข้อมูลผู้ใช้ใน localStorage
          navigate('/home'); // ไปหลังจากผู้ใช้กด OK
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
          <label htmlFor="phone" className="block mb-2 text-sm font-medium text-gray-900">
            Phone:
          </label>
          <input
            type="number"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
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