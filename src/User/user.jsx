import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const User = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [visibleCards, setVisibleCards] = useState(10);

  const loadMore = () => setVisibleCards((prev) => prev + 10);

  const showPrediction = (cardName, description, imageUrl) => {
    Swal.fire({
      title: cardName,
      text: description || 'ไม่มีคำทำนายสำหรับการ์ดนี้',
      imageUrl: imageUrl || 'https://via.placeholder.com/150?text=Image+Not+Found',
      imageWidth: 150,
      imageHeight: 250,
      confirmButtonText: '❌',
      customClass: {
        popup: 'bg-white shadow-lg rounded-lg max-w-[90vw] p-6',
        title: 'text-xl font-bold text-gray-800',
        content: 'text-sm text-gray-600',
        confirmButton: 'bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded',
      },
    });
  };

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
            title: 'text-xl font-bold',
            confirmButton: 'bg-blue-500 text-white hover:bg-blue-600 px-4 py-2',
          },
        }).then(() => {
          navigate('/login');
        });
        return;
      }

      const userData = JSON.parse(user);
      console.log('User data from localStorage:', userData); // Debug: ตรวจสอบโครงสร้างข้อมูล
      if (!userData?.user?.user_id) {
        localStorage.removeItem('user');
        Swal.fire({
          title: 'ข้อผิดพลาด',
          text: 'ข้อมูลผู้ใช้ไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่',
          icon: 'error',
          confirmButtonText: 'ตกลง',
          customClass: {
            popup: 'bg-white shadow-lg rounded-lg max-w-[90vw]',
            title: 'text-xl font-bold',
            confirmButton: 'bg-blue-500 text-white hover:bg-blue-600 px-4 py-2',
          },
        }).then(() => {
          navigate('/login');
        });
        return;
      }

      // Set username from userData, try 'username' or 'name' as fallback
      setUsername(userData.user.username || userData.user.name || 'ผู้ใช้ไม่ระบุชื่อ');

      const res = await axios.post(`${API_BASE_URL}user-card`, { user_id: userData.user.user_id }, { timeout: 10000 });
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
            title: 'text-xl font-bold',
            confirmButton: 'bg-blue-500 text-white hover:bg-blue-600 px-4 py-2',
          },
        });
      }
    } catch (error) {
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: error.response?.data?.message || 'ไม่สามารถโหลดข้อมูลได้',
        icon: 'error',
        confirmButtonText: 'ลองใหม่',
        customClass: {
          popup: 'bg-white shadow-lg rounded-lg max-w-[90vw]',
          title: 'text-xl font-bold',
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

  const groupedCards = useMemo(() => {
    return cards.reduce((acc, card) => {
      const cardInfo = card.cards || card;
      const key = cardInfo.id || cardInfo.name;
      if (!key) return acc;
      if (!acc[key]) acc[key] = { ...cardInfo, count: 0 };
      acc[key].count += 1;
      return acc;
    }, {});
  }, [cards]);

  const uniqueCards = Object.values(groupedCards).sort((a, b) => a.card_id - b.card_id);

  return (
    <div className="mx-4 sm:mx-6 md:mx-8 lg:mx-12 py-6">
      <div className="mb-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
          <div className="flex flex-col items-center py-4">
            <img
              className="w-20 h-20 mb-3 rounded-full shadow-lg"
              src="https://i.postimg.cc/3N5vPMDq/moodcura.webp"
              alt="User Avatar"
            />
            <h5 className="mb-1 text-lg font-medium text-gray-900">{username}</h5>
            <span className="text-xs text-gray-500">สวัสดีผมมูดๆเอง สะสมไพ่เยอะนะครับเด่วผมรางวัลให้moooo</span>
          </div>
        </div>
      </div>

      <div>
        <p className="text-lg font-semibold mb-2 text-center">ไพ่ของฉัน</p>
        <p className="text-sm text-center mb-4 text-gray-700">
          {uniqueCards.length > 0 ? `จำนวนครอบครอง ${uniqueCards.length} ไพ่` : 'ยังไม่มีการ์ดในครอบครอง..เลยหรอ???'}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 border border-gray-500 rounded-md p-4">
          {isLoading ? (
            <p className="text-gray-500 col-span-full text-center text-sm">กำลังโหลดจ๊ะ...</p>
          ) : uniqueCards.length > 0 ? (
            <>
              {uniqueCards.slice(0, visibleCards).map((cardInfo) => (
                <div
                  key={cardInfo.id || cardInfo.name}
                  className="bg-white rounded-lg shadow-lg p-4 flex flex-col items-center transition-transform duration-300 hover:scale-105"
                >
                  <div className="relative w-full aspect-[2/3] mb-3">
                    <img
                      src={cardInfo.image_url || 'https://via.placeholder.com/300x450?text=Image+Not+Found'}
                      alt={cardInfo.name}
                      className="absolute top-0 left-0 w-full h-full object-contain rounded-t-lg"
                      loading="eager"
                      onError={(e) => (e.target.src = 'https://via.placeholder.com/300x450?text=Image+Not+Found')}
                    />
                  </div>
                  <p className="font-bold text-base mb-2">{cardInfo.name}</p>
                  <p className="text-gray-700 text-sm mb-2 line-clamp-3">
                    {cardInfo.description || 'ไม่มีคำอธิบาย'}
                  </p>
                  <button
                    onClick={() => showPrediction(cardInfo.name, cardInfo.description, cardInfo.image_url)}
                    className="text-purple-500 hover:text-purple-600 text-xs mb-2"
                  >
                    อ่านต่อสิจ๊ะ...
                  </button>
                  <p className="text-gray-500 text-xs">ครอบครอง: {cardInfo.count} ใบ</p>
                </div>
              ))}
              {visibleCards < uniqueCards.length && (
                <button
                  onClick={loadMore}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded mx-auto block hover:bg-blue-600 col-span-full"
                >
                  โหลดไพ่ต่อเลย🫵
                </button>
              )}
            </>
          ) : (
            <p className="text-gray-500 col-span-full text-center text-sm">ยังไม่มีการ์ดในครอบครอง..เลยหรอ???</p>
          )}
        </div>
      </div>

      <style jsx>{`
        .aspect-[2/3] {
          aspect-ratio: 2/3;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .grid {
          gap: 1rem;
        }
        @media (max-width: 360px) {
          .grid {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }
          img {
            max-height: 200px;
          }
          .text-sm {
            font-size: 0.75rem;
          }
          .text-base {
            font-size: 0.875rem;
          }
          .p-4 {
            padding: 0.75rem;
          }
        }
        @media (min-width: 361px) and (max-width: 640px) {
          .grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }
          img {
            max-height: 250px;
          }
        }
        @media (min-width: 641px) and (max-width: 1024px) {
          .grid {
            grid-template-columns: repeat(3, 1fr);
            gap:jsx
$0 1.25rem;
          }
          img {
            max-height: 280px;
          }
        }
        @media (min-width: 1025px) {
          .grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 1.5rem;
          }
          img {
            max-height: 300px;
          }
        }
      `}</style>
    </div>
  );
};

export default User;