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

  const ReedeemCode = async () => {
    Swal.fire({
      title: 'Reedeem Code',
      input: 'text',
      inputLabel: 'Enter your Redeem Code',
      showCancelButton: true,
      confirmButtonText: 'Submit',
      cancelButtonText: 'Cancel',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const code = result.value;
        try {
          const response = await axios.post(`${API_BASE_URL}/redeem-code`, {
            code,
            user_id: userId,
          });
          if (response.data.success) {
            setPoint(response.data.user.token);
            Swal.fire('Success', 'Code redeemed successfully!', 'success');
          } else {
            Swal.fire('Error', response.data.message, 'error');
          }
        } catch (error) {
          Swal.fire('Error', 'Unable to redeem code', 'error');
        }
      }
    });
  };

  const Bring_Cards = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/taro-card`);
      setCardsOriginal(res.data.data);
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'ไม่สามารถโหลดข้อมูลได้',
        icon: 'error',
        confirmButtonText: 'Retry',
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
      await axios.post(`${API_BASE_URL}/add-usercard`, {
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
      await axios.put(`${API_BASE_URL}/user-point`, {
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
        title: 'แต้มของคุณหมดแล้ว',
        text: 'กรุณาเติมแต้มก่อนสุ่มไพ่',
        icon: 'warning',
        confirmButtonText: 'ยอมรับ',
      });
      return;
    }

    const randomCards = [];
    while (randomCards.length < 2 && cardsOriginal.length > 1) {
      const randomCard = cardsOriginal[Math.floor(Math.random() * cardsOriginal.length)];
      if (!randomCards.some(card => card.name === randomCard.name)) {
        randomCards.push(randomCard);
      }
    }

    setCards(randomCards);

    const updatedPoint = point - 1;
    setPoint(updatedPoint);
    await updateUserPoint(updatedPoint);

    for (const [index, card] of randomCards.entries()) {
      setTimeout(() => {
        Swal.fire({
          title: card.name,
          html: `
            <div class="text-center">
              <img src="${card.image_url}" alt="${card.name}" class="w-32 h-48 object-cover rounded-lg shadow-lg mx-auto"/>
              <p class="italic text-gray-700 mt-2">${card.description}</p>
            </div>
          `,
          background: "#fff url('src/assets/back.jpg')",
          backdrop: `rgba(0,0,123,0.4)
            url('src/assets/cat.gif')
            left top
            no-repeat`,
          confirmButtonText: 'ยอมรับ',
        });
      }, index * 500);
      await updateUserCards(card.card_id);
    }
  };

  return (
    <div>
      <div className="bg-[url('src/assets/background.jpg')] flex items-center justify-center bg-cover bg-center w-full h-screen">
        <div className="bg-white bg-opacity-70 p-6 rounded-xl shadow text-center max-w-xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">🃏 Random Card</h1>

          {cards.length > 0 ? (
            <div className="mb-6">
              <div className="flex justify-between gap-4">
                {cards.map(card => (
                  <div key={card.name} className="w-32 text-center">
                    <img
                      src={card.image_url}
                      alt={card.name}
                      className="w-32 h-48 object-cover rounded-lg shadow-lg mx-auto"
                    />
                    <h2 className="text-sm font-semibold mt-2">{card.name}</h2>
                    <p className="italic text-gray-700 mt-2">{card.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="italic text-gray-700 mb-6">โปรดกดปุ่มเพื่อสุ่มไพ่ทาโร่</p>
          )}

          <div className='my-3'>
            <button
              onClick={drawCard}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-bold shadow-md"
            >
              {point > 0 ? `Token : ${point}` : 'แต้มหมดแล้ว'}
            </button>
          </div>
          <div>
            <button
              onClick={ReedeemCode}
              type="button"
              className="focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2"
            >
              Reedeem Code
            </button>
          </div>
        </div>
      </div>

      <footer className="bg-amber-300 h-24 flex justify-center items-center p-4 shadow-2xl">
        <div className="text-center">
          <p className="text-md font-light italic">© 2023 Tarot Bamboo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
