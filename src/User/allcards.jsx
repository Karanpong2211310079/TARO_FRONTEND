import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const API_BASE_URL = import.meta.env.VITE_API_URL;
console.log("🌐 API_BASE_URL:", API_BASE_URL);

const AllCards = () => {
  const [cards, setCards] = useState([]);

  const handleCardClick = async (card) => {
    try {
      const res = await axios.post(`${API_BASE_URL}taro-detail`, {
        card_id: card.card_id,
      });

      const cardDetail = res.data.data;

      Swal.fire({
        title: cardDetail.name,
        imageUrl: cardDetail.image_url,
        imageWidth: 300, // Reduced for mobile-friendliness
        imageHeight: 450, // Maintain aspect ratio for tarot cards
        imageAlt: cardDetail.name,
        confirmButtonText: "Close",
        confirmButtonColor: "#3085d6",
        background: "#f9f9f9",
        customClass: {
          popup: "bg-white shadow-lg rounded-lg max-w-[90vw]", // Responsive popup width
          title: "text-xl sm:text-2xl font-bold text-gray-800",
          confirmButton:
            "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500 px-4 py-2",
        },
      });
    } catch (error) {
      console.error("Error fetching card detail:", error);
      Swal.fire("Error", "ไม่สามารถโหลดรายละเอียดไพ่ได้", "error");
    }
  };

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
      Swal.fire("Error", "ไม่สามารถโหลดข้อมูลไพ่ได้", "error");
    }
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {cards.length > 0 ? (
          cards.map((card, index) => (
            <div
              key={index}
              className="rounded-lg text-black text-center transition-transform duration-300 transform hover:scale-105 shadow-lg cursor-pointer bg-white"
              onClick={() => handleCardClick(card)}
            >
              <div className="relative w-full" style={{ paddingTop: "150%" }}>
                <img
                  src={card.image_url}
                  alt={card.name}
                  className="absolute top-0 left-0 w-full h-full object-contain rounded-t-lg"
                />
              </div>
              <p className="font-bold text-lg sm:text-xl p-0 sm:p-1">{card.name}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-600">กำลังโหลดอยู่จ๊ะ...</p>
        )}
      </div>

      {/* Custom CSS for precise control */}
      <style jsx>{`
        @media (max-width: 640px) {
          .grid {
            gap: 1rem;
          }
          .rounded-lg {
            max-width: 100%;
          }
          img {
            max-height: 350px;
          }
          .p-0 {
            padding: 0;
          }
          .font-bold {
            margin-top: -0.5rem; /* ดึงชื่อขึ้นมาใกล้รูป */
          }
        }
        @media (min-width: 641px) and (max-width: 768px) {
          img {
            max-height: 400px;
          }
        }
      `}</style>
    </div>
  );
};

export default AllCards;