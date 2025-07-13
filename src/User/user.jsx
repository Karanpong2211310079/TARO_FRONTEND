import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import clickSound from '../assets/click.mp3';
const clickSoundObj = new window.Audio(clickSound);
import failSound from '../assets/fail.mp3';
const failSoundObj = new window.Audio(failSound);
const playFailSound = () => {
  failSoundObj.currentTime = 0;
  failSoundObj.play();
};

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
    if (trimmedLine.includes('💘 ความรัก') || trimmedLine.includes('❤️') || trimmedLine.includes('💕') ||
      trimmedLine.includes('ความสัมพันธ์') || trimmedLine.includes('คู่รัก') || trimmedLine.includes('คนรัก') ||
      trimmedLine.includes('การแต่งงาน') || trimmedLine.includes('ความโรแมนติก') || trimmedLine.includes('แฟน')) {
      currentCategory = 'love';
    } else if (trimmedLine.includes('💼 การงาน') || trimmedLine.includes('งาน') || trimmedLine.includes('🏢') || trimmedLine.includes('💼') ||
      trimmedLine.includes('อาชีพ') || trimmedLine.includes('ธุรกิจ') || trimmedLine.includes('การทำงาน') ||
      trimmedLine.includes('เพื่อนร่วมงาน') || trimmedLine.includes('เจ้านาย') || trimmedLine.includes('บริษัท') ||
      trimmedLine.includes('โครงการ') || trimmedLine.includes('ตำแหน่ง')) {
      currentCategory = 'work';
    } else if (trimmedLine.includes('💸 การเงิน') || trimmedLine.includes('เงิน') || trimmedLine.includes('💰') || trimmedLine.includes('💵') ||
      trimmedLine.includes('การลงทุน') || trimmedLine.includes('ธุรกิจ') || trimmedLine.includes('ความมั่งคั่ง') ||
      trimmedLine.includes('การออม') || trimmedLine.includes('รายได้') || trimmedLine.includes('กำไร') ||
      trimmedLine.includes('ขาดทุน') || trimmedLine.includes('งบประมาณ')) {
      currentCategory = 'money';
    } else if (trimmedLine.includes('🩺 สุขภาพ') || trimmedLine.includes('ร่างกาย') || trimmedLine.includes('🏥') || trimmedLine.includes('🩺') ||
      trimmedLine.includes('การรักษา') || trimmedLine.includes('ความเจ็บป่วย') || trimmedLine.includes('การออกกำลังกาย') ||
      trimmedLine.includes('จิตใจ') || trimmedLine.includes('ความเครียด') || trimmedLine.includes('โรค') ||
      trimmedLine.includes('อาการ') || trimmedLine.includes('การพักผ่อน')) {
      currentCategory = 'health';
    } else if (trimmedLine.includes('🧭 คำแนะนำ') || trimmedLine.includes('แนะนำ') || trimmedLine.includes('💡') || trimmedLine.includes('🧭') ||
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

  // ฟังก์ชัน JS สำหรับเล่นเสียง (inject ลง onclick)
  const playClickSoundJS = `window.__playClickSound = window.__playClickSound || (function(){ if(!window.__clickSoundObj){ window.__clickSoundObj = new Audio('${clickSound}'); } window.__clickSoundObj.currentTime = 0; window.__clickSoundObj.play(); });`;
  // สร้าง HTML สำหรับปุ่มแต่ละหมวด
  const buttonsHTML = Object.entries(categories)
    .filter(([key, value]) => value.trim())
    .map(([key, value]) => {
      // ใช้ data attributes แทนการส่งผ่าน onclick
      return `
                <button 
                    data-category="${key}"
                    data-content="${encodeURIComponent(value)}"
                    data-card-name="${encodeURIComponent(cardName)}"
                    onclick="${playClickSoundJS}; window.__playClickSound(); window.showCategoryDescriptionFromData(this)"
                    class="w-full mb-3 px-4 py-3 mystic-category-btn mystic-category-btn-${key} flex items-center justify-center gap-2 text-base"
                >
                    <span class='btn-icon'>${categoryLabels[key].split(' ')[0]}</span> ${categoryLabels[key].replace(/^[^ ]+ /, '')}
                </button>
            `;
    }).join('');

  Swal.fire({
    title: `🔮 ${cardName}`,
    html: `
            <div class="text-center">
                ${cardSubtitle ? `<p class="card-subtitle mystic-gold-shadow text-mobile-sm">${cardSubtitle}</p>` : ''}
                <div class="space-y-2">
                    ${buttonsHTML}
                </div>
            </div>
        `,
    showConfirmButton: false,
    showCloseButton: true,
    customClass: {
      popup: 'mystic-modal w-[95vw] max-w-md rounded-xl mx-2',
      title: 'mystic-heading text-[clamp(1rem,4vw,1.25rem)] font-bold text-purple-800 mb-3',
      closeButton: 'text-gray-500 hover:text-gray-700',
      content: 'mystic-gold-shadow',
    }
  });

  // เพิ่มฟังก์ชัน global สำหรับแสดงหมวดหมู่จาก data attributes
  window.showCategoryDescriptionFromData = (buttonElement) => {
    const category = buttonElement.getAttribute('data-category');
    const encodedContent = buttonElement.getAttribute('data-content');
    const encodedCardName = buttonElement.getAttribute('data-card-name');

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

    // Decode ข้อมูลจาก URI component
    const content = decodeURIComponent(encodedContent);
    const cardName = decodeURIComponent(encodedCardName);

    // แปลงข้อความให้รักษารูปแบบ (แปลง \n เป็น <br>)
    const formattedContent = content.replace(/\n/g, '<br>');

    Swal.fire({
      title: `${categoryLabels[category]} - ${cardName}`,
      html: `<div class="category-content mystic-gold-shadow text-[clamp(0.875rem,3.5vw,1rem)]">${formattedContent}</div>`,
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: '👈',
      customClass: {
        popup: 'mystic-modal w-[95vw] max-w-md rounded-xl mx-2',
        title: 'mystic-heading text-[clamp(1rem,4vw,1.25rem)] font-bold text-blue-800 mb-3',
        content: 'mystic-gold-text max-h-[60vh] overflow-y-auto px-2',
        cancelButton: `${categoryColors[category]} px-6 py-3 text-white rounded-lg text-[clamp(0.875rem,3.5vw,1rem)] font-medium mystic-btn`
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

  // ฟังก์ชันเล่นเสียงคลิก
  const playClickSound = () => {
    clickSoundObj.currentTime = 0;
    clickSoundObj.play();
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
            popup: 'mystic-modal bg-white shadow-lg rounded-lg max-w-[90vw]',
            title: 'mystic-heading text-xl font-bold',
            confirmButton: 'mystic-btn bg-blue-500 text-white hover:bg-blue-600 px-4 py-2'
          }
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
            popup: 'mystic-modal bg-white shadow-lg rounded-lg max-w-[90vw]',
            title: 'mystic-heading text-xl font-bold',
            confirmButton: 'mystic-btn bg-blue-500 text-white hover:bg-blue-600 px-4 py-2'
          }
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
            popup: 'mystic-modal bg-white shadow-lg rounded-lg max-w-[90vw]',
            title: 'mystic-heading text-xl font-bold',
            confirmButton: 'mystic-btn bg-blue-500 text-white hover:bg-blue-600 px-4 py-2'
          }
        });
      }
    } catch (error) {
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: error.response?.data?.message || 'ไม่สามารถโหลดข้อมูลได้',
        icon: 'error',
        confirmButtonText: 'ลองใหม่',
        customClass: {
          popup: 'mystic-modal bg-white shadow-lg rounded-lg max-w-[90vw]',
          title: 'mystic-heading text-xl font-bold',
          confirmButton: 'mystic-btn bg-blue-500 text-white hover:bg-blue-600 px-4 py-2'
        }
      }).then(() => {
        playFailSound();
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

  // ตัวกรองไพ่
  const filterOptions = [
    { label: 'All', value: 'all' },
    { label: 'Major Arcana', value: 'major' },
    { label: 'Cups', value: 'cups' },
    { label: 'Pentacles', value: 'pentacles' },
    { label: 'Swords', value: 'swords' },
    { label: 'Wands', value: 'wands' },
  ];
  const [filter, setFilter] = useState('all');

  // แยก Major/Minor ด้วยชื่อ
  const isMinor = (name) =>
    ['cups', 'ถ้วย', 'pentacles', 'เหรียญ', 'swords', 'ดาบ', 'wands', 'ไม้']
      .some(keyword => (name || '').toLowerCase().includes(keyword));

  const majorArcana = useMemo(() => uniqueCards.filter(card => !isMinor(card.name)), [uniqueCards]);
  const minorArcana = useMemo(() => uniqueCards.filter(card => isMinor(card.name)), [uniqueCards]);

  // ฟังก์ชันกรองไพ่ตาม filter (Minor Arcana แยกตามชื่อไพ่)
  const getFilteredCards = () => {
    if (filter === 'all') return uniqueCards;
    if (filter === 'major') return majorArcana;
    if (filter === 'cups') return minorArcana.filter(card => (card.name || '').toLowerCase().includes('cups') || (card.name || '').includes('ถ้วย'));
    if (filter === 'pentacles') return minorArcana.filter(card => (card.name || '').toLowerCase().includes('pentacles') || (card.name || '').includes('เหรียญ'));
    if (filter === 'swords') return minorArcana.filter(card => (card.name || '').toLowerCase().includes('swords') || (card.name || '').includes('ดาบ'));
    if (filter === 'wands') return minorArcana.filter(card => (card.name || '').toLowerCase().includes('wands') || (card.name || '').includes('ไม้'));
    return uniqueCards;
  };
  const filteredCards = getFilteredCards();

  if (isLoading) {
    return (
      <div className="mx-4 sm:mx-6 md:mx-8 lg:mx-12 py-6">
        <div className="mb-6">
          <div className="mystic-card glassmorphism border-2 border-yellow-300 rounded-xl shadow-xl p-4">
            <div className="flex flex-col items-center py-4 animate-pulse">
              <div className="w-20 h-20 mb-3 rounded-full bg-yellow-300"></div>
              <div className="h-5 w-32 bg-yellow-300 rounded mb-1"></div>
              <div className="h-4 w-48 bg-yellow-300 rounded"></div>
            </div>
          </div>
        </div>
        <div>
          <h2 className="mystic-heading text-lg font-semibold mb-2 text-center">ไพ่ของฉัน</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-2 border-yellow-300 rounded-xl p-4 glassmorphism justify-items-center">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="mystic-card glassmorphism rounded-xl shadow-lg animate-pulse">
                <div className="relative w-full" style={{ paddingTop: '150%' }}>
                  <div className="absolute top-0 left-0 w-full h-full bg-gray-300 rounded-t-lg"></div>
                </div>
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
        <div className="mystic-card glassmorphism border-2 border-yellow-300 rounded-xl shadow-xl p-4">
          <div className="flex flex-col items-center py-4">
            <img
              className="w-20 h-20 mb-3 rounded-full shadow-lg border-2 border-yellow-300 bg-white/60"
              src="https://i.postimg.cc/3N5vPMDq/moodcura.webp"
              alt="User Avatar"
              loading="eager"
            />
            <h5 className="mb-1 text-lg font-bold mystic-gold-text font-serif">{username}</h5>
            <span className="text-xs text-center mystic-gold-text font-serif">สวัสดีผมมูดๆเอง สะสมไพ่เยอะนะครับเด่วผมรางวัลให้moooo</span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mystic-heading text-lg font-semibold mb-2 text-center">ไพ่ของฉัน</h2>
        <p className="text-sm text-center mb-4 mystic-gold-text font-serif">
          {filteredCards.length > 0 ? `จำนวนครอบครอง ${filteredCards.length} ไพ่` : 'ยังไม่มีการ์ดในครอบครอง..เลยหรอ???'}
        </p>
        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {filterOptions.map(opt => (
            <button
              key={opt.value}
              className={`px-3 py-1 rounded-full border transition font-serif text-sm ${filter === opt.value ? 'bg-yellow-300 text-purple-900 font-bold border-yellow-400' : 'bg-white/80 text-gray-700 border-gray-300 hover:bg-yellow-100'}`}
              onClick={() => { playClickSound(); setFilter(opt.value); }}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-2 border-yellow-300 rounded-xl p-4 glassmorphism">
          {filteredCards.length > 0 ? (
            <>
              {filteredCards.slice(0, visibleCards).map((cardInfo) => (
                <div
                  key={cardInfo.id || cardInfo.name}
                  className="mystic-card glassmorphism rounded-xl shadow-lg p-4 flex flex-col items-center transition-transform duration-300 hover:scale-105 cursor-pointer border-2 border-yellow-300"
                >
                  <div className="relative w-full" style={{ paddingTop: '150%' }}>
                    <img
                      src={cardInfo.image_url || 'https://via.placeholder.com/300x450?text=Image+Not+Found'}
                      alt={cardInfo.name}
                      width="200"
                      height="300"
                      className="absolute top-0 left-0 h-full w-auto mx-auto object-contain rounded-t-lg border-2 border-yellow-300 shadow-lg bg-white/60 bg-gray-100"
                      loading="lazy"
                      onError={(e) => (e.target.src = 'https://via.placeholder.com/300x450?text=Image+Not+Found')}
                    />
                  </div>
                  {/* ชื่อไพ่ใต้รูป */}
                  <p className="mystic-gold-text text-xs font-medium mt-2 font-serif line-clamp-2 text-center">{cardInfo.name}</p>
                  <button
                    className="user-card-btn mystic-btn bg-gradient-to-r from-purple-600 via-purple-500 to-yellow-400 hover:from-yellow-400 hover:to-purple-600 text-white text-[0.75rem] px-2 py-1 rounded-md font-medium mt-1 shadow-lg border-2 border-yellow-300 sm:text-sm sm:px-3 sm:py-1.5"
                    onClick={() => { playClickSound(); showPrediction(cardInfo.name, cardInfo.description || 'ไม่มีคำอธิบาย', cardInfo.image_url); }}
                  >
                    อ่านไพ่
                  </button>
                </div>
              ))}
              {visibleCards < filteredCards.length && (
                <button
                  onClick={() => { playClickSound(); loadMore(); }}
                  className="mt-4 px-6 py-3 mystic-btn bg-gradient-to-r from-purple-600 via-purple-500 to-yellow-400 hover:from-yellow-400 hover:to-purple-600 text-white rounded-lg mx-auto block col-span-full text-mobile-base font-medium touch-button shadow-lg border-2 border-yellow-300"
                >
                  โหลดไพ่ต่อเลย🧵
                </button>
              )}
            </>
          ) : (
            <p className="mystic-gold-text col-span-full text-center text-sm">ยังไม่มีการ์ดในครอบครอง..เลยหรอ???</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default User;      