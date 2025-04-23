import React, { useState } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Dummy data for tarot cards


const tarotCards = [
  {
    name: 'The Fool',
    image: 'https://i.postimg.cc/CLWmhwpc/S-811050-0.jpg',
    description: 'จงเปิดใจให้กับสิ่งใหม่ ๆ ที่จะเกิดขึ้นในชีวิต'
  },
  {
    name: 'The Hermit',
    image: 'https://i.postimg.cc/dVZd0CjC/S-811052-0.jpg',
    description: 'เวลานี้เหมาะกับการใคร่ครวญภายในจิตใจ'
  },
  {
    name: 'The Star',
    image: 'https://i.postimg.cc/zBzVTHK0/S-811053-0.jpg',
    description: 'ความหวัง พลังงานดี ๆ กำลังจะมาถึง'
  }
];

const Home = () => {
  const [cards, setCards] = useState([]);
  const [point, setPoint] = useState(5); 
  

  const drawCard = () => {
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
    while (randomCards.length < 2) {
      const randomCard = tarotCards[Math.floor(Math.random() * tarotCards.length)];
      if (!randomCards.some(card => card.name === randomCard.name)) {
        randomCards.push(randomCard);
      }
    }

    setCards(randomCards);
    setPoint(prev => prev - 1);

    randomCards.forEach((card, index) => {
      setTimeout(() => {
        Swal.fire({
          title: card.name,
          html: `
            <div class="text-center">
              <img src="${card.image}" alt="${card.name}" class="w-32 h-48 object-cover rounded-lg shadow-lg mx-auto"/>
              <p class="italic text-gray-700 mt-2">${card.description}</p>
            </div>
          `,
          background: "#fff url(src/assets/back.jpg)",
          backdrop: `rgba(0,0,123,0.4)
            url("src/assets/cat.gif")
            left top
            no-repeat`,
          confirmButtonText: 'ยอมรับ',
        });
      }, index * 500);
    });
  };

  return (
    <div>
      

      {/* Body */}
      <div className="bg-[url('src/assets/background.jpg')] flex items-center justify-center bg-cover bg-center w-full h-screen">
        <div className="bg-white bg-opacity-70 p-6 rounded-xl shadow text-center max-w-xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">🃏 Random Card</h1> 

          {cards.length > 0 ? (
            <div className="mb-6">
              <div className="flex justify-between gap-4">
                {cards.map(card => (
                  <div key={card.name} className="w-32 text-center">
                    <img
                      src={card.image}
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

          <button
            onClick={drawCard}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-bold shadow-md"
          >
            {point > 0 ? `Token : ${point}` : 'แต้มหมดแล้ว'}
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-amber-300 h-24 flex justify-center items-center p-4 shadow-2xl">
        <div className="text-center">
          <p className="text-md font-light italic">© 2023 Tarot Bamboo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
