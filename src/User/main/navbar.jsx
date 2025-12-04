import React, { useEffect, useState } from "react";
import tarotLogo from "../../assets/cards.png";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import clickSound from "../../assets/click.mp3";
const clickSoundObj = new window.Audio(clickSound);

// อ่าน user
const getUser = () => {
  const user = localStorage.getItem("user");
  if (!user) return null;
  try {
    return JSON.parse(user);
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};

// ออกจากระบบ
const signOut = () => {
  localStorage.removeItem("user");
};

// เล่นเสียงคลิก
const playClickSound = () => {
  try {
    clickSoundObj.currentTime = 0;
    clickSoundObj.play().catch(() => {});
  } catch {}
};

const Navbar = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSignOut = async () => {
    playClickSound();
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
      });
    } catch (error) {
      await Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: "ออกจากระบบไม่สำเร็จ",
        icon: "error",
        confirmButtonText: "ตกลง",
      });
    }
  };

  useEffect(() => {
    const userData = getUser();
    if (userData?.user?.name) {
      setIsLoggedIn(true);
      setName(userData.user.name);
    }
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-gradient-to-b from-[#3b0764cc] via-[#6d28d9cc] to-[#18181bcc] border-b-2 border-yellow-300 text-white p-3 shadow-xl z-50">
        <div className="container mx-auto flex justify-between items-center max-w-3xl">
          {/* LOGO */}
          <Link
            to="/home"
            className="flex items-center space-x-3 group"
            onClick={playClickSound}
          >
            <img
              src={tarotLogo}
              className="h-11 w-11 drop-shadow-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300"
              alt="logo"
            />
            <span className="text-2xl font-bold flex items-center gap-2">
              🪄 Tarot Mamoo 🔮
            </span>
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center space-x-6">
            {isLoggedIn && (
              <div className="flex items-center space-x-2">
                <img
                  src="https://i.postimg.cc/sX987Gwd/IMG-0870.webp"
                  alt="Profile"
                  className="h-8 w-8 rounded-full border-2 border-yellow-300 shadow"
                />
                <span className="text-base">{name}</span>
              </div>
            )}

            <Link to="/allcards" onClick={playClickSound}>
              การ์ดทั้งหมด
            </Link>

            <Link to="/home" onClick={playClickSound}>
              ทำนาย
            </Link>
          </div>

          {/* MOBILE BUTTON */}
          <button
            className="md:hidden p-1 bg-gradient-to-r from-purple-700 to-yellow-400 rounded"
            onClick={() => {
              playClickSound();
              setMobileMenuOpen(!isMobileMenuOpen);
            }}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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
              />
            </svg>
          </button>
        </div>

        {/* MOBILE MENU */}
        {isMobileMenuOpen && (
          <div className="container mx-auto flex flex-col space-y-3 max-w-3xl mt-3">
            <Link to="/allcards" onClick={playClickSound}>
              การ์ดทั้งหมด
            </Link>

            <Link to="/home" onClick={playClickSound}>
              ทำนาย
            </Link>
          </div>
        )}
      </nav>

      <div className="h-[70px]" />
    </>
  );
};

export default Navbar;
