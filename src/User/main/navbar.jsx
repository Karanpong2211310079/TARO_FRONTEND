import React, { useEffect, useState } from 'react';
import tarotLogo from '../../assets/cards.png';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';

// authService.js
const getUser = () => {
  const user = localStorage.getItem('user');
  if (!user) return null; // ตรวจสอบก่อน parse เพื่อลดการประมวลผล
  try {
    return JSON.parse(user);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

const signOut = () => {
  localStorage.removeItem('user');
};

const Navbar = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      signOut();
      setIsLoggedIn(false);
      setName('');
      setMobileMenuOpen(false);
      navigate('/');
      await Swal.fire({
        title: 'Sign Out สำเร็จ',
        text: 'คุณออกจากระบบเรียบร้อยแล้ว',
        icon: 'success',
        confirmButtonText: 'ตกลง',
        customClass: {
          popup: 'w-[90%] max-w-md rounded-xl',
          title: 'text-[clamp(1rem,3.5vw,1.25rem)] font-bold text-green-600',
          confirmButton: 'bg-green-600 hover:bg-green-700 px-4 py-3 text-sm text-white rounded min-h-[48px]',
        },
      });
    } catch (error) {
      console.error('Error during sign out:', error);
      await Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'มีบางอย่างผิดพลาดขณะออกจากระบบ',
        icon: 'error',
        confirmButtonText: 'ตกลง',
        customClass: {
          popup: 'w-[90%] max-w-md rounded-xl',
          title: 'text-[clamp(1rem,3.5vw,1.25rem)] font-bold text-red-600',
          confirmButton: 'bg-red-600 hover:bg-red-700 px-4 py-3 text-sm text-white rounded min-h-[48px]',
        },
      });
    }
  };

  useEffect(() => {
    const userData = getUser();
    if (userData?.user?.name) {
      setIsLoggedIn(true);
      setName(userData.user.name);
    } else {
      setIsLoggedIn(false);
      setName('');
    }
  }, []);

  // ตรวจสอบ prefers-reduced-motion เพื่อปิด animation ในอุปกรณ์ที่ต้องการลดการเคลื่อนไหว
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <>
      <nav
        role="navigation"
        className="fixed top-0 left-0 w-full bg-gradient-to-b from-purple-950 via-purple-800 to-purple-950 text-white p-3 shadow-xl z-50 overflow-hidden"
      >
        <div className="container mx-auto flex justify-between items-center max-w-screen-md">
          {/* Logo Section */}
          <div className="flex items-center space-x-2">
            <img
              src={tarotLogo}
              className="h-10"
              alt="Tarot Mamoo logo"
              loading="lazy" // เพิ่ม lazy loading สำหรับโลโก้
            />
            <Link to="/home" className="text-xl font-bold font-serif tracking-wide">
              Tarot Mamoo
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="text-white focus:outline-none focus:ring-2 focus:ring-yellow-200 rounded"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={isMobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
              ></path>
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="bg-purple-900 py-3">
            <div className="container mx-auto flex flex-col space-y-3 max-w-screen-md">
              {isLoggedIn ? (
                <>
                  <div className="flex items-center space-x-2 px-3">
                    <img
                      src="https://i.postimg.cc/sX987Gwd/IMG-0870.webp"
                      alt="Profile"
                      className="h-8 w-8 rounded-full object-cover"
                      loading="lazy" // เพิ่ม lazy loading สำหรับรูปโปรไฟล์
                    />
                    <span className="text-base font-medium">{name}</span>
                  </div>
                  <Link
                    to="/user"
                    className="text-base font-medium px-3 hover:text-yellow-200 transition-colors duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Card
                  </Link>
                  <Link
                    to="/allcards"
                    className="text-base font-medium px-3 hover:text-yellow-200 transition-colors duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    All Cards
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-base font-medium px-3 text-left hover:text-yellow-200 transition-colors duration-200"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/"
                  className="text-base font-medium px-3 hover:text-yellow-200 transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Starry Background Effect (ปิดในอุปกรณ์ที่ใช้ prefers-reduced-motion) */}
        {!isReducedMotion && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute w-1 h-1 bg-yellow-200 rounded-full top-1 left-[10%] animate-twinkle"></div>
            <div className="absolute w-1.5 h-1.5 bg-yellow-100 rounded-full top-2 right-[15%] animate-twinkle animation-delay-150"></div>
            <div className="absolute w-1 h-1 bg-white rounded-full bottom-1 left-[25%] animate-twinkle animation-delay-300"></div>
            <div className="absolute w-1.2 h-1.2 bg-yellow-200 rounded-full top-3 right-[30%] animate-twinkle animation-delay-450"></div>
            <div className="absolute w-1 h-1 bg-white rounded-full bottom-2 left-[40%] animate-twinkle animation-delay-600"></div>
          </div>
        )}
      </nav>
      {/* Spacer to prevent content from being hidden under the fixed navbar */}
      <div className="h-[60px]"></div>
    </>
  );
};

export default Navbar;