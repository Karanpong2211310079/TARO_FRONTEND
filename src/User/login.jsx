import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

// เรียกใช้ BASE_URL จาก .env
const API_BASE_URL = import.meta.env.VITE_API_URL;
console.log("🌐 API_BASE_URL:", API_BASE_URL);

const Login = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [countryCode, setCountryCode] = useState('+66'); // default Thailand
  const [phone, setPhone] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // เช็คความยาวเบอร์ (ปรับได้)
    if (phone.length < 9 || phone.length > 10) {
      Swal.fire({
        title: 'Invalid Phone Number',
        text: 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }

    try {
      const fullPhoneNumber = `${countryCode}${phone}`;

      const res = await axios.post(`${API_BASE_URL}login`, {
        name,
        phone: fullPhoneNumber,
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
          }else
          navigate('/home');
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
          <label className="block mb-2 text-sm font-medium text-gray-900">
            Phone Number:
          </label>
          <div className="flex">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-l-lg p-2.5"
            >
              <option value="+66">🇹🇭 +66</option>
              <option value="+1">🇺🇸 +1</option>
              <option value="+81">🇯🇵 +81</option>
              <option value="+84">🇻🇳 +84</option>
              <option value="+60">🇲🇾 +60</option>
            </select>
            <input
              type="text"
              value={phone}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d{0,10}$/.test(value)) {
                  setPhone(value);
                }
              }}
              required
              placeholder="Phone number"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-r-lg block w-full p-2.5"
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">กรอกเฉพาะเบอร์ เช่น 812345678 (ไม่ต้องใส่ 0)</p>
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
