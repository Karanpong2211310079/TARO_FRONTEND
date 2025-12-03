import React, { useState } from 'react';
import tarotLogo from '../../assets/cards.png';
import { Link } from 'react-router-dom';
import clickSound from '../../assets/click.mp3';

const clickSoundObj = new window.Audio(clickSound);
const playClickSound = () => {
  try {
    if (clickSoundObj && clickSoundObj.readyState >= 2) {
      clickSoundObj.currentTime = 0;
      clickSoundObj.play().catch(() => { });
    }
  } catch (e) { }
};

const Navbar = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <>
      <nav
        role="navigation"
        className="fixed top-0 left-0 w-full mystic-glass backdrop-blur-lg bg-gradient-to-b from-[#3b0764cc] via-[#6d28d9cc] to-[#18181bcc] border-b-2 border-yellow-300 text-white p-3 shadow-2xl z-50 overflow-hidden"
      >
        <div className="container mx-auto flex justify-between items-center max-w-screen-md">

          {/* Logo + Animation */}
          <Link
            to="/home"
            className="flex items-center space-x-3 group"
            onClick={playClickSound}
          >
            <img
              src={tarotLogo}
              className="h-11 w-11 drop-shadow-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500"
              alt="logo"
              loading="lazy"
            />
            <span className="text-2xl md:text-3xl mystic-heading font-bold tracking-wider bg-gradient-to-r from-yellow-300 to-yellow-100 bg-clip-text text-transparent group-hover:drop-shadow-2xl transition-all duration-500">
              Tarot Mamoo
            </span>
          </Link>

          {/* Desktop Menu + Animation */}
          <div className="hidden md:flex items-center space-x-10">
            <Link
              to="/home"
              className="text-lg mystic-gold-text hover:text-yellow-200 hover:scale-125 hover:drop-shadow-2xl nav-animate-btn transition-all duration-300"
              onClick={playClickSound}
            >
              ทำนาย
            </Link>
            <Link
              to="/allcards"
              className="text-lg mystic-gold-text hover:text-yellow-200 hover:scale-125 hover:drop-shadow-2xl nav-animate-btn transition-all duration-300"
              onClick={playClickSound}
            >
              All Cards
            </Link>
          </div>

          {/* Mobile Hamburger + Animation */}
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="md:hidden p-3 rounded-xl bg-gradient-to-r from-purple-700 to-yellow-400 shadow-lg hover:shadow-yellow-400/80 hover:scale-110 transition-all duration-300"
            aria-label="เปิดเมนู"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d={isMobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                className="transition-all duration-300"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu + Slide Animation */}
        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isMobileMenuOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="container mx-auto text-center space-y-5 max-w-screen-md">
            <Link
              to="/home"
              className="block text-x mystic-gold-text hover:text-yellow-100 hover:scale-110 hover:drop-shadow-2xl transition-all duration-300"
              onClick={() => { playClickSound(); setMobileMenuOpen(false); }}
            >
              ทำนาย
            </Link>
            <Link
              to="/allcards"
              className="block text-x mystic-gold-text hover:text-yellow-100 hover:scale-110 hover:drop-shadow-2xl transition-all duration-300"
              onClick={() => { playClickSound(); setMobileMenuOpen(false); }}
            >
              All Cards
            </Link>
          </div>
        </div>

        {/* ดาววิ๊ง ๆ จัดเต็ม */}
        {!isReducedMotion && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute w-1 h-1 bg-yellow-200 rounded-full top-1 left-[10%] animate-twinkle animation-delay-0"></div>
            <div className="absolute w-1.5 h-1.5 bg-yellow-100 rounded-full top-2 right-[15%] animate-twinkle animation-delay-200"></div>
            <div className="absolute w-1 h-1 bg-white rounded-full bottom-2 left-[25%] animate-twinkle animation-delay-400"></div>
            <div className="absolute w-1.2 h-1.2 bg-yellow-200 rounded-full top-3 right-[30%] animate-twinkle animation-delay-600"></div>
            <div className="absolute w-1 h-1 bg-white rounded-full bottom-1 left-[40%] animate-twinkle animation-delay-800"></div>
            <div className="absolute w-2 h-2 bg-yellow-300 rounded-full top-4 left-[50%] animate-twinkle animation-delay-1000 blur-sm"></div>
          </div>
        )}
      </nav>

      {/* Spacer */}
      <div className="h-[70px]" />
    </>
  );
};

export default Navbar;