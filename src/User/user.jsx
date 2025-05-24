import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const API_BASE_URL = import.meta.env.VITE_API_URL; // ดึงจาก .env

const User = () => {
  const [cards, setCards] = useState([]);

  const BringUserCard = async () => {
    const user = localStorage.getItem('user');
    if (!user) {
      Swal.fire({
        title: 'Not logged in',
        text: 'กรุณาเข้าสู่ระบบก่อนใช้งาน',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }

    try {
      const userData = JSON.parse(user);
      const userId = userData.user.user_id;

      const res = await axios.post(`${API_BASE_URL}user-card`, { user_id: userId });

      // ตรวจสอบข้อมูลก่อนตั้งค่า
      if (res.data && res.data.data && Array.isArray(res.data.data)) {
        setCards(res.data.data);
        console.log(res.data.data);
      } else {
        setCards([]);
        Swal.fire({
          title: 'No data',
          text: 'ไม่พบข้อมูลการ์ดของผู้ใช้',
          icon: 'info',
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'ไม่สามารถโหลดข้อมูลได้',
        icon: 'error',
        confirmButtonText: 'Retry',
      });
    }
  };

  useEffect(() => {
    BringUserCard();
  }, []);

  return (
    <div className="font-mono grid grid-cols-1 md:grid-cols-4 gap-6 m-8">
      {/* Profile Card (ซ้ายมือ) */}
      <div className="col-span-1">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex flex-col items-center pb-10 mt-5">
            <img
              className="w-24 h-24 mb-3 rounded-full shadow-lg"
              src="https://i.pravatar.cc/100"
              alt="User Avatar"
            />
            <h5 className="mb-1 text-xl font-medium text-gray-900">Bonnie Green</h5>
            <span className="text-sm text-gray-500">Visual Designer</span>
          </div>
        </div>
      </div>

      {/* Card Section (ขวามือ) */}
      <div className="col-span-1 md:col-span-3">
        <p className="text-xl font-semibold mb-4">My Cards</p>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 border border-gray-500 rounded-md gap-4 p-5">
          {cards.length > 0 ? (
            cards.map((card, index) => {
              // ป้องกันการเข้าถึง undefined properties
              const cardInfo = card.cards || card; // ถ้าโครงสร้างต่างกันให้ปรับตรงนี้
              return (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-lg p-4 text-center transition-transform duration-300 transform hover:scale-105"
                >
                  <img
                    src={cardInfo.image_url}
                    alt={cardInfo.name}
                    className="w-full h-32 object-cover rounded mb-3"
                  />
                  <p className="font-bold text-xl">{cardInfo.name}</p>
                  <p className="text-black mt-2">{cardInfo.description}</p>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500 col-span-full text-center">ยังไม่มีการ์ดในครอบครอง</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default User;
