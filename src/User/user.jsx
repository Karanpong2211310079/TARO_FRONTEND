import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const User = () => {
  const [cards, setCards] = useState([]);

  const BringUserCard = async () => {
    const user = localStorage.getItem('user');
    if (!user) {
      Swal.fire({
        title: 'ยังไม่ได้เข้าสู่ระบบ',
        text: 'กรุณาเข้าสู่ระบบก่อนใช้งาน',
        icon: 'warning',
        confirmButtonText: 'ตกลง',
      });
      return;
    }

    try {
      const userData = JSON.parse(user);
      const userId = userData.user.user_id;

      const res = await axios.post(`${API_BASE_URL}user-card`, { user_id: userId });

      if (res.data && res.data.data && Array.isArray(res.data.data)) {
        setCards(res.data.data);
        console.log(res.data.data);
      } else {
        setCards([]);
        Swal.fire({
          title: 'ไม่มีข้อมูล',
          text: 'ไม่พบข้อมูลการ์ดของผู้ใช้',
          icon: 'info',
          confirmButtonText: 'ตกลง',
        });
      }
    } catch (error) {
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถโหลดข้อมูลได้',
        icon: 'error',
        confirmButtonText: 'ลองใหม่',
      });
    }
  };

  useEffect(() => {
    BringUserCard();
  }, []);

  return (
    <div className="mx-4 sm:mx-6 md:mx-8 lg:mx-12 py-6">
      {/* Profile Card */}
      <div className="mb-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
          <div className="flex flex-col items-center py-4">
            <img
              className="w-20 h-20 sm:w-24 sm:h-24 mb-3 rounded-full shadow-lg"
              src="https://i.pravatar.cc/100"
              alt="User Avatar"
            />
            <h5 className="mb-1 text-lg sm:text-xl font-medium text-gray-900">Bonnie Green</h5>
            <span className="text-xs sm:text-sm text-gray-500">Visual Designer</span>
          </div>
        </div>
      </div>

      {/* Card Section */}
      <div>
        <p className="text-lg sm:text-xl font-semibold mb-4 text-center sm:text-left">การ์ดของฉัน</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 border border-gray-500 rounded-md p-4 sm:p-5">
          {cards.length > 0 ? (
            cards.map((card, index) => {
              const cardInfo = card.cards || card;
              return (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-lg p-3 sm:p-4 text-center transition-transform duration-300 transform hover:scale-105"
                >
                  <div className="relative w-full" style={{ paddingTop: '150%' }}>
                    <img
                      src={cardInfo.image_url}
                      alt={cardInfo.name}
                      className="absolute top-0 left-0 w-full h-full object-contain rounded-t-lg"
                      loading="lazy"
                    />
                  </div>
                  <p className="font-bold text-base sm:text-lg mt-2">{cardInfo.name}</p>
                  <p className="text-gray-700 text-sm sm:text-base mt-1 leading-relaxed">{cardInfo.description}</p>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500 col-span-full text-center text-sm sm:text-base">ยังไม่มีการ์ดในครอบครอง</p>
          )}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 640px) {
          .grid {
            gap: 1rem;
          }
          .rounded-lg {
            max-width: 100%;
          }
          img {
            max-height: 300px;
          }
          .text-sm {
            font-size: 0.875rem;
            line-height: 1.5rem;
          }
          .p-3 {
            padding: 0.75rem;
          }
        }
        @media (min-width: 641px) and (max-width: 768px) {
          img {
            max-height: 350px;
          }
        }
      `}</style>
    </div>
  );
};

export default User;