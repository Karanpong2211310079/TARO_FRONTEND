import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { cacheUtils } from "../utils/cache";
import { authUtils } from "../utils/auth";
import clickSound from "../assets/click.mp3";
const clickSoundObj = new window.Audio(clickSound);
import failSound from "../assets/fail.mp3";
const failSoundObj = new window.Audio(failSound);

// ฟังก์ชันเล่นเสียงที่ปลอดภัยสำหรับ Safari
const playClickSound = () => {
  try {
    // ตรวจสอบว่าเป็น Safari หรือไม่
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (clickSoundObj && clickSoundObj.readyState >= 2) {
      clickSoundObj.currentTime = 0;
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
};

const playFailSound = () => {
  try {
    // ตรวจสอบว่าเป็น Safari หรือไม่
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (failSoundObj && failSoundObj.readyState >= 2) {
      failSoundObj.currentTime = 0;
      const playPromise = failSoundObj.play();

      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          // Safari อาจจะไม่ให้เล่นเสียงถ้าไม่มี user interaction
          if (isSafari && error.name === "NotAllowedError") {
            console.log(
              "Safari blocked audio play - user interaction required"
            );
          } else {
            console.log("Fail sound play failed:", error);
          }
        });
      }
    }
  } catch (error) {
    console.log("Fail sound error:", error);
  }
};

const API_BASE_URL = import.meta.env.VITE_API_URL;

