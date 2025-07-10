import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/background.jpg';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Constants
const ANIMATION_DURATION = 5000;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const API_TIMEOUT = 10000;

// Animation variants
const cardVariants = {
    shuffle: {
        x: [0, -50, 50, 0],
        rotate: [0, 10, -10, 0],
        transition: {
            x: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' },
            rotate: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' },
        },
    },
    shuffle2: {
        x: [0, 50, -50, 0],
        rotate: [0, -10, 10, 0],
        transition: {
            x: { repeat: Infinity, duration: 1.7, ease: 'easeInOut' },
            rotate: { repeat: Infinity, duration: 1.7, ease: 'easeInOut' },
        },
    },
    shuffle3: {
        scale: [1, 1.1, 1],
        rotate: [0, 5, -5, 0],
        transition: {
            scale: { repeat: Infinity, duration: 1.6, ease: 'easeInOut' },
            rotate: { repeat: Infinity, duration: 1.6, ease: 'easeInOut' },
        },
    },
};

// Custom hooks
const useLocalStorage = (key, initialValue) => {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    const setValue = useCallback((value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    }, [key, storedValue]);

    return [storedValue, setValue];
};

const useApiCall = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const callApi = useCallback(async (apiFunction, successCallback, errorCallback) => {
        setLoading(true);
        setError(null);

        try {
            const result = await apiFunction();
            if (successCallback) successCallback(result);
            return result;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
            setError(errorMessage);
            if (errorCallback) errorCallback(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { loading, error, callApi };
};

// Utility functions
const showAlert = (title, text, icon = 'info', options = {}) => {
    return Swal.fire({
        title,
        text,
        icon,
        confirmButtonText: options.confirmButtonText || 'ตกลง',
        showCancelButton: options.showCancelButton || false,
        cancelButtonText: options.cancelButtonText || 'ยกเลิก',
        input: options.input || null,
        inputLabel: options.inputLabel || null,
        customClass: {
            popup: 'w-[95vw] max-w-md rounded-xl mx-2',
            title: 'text-[clamp(1rem,4vw,1.25rem)] font-bold',
            content: 'text-[clamp(0.875rem,3.5vw,1rem)] leading-relaxed max-h-[60vh] overflow-y-auto px-2',
            confirmButton: 'px-6 py-3 text-white rounded-lg text-[clamp(0.875rem,3.5vw,1rem)] font-medium min-h-[48px] touch-action-manipulation',
            cancelButton: 'px-6 py-3 text-gray-800 rounded-lg text-[clamp(0.875rem,3.5vw,1rem)] font-medium min-h-[48px] touch-action-manipulation',
            ...options.customClass,
        },
        ...options,
    });
};

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
        } else if (trimmedLine.includes('การงาน') || trimmedLine.includes('งาน') || trimmedLine.includes('💼') || trimmedLine.includes('🏢') ||
            trimmedLine.includes('อาชีพ') || trimmedLine.includes('ธุรกิจ') || trimmedLine.includes('การทำงาน') ||
            trimmedLine.includes('เพื่อนร่วมงาน') || trimmedLine.includes('เจ้านาย') || trimmedLine.includes('บริษัท') ||
            trimmedLine.includes('โครงการ') || trimmedLine.includes('ตำแหน่ง')) {
            currentCategory = 'work';
        } else if (trimmedLine.includes('การเงิน') || trimmedLine.includes('เงิน') || trimmedLine.includes('💰') || trimmedLine.includes('💵') ||
            trimmedLine.includes('การลงทุน') || trimmedLine.includes('ธุรกิจ') || trimmedLine.includes('ความมั่งคั่ง') ||
            trimmedLine.includes('การออม') || trimmedLine.includes('รายได้') || trimmedLine.includes('กำไร') ||
            trimmedLine.includes('ขาดทุน') || trimmedLine.includes('งบประมาณ')) {
            currentCategory = 'money';
        } else if (trimmedLine.includes('สุขภาพ') || trimmedLine.includes('ร่างกาย') || trimmedLine.includes('🏥') || trimmedLine.includes('💊') ||
            trimmedLine.includes('การรักษา') || trimmedLine.includes('ความเจ็บป่วย') || trimmedLine.includes('การออกกำลังกาย') ||
            trimmedLine.includes('จิตใจ') || trimmedLine.includes('ความเครียด') || trimmedLine.includes('โรค') ||
            trimmedLine.includes('อาการ') || trimmedLine.includes('การพักผ่อน')) {
            currentCategory = 'health';
        } else if (trimmedLine.includes('คำแนะนำ') || trimmedLine.includes('แนะนำ') || trimmedLine.includes('💡') || trimmedLine.includes('✨') ||
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

const isCacheValid = (timestamp) => {
    return timestamp && (Date.now() - timestamp) < CACHE_DURATION;
};

const Home = () => {
    const navigate = useNavigate();

    // State management
    const [cardsData, setCardsData] = useState({ cards: [], timestamp: null });
    const [drawnCards, setDrawnCards] = useState([]);
    const [userData, setUserData] = useState({ userId: null, token: null, point: 0 });
    const [isRevealing, setIsRevealing] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);

    // Custom hooks
    const { loading: apiLoading, error: apiError, callApi } = useApiCall();

    // Memoized values
    const animationCards = useMemo(() => {
        if (cardsData.cards.length === 0) return [];
        const shuffled = [...cardsData.cards].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 3);
    }, [cardsData.cards]);

    const canDrawCard = useMemo(() => {
        return userData.point > 0 && !isRevealing && !apiLoading;
    }, [userData.point, isRevealing, apiLoading]);

    // API functions
    const fetchCards = useCallback(async () => {
        const response = await axios.get(`${API_BASE_URL}taro-card`, {
            timeout: API_TIMEOUT
        });
        return response.data.data;
    }, []);

    const updateUserCards = useCallback(async (cardId) => {
        try {
            await axios.post(
                `${API_BASE_URL}add-usercard`,
                { user_id: userData.userId, card_id: cardId },
                {
                    headers: { Authorization: `Bearer ${userData.token}` },
                    timeout: API_TIMEOUT
                }
            );
        } catch (error) {
            console.error('Error adding user card:', error);
            // ไม่ throw error เพื่อไม่ให้กระทบการแสดงการ์ด
        }
    }, [userData.userId, userData.token]);

    const updateUserPoint = useCallback(async (newPoint) => {
        try {
            await axios.put(
                `${API_BASE_URL}user-point`,
                { id: userData.userId, point: newPoint },
                {
                    headers: { Authorization: `Bearer ${userData.token}` },
                    timeout: API_TIMEOUT
                }
            );
        } catch (error) {
            console.error('Error updating user point:', error);
            // ไม่ throw error เพื่อไม่ให้กระทบการแสดงการ์ด
        }
    }, [userData.userId, userData.token]);

    const redeemCode = useCallback(async (code) => {
        const response = await axios.post(
            `${API_BASE_URL}redeem-code`,
            { code, user_id: userData.userId },
            { timeout: API_TIMEOUT }
        );
        return response.data;
    }, [userData.userId]);

    // Business logic functions
    const loadUserData = useCallback(() => {
        try {
            const user = localStorage.getItem('user');
            if (user) {
                const userData = JSON.parse(user);
                const userInfo = userData.user;
                setUserData({
                    userId: userInfo.user_id,
                    token: userInfo.token,
                    point: userInfo.token
                });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error loading user data:', error);
            return false;
        }
    }, []);

    const loadCardsData = useCallback(async () => {
        try {
            const cached = localStorage.getItem('tarotCardsCache');
            if (cached) {
                const { cards, timestamp } = JSON.parse(cached);
                if (isCacheValid(timestamp)) {
                    setCardsData({ cards, timestamp });
                    return;
                }
            }

            const cards = await callApi(fetchCards);
            const timestamp = Date.now();
            setCardsData({ cards, timestamp });
            localStorage.setItem('tarotCardsCache', JSON.stringify({ cards, timestamp }));
        } catch (error) {
            showAlert(
                'เกิดข้อผิดพลาด!',
                'ไม่สามารถโหลดไพ่ทาโรต์ได้ กรุณาลองใหม่',
                'error',
                { customClass: { title: 'text-red-600', confirmButton: 'bg-red-600 hover:bg-red-700' } }
            );
        }
    }, [callApi, fetchCards]);

    const handleRedeemCode = useCallback(async () => {
        const result = await showAlert(
            'เพิ่มพลังด้วยโค้ดลับ!',
            null,
            'question',
            {
                input: 'text',
                inputLabel: 'ขูด!เเล้วกรอกโค้ดจากหน้าซองเลย',
                showCancelButton: true,
                confirmButtonText: '✨เพิ่มพลัง✨',
                cancelButtonText: 'พลังยังไม่มา',
                customClass: {
                    title: 'text-purple-800',
                    confirmButton: 'bg-purple-700 hover:bg-purple-800'
                }
            }
        );

        if (!result.isConfirmed || !result.value?.trim()) {
            showAlert(
                '✋เชื่อมจิตไม่ผ่าน✋',
                'เอ๊ะ! โค้ดลับผิดนะ (อักษรพิมพ์ใหญ่นะจ๊ะ)',
                'error',
                { customClass: { title: 'text-red-600', confirmButton: 'bg-red-600 hover:bg-red-700' } }
            );
            return;
        }

        try {
            const response = await callApi(
                () => redeemCode(result.value.trim()),
                (data) => {
                    if (data.success) {
                        setUserData(prev => ({ ...prev, point: data.user.token }));
                        showAlert(
                            '✨เชื่อมจิตได้สำเร็จ✨',
                            '🔮 ตั้งจิตให้สงบ คิดคำถามในใจ แล้วค่อยกด OK!',
                            'success',
                            { customClass: { title: 'text-green-600', confirmButton: 'bg-green-600 hover:bg-green-700' } }
                        );
                    } else {
                        const isUsedCode = data.message?.toLowerCase().includes('already used') ||
                            data.message?.toLowerCase().includes('used');

                        showAlert(
                            isUsedCode ? '💀โค้ดลับถูกใช้แล้ว💀' : 'โค้ดผิดพลาด!',
                            isUsedCode
                                ? 'หากโค้ดยังไม่เคยใช้ ติดต่อแอดมินหน้า login ได้เลยจ๊ะหนู🫶'
                                : data.message || 'โค้ดนี้ไม่ถูกต้อง กรุณาลองใหม่',
                            'error',
                            {
                                customClass: {
                                    title: isUsedCode ? 'text-yellow-600' : 'text-red-600',
                                    confirmButton: isUsedCode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-red-600 hover:bg-red-700'
                                }
                            }
                        );
                    }
                }
            );
        } catch (error) {
            showAlert(
                '✋เชื่อมจิตไม่ผ่าน✋',
                'เอ๊ะ! โค้ดลับผิดนะ (อักษรพิมพ์ใหญ่นะจ๊ะ)',
                'error',
                { customClass: { title: 'text-red-600', confirmButton: 'bg-red-600 hover:bg-red-700' } }
            );
        }
    }, [callApi, redeemCode]);

    const drawCard = useCallback(async () => {
        if (!canDrawCard) {
            if (userData.point <= 0) {
                showAlert(
                    '👀พลังทำนายหมด!',
                    'เติมพลังด้วยโค้ดลับ!',
                    'warning',
                    { customClass: { title: 'text-yellow-600', confirmButton: 'bg-yellow-600 hover:bg-yellow-700' } }
                );
            }
            return;
        }

        setIsRevealing(true);
        setDrawnCards([]);

        setTimeout(async () => {
            try {
                // ตรวจสอบว่ามีการ์ดในข้อมูลหรือไม่
                if (!cardsData.cards || cardsData.cards.length === 0) {
                    throw new Error('No cards available');
                }

                // สุ่มไพ่แบบเท่าเทียม - ทุกใบมีโอกาสเท่ากัน
                const randomIndex = Math.floor(Math.random() * cardsData.cards.length);
                const randomCard = cardsData.cards[randomIndex];

                // ตรวจสอบว่าการ์ดที่สุ่มได้มีข้อมูลครบหรือไม่
                if (!randomCard || !randomCard.card_id || !randomCard.name) {
                    throw new Error('Invalid card data');
                }

                setDrawnCards([randomCard]);

                const newPoint = userData.point - 1;
                setUserData(prev => ({ ...prev, point: newPoint }));

                // เรียก API แยกกันโดยไม่รอผล
                updateUserPoint(newPoint).catch(error => {
                    console.error('Error updating user point:', error);
                });

                updateUserCards(randomCard.card_id).catch(error => {
                    console.error('Error updating user cards:', error);
                });

                // แจ้งเตือนว่าการ์ดถูกเพิ่มเข้าไปในคอลเลกชัน
                showAlert(
                    '🎉 ได้รับไพ่ใหม่!',
                    `ไพ่ "${randomCard.name}" ถูกเพิ่มเข้าไปในคอลเลกชันของคุณแล้ว! ไปดูที่หน้า "My Card" ตรงขีด3ขีดขวาบนได้เลย`,
                    'success',
                    {
                        customClass: {
                            title: 'text-green-600',
                            confirmButton: 'bg-green-600 hover:bg-green-700'
                        },
                        confirmButtonText: '🃏ดูคำทำนาย'
                    }
                );
            } catch (error) {
                console.error('Error drawing card:', error);
                // แสดง error เฉพาะเมื่อไม่สามารถสุ่มการ์ดได้
                showAlert(
                    'เกิดข้อผิดพลาด!',
                    'ไม่สามารถสุ่มไพ่ได้ กรุณาลองใหม่',
                    'error',
                    { customClass: { title: 'text-red-600', confirmButton: 'bg-red-600 hover:bg-red-700' } }
                );
            } finally {
                setIsRevealing(false);
            }
        }, ANIMATION_DURATION);
    }, [canDrawCard, userData.point, cardsData.cards, updateUserPoint, updateUserCards]);

    const showCardDescription = useCallback((description, cardName) => {
        showCardDescriptionByCategory(description, cardName);
    }, []);

    // Effects
    useEffect(() => {
        const initialize = async () => {
            setIsInitializing(true);
            try {
                const userLoaded = loadUserData();
                if (!userLoaded) {
                    throw new Error('User data not found');
                }
                await loadCardsData();
            } catch (error) {
                showAlert(
                    'เกิดข้อผิดพลาด!',
                    'ไม่สามารถโหลดหน้าได้ กรุณาลองใหม่',
                    'error',
                    { customClass: { title: 'text-red-600', confirmButton: 'bg-red-600 hover:bg-red-700' } }
                );
            } finally {
                setIsInitializing(false);
            }
        };

        initialize();
    }, [loadUserData, loadCardsData]);

    // Loading state
    if (isInitializing) {
        return (
            <div
                className="flex justify-center items-center min-h-screen bg-gray-600 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${backgroundImage})` }}
            >
                <div className="bg-white bg-opacity-70 p-6 rounded-xl shadow-2xl w-[90%] max-w-md">
                    <div className="animate-pulse">
                        <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto mb-4"></div>
                        <div className="h-40 bg-gray-300 rounded-lg mb-4"></div>
                        <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto mb-2"></div>
                        <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="flex flex-col min-h-screen bg-gray-600 bg-cover bg-center bg-no-repeat px-[env(safe-area-inset-left)] py-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
            style={{ backgroundImage: `url(${backgroundImage})` }}
        >
            <div className="flex-grow flex items-center justify-center p-4">
                <div className="bg-white bg-opacity-70 p-6 rounded-xl shadow-2xl text-center w-[90%] max-w-md">
                    <h1 className="text-[clamp(1.5rem,4vw,1.75rem)] font-bold mb-4 text-purple-800">
                        🃏 ทำนายโชคชะตา ✨
                    </h1>

                    {isRevealing ? (
                        <div className="mb-4 flex flex-col justify-center items-center gap-4">
                            <div className="relative w-[12rem] h-[18rem]">
                                {animationCards.map((card, index) => (
                                    <motion.img
                                        key={`${card.card_id}-${index}`}
                                        src={card.image_url}
                                        alt={`Shuffling card ${card.name}`}
                                        className="absolute w-[10rem] h-[15rem] aspect-[2/3] object-contain rounded-lg shadow-2xl"
                                        variants={cardVariants}
                                        animate={index === 0 ? 'shuffle' : index === 1 ? 'shuffle2' : 'shuffle3'}
                                        style={{
                                            top: `${10 + index * 3}%`,
                                            left: `${5 + index * 5}%`,
                                        }}
                                        loading="lazy"
                                        onError={(e) => {
                                            console.error(`Failed to load card image: ${card.image_url}`);
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                ))}
                            </div>
                            <p className="text-[clamp(1rem,3.5vw,1.25rem)] font-bold text-red-600">
                                🔮 โชคชะตากำลังถูกเปิดเผย...
                            </p>
                        </div>
                    ) : drawnCards.length > 0 ? (
                        <div className="mb-4">
                            <div className="flex flex-col justify-center items-center gap-4">
                                {drawnCards.map((card) => (
                                    <motion.div
                                        key={card.card_id}
                                        initial={{ opacity: 0, rotateY: 180 }}
                                        animate={{ opacity: 1, rotateY: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="w-full text-center"
                                    >
                                        <img
                                            src={card.image_url}
                                            alt={card.name}
                                            className="w-full max-w-[12rem] aspect-[2/3] object-contain rounded-lg shadow-2xl mx-auto transform hover:scale-105 transition-transform duration-300"
                                            loading="lazy"
                                            onError={(e) => {
                                                console.error(`Failed to load card image: ${card.image_url}`);
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                        <h2 className="text-lg font-bold mt-2 text-purple-800">{card.name}</h2>
                                        <button
                                            onClick={() => showCardDescription(card.description, card.name)}
                                            className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-4 rounded-lg text-mobile-base font-medium w-full transform hover:scale-105 transition-transform duration-200 touch-button mt-2"
                                        >
                                            คำทำนาย
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="italic text-gray-800 mb-4 text-sm">🫵 โปรดเติมพลังก่อนสุ่มไพ่ทาโรต์!</p>
                    )}

                    <div className="my-3">
                        <button
                            onClick={handleRedeemCode}
                            disabled={apiLoading}
                            type="button"
                            className={`bg-purple-700 hover:bg-purple-800 text-white px-6 py-4 rounded-lg text-mobile-base font-medium w-full transform hover:scale-105 transition-transform duration-200 touch-button ${apiLoading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            {apiLoading ? 'กำลังเชื่อมจิต...' : 'กรอกโค้ดลับ'}
                        </button>
                    </div>

                    <div>
                        <button
                            onClick={drawCard}
                            disabled={!canDrawCard}
                            className={`bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg font-bold shadow-md text-mobile-base w-full transform hover:scale-105 transition-transform duration-200 touch-button ${!canDrawCard ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            {userData.point > 0 ? `ใช้พลังทำนาย: ${userData.point}` : 'สุ่มไพ่ทาโรต์'}
                        </button>
                    </div>
                </div>
            </div>

            <footer className="bg-purple-900 min-h-[48px] flex justify-center items-center p-4 shadow-2xl">
                <div className="text-center">
                    <p className="text-sm font-light italic">© 2025 Tarot Moodma. สงวนลิขสิทธิ์.</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;