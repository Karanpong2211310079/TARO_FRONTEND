<<<<<<< HEAD
import React, { useEffect, useState } from "react";
import tarotLogo from "../../assets/cards.png";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import clickSound from "../../assets/click.mp3";
const clickSoundObj = new window.Audio(clickSound);

// authService.js
const getUser = () => {
  const user = localStorage.getItem("user");
  if (!user) return null; // ตรวจสอบก่อน parse เพื่อลดการประมวลผล
  try {
    return JSON.parse(user);
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};

const signOut = () => {
  localStorage.removeItem("user");
};

// ฟังก์ชันเล่นเสียงคลิก
=======
import React, { useState } from 'react';
import tarotLogo from '../../assets/cards.png';
import { Link } from 'react-router-dom';
import clickSound from '../../assets/click.mp3';

const clickSoundObj = new window.Audio(clickSound);
>>>>>>> 3b0de2f63b8d6c3ba8daa1a29e3d98b22c0e64d1
const playClickSound = () => {
  try {
    if (clickSoundObj && clickSoundObj.readyState >= 2) {
      clickSoundObj.currentTime = 0;
<<<<<<< HEAD
      const playPromise = clickSoundObj.play();

      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          // Safari อาจจะไม่ให้เล่นเสียงถ้าไม่มี user interaction
          if (isSafari && error.name === "NotAllowedError") {
            console.log(
              "Safari blocked audio play - user interaction required"
            );
          } else {
            console.log("Click sound play failed:", error);
          }
        });
      }
    }
  } catch (error) {
    console.log("Click sound error:", error);
  }
=======
      clickSoundObj.play().catch(() => { });
    }
  } catch (e) { }
>>>>>>> 3b0de2f63b8d6c3ba8daa1a29e3d98b22c0e64d1
};

const Navbar = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
<<<<<<< HEAD
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      signOut();
      setIsLoggedIn(false);
      setName("");
      setMobileMenuOpen(false);
      navigate("/");
      await Swal.fire({
        title: "Sign Out สำเร็จ",
        text: "คุณออกจากระบบเรียบร้อยแล้ว",
        icon: "success",
        confirmButtonText: "ตกลง",
        customClass: {
          popup: "mystic-modal w-[95vw] max-w-md rounded-xl mx-2",
          title: "mystic-heading text-xl mb-2",
          content: "mystic-gold-text font-serif",
          confirmButton: "mystic-btn w-full mt-4",
          cancelButton: "mystic-btn w-full mt-4",
        },
      });
    } catch (error) {
      console.error("Error during sign out:", error);
      await Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: "มีบางอย่างผิดพลาดขณะออกจากระบบ",
        icon: "error",
        confirmButtonText: "ตกลง",
        customClass: {
          popup: "mystic-modal w-[95vw] max-w-md rounded-xl mx-2",
          title: "mystic-heading text-xl mb-2",
          content: "mystic-gold-text font-serif",
          confirmButton: "mystic-btn w-full mt-4",
          cancelButton: "mystic-btn w-full mt-4",
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
      setName("");
    }

    // Preload audio for Safari compatibility
    try {
      if (clickSoundObj) {
        clickSoundObj.load();
      }
    } catch (error) {
      console.log("Audio preload failed:", error);
    }
  }, []);

  // ตรวจสอบ prefers-reduced-motion เพื่อปิด animation ในอุปกรณ์ที่ต้องการลดการเคลื่อนไหว
  const isReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
=======
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
>>>>>>> 3b0de2f63b8d6c3ba8daa1a29e3d98b22c0e64d1

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
<<<<<<< HEAD
            <Link
              to="/home"
              className="text-2xl mystic-heading tracking-wide flex items-center gap-2"
            >
              <span
                className="text-2xl"
                style={{ minWidth: "1.5em", display: "inline-block" }}
              >
                🪄
              </span>{" "}
              Tarot Mamoo{" "}
              <span
                className="text-2xl"
                style={{ minWidth: "1.5em", display: "inline-block" }}
              >
                🔮
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div
            className="hidden md:flex items-center space-x-6"
            style={{ minHeight: "40px" }}
          >
            <>
              <div className="flex items-center space-x-2">
                <img
                  src="https://i.postimg.cc/sX987Gwd/IMG-0870.webp"
                  alt="Profile"
                  className="h-8 w-8 rounded-full object-cover border-2 border-yellow-300 shadow-md"
                  loading="lazy"
                />
                <span className="text-base font-medium mystic-gold-text drop-shadow-lg">
                  {name}
                </span>
              </div>

              <Link
                to="/allcards"
                className="text-base font-medium mystic-gold-text hover:text-white hover:drop-shadow-lg transition-all duration-200 nav-animate-btn"
                onClick={playClickSound}
              >
                การ์ดทั้งหมด
              </Link>
              <Link
                to="/home"
                className="text-base font-medium mystic-gold-text hover:text-white hover:drop-shadow-lg transition-all duration-200 nav-animate-btn"
                onClick={playClickSound}
              >
                ทำนาย
              </Link>
            </>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden text-white focus:outline-none focus:ring-2 focus:ring-yellow-200 rounded bg-gradient-to-r from-purple-700 to-yellow-400 p-1 shadow-md"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={
                  isMobileMenuOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              ></path>
=======
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
>>>>>>> 3b0de2f63b8d6c3ba8daa1a29e3d98b22c0e64d1
            </svg>
          </button>
        </div>

<<<<<<< HEAD
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
                    <span className="text-base font-medium mystic-gold-text drop-shadow-lg">
                      {name}
                    </span>
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
                    onClick={() => {
                      playClickSound();
                      handleSignOut();
                    }}
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
=======
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
>>>>>>> 3b0de2f63b8d6c3ba8daa1a29e3d98b22c0e64d1
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
