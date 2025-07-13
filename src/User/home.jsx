import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cacheUtils } from '../utils/cache';
import clickSound from '../assets/click.mp3';
const clickSoundObj = new window.Audio(clickSound);
import failSound from '../assets/fail.mp3';
const failSoundObj = new window.Audio(failSound);
const playFailSound = () => {
    failSoundObj.currentTime = 0;
    failSoundObj.play();
};
import magicSound from '../assets/magic.mp3';
const magicSoundObj = new window.Audio(magicSound);
const playMagicSound = () => {
    magicSoundObj.currentTime = 0;
    magicSoundObj.play();
};

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Constants
const ANIMATION_DURATION = 5000;
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
        title: `<span class='mystic-heading text-xl'>${title}</span>`,
        text,
        icon,
        confirmButtonText: options.confirmButtonText || 'ตกลง',
        showCancelButton: options.showCancelButton || false,
        cancelButtonText: options.cancelButtonText || 'ยกเลิก',
        input: options.input || null,
        inputLabel: options.inputLabel || null,
        customClass: {
            popup: 'mystic-modal w-[95vw] max-w-md rounded-xl mx-2',
            title: 'mystic-heading text-xl mb-2',
            content: 'text-[clamp(0.95rem,3.5vw,1.1rem)] mystic-gold-text font-serif',
            confirmButton: 'mystic-btn w-full mt-4',
            cancelButton: 'mystic-btn w-full mt-4',
            htmlContainer: 'font-serif',
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
        if (trimmedLine.includes('💘 ความรัก')) {
            currentCategory = 'love';
        } else if (trimmedLine.includes('💼 การงาน')) {
            currentCategory = 'work';
        } else if (trimmedLine.includes('💸 การเงิน')) {
            currentCategory = 'money';
        } else if (trimmedLine.includes('🩺 สุขภาพ')) {
            currentCategory = 'health';
        } else if (trimmedLine.includes('🧭 คำแนะนำ')) {
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
                ${cardSubtitle ? `<p class="card-subtitle text-mobile-sm mystic-gold-text mb-2">${cardSubtitle}</p>` : ''}
                <div class="space-y-2">
                    ${buttonsHTML}
                </div>
            </div>
        `,
        showConfirmButton: false,
        showCloseButton: true,
        customClass: {
            popup: 'mystic-modal w-[95vw] max-w-md rounded-xl mx-2',
            title: 'mystic-heading text-2xl mb-3',
            closeButton: 'text-yellow-300 hover:text-yellow-100',
            htmlContainer: 'font-serif',
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
                title: 'mystic-heading text-2xl mb-3',
                content: 'mystic-gold-text max-h-[60vh] overflow-y-auto px-2',
                cancelButton: 'mystic-btn w-full mt-4',
                htmlContainer: 'font-serif',
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
    return timestamp && (Date.now() - timestamp) < cacheUtils.CACHE_DURATION;
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
            timeout: API_TIMEOUT,
            headers: {
                'Cache-Control': 'no-cache',
            }
        });
        return response.data.data;
    }, []);

    const updateUserCards = useCallback(async (cardId) => {
        try {
            console.log('Adding user card:', { user_id: userData.userId, card_id: cardId });

            // ใช้ endpoint add-usercard โดยตรง
            const response = await axios.post(
                `${API_BASE_URL}add-usercard`,
                {
                    user_id: userData.userId,
                    card_id: cardId
                },
                {
                    timeout: API_TIMEOUT,
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );
            console.log('User card added successfully:', response.data);
        } catch (error) {
            console.error('Error adding user card:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            console.error('Error message:', error.response?.data?.message);
            console.error('Full error response:', JSON.stringify(error.response?.data, null, 2));
            console.error('Request data sent:', { user_id: userData.userId, card_id: cardId });
            console.error('API URL:', `${API_BASE_URL}add-usercard`);

            // ตรวจสอบว่าเป็นการ์ดที่มีอยู่แล้วหรือไม่
            if (error.response?.data?.message === 'User Card Already Exist') {
                console.log('User already has this card, throwing error for handling...');
                throw error; // Throw error เพื่อให้ drawCard จัดการ
            }

            // ลองใช้ endpoint user-card เป็น fallback (เฉพาะกรณีที่ไม่ใช่การ์ดที่มีอยู่แล้ว)
            try {
                console.log('Trying fallback endpoint: user-card');
                const fallbackResponse = await axios.post(
                    `${API_BASE_URL}user-card`,
                    {
                        user_id: userData.userId,
                        card_id: cardId,
                        action: 'add'
                    },
                    {
                        timeout: API_TIMEOUT,
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    }
                );
                console.log('User card added successfully with fallback:', fallbackResponse.data);
            } catch (fallbackError) {
                console.error('Fallback endpoint also failed:', fallbackError.response?.data);
                console.error('Fallback error message:', fallbackError.response?.data?.message);
                throw fallbackError; // Throw error เพื่อให้ drawCard จัดการ
            }
        }
    }, [userData.userId]);

    const updateUserPoint = useCallback(async (newPoint) => {
        try {
            console.log('Updating user point:', { id: userData.userId, point: newPoint });
            const response = await axios.put(
                `${API_BASE_URL}user-point`,
                { id: userData.userId, point: newPoint },
                {
                    timeout: API_TIMEOUT,
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );
            console.log('User point updated successfully:', response.data);
        } catch (error) {
            console.error('Error updating user point:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            // ไม่ throw error เพื่อไม่ให้กระทบการแสดงการ์ด
        }
    }, [userData.userId]);

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
                console.log('Raw user data from localStorage:', userData);

                const userInfo = userData.user;
                console.log('User info:', userInfo);

                // ตรวจสอบว่ามีข้อมูลที่จำเป็นหรือไม่
                if (!userInfo || !userInfo.user_id) {
                    console.error('Invalid user data structure:', userInfo);
                    return false;
                }

                const userDataState = {
                    userId: userInfo.user_id,
                    token: userInfo.token || null,
                    point: userInfo.point || userInfo.token || 0 // ใช้ point หรือ token เป็น fallback
                };

                console.log('Setting user data state:', userDataState);
                setUserData(userDataState);
                return true;
            }
            console.log('No user data found in localStorage');
            return false;
        } catch (error) {
            console.error('Error loading user data:', error);
            return false;
        }
    }, []);

    const loadCardsData = useCallback(async () => {
        try {
            // Use cache utility to get cached data
            const cachedCards = cacheUtils.getCachedData('tarotCardsCache');
            if (cachedCards) {
                setCardsData({ cards: cachedCards, timestamp: Date.now() });
                return;
            }

            // Load from API if cache is invalid or doesn't exist
            const cards = await callApi(fetchCards);
            const timestamp = Date.now();
            setCardsData({ cards, timestamp });

            // Save to cache using utility
            cacheUtils.setCachedData('tarotCardsCache', cards);
        } catch (error) {
            console.error('Error loading cards data:', error);
            showAlert(
                'เกิดข้อผิดพลาด!',
                'ไม่สามารถโหลดไพ่ทาโรต์ได้ กรุณาลองใหม่',
                'error',
                { customClass: { title: 'text-red-600', confirmButton: 'bg-red-600 hover:bg-red-700' } }
            );
        }
    }, [callApi, fetchCards]);

    // Preload cards data in background
    useEffect(() => {
        const preloadCards = async () => {
            try {
                // Use cache utility to check and preload
                const cachedCards = cacheUtils.getCachedData('tarotCardsCache');
                if (cachedCards) {
                    setCardsData({ cards: cachedCards, timestamp: Date.now() });
                    return;
                }

                // Load in background without blocking UI
                fetchCards().then(cards => {
                    setCardsData({ cards, timestamp: Date.now() });
                    cacheUtils.setCachedData('tarotCardsCache', cards);
                }).catch(error => {
                    console.error('Background cards loading failed:', error);
                });
            } catch (error) {
                console.error('Error in preload cards:', error);
            }
        };

        preloadCards();
    }, [fetchCards]);

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
            playFailSound();
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
            playFailSound();
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
                playFailSound();
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

                // เรียก API เพิ่มการ์ดและตรวจสอบผลลัพธ์
                try {
                    await updateUserCards(randomCard.card_id);
                    // แจ้งเตือนว่าการ์ดถูกเพิ่มเข้าไปในคอลเลกชัน
                    playMagicSound();
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
                } catch (cardError) {
                    // ตรวจสอบว่าเป็นการ์ดที่มีอยู่แล้วหรือไม่
                    if (cardError.response?.data?.message === 'User Card Already Exist') {
                        playMagicSound();
                        showAlert(
                            '🃏 ไพ่ใบนี้มีอยู่แล้ว!',
                            `ไพ่ "${randomCard.name}" มีอยู่ในคอลเลกชันของคุณแล้ว! ไปดูที่หน้า "My Card" ตรงขีด3ขีดขวาบนได้เลย`,
                            'success',
                            {
                                customClass: {
                                    title: 'text-blue-600',
                                    confirmButton: 'bg-blue-600 hover:bg-blue-700'
                                },
                                confirmButtonText: '🃏ดูคำทำนาย'
                            }
                        );
                    } else {
                        // กรณีอื่นๆ ให้แสดงข้อความปกติ
                        playMagicSound();
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
                    }
                }
            } catch (error) {
                console.error('Error drawing card:', error);
                // แสดง error เฉพาะเมื่อไม่สามารถสุ่มการ์ดได้
                playFailSound();
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
                // Load user data first (fast, from localStorage)
                const userLoaded = loadUserData();
                if (!userLoaded) {
                    throw new Error('User data not found');
                }

                // Set loading to false ทันทีหลังโหลด user data
                setIsInitializing(false);

                // Load cards data in parallel (can be slower, but won't block UI)
                loadCardsData().catch(error => {
                    console.error('Cards loading failed:', error);
                    // Don't throw error here, let user continue with cached data
                });
            } catch (error) {
                console.error('Initialization error:', error);
                showAlert(
                    'เกิดข้อผิดพลาด!',
                    'ไม่สามารถโหลดหน้าได้ กรุณาลองใหม่',
                    'error',
                    { customClass: { title: 'text-red-600', confirmButton: 'bg-red-600 hover:bg-red-700' } }
                );
                setIsInitializing(false);
            }
        };

        initialize();
    }, [loadUserData, loadCardsData]);

    // Loading state
    if (isInitializing) {
        return (
            <div className="flex justify-center items-center min-h-screen login-home-bg">

                <div className="mystic-card flex flex-col items-center justify-center p-8 shadow-2xl">
                    <svg className="animate-spin h-12 w-12 text-yellow-300 mb-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    <div className="mystic-heading text-xl text-center mb-2">กำลังโหลดหน้า Home...</div>
                    <div className="text-yellow-200 text-center">โปรดรอสักครู่ กำลังเชื่อมจิตกับจักรวาล...</div>
                </div>
            </div>
        );
    }

    // ฟังก์ชันเล่นเสียงคลิก
    const playClickSound = () => {
        const audio = new window.Audio(clickSound);
        audio.currentTime = 0;
        audio.play();
    };

    return (
        <div
            className="flex flex-col min-h-screen px-[env(safe-area-inset-left)] py-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] login-home-bg layout-stable no-layout-shift"
            style={{ position: 'relative' }}
        >
            {/* Twinkle stars background - optimized for layout stability */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" style={{ contain: 'layout' }}>
                <div className="star-element star-small bg-yellow-200 top-6 left-[10%] animate-twinkle"></div>
                <div className="star-element star-medium bg-yellow-100 top-12 right-[15%] animate-twinkle animation-delay-150"></div>
                <div className="star-element star-small bg-white bottom-8 left-[25%] animate-twinkle animation-delay-300"></div>
                <div className="star-element star-medium bg-yellow-200 top-20 right-[30%] animate-twinkle animation-delay-450"></div>
                <div className="star-element star-small bg-white bottom-16 left-[40%] animate-twinkle animation-delay-600"></div>
                <div className="star-element star-small bg-yellow-100 top-10 left-[60%] animate-twinkle animation-delay-200"></div>
                <div className="star-element star-medium bg-white top-24 left-[80%] animate-twinkle animation-delay-350"></div>
                <div className="star-element star-small bg-yellow-200 bottom-20 right-[10%] animate-twinkle animation-delay-500"></div>
                <div className="star-element star-medium bg-yellow-100 bottom-10 right-[25%] animate-twinkle animation-delay-700"></div>
                <div className="star-element star-small bg-white top-1/2 left-[15%] animate-twinkle animation-delay-800"></div>
                <div className="star-element star-medium bg-yellow-200 top-[70%] left-[50%] animate-twinkle animation-delay-900"></div>
                <div className="star-element star-small bg-yellow-100 bottom-[30%] right-[40%] animate-twinkle animation-delay-1000"></div>
                <div className="star-element star-medium bg-white top-[60%] left-[80%] animate-twinkle animation-delay-1100"></div>
                <div className="star-element star-small bg-yellow-200 top-[80%] left-[20%] animate-twinkle animation-delay-1200"></div>
                <div className="star-element star-medium bg-yellow-100 bottom-[15%] left-[60%] animate-twinkle animation-delay-1300"></div>
            </div>
            <div className="flex-grow flex items-center justify-center p-2 sm:p-4">
                <div className="mystic-card w-full max-w-md mx-auto text-center relative">
                    <div className="card-glow"></div>
                    <h1 className="mystic-heading text-[clamp(1.5rem,4vw,1.75rem)] font-bold mb-4 flex items-center justify-center gap-2">
                        <span className="text-3xl">🃏</span> ทำนายโชคชะตา <span className="text-3xl">✨</span>
                    </h1>

                    {isRevealing ? (
                        <div className="mb-4 flex flex-col justify-center items-center gap-4">
                            <div className="relative w-[10rem] h-[15rem] sm:w-[12rem] sm:h-[18rem] mx-auto">
                                {animationCards.map((card, index) => (
                                    <motion.img
                                        key={`${card.card_id}-${index}`}
                                        src={card.image_url}
                                        alt={`Shuffling card ${card.name}`}
                                        className="absolute w-[8rem] h-[12rem] sm:w-[10rem] sm:h-[15rem] aspect-[2/3] object-contain rounded-lg shadow-2xl border-2 border-yellow-300"
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
                            <p className="text-[clamp(1rem,3.5vw,1.25rem)] font-bold text-yellow-300 drop-shadow-lg">
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
                                            className="w-full max-w-[10rem] sm:max-w-[12rem] aspect-[2/3] object-contain rounded-lg shadow-2xl mx-auto border-2 border-yellow-300"
                                            loading="lazy"
                                            onError={(e) => {
                                                console.error(`Failed to load card image: ${card.image_url}`);
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                        <h2 className="text-lg font-bold mt-2 mystic-gold-text drop-shadow-lg">{card.name}</h2>
                                        <button
                                            onClick={() => { playClickSound(); showCardDescription(card.description, card.name); }}
                                            className="mystic-btn w-full flex items-center justify-center gap-2 mt-2"
                                        >
                                            <span className="btn-icon">👁️</span> ดูคำทำนายของไพ่ใบนี้
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="italic text-yellow-200 mb-4 text-sm">🫵 โปรดเติมพลังก่อนสุ่มไพ่ทาโรต์!</p>
                    )}

                    <div className="my-3">
                        <button
                            onClick={(e) => { playClickSound(); handleRedeemCode(e); }}
                            disabled={apiLoading}
                            type="button"
                            className="mystic-btn w-full flex items-center justify-center gap-2"
                        >
                            <span className="btn-icon">✨</span> {apiLoading ? 'กำลังเชื่อมจิต...' : 'กรอกโค้ดลับ'}
                        </button>
                    </div>

                    <div>
                        <button
                            onClick={(e) => { playClickSound(); drawCard(e); }}
                            disabled={!canDrawCard}
                            className={`mystic-btn w-full flex items-center justify-center gap-2 font-bold shadow-md ${!canDrawCard ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <span className="btn-icon">🔮</span> {userData.point > 0 ? `ใช้พลังทำนาย: ${userData.point}` : 'สุ่มไพ่ทาโรต์'}
                        </button>
                    </div>
                </div>
            </div>

            <footer className="bg-transparent min-h-[48px] flex justify-center items-center p-4 mt-4">
                <div className="text-center">
                    <p className="text-sm font-light italic mystic-black-text">© 2025 Tarot Moodma. สงวนลิขสิทธิ์.</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;