const Login = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const goToNextPage = () => {
    navigate("/home");
  };

  // Preload images on mount (for background & logo)
  useEffect(() => {
    [
      "https://i.postimg.cc/XNgSymzG/IMG-0869.webp",
      "https://i.postimg.cc/sX987Gwd/IMG-0870.webp",
    ].forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });

    // Preload audio for Safari compatibility
    try {
      if (clickSoundObj) {
        clickSoundObj.load();
      }
      if (failSoundObj) {
        failSoundObj.load();
      }
    } catch (error) {
      console.log("Audio preload failed:", error);
    }
  }, []);

  // ฟังก์ชันเล่นเสียงคลิก (ใช้ฟังก์ชันที่ปลอดภัยจากด้านบน)

  // Main login handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    playClickSound();
    if (isLoading) return;

    if (!navigator.onLine) {
      Swal.fire({
        title: "ไม่มีการเชื่อมต่ออินเทอร์เน็ต",
        text: "กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตของคุณ",
        icon: "warning",
        confirmButtonText: "ตกลง",
        customClass: {
          popup: "mystic-modal w-[95vw] max-w-md rounded-xl mx-2",
          title: "mystic-heading text-xl mb-2",
          content: "mystic-gold-text font-serif",
          confirmButton: "mystic-btn w-full mt-4",
          cancelButton: "mystic-btn w-full mt-4",
        },
      });
      return;
    }

    // เพิ่มการตรวจสอบ API URL format
    if (!API_BASE_URL.startsWith("http")) {
      Swal.fire({
        title: "ข้อผิดพลาด",
        text: "ที่อยู่เซิร์ฟเวอร์ไม่ถูกต้อง กรุณาติดต่อแอดมิน",
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
      return;
    }

    // ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต
    if (!navigator.onLine) {
      Swal.fire({
        title: "ไม่มีการเชื่อมต่ออินเทอร์เน็ต",
        text: "กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตของคุณ",
        icon: "warning",
        confirmButtonText: "ตกลง",
        customClass: {
          popup: "mystic-modal w-[95vw] max-w-md rounded-xl mx-2",
          title: "mystic-heading text-xl mb-2",
          content: "mystic-gold-text font-serif",
          confirmButton: "mystic-btn w-full mt-4",
          cancelButton: "mystic-btn w-full mt-4",
        },
      });
      return;
    }

    if (password.length < 6) {
      Swal.fire({
        title: "รหัสผ่านไม่ถูกต้อง",
        text: "รหัสผ่านควรมีอย่างน้อย 6 ตัวอักษรนะจ๊ะ",
        icon: "warning",
        confirmButtonText: "ตกลง",
        customClass: {
          popup: "mystic-modal w-[95vw] max-w-md rounded-xl mx-2",
          title: "mystic-heading text-xl mb-2",
          content: "mystic-gold-text font-serif",
          confirmButton: "mystic-btn w-full mt-4",
          cancelButton: "mystic-btn w-full mt-4",
        },
      });
      return;
    }

    setIsLoading(true);

    try {
      // ลอง endpoint หลักก่อน
      let res = null;
      let lastError = null;

      try {
        res = await axios.post(
          `${API_BASE_URL}login`,
          { name, phone: password },
          {
            timeout: 8000, // ลด timeout เป็น 8 วินาที
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache",
            },
          }
        );
      } catch (error) {
        lastError = error;

        // ลอง fallback endpoints สำหรับทุกกรณี (ไม่ใช่แค่ 404)
        const fallbackEndpoints = ["api/login", "auth/login", "user/login"];

        for (const endpoint of fallbackEndpoints) {
          try {
            res = await axios.post(
              `${API_BASE_URL}${endpoint}`,
              { name, phone: password },
              {
                timeout: 5000, // ลด timeout สำหรับ fallback
                headers: {
                  "Content-Type": "application/json",
                  "Cache-Control": "no-cache",
                },
              }
            );
            break;
          } catch (fallbackError) {
            lastError = fallbackError;
            // ไม่หยุด loop เพื่อลอง endpoint ถัดไป
          }
        }
      }

      if (!res) {
        playFailSound();

        // ตรวจสอบ error type และแสดงข้อความที่เหมาะสม
        const errorStatus = lastError?.response?.status;
        const errorCode = lastError?.code;

        // ปรับปรุงข้อความ error สำหรับกรณี server cold start หรือ network error
        if (errorCode === "ECONNABORTED" || errorCode === "ERR_NETWORK") {
          Swal.fire({
            title: "ระบบกำลังตื่น",
            text: "โปรดลองใหม่อีกครั้งใน 5-10 วินาที",
            icon: "warning",
            confirmButtonText: "ตกลง",
            customClass: {
              popup: "mystic-modal w-[95vw] max-w-md rounded-xl mx-2",
              title: "mystic-heading text-xl mb-2",
              content: "mystic-gold-text font-serif",
              confirmButton: "mystic-btn w-full mt-4",
            },
          });
        } else {
          // ข้อความทั่วไปสำหรับ login ไม่สำเร็จ
          Swal.fire({
            title: "ชื่อนี้ถูกใช้เเล้วหรือรหัสผ่านไม่ถูกต้อง",
            text: "กรุณาเปลี่ยนชื่อผู้ใช้หรือตรวจสอบรหัสผ่านอีกครั้ง",
            icon: "error",
            confirmButtonText: "ตกลง",
            customClass: {
              popup: "mystic-modal w-[95vw] max-w-md rounded-xl mx-2",
              title: "mystic-heading text-xl mb-2",
              content: "mystic-gold-text font-serif",
              confirmButton: "mystic-btn w-full mt-4",
            },
          });
        }
        return;
      }

      if ((res.status === 200 || res.status === 201) && res.data?.user?.role) {
        // Save user data using authUtils
        if (authUtils.setSession(res.data)) {
          // Navigate immediately without preloading to prevent delay
          navigate(res.data.user.role === "admin" ? "/admin" : "/home", {
            replace: true,
          });
        } else {
          throw new Error("Failed to save user session");
        }

        // Preload data in background after navigation
        setTimeout(() => {
          const preloadData = async () => {
            try {
              const cachedCards = cacheUtils.getCachedData("tarotCardsCache");
              if (!cachedCards) {
                const cardsRes = await axios.get(`${API_BASE_URL}taro-card`, {
                  timeout: 5000,
                  headers: { "Cache-Control": "no-cache" },
                });
                cacheUtils.setCachedData("tarotCardsCache", cardsRes.data.data);
              }
            } catch (error) {
              console.error("Background preload failed:", error);
            }
          };
          preloadData();
        }, 1000); // Delay preload by 1 second
      } else {
        Swal.fire({
          title: "ล็อกอินไม่สำเร็จ",
          text: "กรุณาตรวจสอบชื่อผู้ใช้และรหัสผ่าน",
          icon: "error",
          confirmButtonText: "ลองใหม่",
          customClass: {
            popup: "mystic-modal w-[95vw] max-w-md rounded-xl mx-2",
            title: "mystic-heading text-xl mb-2",
            content: "mystic-gold-text font-serif",
            confirmButton: "mystic-btn w-full mt-4",
            cancelButton: "mystic-btn w-full mt-4",
          },
        });
      }
    } catch (error) {
      playFailSound();
      let errorMessage = "กรุณาลองใหม่";

      if (error.code === "ECONNABORTED") {
        errorMessage = "เซิร์ฟเวอร์ไม่ตอบสนอง กรุณาลองใหม่";
      } else if (error.code === "ERR_NETWORK") {
        errorMessage =
          "ไม่สามารถเชื่อมต่อได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต";
      } else if (error.response?.status === 500) {
        errorMessage = "เซิร์ฟเวอร์มีปัญหา กรุณาลองใหม่";
      } else if (error.message?.includes("Network Error")) {
        errorMessage = "ไม่สามารถเชื่อมต่ออินเทอร์เน็ตได้";
      }

      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "ลองใหม่",
        customClass: {
          popup: "mystic-modal w-[95vw] max-w-md rounded-xl mx-2",
          title: "mystic-heading text-xl mb-2",
          content: "mystic-gold-text font-serif",
          confirmButton: "mystic-btn w-full mt-4",
          cancelButton: "mystic-btn w-full mt-4",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .password-container { position: relative; }
        .password-toggle {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
          color: #ffd700;
          filter: drop-shadow(0 0 4px #6d28d9);
          transition: all 0.12s ease-out;
          will-change: transform, filter;
          user-select: none;
        }
        .password-toggle:hover { 
          color: #fff; 
          filter: drop-shadow(0 0 8px #ffd700); 
          transform: translateY(-50%) scale(1.05);
        }
        
        /* เพิ่มความโปร่งใสให้กับกล่อง login */
        .login-content {
          background: rgba(40, 0, 60, 0.08) !important;
          backdrop-filter: blur(3px) saturate(1.01) !important;
          border: 3px solid rgba(255, 215, 0, 0.6) !important;
          border-radius: 2rem !important;
          box-shadow: 0 4px 32px 0 rgba(80, 0, 120, 0.15) !important;
        }
        
        /* ทำให้ input fields มีความโปร่งใสมากขึ้น */
        .login-content input {
          background: rgba(255, 255, 255, 0.7) !important;
          backdrop-filter: blur(2px) !important;
        }
        
        /* ทำให้ label มีความชัดเจนมากขึ้น */
        .login-content label {
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8) !important;
        }
      `}</style>
      <div className="flex justify-center items-center min-h-screen login-background px-2 sm:px-4">
        <div className="w-full max-w-md sm:max-w-sm xs:max-w-xs p-4 sm:p-6 mystic-shadow transition-all duration-300 hover:shadow-2xl relative login-content">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <img
              src="https://i.postimg.cc/sX987Gwd/IMG-0870.webp"
              alt="โลโก้"
              loading="eager"
              className="h-24 sm:h-28 xs:h-18 w-auto object-contain drop-shadow-lg"
              onError={(e) => (e.target.style.display = "none")}
            />
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-xl mystic-heading text-center mb-6 font-semibold tracking-wide leading-tight">
            <span className="block text-xl">ยินดีต้อนรับสู่</span>
            <span className="block font-bold text-purple-600 text-3xl mt-1">
              ✨ Taro Mammoo ✨
            </span>
          </h2>

          {/* Main Button */}
          <button
            onClick={() => {
              playClickSound();
              goToNextPage();
            }}
            className="mystic-btn w-full flex items-center justify-center gap-2 mt-2 font-semibold tracking-wide text-lg"
          >
            ✨ เริ่มทำนาย ✨
          </button>
        </div>
      </div>
    </>
  );
};
export default Login;
