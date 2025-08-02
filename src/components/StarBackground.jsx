import React from 'react';

const StarBackground = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" style={{ contain: 'layout' }}>
        {Array.from({ length: 15 }, (_, i) => (
            <div
                key={i}
                className={`star-element ${i % 2 === 0 ? 'star-small' : 'star-medium'} ${i % 3 === 0 ? 'bg-yellow-200' : i % 3 === 1 ? 'bg-yellow-100' : 'bg-white'
                    } animate-twinkle`}
                style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${i * 100}ms`
                }}
            />
        ))}
    </div>
);

export default StarBackground; 