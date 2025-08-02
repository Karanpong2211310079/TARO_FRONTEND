import React, { useEffect, useState, useCallback } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import clickSound from '../assets/click.mp3';
const clickSoundObj = new window.Audio(clickSound);
import failSound from '../assets/fail.mp3';
const failSoundObj = new window.Audio(failSound);

const API_BASE_URL = import.meta.env.VITE_API_URL;
const MAX_DRAW = 20;

const playClickSound = () => {
    clickSoundObj.currentTime = 0;
    clickSoundObj.play();
};
const playFailSound = () => {
    failSoundObj.currentTime = 0;
    failSoundObj.play();
};

const GamePage = () => {
    const navigate = useNavigate();
    const [cards, setCards] = useState([]);
    const [drawCount, setDrawCount] = useState(MAX_DRAW);
    const [drawnCards, setDrawnCards] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // โหลดไพ่ทั้งหมด
    const fetchCards = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await axios.get(`${API_BASE_URL}taro-card`, { timeout: 5000 });
            if (res.data && res.data.data) {
                const cardsArray = Object.values(res.data.data);
                setCards(cardsArray);
            } else {
                throw new Error('Data format is incorrect');
            }
        } catch (error) {
            Swal.fire({
                title: 'เกิดข้อผิดพลาด',
                text: 'ไม่สามารถโหลดข้อมูลไพ่ได้ กรุณาลองใหม่',
                icon: 'error',
                confirmButtonText: 'ตกลง',
            });
        } finally {
            setIsLoading(false);
        }
    }, []);

    // รีเซ็ต drawCount เมื่อกลับเข้าหน้านี้หลังใช้พลังทำนาย (เช็คจาก sessionStorage)
    useEffect(() => {
        fetchCards();
        const resetFlag = sessionStorage.getItem('resetGameDraw');
        if (resetFlag === '1') {
            setDrawCount(MAX_DRAW);
            setDrawnCards([]);
            sessionStorage.removeItem('resetGameDraw');
        }
    }, [fetchCards]);

    // ฟังก์ชันสุ่มไพ่
    const handleDrawCard = () => {
        if (drawCount <= 0) {
            playFailSound();
            Swal.fire({
                title: 'หมดสิทธิ์หยิบไพ่',
                text: 'คุณหยิบไพ่ครบ 20 ครั้งแล้ว กรุณาใช้พลังทำนายเพื่อรีเซ็ต',
                icon: 'warning',
                confirmButtonText: 'ตกลง',
            });
            return;
        }
        if (!cards.length) {
            playFailSound();
            Swal.fire({
                title: 'ไม่มีข้อมูลไพ่',
                text: 'กรุณาลองใหม่',
                icon: 'error',
                confirmButtonText: 'ตกลง',
            });
            return;
        }
        playClickSound();
        const randomIndex = Math.floor(Math.random() * cards.length);
        const card = cards[randomIndex];
        setDrawnCards(prev => [...prev, card]);
        setDrawCount(prev => prev - 1);
        Swal.fire({
            title: `คุณหยิบได้ไพ่: ${card.name}`,
            text: card.description?.split('\n')[0] || '',
            imageUrl: card.image_url,
            imageHeight: 180,
            showConfirmButton: false,
            showCloseButton: true,
            customClass: {
                closeButton: 'swal2-close-custom text-gray-500 hover:text-gray-700',
            },
        });
    };

    return (
        <>
            <style>{`
                .swal2-close-custom {
                    font-size: 5rem !important;
                    top: 1.2rem !important;
                    right: 1.5rem !important;
                    width: 2.5rem !important;
                    height: 2.5rem !important;
                    color: #6b7280 !important;
                    opacity: 0.95 !important;
                    transition: color 0.2s;
                    padding: 0.3rem !important;
                    border-radius: 0.75rem !important;
                }
            `}</style>
            <div
                className="flex flex-col min-h-screen px-[env(safe-area-inset-left)] py-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] login-home-bg layout-stable no-layout-shift"
                style={{ position: 'relative' }}
            >
                {/* Twinkle stars background - เหมือนหน้า Home */}
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
                    <div className="mystic-card glassmorphism border-2 border-yellow-300 rounded-xl shadow-xl p-6 mt-8 w-full max-w-md text-center relative flex flex-col items-center justify-center">
                        <h2 className="mystic-heading text-2xl font-bold text-center mb-4">โหมดเล่นเกม - หยิบไพ่ 20 ครั้ง</h2>
                        <div className="text-center mb-4 text-lg font-semibold text-purple-800">เหลือสิทธิ์หยิบไพ่: <span className="text-yellow-500">{drawCount}</span> / {MAX_DRAW}</div>
                        <div className="flex justify-center w-full">
                            <button
                                className="mystic-btn w-66 mb-4 px-4 py-3 flex items-center justify-center gap-2 text-base bg-gradient-to-r from-purple-600 to-yellow-400 text-white font-bold shadow-lg hover:scale-105 transition-all duration-200"
                                onClick={handleDrawCard}
                                disabled={drawCount <= 0 || isLoading}
                            >
                                <span className="btn-icon">🃏</span> หยิบไพ่
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
        </>
    );
};

export default GamePage; 