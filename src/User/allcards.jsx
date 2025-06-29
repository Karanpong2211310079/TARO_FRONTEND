import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;
console.log("🌐 API_BASE_URL:", API_BASE_URL);

const AllCards = () => {
  const [cards, setCards] = useState([]);
  const [activeCard, setActiveCard] = useState(null); // Track active card

  const showCard = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}taro-card`);

      if (res.data && res.data.data) {
        const cardsArray = Object.values(res.data.data);
        // เรียงลำดับตาม card_id
        const sortedCards = cardsArray.sort((a, b) => a.card_id - b.card_id);
        setCards(sortedCards);
      } else {
        throw new Error("Data format is incorrect");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("ไม่สามารถโหลดข้อมูลไพ่ได้");
    }
  };

  const handleCardInteraction = (index) => {
    setActiveCard(index); // Set active card on click/tap
    // Reset scale after 5 seconds
    setTimeout(() => {
      setActiveCard(null);
    }, 5000);
  };

  useEffect(() => {
    showCard();
  }, []);

  return (
    <div className="mx-4 sm:mx-6 md:mx-8 lg:mx-12 py-6">
      <div>
        <h1 className="font-sans text-2xl sm:text-3xl font-bold text-center mb-4">
          All Cards
        </h1>
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
        {cards.length > 0 ? (
          cards.map((card, index) => (
            <div
              key={index}
              className={`rounded-lg text-black text-center transition-transform duration-300 ease-in-out transform ${activeCard === index ? "scale-110" : "scale-100"
                } hover:scale-110 bg-white shadow-lg cursor-pointer`}
              onClick={() => handleCardInteraction(index)}
            >
              <div className="relative w-full" style={{ paddingTop: "150%" }}>
                <img
                  src={card.image_url}
                  alt={card.name}
                  className="absolute top-0 left-0 w-full h-full object-contain rounded-t-lg transition-transform duration-300 ease-in-out"
                />
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-600 col-span-3">กำลังโหลดอยู่จ๊ะ...</p>
        )}
      </div>

      {/* Custom CSS for precise control */}
      <style jsx>{`
        .rounded-lg {
          transition: transform 0.3s ease-in-out;
        }
        .rounded-lg:hover {
          transform: scale(1.5);
          z-index: 10; /* Ensure the card is above others when scaled */
        }
        @media (max-width: 640px) {
          .grid {
            gap: 1rem;
          }
          .rounded-lg {
            max-width: 100%;
          }
          img {
            max-height: 250px; /* Adjusted for 3 columns on mobile */
          }
        }
        @media (min-width: 641px) {
          img {
            max-height: 350px; /* Adjusted for 3 columns on larger screens */
          }
        }
      `}</style>
    </div>
  );
};

export default AllCards;