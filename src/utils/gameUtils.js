import Swal from 'sweetalert2';
import clickSound from '../assets/click.mp3';
import failSound from '../assets/fail.mp3';

// Audio objects
const audioObjects = {
    click: new window.Audio(clickSound),
    fail: new window.Audio(failSound)
};

// Major Arcana card names
export const MAJOR_ARCANA_NAMES = new Set([
    'The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor',
    'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit',
    'Wheel of Fortune', 'Justice', 'The Hanged Man', 'Death', 'Temperance',
    'The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun', 'Judgement', 'The World',
]);

// Utility functions
export const playSound = (type) => {
    const audio = audioObjects[type];
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => { });
    }
};

export const isMajorArcana = (cardName) => {
    if (MAJOR_ARCANA_NAMES.has(cardName)) return true;

    const normalizedName = cardName.toLowerCase().replace(/[^a-z]/g, '');
    return Array.from(MAJOR_ARCANA_NAMES).some(majorName => {
        const normalizedMajorName = majorName.toLowerCase().replace(/[^a-z]/g, '');
        return normalizedName.includes(normalizedMajorName) || normalizedMajorName.includes(normalizedName);
    });
};

// Game validation functions
export const validatePlayerCount = (value) => {
    const num = parseInt(value);
    if (!value || isNaN(num) || num < 2 || num > 10) {
        return 'กรุณาใส่จำนวนผู้เล่น 2-10 คน!';
    }
    return null;
};

export const validatePlayerNames = (count) => {
    const playerNames = [];
    for (let i = 0; i < count; i++) {
        const input = document.getElementById(`player-${i}`);
        const name = input.value.trim();
        if (!name) {
            Swal.showValidationMessage(`กรุณาใส่ชื่อผู้เล่นที่ ${i + 1}`);
            return false;
        }
        if (playerNames.includes(name)) {
            Swal.showValidationMessage(`ชื่อผู้เล่น "${name}" ซ้ำ กรุณาใส่ชื่อใหม่`);
            return false;
        }
        playerNames.push(name);
    }
    return playerNames;
};

// SweetAlert configurations
export const showError = (title, text) => {
    Swal.fire({
        title,
        text,
        icon: 'error',
        confirmButtonText: 'ตกลง',
    });
};

export const showSuccess = (title, text) => {
    Swal.fire({
        title,
        text,
        icon: 'success',
        confirmButtonText: 'ตกลง',
    });
};

export const showInfo = (title, text) => {
    Swal.fire({
        title,
        text,
        icon: 'info',
        confirmButtonText: 'ตกลง',
    });
};

export const showWarning = (title, text) => {
    Swal.fire({
        title,
        text,
        icon: 'warning',
        confirmButtonText: 'ตกลง',
    });
}; 