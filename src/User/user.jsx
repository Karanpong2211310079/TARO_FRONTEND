import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// ฟังก์ชันสำหรับแยกคำอธิบายออกเป็นหมวดต่างๆ
const parseCardDescription = (description) => {
  const categories = {
    love: '',
    work: '',
    money: '',
    health: '',
    advice: ''
  };

  if (!description) return categories;

  // แยกข้อความตามหมวดหมู่
  const lines = description.split('\n').filter(line => line.trim());

  let currentCategory = '';

  lines.forEach(line => {
    const trimmedLine = line.trim();

    // ตรวจสอบหมวดหมู่จากคำสำคัญและ emoji
    if (trimmedLine.includes('ความรัก') || trimmedLine.includes('รัก') || trimmedLine.includes('❤️') || trimmedLine.includes('💕') ||
      trimmedLine.includes('ความสัมพันธ์') || trimmedLine.includes('คู่รัก') || trimmedLine.includes('คนรัก') ||
      trimmedLine.includes('การแต่งงาน') || trimmedLine.includes('ความโรแมนติก') || trimmedLine.includes('แฟน')) {
      currentCategory = 'love';
    } else if (trimmedLine.includes('การงาน') || trimmedLine.includes('งาน') || trimmedLine.includes('🏢') || trimmedLine.includes('💼') ||
      trimmedLine.includes('อาชีพ') || trimmedLine.includes('ธุรกิจ') || trimmedLine.includes('การทำงาน') ||
      trimmedLine.includes('เพื่อนร่วมงาน') || trimmedLine.includes('เจ้านาย') || trimmedLine.includes('บริษัท') ||
      trimmedLine.includes('โครงการ') || trimmedLine.includes('ตำแหน่ง')) {
      currentCategory = 'work';
    } else if (trimmedLine.includes('การเงิน') || trimmedLine.includes('เงิน') || trimmedLine.includes('💰') || trimmedLine.includes('💵') ||
      trimmedLine.includes('การลงทุน') || trimmedLine.includes('ธุรกิจ') || trimmedLine.includes('ความมั่งคั่ง') ||
      trimmedLine.includes('การออม') || trimmedLine.includes('รายได้') || trimmedLine.includes('กำไร') ||
      trimmedLine.includes('ขาดทุน') || trimmedLine.includes('งบประมาณ')) {
      currentCategory = 'money';
    } else if (trimmedLine.includes('สุขภาพ') || trimmedLine.includes('ร่างกาย') || trimmedLine.includes('🏥') || trimmedLine.includes('🩺') ||
      trimmedLine.includes('การรักษา') || trimmedLine.includes('ความเจ็บป่วย') || trimmedLine.includes('การออกกำลังกาย') ||
      trimmedLine.includes('จิตใจ') || trimmedLine.includes('ความเครียด') || trimmedLine.includes('โรค') ||
      trimmedLine.includes('อาการ') || trimmedLine.includes('การพักผ่อน')) {
      currentCategory = 'health';
    } else if (trimmedLine.includes('คำแนะนำ') || trimmedLine.includes('แนะนำ') || trimmedLine.includes('💡') || trimmedLine.includes('🧭') ||
      trimmedLine.includes('ควร') || trimmedLine.includes('ไม่ควร') || trimmedLine.includes('วิธี') ||
      trimmedLine.includes('เคล็ดลับ') || trimmedLine.includes('ข้อควรระวัง') || trimmedLine.includes('#') ||
      trimmedLine.includes('ข้อคิด') || trimmedLine.includes('แนวทาง')) {
      currentCategory = 'advice';
    }

    // เพิ่มข้อความลงในหมวดหมู่ปัจจุบัน
    if (currentCategory && trimmedLine) {
      if (categories[currentCategory]) {
        categories[currentCategory] += '\n' + trimmedLine;
      } else {
        categories[currentCategory] = trimmedLine;
      }
    }
  });

  // ถ้าไม่พบหมวดหมู่ที่ชัดเจน ให้แบ่งตามความยาว
  if (!Object.values(categories).some(cat => cat)) {
    const words = description.split(' ');
    const chunkSize = Math.ceil(words.length / 5);

    for (let i = 0; i < 5; i++) {
      const start = i * chunkSize;
      const end = start + chunkSize;
      const chunk = words.slice(start, end).join(' ');

      if (chunk.trim()) {
        const categoryKeys = Object.keys(categories);
        categories[categoryKeys[i]] = chunk.trim();
      }
    }
  }

  return categories;
};

