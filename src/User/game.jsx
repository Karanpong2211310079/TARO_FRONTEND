import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useGameState } from '../hooks/useGameState';
import { playSound, isMajorArcana, showError, showSuccess, showInfo, showWarning } from '../utils/gameUtils';
import CardModal from '../components/CardModal';
import PlayerCardsModal from '../components/PlayerCardsModal';
import StarBackground from '../components/StarBackground';
import '../game.css';

const PLAYER_ICONS = [
    '🧙‍♂️', '🐳', '🧚‍♂️', '🧛‍♂️', '🧜‍♀️',
    '🦄', '🐔', '🪳', '🐸', '🧟‍♂️'
];
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
    // Assign a random icon to each player (stable per session)
    const [playerIcons, setPlayerIcons] = useState([]);

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

    // Step-based form for player count and names (minimal, clean)
    const [setupStep, setSetupStep] = useState(0); // 0 = count, 1 = names
    const [playerCount, setPlayerCount] = useState(2);
    const [playerNameInputs, setPlayerNameInputs] = useState(["", ""]);
    const [formError, setFormError] = useState("");

    const handlePlayerCountSubmit = (e) => {
        e.preventDefault();
        const count = parseInt(playerCount);
        if (isNaN(count) || count < 2 || count > 10) {
            setFormError("กรุณาใส่จำนวนผู้เล่น 2-10 คน");
            return;
        }
        setPlayerNameInputs(Array(count).fill(""));
        setFormError("");
        setSetupStep(1);
    };

    const handlePlayerNamesSubmit = (e) => {
        e.preventDefault();
        const names = playerNameInputs.map(n => n.trim());
        if (names.some(n => !n)) {
            setFormError("กรุณากรอกชื่อผู้เล่นให้ครบทุกคน");
            return;
        }
        setPlayers(names);
        setGameStarted(true);
        setCurrentPlayerIndex(0);
        if (cards.length > 0) setAvailableCards(cards);
        // Assign random icons (shuffle and pick)
        let iconPool = [...PLAYER_ICONS];
        let icons = [];
        for (let i = 0; i < names.length; i++) {
            if (iconPool.length === 0) iconPool = [...PLAYER_ICONS];
            const idx = Math.floor(Math.random() * iconPool.length);
            icons.push(iconPool[idx]);
            iconPool.splice(idx, 1);
        }
        setPlayerIcons(icons);
        setFormError("");
    };

    // Draw card (minimal, clean)
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
        if (cardWithPlayer.isMajorArcana) setMajorArcanaCards(prev => [...prev, cardWithPlayer]);
        setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length);
        setCurrentCard({ card, playerName: currentPlayerName });
    }, [drawCount, availableCards, players, currentPlayerIndex, setAvailableCards, setDrawnCards, setDrawCount, setMajorArcanaCards, setCurrentPlayerIndex]);

    // Skip turn (move to next player)
    const handleSkipTurn = useCallback(() => {
        setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length);
        playSound('click');
    }, [currentPlayerIndex, players.length, setCurrentPlayerIndex]);

    // View player cards (minimal, clean)
    const handleViewPlayerCards = useCallback((playerName) => {
        const playerCards = majorArcanaCards.filter(card => card.player === playerName);
        if (playerCards.length === 0) {
            showInfo(`${playerName} ยังไม่มี Major Arcana`, 'ยังไม่มีไพ่ Major Arcana เลย');
            return;
        }
        setShowPlayerCards({ player: playerName, cards: playerCards });
    }, [majorArcanaCards]);

    // Use card (minimal, clean)
    const handleUseCard = useCallback((cardIndex) => {
        const cardToUse = showPlayerCards.cards[cardIndex];
        setMajorArcanaCards(prev => prev.filter(card =>
            !(card.player === cardToUse.player && card.name === cardToUse.name)
        ));
        const updatedCards = showPlayerCards.cards.filter((_, index) => index !== cardIndex);
        setShowPlayerCards(updatedCards.length === 0 ? null : { ...showPlayerCards, cards: updatedCards });
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
                                {setupStep === 0 && (
                                    <form onSubmit={handlePlayerCountSubmit} className="flex flex-col gap-4 items-center">
                                        <label className="font-bold text-lg text-yellow-400">จำนวนผู้เล่น (2-10 คน)</label>
                                        <input
                                            type="number"
                                            min={2}
                                            max={10}
                                            value={playerCount}
                                            onChange={e => setPlayerCount(e.target.value)}
                                            className="w-32 px-3 py-2 border border-yellow-300 rounded-md text-center text-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                        {formError && <div className="text-red-500 text-sm">{formError}</div>}
                                        <button type="submit" className="mystic-btn w-full px-6 py-3 flex items-center justify-center gap-2 text-lg bg-gradient-to-r from-green-600 via-green-500 to-emerald-400 text-white font-bold shadow-xl hover:scale-105 transition-all duration-300 rounded-xl border-2 border-green-400 hover:border-emerald-300">
                                            <span className="text-2xl">🎮</span>
                                            <span>ต่อไป</span>
                                        </button>
                                    </form>
                                )}
                                {setupStep === 1 && (
                                    <form onSubmit={handlePlayerNamesSubmit} className="flex flex-col gap-4 items-center">
                                        <label className="font-bold text-lg text-yellow-400 mb-2">กรอกชื่อผู้เล่น</label>
                                        {playerNameInputs.map((name, idx) => (
                                            <input
                                                key={idx}
                                                type="text"
                                                value={name}
                                                onChange={e => setPlayerNameInputs(inputs => inputs.map((n, i) => i === idx ? e.target.value : n))}
                                                placeholder={`ชื่อผู้เล่นที่ ${idx + 1}`}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-center text-lg"
                                            />
                                        ))}
                                        {formError && <div className="text-red-500 text-sm">{formError}</div>}
                                        <button type="submit" className="mystic-btn w-full px-6 py-3 flex items-center justify-center gap-2 text-lg bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-200 text-purple-900 font-bold shadow-xl hover:scale-105 transition-all duration-300 rounded-xl border-2 border-yellow-400 hover:border-yellow-300">
                                            <span className="text-2xl">✨</span>
                                            <span>เริ่มเกม</span>
                                        </button>
                                        <button type="button" onClick={() => setSetupStep(0)} className="text-sm text-gray-400 underline mt-2">ย้อนกลับ</button>
                                    </form>
                                )}
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
                                    <>
                                        <div className="player-grid">
                                            {players.map((player, index) => {
                                                // ชื่อย่อ: 2 ตัวแรก + ... + 2 ตัวท้าย ถ้ายาว > 8
                                                let displayName = player;
                                                if (player.length > 8) displayName = player.slice(0, 2) + '...' + player.slice(-2);
                                                // สีผู้เล่นแต่ละคน (10 สีเวทมนตร์/แฟนตาซี)
                                                const playerColors = [
                                                    'linear-gradient(135deg, #a78bfa 0%, #fbbf24 100%)',
                                                    'linear-gradient(135deg, #f472b6 0%, #38bdf8 100%)',
                                                    'linear-gradient(135deg, #34d399 0%, #fbbf24 100%)',
                                                    'linear-gradient(135deg, #f87171 0%, #6366f1 100%)',
                                                    'linear-gradient(135deg, #f59e42 0%, #10b981 100%)',
                                                    'linear-gradient(135deg, #facc15 0%, #a78bfa 100%)',
                                                    'linear-gradient(135deg, #fbbf24 0%, #f472b6 100%)',
                                                    'linear-gradient(135deg, #38bdf8 0%, #f87171 100%)',
                                                    'linear-gradient(135deg, #6366f1 0%, #f59e42 100%)',
                                                    'linear-gradient(135deg, #10b981 0%, #facc15 100%)',
                                                ];
                                                // ใช้ CSS variable --player-bg เพื่อวนสีแต่ละ card
                                                const playerBg = index === currentPlayerIndex
                                                    ? 'linear-gradient(135deg, #fbbf24 0%, #a78bfa 100%)'
                                                    : playerColors[index % playerColors.length];
                                                return (
                                                    <div key={player} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                        <div
                                                            className={`player-card${index === currentPlayerIndex ? ' current' : ''}`}
                                                            style={{
                                                                '--player-bg': playerBg,
                                                                cursor: 'pointer',
                                                            }}
                                                            onClick={() => handleViewPlayerCards(player)}
                                                            title={player}
                                                        >
                                                            <span className="player-icon" style={{ fontSize: 28 }}>{playerIcons[index] || '🧙‍♂️'}</span>
                                                        </div>
                                                        <span className="player-name">{displayName}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {/* ปุ่มจั่วไพ่/ข้าม ย้ายลงล่าง player grid */}
                                        <div className="flex flex-row gap-4 justify-center items-center mt-6 mb-2 w-full">
                                            <button
                                                style={{
                                                    minWidth: 140,
                                                    minHeight: 48,
                                                    fontSize: 20,
                                                    width: 'auto',
                                                    whiteSpace: 'nowrap',
                                                    background: '#7c3aed',
                                                    color: '#fff',
                                                    border: '2px solid #7c3aed',
                                                    borderRadius: 9999,
                                                    fontWeight: 'bold',
                                                    boxShadow: '0 3px 16px 0 #a78bfa',
                                                    transition: 'all 0.2s',
                                                }}
                                                onClick={handleDrawCard}
                                                disabled={drawCount <= 0 || isLoading}
                                            >
                                                จั่วไพ่
                                            </button>
                                            <button
                                                style={{
                                                    minWidth: 140,
                                                    minHeight: 48,
                                                    fontSize: 20,
                                                    width: 'auto',
                                                    whiteSpace: 'nowrap',
                                                    background: '#fde047',
                                                    color: '#7c3aed',
                                                    border: '2px solid #fde047',
                                                    borderRadius: 9999,
                                                    fontWeight: 'bold',
                                                    boxShadow: '0 3px 16px 0 #fbbf24',
                                                    transition: 'all 0.2s',
                                                }}
                                                onClick={handleSkipTurn}
                                                disabled={isLoading}
                                            >
                                                ข้าม
                                            </button>
                                        </div>
                                    </>
                                )}
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