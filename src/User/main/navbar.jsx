import React, { useEffect, useState } from 'react'
import tarotLogo from '../../assets/tarot.png'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'

// 🔧 ใช้ URL จากไฟล์ .env
const API_BASE_URL = import.meta.env.VITE_API_URL
console.log("🌐 API_BASE_URL:", API_BASE_URL) // ตรวจสอบค่าที่โหลดมา

const Navbar = () => {
  const [isMainDropdownOpen, setMainDropdownOpen] = useState(false)
  const [islogin, setislogin] = useState(false)
  const [name, setName] = useState('')
  const navigate = useNavigate()

  const handSignout = async () => {
    localStorage.removeItem('user')
    setislogin(false)
    navigate('/')
    await Swal.fire({
      title: 'Sign Out Successful',
      text: 'You have been logged out.',
      icon: 'success',
      confirmButtonText: 'OK',
    })
  }

  useEffect(() => {
    const user = localStorage.getItem('user')

    if (user) {
      const userData = JSON.parse(user)
      console.log(userData.user.name)
      setislogin(true)
      setName(userData.user.name)
    } else {
      setislogin(false)
    }
  }, [])

  return (
    <div>
      <nav className="bg-amber-300 flex justify-between items-center p-4 shadow-2xl relative z-50">
        <div className="flex items-center justify-center my-2">
          <img src={tarotLogo} className="h-10" alt="logo" />
          <a href='/home' className="text-3xl font-bold font-serif ml-2">Tarot Bamboo</a>
        </div>

        {islogin ? (
          <div className="flex items-center gap-4 mr-4">
            <span className="text-lg font-semibold">{name}</span>
            <a href="/user" className="text-lg font-semibold">My Card</a>
          </div>
        ) : (
          <div className="flex items-center gap-4 mr-4">
            <a href="/login" className="text-lg font-semibold">Login</a>
            <a href="/register" className="text-lg font-semibold">Register</a>
          </div>
        )}

        <div className="relative">
          <button
            onClick={() => setMainDropdownOpen(prev => !prev)}
            type="button"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 flex items-center gap-2"
          >
            Menu
            <svg className="w-2.5 h-2.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1l4 4 4-4" />
            </svg>
          </button>

          {isMainDropdownOpen && (
            <div className="absolute right-0 mt-2 w-44 z-50 bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700">
              <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                <li>
                  <a href="/user" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                    PROFILE
                  </a>
                </li>
                <li>
                  <a href="/allcards" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                    ALL CARDS
                  </a>
                </li>
                <li>
                  <a href="#" onClick={handSignout} className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                    SIGN OUT
                  </a>
                </li>
              </ul>
            </div>
          )}
        </div>
      </nav>
    </div>
  )
}

export default Navbar
