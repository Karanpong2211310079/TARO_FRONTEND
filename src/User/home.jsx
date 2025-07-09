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
            popup: 'w-[90%] max-w-md rounded-xl',
            title: 'text-[clamp(1rem,3.5vw,1.25rem)] font-bold',
            confirmButton: 'px-4 py-3 text-sm text-white rounded min-h-[48px]',
            cancelButton: 'px-4 py-3 text-sm text-gray-800 rounded min-h-[48px]',
            ...options.customClass,
        },
        ...options,
    });
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
        await axios.post(
            `${API_BASE_URL}add-usercard`,
            { user_id: userData.userId, card_id: cardId },
            {
                headers: { Authorization: `Bearer ${userData.token}` },
                timeout: API_TIMEOUT
            }
        );
    }, [userData.userId, userData.token]);

    const updateUserPoint = useCallback(async (newPoint) => {
        await axios.put(
            `${API_BASE_URL}user-point`,
            { id: userData.userId, point: newPoint },
            {
                headers: { Authorization: `Bearer ${userData.token}` },
                timeout: API_TIMEOUT
            }
        );
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
                const randomCard = cardsData.cards[Math.floor(Math.random() * cardsData.cards.length)];
                setDrawnCards([randomCard]);

                const newPoint = userData.point - 1;
                setUserData(prev => ({ ...prev, point: newPoint }));

                await Promise.all([
                    updateUserPoint(newPoint),
                    updateUserCards(randomCard.card_id)
                ]);

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

    const showCardDescription = useCallback((description) => {
        showAlert(
            '🔮ชะตาคุณถูกเปิดเผยแล้ว👀',
            description,
            {
                confirmButtonText: '🧿',
                customClass: {
                    title: 'text-blue-800',
                    confirmButton: 'bg-yellow-700 hover:bg-yellow-800'
                }
            }
        );
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
                                        <h2 className="text-base font-bold mt-2 text-purple-800">{card.name}</h2>
                                        <p className="italic text-gray-800 text-sm line-clamp-3">{card.description}</p>
                                        <button
                                            onClick={() => showCardDescription(card.description)}
                                            className="text-purple-600 hover:text-purple-800 text-xs underline mt-1"
                                        >
                                            อ่านต่อ...
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
                            className={`bg-purple-700 hover:bg-purple-800 text-white px-4 py-3 rounded text-sm w-full transform hover:scale-105 transition-transform duration-200 min-h-[48px] touch-action-manipulation ${apiLoading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            {apiLoading ? 'กำลังเชื่อมจิต...' : 'กรอกโค้ดลับ'}
                        </button>
                    </div>

                    <div>
                        <button
                            onClick={drawCard}
                            disabled={!canDrawCard}
                            className={`bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded font-bold shadow-md text-sm w-full transform hover:scale-105 transition-transform duration-200 min-h-[48px] touch-action-manipulation ${!canDrawCard ? 'opacity-50 cursor-not-allowed' : ''
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