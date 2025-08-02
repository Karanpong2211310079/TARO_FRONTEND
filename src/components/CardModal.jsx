import React, { useEffect } from 'react';
import Swal from 'sweetalert2';

const CardModal = ({ card, playerName, onClose }) => {
    useEffect(() => {
        const handleClick = (e) => {
            if (e.target.className === 'custom-card-modal') {
                onClose();
            }
        };

        // ปุ่มบทลงโทษ: SweetAlert ทับ popup card, popup card ไม่ปิดเอง
        const handlePunishment = () => {
            const modal = document.querySelector('.custom-card-modal');
            // ให้ SweetAlert อยู่บนสุดจริงๆ ด้วย z-index สูงกว่า popup card
            // และบังคับ z-index ของ .swal2-container
            Swal.fire({
                title: '<div class="text-center"><div class="text-2xl mb-2">⚡</div><div class="text-xl font-bold text-red-600">บทลงโทษ</div></div>',
                html: '<div class="bg-gradient-to-r from-red-100 to-pink-100 p-4 rounded-lg border-2 border-red-200"><p class="text-gray-700">ยังไม่มีข้อมูลบทลงโทษ</p></div>',
                showConfirmButton: true,
                confirmButtonText: 'ตกลง',
                confirmButtonColor: '#ef4444',
                didOpen: () => {
                    const swal = document.querySelector('.swal2-container');
                    if (swal) swal.style.zIndex = 10001;
                    if (modal) modal.style.zIndex = 9999;
                },
                didClose: () => {
                    if (modal) modal.style.zIndex = 9999;
                }
            });
        };

        const modal = document.querySelector('.custom-card-modal');
        const punishmentBtn = document.querySelector('#punishment-btn');

        if (modal) modal.addEventListener('click', handleClick);
        if (punishmentBtn) punishmentBtn.addEventListener('click', handlePunishment);

        // Add keyboard event listener for Escape key
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            if (modal) modal.removeEventListener('click', handleClick);
            if (punishmentBtn) punishmentBtn.removeEventListener('click', handlePunishment);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    return (
        <div className="custom-card-modal">
            <button className="card-close-btn" onClick={onClose}>×</button>
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
                        <div className="card-footer">
                            <button id="punishment-btn" className="punishment-btn">
                                <span className="btn-icon">⚡</span>
                                <span className="btn-text">บทลงโทษ</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CardModal; 