import React from 'react';

const LoadingSpinner = ({ size = 'w-12 h-12', color = 'border-purple-600' }) => {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-600">
            <div className={`${size} border-4 ${color} border-t-transparent rounded-full animate-spin`}></div>
        </div>
    );
};

export default LoadingSpinner; 