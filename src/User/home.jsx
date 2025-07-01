import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { motion } from 'framer-motion';
import backgroundImage from '../assets/background.jpg'; // Assuming you have a background image

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Variants สำหรับอนิเมชันสับไพ่
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

const Home = () => {
    const [cardsOriginal, setCardsOriginal] = useState([]);
    const [cards, setCards] = useState([]);
    const [point, setPoint] = useState(0);
    const [userId, setUserId] = useState(null);
    const [token, setToken] = useState(null);
    const [isRevealing, setIsRevealing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Debug: ตรวจสอบว่า background image โหลดได้หรือไม่
    useEffect(() => {
        const img = new Image();
        img.src = backgroundImage;
        img.onload = () => console.log('Background image loaded successfully:', backgroundImage);
        img.onerror = () => console.error('Failed to load background image:', backgroundImage);
    }, []);

    const loadUserFromLocalStorage = () => {
        const user = localStorage.getItem('user');
        if (user) {
            const userData = JSON.parse(user);
            setUserId(userData.user.user_id);
            setToken(userData.user.token);
            setPoint(userData.user.token);
        }
    };

    const Bring_Cards = async () => {
        const cachedCards = localStorage.getItem('tarotCards');
        if (cachedCards) {
            setCardsOriginal(JSON.parse(cachedCards));
            setIsLoading(false);
            return;
        }
        try {
            const res = await axios.get(`${API_BASE_URL}taro-card`, { timeout: 5000 });
            setCardsOriginal(res.data.data);
            localStorage.setItem('tarotCards', JSON.stringify(res.data.data));
        } catch (error) {
            Swal.fire({
                title: 'เกิดข้อผิดพลาด!',
                text: 'ไม่สามารถโหลดไพ่ทาโรต์ได้ กรุณาลองใหม่',
                icon: 'error',
                confirmButtonText: 'ลองใหม่',
                customClass: {
                    popup: 'w-[90%] max-w-md rounded-xl',
                    title: 'text-[clamp(1rem,3.5vw,1.25rem)] font-bold text-red-600',
                    confirmButton: 'bg-red-600 hover:bg-red-700 px-4 py-3 text-sm text-white rounded min-h-[48px]',
                },
            });
        } finally {
            setIsLoading(false);
        }
    };

    const updateUserCards = async (newCardId) => {
        try {
            const cardId = parseInt(newCardId, 10);
            await axios.post(
                `${API_BASE_URL}add-usercard`,
                { user_id: userId, card_id: cardId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const updatedUser = { ...JSON.parse(localStorage.getItem('user')) };
            updatedUser.user.cards = [...(updatedUser.user.cards || []), cardId];
            localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (err) {
            console.error('Error updating cards', err);
        }
    };

    const updateUserPoint = async (newPoint) => {
        try {
            await axios.put(
                `${API_BASE_URL}user-point`,
                { id: userId, point: newPoint },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const updatedUser = { ...JSON.parse(localStorage.getItem('user')) };
            updatedUser.user.token = newPoint;
            localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (err) {
            console.error('Error updating point', err);
        }
    };

    const ReedeemCode = async () => {
        Swal.fire({
            title: 'เพิ่มพลังด้วยโค้ดลับ!',
            input: 'text',
            inputLabel: 'ขูด!เเล้วกรอกโค้ดจากหน้าซองเลย',
            showCancelButton: true,
            confirmButtonText: '✨เพิ่มพลัง✨',
            cancelButtonText: 'พลังยังไม่มา',
            customClass: {
                popup: 'w-[90%] max-w-md rounded-xl',
                title: 'text-[clamp(1rem,3.5vw,1.25rem)] font-bold text-purple-800',
                inputLabel: 'text-sm text-gray-600',
                confirmButton: 'bg-purple-700 hover:bg-purple-800 px-4 py-3 text-sm text-white rounded min-h-[48px]',
                cancelButton: 'bg-gray-300 hover:bg-gray-400 px-4 py-3 text-sm text-gray-800 rounded min-h-[48px]',
            },
        }).then(async (result) => {
            if (result.isConfirmed) {
                const code = result.value?.trim();
                if (!code) {
                    Swal.fire({
                        title: '✋เชื่อมจิตไม่ผ่าน✋',
                        text: 'เอ๊ะ! โค้ดลับผิดนะ (อักษรพิมพ์ใหญ่นะจ๊ะ)',
                        icon: 'error',
                        customClass: {
                            popup: 'w-[90%] max-w-md rounded-xl',
                            title: 'text-[clamp(1rem,3.5vw,1.25rem)] font-bold text-red-600',
                            confirmButton: 'bg-red-600 hover:bg-red-700 px-4 py-3 text-sm text-white rounded min-h-[48px]',
                        },
                    });
                    return;
                }
                try {
                    const response = await axios.post(`${API_BASE_URL}redeem-code`, {
                        code,
                        user_id: userId,
                    });
                    if (response.data.success) {
                        setPoint(response.data.user.token);
                        Swal.fire({
                            title: '✨เชื่อมจิตได้สำเร็จ✨',
                            text: '🔮 ตั้งจิตให้สงบ คิดคำถามในใจ แล้วค่อยกด OK!',
                            icon: 'success',
                            customClass: {
                                popup: 'w-[90%] max-w-md rounded-xl',
                                title: 'text-[clamp(1rem,3.5vw,1.25rem)] font-bold text-green-600',
                                confirmButton: 'bg-green-600 hover:bg-green-700 px-4 py-3 text-sm text-white rounded min-h-[48px]',
                            },
                        });
                    } else {
                        if (response.data.message && (response.data.message.toLowerCase().includes('already used') || response.data.message.toLowerCase().includes('used'))) {
                            Swal.fire({
                                title: '💀โค้ดลับถูกใช้แล้ว💀',
                                text: 'หากโค้ดยังไม่เคยใช้ ติดต่อแอดมินหน้า login ได้เลยจ๊ะหนู🫶',
                                icon: 'error',
                                customClass: {
                                    popup: 'w-[90%] max-w-md rounded-xl',
                                    title: 'text-[clamp(1rem,3.5vw,1.25rem)] font-bold text-yellow-600',
                                    confirmButton: 'bg-yellow-600 hover:bg-yellow-700 px-4 py-3 text-sm text-white rounded min-h-[48px]',
                                },
                            });
                        } else {
                            Swal.fire({
                                title: 'โค้ดผิดพลาด!',
                                text: response.data.message || 'โค้ดนี้ไม่ถูกต้อง กรุณาลองใหม่',
                                icon: 'error',
                                customClass: {
                                    popup: 'w-[90%] max-w-md rounded-xl',
                                    title: 'text-[clamp(1rem,3.5vw,1.25rem)] font-bold text-red-600',
                                    confirmButton: 'bg-red-600 hover:bg-red-700 px-4 py-3 text-sm text-white rounded min-h-[48px]',
                                },
                            });
                        }
                    }
                } catch (error) {
                    Swal.fire({
                        title: '✋เชื่อมจิตไม่ผ่าน✋',
                        text: 'เอ๊ะ! โค้ดลับผิดนะ (อักษรพิมพ์ใหญ่นะจ๊ะ)',
                        icon: 'error',
                        customClass: {
                            popup: 'w-[90%] max-w-md rounded-xl',
                            title: 'text-[clamp(1rem,3.5vw,1.25rem)] font-bold text-red-600',
                            confirmButton: 'bg-red-600 hover:bg-red-700 px-4 py-3 text-sm text-white rounded min-h-[48px]',
                        },
                    });
                }
            }
        });
    };

    // ฟังก์ชันสำหรับสุ่มไพ่ 3 ใบสำหรับอนิเมชันสับไพ่
    const selectRandomCardsForAnimation = () => {
        if (cardsOriginal.length > 0) {
            const shuffled = [...cardsOriginal].sort(() => Math.random() - 0.5);
            return shuffled.slice(0, 3); // เลือก 3 ใบแรก
        }
        return [];
    };

    const drawCard = async () => {
        if (point <= 0) {
            Swal.fire({
                title: '👀พลังทำนายหมด!',
                text: 'เติมพลังด้วยโค้ดลับ!',
                icon: 'warning',
                confirmButtonText: 'ปิด',
                customClass: {
                    popup: 'w-[90%] max-w-md rounded-xl',
                    title: 'text-[clamp(1rem,3.5vw,1.25rem)] font-bold text-yellow-600',
                    confirmButton: 'bg-yellow-600 hover:bg-yellow-700 px-4 py-3 text-sm text-white rounded min-h-[48px]',
                },
            });
            return;
        }

        setIsRevealing(true);
        setCards([]);
        console.log('Starting card shuffle animation for 5 seconds'); // Debug

        setTimeout(async () => {
            console.log('Card shuffle animation completed, drawing card'); // Debug
            const randomCards = selectRandomCard();
            setCards(randomCards);
            setIsRevealing(false);

            const updatedPoint = point - 1;
            setPoint(updatedPoint);
            await updateUserPoint(updatedPoint);

            for (const card of randomCards) {
                await updateUserCards(card.card_id);
            }
        }, 5000); // 5 วินาที
    };

    const selectRandomCard = () => {
        if (cardsOriginal.length > 0) {
            return [cardsOriginal[Math.floor(Math.random() * cardsOriginal.length)]];
        }
        return [];
    };

    const showFullDescription = (description) => {
        Swal.fire({
            title: '🔮ชะตาคุณถูกเปิดเผยแล้ว👀',
            text: description,
            confirmButtonText: '🧿',
            customClass: {
                popup: 'w-[90%] max-w-md rounded-xl',
                title: 'text-[clamp(1rem,3.5vw,1.25rem)] font-bold text-blue-800',
                confirmButton: 'bg-yellow-700 hover:bg-yellow-800 px-4 py-3 text-sm text-white rounded min-h-[48px]',
            },
        });
    };

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                await loadUserFromLocalStorage();
                await Bring_Cards();
            } catch (error) {
                Swal.fire({
                    title: 'เกิดข้อผิดพลาด!',
                    text: 'ไม่สามารถโหลดหน้าได้ กรุณาลองใหม่',
                    icon: 'error',
                    confirmButtonText: 'ตกลง',
                    customClass: {
                        popup: 'w-[90%] max-w-md rounded-xl',
                        title: 'text-[clamp(1rem,3.5vw,1.25rem)] font-bold text-red-600',
                        confirmButton: 'bg-red-600 hover:bg-red-700 px-4 py-3 text-sm text-white rounded min-h-[48px]',
                    },
                });
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    if (isLoading) {
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
                                {selectRandomCardsForAnimation().map((card, index) => (
                                    <motion.img
                                        key={card.card_id}
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
                                        onError={() => console.error(`Failed to load card image: ${card.image_url}`)}
                                    />
                                ))}
                            </div>
                            <p className="text-[clamp(1rem,3.5vw,1.25rem)] font-bold text-red-600">
                                🔮 โชคชะตากำลังถูกเปิดเผย...
                            </p>
                        </div>
                    ) : cards.length > 0 ? (
                        <div className="mb-4">
                            <div className="flex flex-col justify-center items-center gap-4">
                                {cards.map((card) => (
                                    <motion.div
                                        key={card.name}
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
                                        />
                                        <h2 className="text-base font-bold mt-2 text-purple-800">{card.name}</h2>
                                        <p className="italic text-gray-800 text-sm line-clamp-3">{card.description}</p>
                                        <button
                                            onClick={() => showFullDescription(card.description)}
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
                            onClick={ReedeemCode}
                            type="button"
                            className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-3 rounded text-sm w-full transform hover:scale-105 transition-transform duration-200 min-h-[48px] touch-action-manipulation"
                        >
                            กรอกโค้ดลับ
                        </button>
                    </div>
                    <div>
                        <button
                            onClick={drawCard}
                            disabled={isRevealing}
                            className={`bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded font-bold shadow-md text-sm w-full transform hover:scale-105 transition-transform duration-200 min-h-[48px] touch-action-manipulation ${isRevealing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {point > 0 ? `พลังทำนาย: ${point}` : 'สุ่มไพ่ทาโรต์'}
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