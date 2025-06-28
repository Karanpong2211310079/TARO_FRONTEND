import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const Home = () => {
  const [cardsOriginal, setCardsOriginal] = useState([]);
  const [cards, setCards] = useState([]);
  const [point, setPoint] = useState();
  const [userId, setUserId] = useState();
  const [token, setToken] = useState();
  const [isRevealing, setIsRevealing] = useState(false);

  const ReedeemCode = async () => {
    Swal.fire({
      title: 'ปลดล็อกพลังด้วยโค้ดลับ!',
      input: 'text',
      inputLabel: 'ป้อนโค้ดจากหน้าซองเพื่อเพิ่มพลังทำนาย',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      customClass: {
        popup: 'w-11/12 max-w-md rounded-xl',
        title: 'text-lg font-bold text-purple-800',
        inputLabel: 'text-sm text-gray-600',
        confirmButton: 'bg-purple-700 hover:bg-purple-800 px-4 py-1.5 text-sm text-white rounded',
        cancelButton: 'bg-gray-300 hover:bg-gray-400 px-4 py-1.5 text-sm text-gray-800 rounded',
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        const code = result.value;
        try {
          const response = await axios.post(`${API_BASE_URL}redeem-code`, {
            code,
            user_id: userId,
          });
          if (response.data.success) {
            setPoint(response.data.user.token);
            Swal.fire({
              title: 'โปรดตั้งจิตให้มั่น!',
              text: 'ตั้งคำถามที่อยากให้ไพ่ทำนายก่อนกด OK!',
              icon: 'success',
              customClass: {
                popup: 'w-11/12 max-w-md rounded-xl',
                title: 'text-lg font-bold text-green-600',
                confirmButton: 'bg-green-600 hover:bg-green-700 px-4 py-1.5 text-sm text-white rounded',
              },
            });
          } else {
            Swal.fire({
              title: 'โค้ดผิดพลาด!',
              text: response.data.message,
              icon: 'error',
              customClass: {
                popup: 'w-11/12 max-w-md rounded-xl',
                title: 'text-lg font-bold text-red-600',
                confirmButton: 'bg-red-600 hover:bg-red-700 px-4 py-1.5 text-sm text-white rounded',
              },
            });
          }
        } catch (error) {
          Swal.fire({
            title: 'เกิดข้อผิดพลาด!',
            text: 'ไม่สามารถใช้โค้ดได้ ลองอีกครั้ง!',
            icon: 'error',
            customClass: {
              popup: 'w-11/12 max-w-md rounded-xl',
              title: 'text-lg font-bold text-red-600',
              confirmButton: 'bg-red-600 hover:bg-red-700 px-4 py-1.5 text-sm text-white rounded',
            },
          });
        }
      }
    });
  };

  const Bring_Cards = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}taro-card`);
      setCardsOriginal(res.data.data);
    } catch (error) {
      Swal.fire({
        title: 'เกิดข้อผิดพลาด!',
        text: 'ไม่สามารถโหลดไพ่ทาโรต์ได้ ลองใหม่!',
        icon: 'error',
        confirmButtonText: 'ลองใหม่',
        customClass: {
          popup: 'w-11/12 max-w-md rounded-xl',
          title: 'text-lg font-bold text-red-600',
          confirmButton: 'bg-red-600 hover:bg-red-700 px-4 py-1.5 text-sm text-white rounded',
        },
      });
    }
  };

  const loadUserFromLocalStorage = () => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setUserId(userData.user.user_id);
      setToken(userData.user.token);
      setPoint(userData.user.token);
    }
  };

  const updateUserCards = async (newCardId) => {
    try {
      const cardId = parseInt(newCardId, 10);
      await axios.post(`${API_BASE_URL}add-usercard`, {
        user_id: userId,
        card_id: cardId,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const updatedUser = { ...JSON.parse(localStorage.getItem('user')) };
      updatedUser.user.cards = [...(updatedUser.user.cards || []), cardId];
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) {
      console.error("Error updating cards", err);
    }
  };

  const updateUserPoint = async (newPoint) => {
    try {
      await axios.put(`${API_BASE_URL}user-point`, {
        id: userId,
        point: newPoint,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const updatedUser = { ...JSON.parse(localStorage.getItem('user')) };
      updatedUser.user.token = newPoint;
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) {
      console.error("Error updating point", err);
    }
  };

  useEffect(() => {
    loadUserFromLocalStorage();
    Bring_Cards();
  }, []);

  const drawCard = async () => {
    if (point <= 0) {
      Swal.fire({
        title: 'พลังทำนายหมดแล้ว!',
        text: 'เติมพลังด้วยโค้ดลับเพื่อสุ่มไพ่ต่อ!',
        icon: 'warning',
        confirmButtonText: 'ตกลง',
        customClass: {
          popup: 'w-11/12 max-w-md rounded-xl',
          title: 'text-lg font-bold text-yellow-600',
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 px-4 py-1.5 text-sm text-white rounded',
        },
      });
      return;
    }

    setIsRevealing(true);
    setCards([]);

    setTimeout(async () => {
      const randomCards = [];
      if (cardsOriginal.length > 0) {
        const randomCard = cardsOriginal[Math.floor(Math.random() * cardsOriginal.length)];
        randomCards.push(randomCard);
      }

      setCards(randomCards);
      setIsRevealing(false);

      const updatedPoint = point - 1;
      setPoint(updatedPoint);
      await updateUserPoint(updatedPoint);

      for (const card of randomCards) {
        await updateUserCards(card.card_id);
      }
    }, 5000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-600 bg-cover bg-center">
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white bg-opacity-70 p-6 rounded-xl shadow-2xl text-center w-full max-w-lg">
          <h1 className="text-2xl font-bold mb-4 text-purple-800">🃏 เปิดคำทำนายแห่งโชคชะตา</h1>

          {isRevealing ? (
            <div className="mb-4 flex flex-col justify-center items-center gap-2 animate__animated animate__pulse animate__infinite">
              <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-lg font-bold text-red-600">
                โชคชะตากำลังถูกเปิดเผย
                <span className="animate__animated animate__bounce animate__infinite animate__slower">...</span>
              </p>
            </div>
          ) : cards.length > 0 ? (
            <div className="mb-4">
              <div className="flex flex-col justify-center items-center gap-4">
                {cards.map(card => (
                  <div key={card.name} className="w-full text-center animate__animated animate__zoomIn">
                    <img
                      src={card.image_url}
                      alt={card.name}
                      className="w-48 h-72 object-contain rounded-lg shadow-2xl mx-auto transform hover:scale-105 transition-transform duration-300"
                    />
                    <h2 className="text-sm font-bold mt-2 text-purple-700">{card.name}</h2>
                    <p className="italic text-gray-700 mt-1 text-sm max-h-40 overflow-y-auto">{card.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="italic text-gray-700 mb-4 text-sm">กดปุ่มเพื่อเปิดไพ่ทาโรต์และลุ้นโชคชะตา!</p>
          )}

          <div className="my-3">
            <button
              onClick={ReedeemCode}
              type="button"
              className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded text-sm w-full transform hover:scale-105 transition-transform duration-200"
            >
              กรอกโค้ดลับ
            </button>
          </div>
          <div>
            <button
              onClick={drawCard}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-bold shadow-md text-sm w-full transform hover:scale-105 transition-transform duration-200"
            >
              {point > 0 ? `พลังทำนาย: ${point}` : 'สุ่มไพ่ทาโรต์'}
            </button>
          </div>
        </div>
      </div>

      <footer className="bg-amber-300 h-16 flex justify-center items-center p-4 shadow-2xl">
        <div className="text-center">
          <p className="text-sm font-light italic">© 2025 Tarot Moodma. สงวนลิขสิทธิ์.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;