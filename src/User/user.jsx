import React from 'react';
import axios from 'axios';

const User = () => {
  return (
    <div className="font-mono grid grid-cols-1 md:grid-cols-4 gap-6 m-8">
      {/* Profile Card (ซ้ายมือ) */}
      <div className="col-span-1">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex flex-col items-center pb-10 mt-5">
            <img
              className="w-24 h-24 mb-3 rounded-full shadow-lg"
              src="https://i.pravatar.cc/100"
              alt="Bonnie Green"
            />
            <h5 className="mb-1 text-xl font-medium text-gray-900">Bonnie Green</h5>
            <span className="text-sm text-gray-500">Visual Designer</span>
          </div>
        </div>
      </div>

      {/* Card Section (ขวามือ) */}
      <div className="col-span-1 md:col-span-3">
        <p className="text-xl font-semibold mb-4">My Cards</p>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 border border-gray-500 rounded-md  gap-4 p-5">
          {/* Card Item */}
          <div className="bg-white rounded-lg shadow-lg p-4 text-center transition-transform duration-300 transform hover:scale-105">
            <img
              src="https://i.pravatar.cc/100"
              alt="Card Image"
              className="w-8 h-8 rounded mb-3"
            />
            <p className="font-bold text-xl">Card Name</p>
            <p className="text-gray-600 mt-2">Card Description</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-4 text-center transition-transform duration-300 transform hover:scale-105">
            <img
              src="https://i.pravatar.cc/100"
              alt="Card Image"
              className="w-8 h-8 rounded mb-3"
            />
            <p className="font-bold text-xl">Card Name</p>
            <p className="text-gray-600 mt-2">Card Description</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-4 text-center transition-transform duration-300 transform hover:scale-105">
            <img
              src="https://i.pravatar.cc/100"
              alt="Card Image"
              className="w-8 h-8 rounded mb-3"
            />
            <p className="font-bold text-xl">Card Name</p>
            <p className="text-gray-600 mt-2">Card Description</p>
          </div>
          {/* เพิ่มการ์ดเพิ่มเติมได้ตามต้องการ */}
        </div>
      </div>
    </div>
  );
};

export default User;
