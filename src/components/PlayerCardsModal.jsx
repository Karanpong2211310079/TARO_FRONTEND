
import React, { useRef } from 'react';
import { playSound } from '../utils/gameUtils';


const PlayerCardsModal = ({ playerCards, onClose, onUseCard }) => {
    const lockRef = useRef(false);
    // ปิด scroll ด้านหลัง modal
    React.useEffect(() => {
        if (!playerCards) return;
        const original = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = original; };
    }, [playerCards]);

    if (!playerCards) return null;

    // ป้องกัน double tap/spam
    const handleUseCard = (index) => {
        if (lockRef.current) return;
        lockRef.current = true;
        playSound('pop');
        onUseCard(index);
        setTimeout(() => { lockRef.current = false; }, 700);
    };

    // ปิด modal ด้วยปุ่มเท่านั้น (ลดปัญหา modal หลุดบน Android)
    return (
        <div className="player-cards-modal" style={{ zIndex: 9999 }}>
            <div className="player-cards-content" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-yellow-400">Major Arcana</h2>
                    <button
                        className="text-yellow-400 hover:text-yellow-500 text-xl font-bold"
                        onTouchStart={e => { e.preventDefault(); playSound('pop'); onClose(); }}
                        onClick={e => { e.preventDefault(); playSound('pop'); onClose(); }}
                        tabIndex={0}
                        aria-label="ปิด"
                    >×</button>
                </div>
                <div className="space-y-2">
                    {playerCards.cards.map((card, index) => (
                        <div key={`${card.name}-${index}`} className="card-item">
                            <div className="flex-1">
                                <h3 className="font-bold text-base text-purple-800 mb-1">{card.name}</h3>
                                <p className="text-xs text-yellow-600 mb-2">{card.description?.split('\n')[0] || ''}</p>
                                <button
                                    className="use-card-btn mt-1"
                                    onTouchStart={e => { e.preventDefault(); handleUseCard(index); }}
                                    onClick={e => { e.preventDefault(); handleUseCard(index); }}
                                    tabIndex={0}
                                >ใช้</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PlayerCardsModal; 