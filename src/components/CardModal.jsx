import React, { useEffect } from 'react';
import { playSound } from '../utils/gameUtils';

const CardModal = ({ card, playerName, onClose }) => {
    useEffect(() => {
        const handleClick = (e) => {
            if (e.target.className === 'custom-card-modal') onClose();
        };
        const modal = document.querySelector('.custom-card-modal');
        if (modal) modal.addEventListener('click', handleClick);
        const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            if (modal) modal.removeEventListener('click', handleClick);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    return (
        <div className="custom-card-modal">
            <button className="card-close-btn" onClick={() => { playSound('pop'); onClose(); }}>×</button>
            <div className="card-popup-container">
                <div className="card-popup">
                    <div className="card-back">
                        <div className="card-back-pattern"></div>
                        <div className="card-back-text">TAROT</div>
                    </div>
                    <div className="card-front">
                        <div className="card-header">
                            <div className="card-icon">🎴</div>
                            <div className="card-title">{card.name}</div>
                            <div className="card-player">{playerName} ได้รับไพ่</div>
                        </div>
                        <div className="card-body">
                            <div className="card-description">
                                <p>{card.description?.split('\n')[0] || 'ไม่มีคำอธิบาย'}</p>
                            </div>
                        </div>
                        {/* ปุ่มบทลงโทษกลับไปอยู่ล่าง card-body */}
                        <div className="flex justify-center mt-4">
                            <button
                                className="punishment-btn"
                                type="button"
                                onClick={() => {
                                    playSound('flipcard');
                                    // เพิ่มคลาสเพื่อแสดงอนิเมะชั่นพลิก popup card
                                    const popup = document.querySelector('.card-popup');
                                    if (popup) {
                                        popup.classList.add('flip-animation');
                                        setTimeout(() => {
                                            popup.classList.remove('flip-animation');
                                        }, 700); // ระยะเวลาอนิเมะชั่น (ms)
                                    }
                                    // ยังไม่มีเนื้อหาหมวดบทลงโทษ ให้หน้าว่างๆ (ไม่ต้องแสดงอะไร)
                                    // สามารถเพิ่ม logic แสดงบทลงโทษแบบสุ่มได้ในอนาคต
                                    const cardBody = document.querySelector('.card-body .card-description');
                                    if (cardBody) cardBody.innerHTML = '';
                                }}
                            >
                                <span className="btn-text">โดนของ</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CardModal;