import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { cacheUtils } from '../utils/cache';
import { authUtils } from '../utils/auth';
import clickSound from '../assets/click.mp3';
const clickSoundObj = new window.Audio(clickSound);
import failSound from '../assets/fail.mp3';
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
        playPromise.catch(error => {
          // Safari อาจจะไม่ให้เล่นเสียงถ้าไม่มี user interaction
          if (isSafari && error.name === 'NotAllowedError') {
            console.log('Safari blocked audio play - user interaction required');
          } else {
            console.log('Click sound play failed:', error);
          }
        });
      }
    }
  } catch (error) {
    console.log('Click sound error:', error);
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
        playPromise.catch(error => {
          // Safari อาจจะไม่ให้เล่นเสียงถ้าไม่มี user interaction
          if (isSafari && error.name === 'NotAllowedError') {
            console.log('Safari blocked audio play - user interaction required');
          } else {
            console.log('Fail sound play failed:', error);
          }
        });
      }
    }
  } catch (error) {
    console.log('Fail sound error:', error);
  }
};

const API_BASE_URL = import.meta.env.VITE_API_URL;

const Login = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Preload images on mount (for background & logo)
  useEffect(() => {
    [
      'https://i.postimg.cc/XNgSymzG/IMG-0869.webp',
      'https://i.postimg.cc/sX987Gwd/IMG-0870.webp',
    ].forEach(src => {
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
      console.log('Audio preload failed:', error);
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
        title: 'ไม่มีการเชื่อมต่ออินเทอร์เน็ต',
        text: 'กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตของคุณ',
        icon: 'warning',
        confirmButtonText: 'ตกลง',
        customClass: {
          popup: 'mystic-modal w-[95vw] max-w-md rounded-xl mx-2',
          title: 'mystic-heading text-xl mb-2',
          content: 'mystic-gold-text font-serif',
          confirmButton: 'mystic-btn w-full mt-4',
          cancelButton: 'mystic-btn w-full mt-4',
        }
      });
      return;
    }

    // เพิ่มการตรวจสอบ API URL format
    if (!API_BASE_URL.startsWith('http')) {
      Swal.fire({
        title: 'ข้อผิดพลาด',
        text: 'ที่อยู่เซิร์ฟเวอร์ไม่ถูกต้อง กรุณาติดต่อแอดมิน',
        icon: 'error',
        confirmButtonText: 'ตกลง',
        customClass: {
          popup: 'mystic-modal w-[95vw] max-w-md rounded-xl mx-2',
          title: 'mystic-heading text-xl mb-2',
          content: 'mystic-gold-text font-serif',
          confirmButton: 'mystic-btn w-full mt-4',
          cancelButton: 'mystic-btn w-full mt-4',
        }
      });
      return;
    }

    // ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต
    if (!navigator.onLine) {
      Swal.fire({
        title: 'ไม่มีการเชื่อมต่ออินเทอร์เน็ต',
        text: 'กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตของคุณ',
        icon: 'warning',
        confirmButtonText: 'ตกลง',
        customClass: {
          popup: 'mystic-modal w-[95vw] max-w-md rounded-xl mx-2',
          title: 'mystic-heading text-xl mb-2',
          content: 'mystic-gold-text font-serif',
          confirmButton: 'mystic-btn w-full mt-4',
          cancelButton: 'mystic-btn w-full mt-4',
        }
      });
      return;
    }

    if (password.length < 6) {
      Swal.fire({
        title: 'รหัสผ่านไม่ถูกต้อง',
        text: 'รหัสผ่านควรมีอย่างน้อย 6 ตัวอักษรนะจ๊ะ',
        icon: 'warning',
        confirmButtonText: 'ตกลง',
        customClass: {
          popup: 'mystic-modal w-[95vw] max-w-md rounded-xl mx-2',
          title: 'mystic-heading text-xl mb-2',
          content: 'mystic-gold-text font-serif',
          confirmButton: 'mystic-btn w-full mt-4',
          cancelButton: 'mystic-btn w-full mt-4',
        }
      });
      return;
    }

    setIsLoading(true);

    try {
      // ลอง endpoint หลักก่อน
      let res = null;
      let lastError = null;

      try {
        console.log(`Trying main endpoint: ${API_BASE_URL}login`);
        res = await axios.post(
          `${API_BASE_URL}login`,
          { name, phone: password },
          {
            timeout: 8000, // ลด timeout เป็น 8 วินาที
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
            },
          }
        );
        console.log('Login successful with main endpoint');
      } catch (error) {
        console.log('Main endpoint failed:', error.response?.status, error.code);
        lastError = error;

        // ลอง fallback endpoints สำหรับทุกกรณี (ไม่ใช่แค่ 404)
        const fallbackEndpoints = ['api/login', 'auth/login', 'user/login'];

        for (const endpoint of fallbackEndpoints) {
          try {
            console.log(`Trying fallback endpoint: ${API_BASE_URL}${endpoint}`);
            res = await axios.post(
              `${API_BASE_URL}${endpoint}`,
              { name, phone: password },
              {
                timeout: 5000, // ลด timeout สำหรับ fallback
                headers: {
                  'Content-Type': 'application/json',
                  'Cache-Control': 'no-cache',
                },
              }
            );
            console.log(`Success with fallback endpoint: ${endpoint}`);
            break;
          } catch (fallbackError) {
            console.log(`Fallback endpoint ${endpoint} failed:`, fallbackError.response?.status, fallbackError.code);
            lastError = fallbackError;
            // ไม่หยุด loop เพื่อลอง endpoint ถัดไป
          }
        }
      }

      if (!res) {
        console.log('All endpoints failed, last error:', lastError);
        playFailSound();

        // ตรวจสอบ error type และแสดงข้อความที่เหมาะสม
        const errorStatus = lastError?.response?.status;
        const errorCode = lastError?.code;
        const errorMessage = lastError?.response?.data?.message || '';

        // จัดการ timeout และ network errors ก่อน
        if (errorCode === 'ECONNABORTED') {
          Swal.fire({
            title: 'เซิร์ฟเวอร์ไม่ตอบสนอง',
            text: 'การเชื่อมต่อใช้เวลานานเกินไป กรุณาลองใหม่ หรือตรวจสอบการเชื่อมต่ออินเทอร์เน็ต',
            icon: 'warning',
            confirmButtonText: 'ลองใหม่',
            customClass: {
              popup: 'mystic-modal w-[95vw] max-w-md rounded-xl mx-2',
              title: 'mystic-heading text-xl mb-2',
              content: 'mystic-gold-text font-serif',
              confirmButton: 'mystic-btn w-full mt-4',
              cancelButton: 'mystic-btn w-full mt-4',
            }
          });
        } else if (errorCode === 'ERR_NETWORK' || errorMessage.includes('Network Error')) {
          Swal.fire({
            title: 'ไม่สามารถเชื่อมต่อได้',
            text: 'กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตและลองใหม่',
            icon: 'error',
            confirmButtonText: 'ลองใหม่',
            customClass: {
              popup: 'mystic-modal w-[95vw] max-w-md rounded-xl mx-2',
              title: 'mystic-heading text-xl mb-2',
              content: 'mystic-gold-text font-serif',
              confirmButton: 'mystic-btn w-full mt-4',
              cancelButton: 'mystic-btn w-full mt-4',
            }
          });
        } else if (errorStatus === 404) {
          Swal.fire({
            title: 'ไม่พบ API endpoint',
            text: 'กรุณาติดต่อแอดมิน',
            icon: 'error',
            confirmButtonText: 'ตกลง',
            customClass: {
              popup: 'mystic-modal w-[95vw] max-w-md rounded-xl mx-2',
              title: 'mystic-heading text-xl mb-2',
              content: 'mystic-gold-text font-serif',
              confirmButton: 'mystic-btn w-full mt-4',
              cancelButton: 'mystic-btn w-full mt-4',
            }
          });
        } else {
          Swal.fire({
            title: 'ชื่อนี้ถูกใช้แล้วหรือรหัสผ่านไม่ถูกต้อง',
            text: 'หากลืมรหัสผ่านกรุณาติดต่อแอดมิน ทักIG: _moodma_',
            icon: 'error',
            confirmButtonText: 'ตกลง',
            customClass: {
              popup: 'mystic-modal w-[95vw] max-w-md rounded-xl mx-2',
              title: 'mystic-heading text-xl mb-2',
              content: 'mystic-gold-text font-serif',
              confirmButton: 'mystic-btn w-full mt-4',
              cancelButton: 'mystic-btn w-full mt-4',
            }
          });
        }
        return;
      }

      if ((res.status === 200 || res.status === 201) && res.data?.user?.role) {
        // Save user data using authUtils
        if (authUtils.setSession(res.data)) {
          // Navigate immediately without preloading to prevent delay
          navigate(res.data.user.role === 'admin' ? '/admin' : '/home', { replace: true });
        } else {
          throw new Error('Failed to save user session');
        }

        // Preload data in background after navigation
        setTimeout(() => {
          const preloadData = async () => {
            try {
              const cachedCards = cacheUtils.getCachedData('tarotCardsCache');
              if (!cachedCards) {
                const cardsRes = await axios.get(`${API_BASE_URL}taro-card`, {
                  timeout: 5000,
                  headers: { 'Cache-Control': 'no-cache' }
                });
                cacheUtils.setCachedData('tarotCardsCache', cardsRes.data.data);
              }
            } catch (error) {
              console.error('Background preload failed:', error);
            }
          };
          preloadData();
        }, 1000); // Delay preload by 1 second
      } else {
        Swal.fire({
          title: 'ล็อกอินไม่สำเร็จ',
          text: 'กรุณาตรวจสอบชื่อผู้ใช้และรหัสผ่าน',
          icon: 'error',
          confirmButtonText: 'ลองใหม่',
          customClass: {
            popup: 'mystic-modal w-[95vw] max-w-md rounded-xl mx-2',
            title: 'mystic-heading text-xl mb-2',
            content: 'mystic-gold-text font-serif',
            confirmButton: 'mystic-btn w-full mt-4',
            cancelButton: 'mystic-btn w-full mt-4',
          }
        });
      }
    } catch (error) {
      // เพิ่มการ log error เพื่อ debug
      console.error('Login error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);

      playFailSound();
      let errorMessage = 'กรุณาลองใหม่';

      if (error.code === 'ECONNABORTED') {
        errorMessage = 'เซิร์ฟเวอร์ไม่ตอบสนอง (Timeout) กรุณาลองใหม่ หรือตรวจสอบการเชื่อมต่ออินเทอร์เน็ต';
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต';
      } else if (error.response?.status === 500) {
        errorMessage = 'เซิร์ฟเวอร์มีปัญหา กรุณาลองใหม่ในภายหลัง';
      } else if (error.message?.includes('Network Error')) {
        errorMessage = 'ไม่สามารถเชื่อมต่ออินเทอร์เน็ตได้ กรุณาตรวจสอบการเชื่อมต่อ';
      }

      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'ลองใหม่',
        customClass: {
          popup: 'mystic-modal w-[95vw] max-w-md rounded-xl mx-2',
          title: 'mystic-heading text-xl mb-2',
          content: 'mystic-gold-text font-serif',
          confirmButton: 'mystic-btn w-full mt-4',
          cancelButton: 'mystic-btn w-full mt-4',
        }
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
          <div className="flex justify-center mb-4">
            <img
              src="https://i.postimg.cc/sX987Gwd/IMG-0870.webp"
              alt="โลโก้"
              loading="eager"
              className="h-24 sm:h-28 xs:h-18 w-auto object-contain drop-shadow-lg"
              onError={e => (e.target.style.display = 'none')}
            />
          </div>
          <h2 className="text-2xl sm:text-xl mystic-heading text-center mb-4 flex items-center justify-center gap-2">
            <span className="text-xl">🔮</span> Login เพื่อรับคำทำนาย <span className="text-3xl">✨</span>
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block mb-1 text-sm font-medium mystic-gold-text">
                ชื่อผู้ใช้:
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="กรอกชื่อผู้ใช้ของคุณ"
                required
                autoComplete="username"
                className="w-full p-2 sm:p-1.5 text-base border-2 border-yellow-300 bg-white bg-opacity-90 rounded-lg focus:ring-2 focus:ring-[#D497FF] focus:border-yellow-400 transition-all duration-200 text-black placeholder:text-gray-500 shadow-inner"
              />
            </div>
            <div>
              <label htmlFor="password" className="block mb-1 text-sm font-medium mystic-gold-text">
                รหัสผ่าน:
              </label>
              <div className="password-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่านของคุณ(ไม่ใช่โค้ดดูดวง)"
                  required
                  autoComplete="current-password"
                  className="w-full p-2 sm:p-1.5 text-base border-2 border-yellow-300 bg-white bg-opacity-90 rounded-lg focus:ring-2 focus:ring-[#D497FF] focus:border-yellow-400 transition-all duration-200 text-black placeholder:text-gray-500 shadow-inner"
                />
                {showPassword ? (
                  // ตาเปิด - เห็นรหัสผ่าน
                  <svg
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M1 12C2.73 7.61 7.11 4.5 12 4.5C16.89 4.5 21.27 7.61 23 12C21.27 16.39 16.89 19.5 12 19.5C7.11 19.5 2.73 16.39 1 12Z" stroke="#ffd700" strokeWidth="2" />
                    <circle cx="12" cy="12" r="3.5" stroke="#ffd700" strokeWidth="2" />
                  </svg>
                ) : (
                  // ตาปิด - ไม่เห็นรหัสผ่าน
                  <svg
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="#ffd700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="1" y1="1" x2="23" y2="23" stroke="#ffd700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </div>
            <button
              type="submit"
              className="mystic-btn w-full flex items-center justify-center gap-2 mt-2"
              disabled={isLoading}
              onClick={playClickSound}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2 text-yellow-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  กำลังเชื่อมจิต...
                </>
              ) : (
                '✨เชื่อมจิต✨'
              )}
            </button>
            <p className="mt-2 text-sm text-red-500 font-semibold">
              **รหัสสำหรับ Login ไม่ใช่โค้ดดูดวง❗เข้าครั้งเเรกให้ตั้งรหัสผ่านของคุณเพื่อนำไปใช้ในครั้งถัดไป<br />
              **หากลืมรหัสผ่านหรือเว็ปไซด์มีปัญหา ติดต่อแอดมินที่ IG:
              <a
                href="https://www.instagram.com/_moodma_?igsh=NGZvZTNmZWJtNjln"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-600"
              >
                @_moodma_
              </a>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};
export default Login;