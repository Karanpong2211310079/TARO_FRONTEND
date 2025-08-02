import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useGameState } from '../hooks/useGameState';
import { playSound, isMajorArcana, validatePlayerCount, validatePlayerNames, showError, showSuccess, showInfo, showWarning } from '../utils/gameUtils';
import CardModal from '../components/CardModal';
import PlayerCardsModal from '../components/PlayerCardsModal';
import StarBackground from '../components/StarBackground';
import '../game.css';

const API_BASE_URL = import.meta.env.VITE_API_URL;
const MAX_DRAW = 78;







const GamePage = () => {
    const {
        cards, setCards,
        availableCards, setAvailableCards,
        drawCount, setDrawCount,
        drawnCards, setDrawnCards,
        majorArcanaCards, setMajorArcanaCards,
        players, setPlayers,
        currentPlayerIndex, setCurrentPlayerIndex,
        gameStarted, setGameStarted,
        isLoading, setIsLoading,
        resetGame
    } = useGameState();

    const [showPlayerCards, setShowPlayerCards] = useState(null);
    const [currentCard, setCurrentCard] = useState(null);

    // Fetch cards
    const fetchCards = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await axios.get(`${API_BASE_URL}taro-card`, { timeout: 5000 });
            if (res.data?.data) {
                const cardsArray = Object.values(res.data.data);
                setCards(cardsArray);
                if (!availableCards.length) {
                    setAvailableCards(cardsArray);
                }
            }
        } catch (error) {
            console.error('Error fetching cards:', error);
            showError('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลไพ่ได้ กรุณาลองใหม่');
        } finally {
            setIsLoading(false);
        }
    }, [setAvailableCards, availableCards.length]);

    // Initialize game
    useEffect(() => {
        fetchCards();
        const resetFlag = sessionStorage.getItem('resetGameDraw');
        if (resetFlag === '1') {
            resetGame();
            sessionStorage.removeItem('resetGameDraw');
        }
    }, [fetchCards, resetGame]);

    // Game functions
    const startNewGame = () => {
        Swal.fire({
            title: 'เริ่มเกมใหม่',
            text: 'กรุณาใส่จำนวนผู้เล่น (2-10 คน)',
            input: 'number',
            inputAttributes: { min: '2', max: '10', step: '1' },
            showCancelButton: true,
            confirmButtonText: 'ต่อไป',
            cancelButtonText: 'ยกเลิก',
            inputValidator: validatePlayerCount
        }).then((result) => {
            if (result.isConfirmed) {
                registerPlayers(parseInt(result.value));
            }
        });
    };

    const registerPlayers = (count) => {
        Swal.fire({
            title: 'ใส่ชื่อผู้เล่น',
            html: Array.from({ length: count }, (_, i) => `
                        <div class="mb-3">
                            <label class="block text-sm font-medium text-yellow-400 mb-1">ผู้เล่นที่ ${i + 1}</label>
                    <input type="text" id="player-${i}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="ชื่อผู้เล่น..."/>
                </div>
            `).join(''),
            showCancelButton: true,
            confirmButtonText: 'เริ่มเกม',
            cancelButtonText: 'ยกเลิก',
            preConfirm: () => validatePlayerNames(count)
        }).then((result) => {
            if (result.isConfirmed) {
                setPlayers(result.value);
                setGameStarted(true);
                setCurrentPlayerIndex(0);
                if (cards.length > 0) {
                    setAvailableCards(cards);
                }
                showSuccess('เริ่มเกม!', `ผู้เล่นทั้งหมด: ${result.value.join(', ')}`);
            }
        });
    };

    const handleDrawCard = useCallback(() => {
        if (drawCount <= 0) {
            playSound('fail');
            showWarning('เกมส์จบเเล้ว', 'ขอบคุณที่เล่นเกมส์ของเรา หากชอบโปรดรีวิวให้กับเราเพื่อเป็นกำลังใจให้เราต่อไป');
            return;
        }

        const currentPlayerName = players[currentPlayerIndex];
        playSound('click');

        const randomIndex = Math.floor(Math.random() * availableCards.length);
        const card = availableCards[randomIndex];
        const newAvailableCards = availableCards.filter((_, index) => index !== randomIndex);

        const cardWithPlayer = {
            ...card,
            player: currentPlayerName,
            isMajorArcana: isMajorArcana(card.name)
        };

        setAvailableCards(newAvailableCards);
        setDrawnCards(prev => [...prev, cardWithPlayer]);
        setDrawCount(prev => prev - 1);

        if (cardWithPlayer.isMajorArcana) {
            setMajorArcanaCards(prev => [...prev, cardWithPlayer]);
        }

        setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length);
        setCurrentCard({ card, playerName: currentPlayerName });
    }, [drawCount, availableCards, players, currentPlayerIndex, setAvailableCards, setDrawnCards, setDrawCount, setMajorArcanaCards, setCurrentPlayerIndex]);

    const handleViewPlayerCards = useCallback((playerName) => {
        const playerCards = majorArcanaCards.filter(card => card.player === playerName);
        if (playerCards.length === 0) {
            showInfo(`${playerName} ยังไม่มี Major Arcana`, 'ยังไม่มีไพ่ Major Arcana เลย');
            return;
        }
        setShowPlayerCards({ player: playerName, cards: playerCards });
    }, [majorArcanaCards]);

    const handleUseCard = useCallback((cardIndex) => {
        const cardToUse = showPlayerCards.cards[cardIndex];
        setMajorArcanaCards(prev => prev.filter(card =>
            !(card.player === cardToUse.player && card.name === cardToUse.name)
        ));

        const updatedCards = showPlayerCards.cards.filter((_, index) => index !== cardIndex);
        if (updatedCards.length === 0) {
            setShowPlayerCards(null);
        } else {
            setShowPlayerCards({ ...showPlayerCards, cards: updatedCards });
        }

        showSuccess('ใช้ไพ่แล้ว', `ใช้ไพ่ ${cardToUse.name} ของ ${cardToUse.player} แล้ว`);
    }, [showPlayerCards, setMajorArcanaCards]);

    const currentPlayerName = useMemo(() => players[currentPlayerIndex] || '', [players, currentPlayerIndex]);

    return (
        <>
            {currentCard && (
                <CardModal
                    card={currentCard.card}
                    playerName={currentCard.playerName}
                    onClose={() => setCurrentCard(null)}
                />
            )}

            <PlayerCardsModal
                playerCards={showPlayerCards}
                onClose={() => setShowPlayerCards(null)}
                onUseCard={handleUseCard}
            />

            <div className="flex flex-col min-h-screen px-[env(safe-area-inset-left)] py-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] login-home-bg layout-stable no-layout-shift" style={{ position: 'relative' }}>
                <StarBackground />

                <div className="flex-grow flex items-center justify-center p-2 sm:p-4">
                    <div className="mystic-card glassmorphism border-2 border-yellow-300 rounded-xl shadow-xl p-6 mt-8 w-full max-w-md text-center relative flex flex-col items-center justify-center z-30">
                        <h2 className="mystic-heading text-xl font-bold text-center mb-4">เกมส์มิตรภาพอันเเสนวิเศษ</h2>

                        {!gameStarted ? (
                            <div className="w-full">
                                <button
                                    className="mystic-btn w-full px-6 py-4 flex items-center justify-center gap-3 text-lg bg-gradient-to-r from-green-600 via-green-500 to-emerald-400 text-white font-bold shadow-xl hover:scale-105 transition-all duration-300 rounded-xl border-2 border-green-400 hover:border-emerald-300"
                                    onClick={startNewGame}
                                >
                                    <span className="text-2xl">🎮</span>
                                    <span>เข้าเกมส์</span>
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="text-center mb-4">
                                    <div className="bg-gradient-to-r from-purple-600 to-yellow-500 p-3 rounded-lg shadow-lg">
                                        <div className="text-white font-bold text-lg">
                                            ไพ่คงเหลือ: <span className="text-yellow-300">{drawCount}</span> / {MAX_DRAW}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-center mb-4 text-sm text-yellow-600 font-medium">
                                    ✨ คลิกที่ชื่อผู้เล่นเพื่อดู Major Arcana ✨
                                </div>

                                {players.length > 0 && (
                                    <div className="flex flex-row flex-wrap justify-center items-center gap-3 mb-4">
                                        {players.map((player, index) => (
                                            <div
                                                key={player}
                                                className={`player-bar px-4 py-2 rounded-full shadow-lg font-bold text-sm cursor-pointer transition-all duration-200
                                                     ${index === currentPlayerIndex ? 'bg-yellow-400 text-white scale-110' : 'bg-purple-500 text-white hover:bg-yellow-300 hover:text-purple-800'}`}
                                                onClick={() => handleViewPlayerCards(player)}
                                                title={player}
                                            >
                                                {player.length > 10 ? player.substring(2, 10) + '...' : player}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex flex-col gap-3 w-full mb-4">
                                    <button
                                        className="mystic-btn w-full px-6 py-4 flex items-center justify-center gap-3 text-lg bg-gradient-to-r from-purple-600 via-purple-500 to-yellow-400 text-white font-bold shadow-xl hover:scale-105 transition-all duration-300 rounded-xl border-2 border-purple-400 hover:border-yellow-300"
                                        onClick={handleDrawCard}
                                        disabled={drawCount <= 0 || isLoading}
                                    >
                                        <span className="text-2xl">🎴</span>
                                        <span>จั่วไพ่</span>
                                    </button>
                                </div>
                            </>
                        )}
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