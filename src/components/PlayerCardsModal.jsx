import React from 'react';

const PlayerCardsModal = ({ playerCards, onClose, onUseCard }) => {
    if (!playerCards) return null;

    return (
        <div className="player-cards-modal" onClick={onClose}>
            <div className="player-cards-content" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-yellow-400">Major Arcana</h2>
                    <button onClick={onClose} className="text-yellow-400 hover:text-yellow-500 text-xl font-bold">×</button>
                </div>
                <div className="space-y-2">
                    {playerCards.cards.map((card, index) => (
                        <div key={`${card.name}-${index}`} className="card-item">
                            <div className="flex-1">
                                <h3 className="font-bold text-base text-purple-800 mb-1">{card.name}</h3>
                                <p className="text-xs text-yellow-600 mb-2">{card.description?.split('\n')[0] || ''}</p>
                                <button className="use-card-btn mt-1" onClick={() => onUseCard(index)}>ใช้</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PlayerCardsModal; 