import { useState, useCallback } from 'react';

const MAX_DRAW = 78;

// Custom hook for localStorage management
const useLocalStorage = (key, initialValue) => {
    const [value, setValue] = useState(() => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    const setStoredValue = useCallback((newValue) => {
        try {
            setValue(newValue);
            localStorage.setItem(key, JSON.stringify(newValue));
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    }, [key]);

    return [value, setStoredValue];
};

// Custom hook for game state
export const useGameState = () => {
    const [cards, setCards] = useState([]);
    const [availableCards, setAvailableCards] = useLocalStorage('availableCards', []);
    const [drawCount, setDrawCount] = useLocalStorage('drawCount', MAX_DRAW);
    const [drawnCards, setDrawnCards] = useLocalStorage('drawnCards', []);
    const [majorArcanaCards, setMajorArcanaCards] = useLocalStorage('majorArcanaCards', []);
    const [players, setPlayers] = useLocalStorage('gamePlayers', []);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useLocalStorage('currentPlayerIndex', 0);
    const [gameStarted, setGameStarted] = useLocalStorage('gameStarted', false);
    const [isLoading, setIsLoading] = useState(false);

    const resetGame = useCallback(() => {
        setDrawCount(MAX_DRAW);
        setDrawnCards([]);
        setMajorArcanaCards([]);
        setPlayers([]);
        setCurrentPlayerIndex(0);
        setGameStarted(false);
        setAvailableCards([]);
    }, [setDrawCount, setDrawnCards, setMajorArcanaCards, setPlayers, setCurrentPlayerIndex, setGameStarted, setAvailableCards]);

    return {
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
    };
}; 