// ฟังก์ชันสำหรับแสดงคำอธิบายแยกตามหมวดหมู่
const showCardDescriptionByCategory = (description, cardName) => {
  const categories = parseCardDescription(description);

  const categoryLabels = {
    love: '💕 ความรัก',
    work: '💼 การงาน',
    money: '💰 การเงิน',
    health: '🏥 สุขภาพ',
    advice: '💡 คำแนะนำ'
  };

  const categoryColors = {
    love: 'category-love',
    work: 'category-work',
    money: 'category-money',
    health: 'category-health',
    advice: 'category-advice'
  };

  // หาข้อความหลังชื่อไพ่ (ส่วนแรกของคำอธิบาย)
  const firstLine = description.split('\n')[0]?.trim() || '';
  const cardSubtitle = firstLine && firstLine !== cardName ? firstLine : '';

  // สร้าง HTML สำหรับปุ่มแต่ละหมวด
  const buttonsHTML = Object.entries(categories)
    .filter(([key, value]) => value.trim())
    .map(([key, value]) => {
      // ใช้ base64 encoding เพื่อหลีกเลี่ยงปัญหา escape characters
      const encodedValue = btoa(unescape(encodeURIComponent(value)));
      const encodedCardName = btoa(unescape(encodeURIComponent(cardName)));

      return `
                <button 
                    onclick="window.showCategoryDescription('${key}', '${encodedValue}', '${encodedCardName}')"
                    class="w-full mb-3 px-4 py-3 text-white rounded-lg text-mobile-base font-medium category-button ${categoryColors[key]} transition-all duration-200"
                >
                    ${categoryLabels[key]}
                </button>
            `;
    }).join('');

  Swal.fire({
    title: `🔮 ${cardName}`,
    html: `
            <div class="text-center">
                ${cardSubtitle ? `<p class="card-subtitle text-mobile-sm">${cardSubtitle}</p>` : ''}
                <div class="space-y-2">
                    ${buttonsHTML}
                </div>
            </div>
        `,
    showConfirmButton: false,
    showCloseButton: true,
    customClass: {
      popup: 'w-[95vw] max-w-md rounded-xl mx-2',
      title: 'text-[clamp(1rem,4vw,1.25rem)] font-bold text-purple-800 mb-3',
      closeButton: 'text-gray-500 hover:text-gray-700'
    }
  });

  // เพิ่มฟังก์ชัน global สำหรับแสดงหมวดหมู่
  window.showCategoryDescription = (category, encodedContent, encodedCardName) => {
    const categoryLabels = {
      love: '🔮',
      work: '🔮',
      money: '🔮',
      health: '🔮',
      advice: '🔮'
    };

    const categoryColors = {
      love: 'category-love',
      work: 'category-work',
      money: 'category-money',
      health: 'category-health',
      advice: 'category-advice'
    };

    // Decode ข้อมูลจาก base64
    const content = decodeURIComponent(escape(atob(encodedContent)));
    const cardName = decodeURIComponent(escape(atob(encodedCardName)));

    // แปลงข้อความให้รักษารูปแบบ (แปลง \n เป็น <br>)
    const formattedContent = content.replace(/\n/g, '<br>');

    Swal.fire({
      title: `${categoryLabels[category]} - ${cardName}`,
      html: `<div class="category-content text-[clamp(0.875rem,3.5vw,1rem)] text-gray-700">${formattedContent}</div>`,
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: 'ย้อนกลับ',
      customClass: {
        popup: 'w-[95vw] max-w-md rounded-xl mx-2',
        title: 'text-[clamp(1rem,4vw,1.25rem)] font-bold text-blue-800 mb-3',
        content: 'max-h-[60vh] overflow-y-auto px-2',
        cancelButton: `${categoryColors[category]} px-6 py-3 text-white rounded-lg text-[clamp(0.875rem,3.5vw,1rem)] font-medium`
      }
    }).then((result) => {
      if (result.dismiss === Swal.DismissReason.cancel) {
        // กลับไปหน้าหมวดหมู่
        showCardDescriptionByCategory(description, cardName);
      }
    });
  };
};

const User = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [visibleCards, setVisibleCards] = useState(10);

  const loadMore = () => setVisibleCards((prev) => prev + 10);

  const showPrediction = (cardName, description, imageUrl) => {
    showCardDescriptionByCategory(description, cardName);
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

  if (isLoading) {
    return (
      <div className="mx-4 sm:mx-6 md:mx-8 lg:mx-12 py-6">
        <div className="mb-6">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <div className="flex flex-col items-center py-4 animate-pulse">
              <div className="w-20 h-20 mb-3 rounded-full bg-gray-300"></div>
              <div className="h-5 w-32 bg-gray-300 rounded mb-1"></div>
              <div className="h-4 w-48 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
        <div>
          <p className="text-lg font-semibold mb-2 text-center">ไพ่ของฉัน</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 border border-gray-500 rounded-md p-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-4 animate-pulse">
                <div className="relative w-full aspect-[2/3] mb-3 bg-gray-300 rounded-t-lg"></div>
                <div className="h-4 w-3/4 bg-gray-300 rounded mb-2 mx-auto"></div>
                <div className="h-3 w-1/2 bg-gray-300 rounded mb-2 mx-auto"></div>
                <div className="h-3 w-1/4 bg-gray-300 rounded mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-4 sm:mx-6 md:mx-8 lg:mx-12 py-6">
      <div className="mb-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
          <div className="flex flex-col items-center py-4">
            <img
              className="w-20 h-20 mb-3 rounded-full shadow-lg"
              src="https://i.postimg.cc/3N5vPMDq/moodcura.webp"
              alt="User Avatar"
              loading="eager"
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
          {uniqueCards.length > 0 ? (
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
                      loading="lazy" // เปลี่ยนเป็น lazy เพื่อลดการโหลดครั้งแรก
                      onError={(e) => (e.target.src = 'https://via.placeholder.com/300x450?text=Image+Not+Found')}
                    />
                  </div>
                  <p className="font-bold text-base mb-2">{cardInfo.name}</p>
                  <button
                    onClick={() => showPrediction(cardInfo.name, cardInfo.description, cardInfo.image_url)}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-mobile-sm mb-2 touch-button px-4 py-2 rounded-lg transition-colors font-medium"
                  >
                    อ่านคำทำนาย
                  </button>
                  <p className="text-gray-500 text-xs">ครอบครอง: {cardInfo.count} ใบ</p>
                </div>
              ))}
              {visibleCards < uniqueCards.length && (
                <button
                  onClick={loadMore}
                  className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg mx-auto block hover:bg-blue-600 col-span-full text-mobile-base font-medium touch-button"
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
            gap: 1.25rem;
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