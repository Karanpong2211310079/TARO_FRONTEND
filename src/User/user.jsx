import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const API_BASE_URL = import.meta.env.VITE_API_URL;
console.log('🌐 API_BASE_URL:', API_BASE_URL);

const User = () => {
  const [cards, setCards] = useState([]);
  const [username, setUsername] = useState('Guest');
  const [isLoading, setIsLoading] = useState(false);

  const BringUserCard = async () => {
    setIsLoading(true);
    try {
      const user = localStorage.getItem('user');
      if (!user) {
        Swal.fire({
          title: 'ยังไม่ได้เข้าสู่ระบบ',
          text: 'กรุณาเข้าสู่ระบบก่อนใช้งาน',
          icon: 'warning',
          confirmButtonText: 'ตกลง',
          customClass: {
            popup: 'bg-white shadow-lg rounded-lg max-w-[90vw]',
            title: 'text-xl sm:text-2xl font-bold text-gray-800',
            confirmButton: 'bg-blue-500 text-white hover:bg-blue-600 px-4 py-2',
          },
        });
        return;
      }

      let userData;
      try {
        userData = JSON.parse(user);
        if (!userData?.user?.user_id) {
          throw new Error('Invalid user data');
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
        Swal.fire({
          title: 'ข้อผิดพลาด',
          text: 'ข้อมูลผู้ใช้ไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่',
          icon: 'error',
          confirmButtonText: 'ตกลง',
          customClass: {
            popup: 'bg-white shadow-lg rounded-lg max-w-[90vw]',
            title: 'text-xl sm:text-2xl font-bold text-gray-800',
            confirmButton: 'bg-blue-500 text-white hover:bg-blue-600 px-4 py-2',
          },
        });
        return;
      }

      const userId = userData.user?.user_id;
      console.log('User data:', userData);
      setUsername(userData.user?.username || userData.user?.name || 'Guest');

      const res = await axios.post(`${API_BASE_URL}user-card`, { user_id: userId });
      console.log('API response:', res.data);

      if (res.data?.data && Array.isArray(res.data.data)) {
        setCards(res.data.data);
      } else {
        setCards([]);
        Swal.fire({
          title: 'ไม่มีข้อมูล',
          text: 'ไม่พบข้อมูลการ์ดของผู้ใช้',
          icon: 'info',
          confirmButtonText: 'ตกลง',
          customClass: {
            popup: 'bg-white shadow-lg rounded-lg max-w-[90vw]',
            title: 'text-xl sm:text-2xl font-bold text-gray-800',
            confirmButton: 'bg-blue-500 text-white hover:bg-blue-600 px-4 py-2',
          },
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถโหลดข้อมูลได้';
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'ลองใหม่',
        customClass: {
          popup: 'bg-white shadow-lg rounded-lg max-w-[90vw]',
          title: 'text-xl sm:text-2xl font-bold text-gray-800',
          confirmButton: 'bg-blue-500 text-white hover:bg-blue-600 px-4 py-2',
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    BringUserCard();
  }, []);

  const groupedCards = cards.reduce((acc, card) => {
    const cardInfo = card.cards || card;
    const key = cardInfo.id || cardInfo.name;
    if (!key) return acc;
    if (!acc[key]) {
      acc[key] = { ...cardInfo, count: 0 };
    }
    acc[key].count += 1;
    return acc;
  }, {});

  const uniqueCards = Object.values(groupedCards).sort((a, b) => a.card_id - b.card_id);

  return (
    <div className="mx-4 sm:mx-6 md:mx-8 lg:mx-12 py-6">
      <div className="mb-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
          <div className="flex flex-col items-center py-4">
            <img
              className="w-20 h-20 sm:w-24 sm:h-24 mb-3 rounded-full shadow-lg"
              src="https://i.postimg.cc/3N5vPMDq/moodcura.webp"
              alt="User Avatar"
            />
            <h5 className="mb-1 text-lg sm:text-xl font-medium text-gray-900">{username}</h5>
            <span className="text-xs sm:text-sm text-gray-500">คลังไพ่ของคุณมีกี่ใบเเล้วนะ</span>
          </div>
        </div>
      </div>

      <div>
        <p className="text-lg sm:text-xl font-semibold mb-2 text-center sm:text-left">ไพ่ของฉัน</p>
        <p className="text-sm sm:text-base text-center sm:text-left mb-4 text-gray-700">
          {uniqueCards.length > 0 ? `จำนวนครอบครอง ${uniqueCards.length} ไพ่` : 'ยังไม่มีการ์ดในครอบครอง'}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 border border-gray-500 rounded-md p-4 sm:p-5">
          {isLoading ? (
            <p className="text-gray-500 col-span-full text-center text-sm sm:text-base">กำลังโหลด...</p>
          ) : uniqueCards.length > 0 ? (
            uniqueCards.map((cardInfo) => (
              <div
                key={cardInfo.id || cardInfo.name}
                className="bg-white rounded-lg shadow-lg p-3 sm:p-4 text-center transition-transform duration-300 transform hover:scale-105"
              >
                <div className="relative w-full aspect-[2/3]">
                  <img
                    src={cardInfo.image_url || 'https://via.placeholder.com/300x450?text=Image+Not+Found'}
                    alt={cardInfo.name}
                    className="absolute top-0 left-0 w-full h-full object-contain rounded-t-lg"
                    loading="eager"
                    onError={(e) => (e.target.src = 'https://via.placeholder.com/300x450?text=Image+Not+Found')}
                  />
                </div>
                <p className="font-bold text-base sm:text-lg p-0 sm:p-1">{cardInfo.name}</p>
                <p className="text-gray-700 text-sm sm:text-base mt-1 sm:mt-2 leading-relaxed">{cardInfo.description}</p>
                <p className="text-gray-500 text-xs sm:text-sm mt-1">ครอบครอง: {cardInfo.count} ใบ</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 col-span-full text-center text-sm sm:text-base">ยังไม่มีการ์ดในครอบครอง</p>
          )}
        </div>
      </div>

      <style jsx>{`
        .aspect-[2/3] {
          aspect-ratio: 2/3;
        }
        @media (max-width: 360px) {
          .grid {
            gap: 0.5rem;
          }
          img {
            max-height: 180px;
          }
          .text-sm {
            font-size: 0.7rem;
            line-height: 1.2rem;
          }
          .p-3 {
            padding: 0.5rem;
          }
          .font-bold {
            margin-top: -0.5rem;
          }
        }
        @media (min-width: 361px) and (max-width: 640px) {
          .grid {
            gap: 1rem;
          }
          img {
            max-height: 300px;
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