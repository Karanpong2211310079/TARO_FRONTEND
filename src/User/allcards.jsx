import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const API_BASE_URL = import.meta.env.VITE_API_URL;
console.log('🌐 API_BASE_URL:', API_BASE_URL);

const AllCards = () => {
  const [cards, setCards] = useState([]);
  const [activeCard, setActiveCard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const showCard = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}taro-card`, { timeout: 5000 });
      if (res.data && res.data.data) {
        const cardsArray = Object.values(res.data.data);
        // เรียงลำดับตาม card_id
        const sortedCards = cardsArray.sort((a, b) => a.card_id - b.card_id);
        setCards(sortedCards);
      } else {
        throw new Error('Data format is incorrect');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถโหลดข้อมูลไพ่ได้ กรุณาลองใหม่',
        icon: 'error',
        confirmButtonText: 'ตกลง',
        customClass: {
          popup: 'mystic-modal w-[95vw] max-w-md rounded-xl mx-2',
          title: 'mystic-heading text-xl mb-2',
          content: 'mystic-gold-text font-serif',
          confirmButton: 'mystic-btn w-full mt-4',
          cancelButton: 'mystic-btn w-full mt-4',
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardInteraction = (index) => {
    setActiveCard(index);
    setTimeout(() => {
      setActiveCard(null);
    }, 5000);
  };

  useEffect(() => {
    showCard();
  }, []);

  // แยกไพ่เป็น Major Arcana (22 ใบแรก) และ Minor Arcana (ที่เหลือ)
  const majorArcana = cards.slice(0, 22);
  const minorArcana = cards.slice(22);

  // ตรวจสอบ prefers-reduced-motion เพื่อปิด animation ในอุปกรณ์ที่ต้องการลดการเคลื่อนไหว
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (isLoading) {
    return (
      <div className="mx-4 sm:mx-6 md:mx-8 lg:mx-12 py-6">
        <div>
          <h1 className="font-sans text-2xl sm:text-3xl font-bold text-center mb-4">
            All Cards
          </h1>
          <p className="text-center text-gray-600 mb-4">กำลังโหลดไพ่...</p>
          <div className="inline-flex items-center justify-center w-full relative">
            <hr className="w-64 h-1 my-6 bg-gray-200 border-0 rounded-sm dark:bg-gray-700" />
            <div className="absolute px-4 -translate-x-1/2 bg-white left-1/2 dark:bg-gray-900">
              <svg
                className="w-4 h-4 text-gray-700 dark:text-gray-300"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 18 14"
              >
                <path d="M6 0H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3H2a1 1 0 0 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Zm10 0h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3h-1a1 1 0 0 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg animate-pulse">
              <div className="relative w-full" style={{ paddingTop: '150%' }}>
                <div className="absolute top-0 left-0 w-full h-full bg-gray-300 rounded-t-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-4 sm:mx-6 md:mx-8 lg:mx-12 py-6">
      <div>
        <h1 className="mystic-heading text-2xl sm:text-3xl font-bold text-center mb-4 flex items-center justify-center gap-2">
          <span className="text-3xl">🃏</span> My Card <span className="text-3xl">✨</span>
        </h1>
        <p className="text-center mystic-gold-text mb-4 font-serif">
          จำนวนไพ่ทั้งหมด: {cards.length} ใบ
        </p>
        <div className="inline-flex items-center justify-center w-full relative">
          <hr className="mystic-divider w-64 h-1 my-6" />
          <div className="absolute px-4 -translate-x-1/2 bg-transparent left-1/2">
            <svg
              className="w-4 h-4 text-yellow-300"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 18 14"
            >
              <path d="M6 0H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3H2a1 1 0 0 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Zm10 0h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3h-1a1 1 0 0 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Major Arcana Section */}
      <div className="mb-8">
        <h2 className="mystic-heading text-xl font-semibold text-center mb-4">Major Arcana ({majorArcana.length} ใบ)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {majorArcana.length > 0 ? (
            majorArcana.map((card, index) => (
              <div
                key={card.card_id || index}
                className={`mystic-card text-center transition-transform duration-300 ease-in-out transform ${activeCard === index && !isReducedMotion ? 'scale-110' : 'scale-100'} hover:scale-105 cursor-pointer`}
                onClick={() => handleCardInteraction(index)}
              >
                <div className="relative w-full" style={{ paddingTop: '150%' }}>
                  <img
                    src={card.image_url}
                    alt={card.name}
                    className="absolute top-0 left-0 w-full h-full object-contain rounded-t-lg border-2 border-yellow-300 shadow-lg"
                    style={{ maxWidth: '100%', maxHeight: '260px', minHeight: '180px' }}
                    loading="lazy"
                    onError={(e) => (e.target.src = 'https://via.placeholder.com/300x450?text=Image+Not+Found')}
                  />
                </div>
                <p className="mystic-gold-text text-sm font-medium mt-2 font-serif" style={{ fontSize: '0.82rem' }}>{card.name}</p>
              </div>
            ))
          ) : (
            <p className="text-center mystic-gold-text col-span-3">ไม่มีไพ่ Major Arcana</p>
          )}
        </div>
      </div>

      {/* Minor Arcana Section */}
      <div>
        <h2 className="mystic-heading text-xl font-semibold text-center mb-4">Minor Arcana ({minorArcana.length} ใบ)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {minorArcana.length > 0 ? (
            minorArcana.map((card, index) => (
              <div
                key={card.card_id || index + 22}
                className={`mystic-card text-center transition-transform duration-300 ease-in-out transform ${activeCard === index + 22 && !isReducedMotion ? 'scale-110' : 'scale-100'} hover:scale-105 cursor-pointer`}
                onClick={() => handleCardInteraction(index + 22)}
              >
                <div className="relative w-full" style={{ paddingTop: '150%' }}>
                  <img
                    src={card.image_url}
                    alt={card.name}
                    className="absolute top-0 left-0 w-full h-full object-contain rounded-t-lg border-2 border-yellow-300 shadow-lg"
                    style={{ maxWidth: '100%', maxHeight: '260px', minHeight: '180px' }}
                    loading="lazy"
                    onError={(e) => (e.target.src = 'https://via.placeholder.com/300x450?text=Image+Not+Found')}
                  />
                </div>
                <p className="mystic-gold-text text-sm font-medium mt-2 font-serif" style={{ fontSize: '0.82rem' }}>{card.name}</p>
              </div>
            ))
          ) : (
            <p className="text-center mystic-gold-text col-span-3">ไม่มีไพ่ Minor Arcana</p>
          )}
        </div>
      </div>

      <style jsx>{`
        .rounded-lg {
          transition: transform 0.3s ease-in-out;
        }
        .rounded-lg:hover {
          transform: ${isReducedMotion ? 'scale(1)' : 'scale(1.1)'};
          z-index: 10;
        }
        @media (max-width: 640px) {
          .grid {
            gap: 1rem;
          }
          .rounded-lg {
            max-width: 100%;
          }
          img {
            max-height: 250px;
          }
        }
        @media (min-width: 641px) {
          img {
            max-height: 350px;
          }
        }
      `}</style>
    </div>
  );
};

export default AllCards;