import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

// ใช้ค่าจาก .env
const API_BASE_URL = import.meta.env.VITE_API_URL;
console.log("🌐 API_BASE_URL:", API_BASE_URL); // สำหรับตรวจสอบ

const AllCards = () => {
  const [cards, setCards] = useState([]);

  // ✅ handleCardClick ต้องเป็น async และใช้ข้อมูลจาก API
  const handleCardClick = async (card) => {
    try {
      const res = await axios.post(`${API_BASE_URL}taro-detail`, {
        card_id: card.card_id, // ใช้ card_id ให้ตรงกับ backend
      });

      const cardDetail = res.data.data;

      Swal.fire({
        title: cardDetail.name,
        text: cardDetail.description,
        imageUrl: cardDetail.image_url,
        imageWidth: 400,
        imageHeight: 500,
        confirmButtonText: "Close",
        confirmButtonColor: "#3085d6",
        background: "#f9f9f9",
        customClass: {
          popup: "bg-white shadow-lg rounded-lg",
          title: "text-2xl font-bold text-gray-800",
          content: "text-gray-600",
          confirmButton: "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500",
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
        setCards(cardsArray);
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
    <div className="m-5">
      <div>
        <h1 className="font-sans flex justify-center text-3xl font-bold mb-4">All Cards</h1>
        <div className="inline-flex items-center justify-center w-full relative">
          <hr className="w-64 h-1 my-8 bg-gray-200 border-0 rounded-sm dark:bg-gray-700" />
          <div className="absolute px-4 -translate-x-1/2 bg-white left-1/2 dark:bg-gray-900">
            <svg className="w-4 h-4 text-gray-700 dark:text-gray-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 14">
              <path d="M6 0H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3H2a1 1 0 0 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Zm10 0h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3h-1a1 1 0 0 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cards.length > 0 ? (
          cards.map((card, index) => (
            <div
              key={index}
              className="rounded-lg text-black text-center transition-transform duration-300 transform hover:scale-105 shadow-lg cursor-pointer"
              onClick={() => handleCardClick(card)} // ✅ ใส่ onClick ที่ภาพ
            >
              <img src={card.image_url} alt={card.name} className="w-full h-100 rounded mb-3" />
              <p className="font-bold text-xl">{card.name}</p>
              <p className="text-black mt-2">{card.description}</p>
            </div>
          ))
        ) : (
          <p>กำลังโหลด...</p>
        )}
      </div>
    </div>
  );
};

export default AllCards;
