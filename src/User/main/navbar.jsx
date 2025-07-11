import React, { useEffect, useState } from 'react';
import tarotLogo from '../../assets/cards.png';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import clickSound from '../../assets/click.mp3';
const clickSoundObj = new window.Audio(clickSound);

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

// ฟังก์ชันเล่นเสียงคลิก
const playClickSound = () => {
  clickSoundObj.currentTime = 0;
  clickSoundObj.play();
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
          popup: 'mystic-modal w-[95vw] max-w-md rounded-xl mx-2',
          title: 'mystic-heading text-xl mb-2',
          content: 'mystic-gold-text font-serif',
          confirmButton: 'mystic-btn w-full mt-4',
          cancelButton: 'mystic-btn w-full mt-4',
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
          popup: 'mystic-modal w-[95vw] max-w-md rounded-xl mx-2',
          title: 'mystic-heading text-xl mb-2',
          content: 'mystic-gold-text font-serif',
          confirmButton: 'mystic-btn w-full mt-4',
          cancelButton: 'mystic-btn w-full mt-4',
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
        className="fixed top-0 left-0 w-full mystic-glass backdrop-blur-lg bg-gradient-to-b from-[#3b0764cc] via-[#6d28d9cc] to-[#18181bcc] border-b-2 border-yellow-300 text-white p-3 shadow-2xl z-50 overflow-hidden"
      >
        <div className="container mx-auto flex justify-between items-center max-w-screen-md">
          {/* Logo Section */}
          <div className="flex items-center space-x-2">
            <img
              src={tarotLogo}
              className="h-10 w-10 drop-shadow-lg"
              alt="Tarot Mamoo logo"
              loading="lazy"
              width={40}
              height={40}
            />
            <Link to="/home" className="text-2xl mystic-heading tracking-wide flex items-center gap-2">
              <span className="text-2xl" style={{ minWidth: '1.5em', display: 'inline-block' }}>🪄</span> Tarot Mamoo <span className="text-2xl" style={{ minWidth: '1.5em', display: 'inline-block' }}>🔮</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6" style={{ minHeight: '40px' }}>
            {isLoggedIn ? (
              <>
                <div className="flex items-center space-x-2">
                  <img
                    src="https://i.postimg.cc/sX987Gwd/IMG-0870.webp"
                    alt="Profile"
                    className="h-8 w-8 rounded-full object-cover border-2 border-yellow-300 shadow-md"
                    loading="lazy"
                  />
                  <span className="text-base font-medium mystic-gold-text drop-shadow-lg">{name}</span>
                </div>
                <Link
                  to="/user"
                  className="text-base font-medium mystic-gold-text hover:text-white hover:drop-shadow-lg transition-all duration-200 nav-animate-btn"
                  onClick={playClickSound}
                >
                  My Card
                </Link>
                <Link
                  to="/allcards"
                  className="text-base font-medium mystic-gold-text hover:text-white hover:drop-shadow-lg transition-all duration-200 nav-animate-btn"
                  onClick={playClickSound}
                >
                  All Cards
                </Link>
                <Link
                  to="/home"
                  className="text-base font-medium mystic-gold-text hover:text-white hover:drop-shadow-lg transition-all duration-200 nav-animate-btn"
                  onClick={playClickSound}
                >
                  ทำนาย
                </Link>
                <button
                  onClick={() => { playClickSound(); handleSignOut(); }}
                  className="mystic-btn text-base py-1 px-4 !rounded-lg !text-sm !font-semibold !shadow-md !bg-gradient-to-r !from-purple-700 !to-yellow-400 !border-0 !text-white hover:scale-105 hover:drop-shadow-lg transition-all duration-200"
                >
                  <span className="btn-icon">🚪</span> Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/"
                className="text-base font-medium mystic-gold-text hover:text-white hover:drop-shadow-lg transition-all duration-200"
                onClick={playClickSound}
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden text-white focus:outline-none focus:ring-2 focus:ring-yellow-200 rounded bg-gradient-to-r from-purple-700 to-yellow-400 p-1 shadow-md"
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
          <div className="mystic-glass py-3 border-t-2 border-yellow-300 shadow-xl">
            <div className="container mx-auto flex flex-col space-y-3 max-w-screen-md">
              {isLoggedIn ? (
                <>
                  <div className="flex items-center space-x-2 px-3">
                    <img
                      src="https://i.postimg.cc/sX987Gwd/IMG-0870.webp"
                      alt="Profile"
                      className="h-8 w-8 rounded-full object-cover border-2 border-yellow-300 shadow-md"
                      loading="lazy" // เพิ่ม lazy loading สำหรับรูปโปรไฟล์
                    />
                    <span className="text-base font-medium mystic-gold-text drop-shadow-lg">{name}</span>
                  </div>
                  <Link
                    to="/user"
                    className="text-base font-medium px-3 mystic-gold-text hover:text-white hover:drop-shadow-lg transition-all duration-200 nav-animate-btn"
                    onClick={() => setMobileMenuOpen(false)}
                    onClickCapture={playClickSound}
                  >
                    My Card
                  </Link>
                  <Link
                    to="/allcards"
                    className="text-base font-medium px-3 mystic-gold-text hover:text-white hover:drop-shadow-lg transition-all duration-200 nav-animate-btn"
                    onClick={() => setMobileMenuOpen(false)}
                    onClickCapture={playClickSound}
                  >
                    All Cards
                  </Link>
                  <Link
                    to="/home"
                    className="text-base font-medium px-3 mystic-gold-text hover:text-white hover:drop-shadow-lg transition-all duration-200 nav-animate-btn"
                    onClick={() => setMobileMenuOpen(false)}
                    onClickCapture={playClickSound}
                  >
                    ทำนาย
                  </Link>
                  <button
                    onClick={() => { playClickSound(); handleSignOut(); }}
                    className="mystic-btn text-base py-1 px-4 !rounded-lg !text-sm !font-semibold !shadow-md !bg-gradient-to-r !from-purple-700 !to-yellow-400 !border-0 !text-white hover:scale-105 hover:drop-shadow-lg transition-all duration-200 text-left"
                  >
                    <span className="btn-icon">🚪</span> Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/"
                  className="text-base font-medium px-3 mystic-gold-text hover:text-white hover:drop-shadow-lg transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                  onClickCapture={playClickSound}
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