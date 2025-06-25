import React, { useEffect, useState } from 'react'
import tarotLogo from '../../assets/tarot.png'
import { useNavigate, Link } from 'react-router-dom'
import Swal from 'sweetalert2'

const API_BASE_URL = import.meta.env.VITE_API_URL
console.log("🌐 API_BASE_URL:", API_BASE_URL)

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
      setislogin(true)
      setName(userData.user.name)
    } else {
      setislogin(false)
    }
  }, [])

  return (
    <div>
      <nav className="bg-purple-600 flex justify-between items-center p-4 shadow-2xl relative z-50">
        <div className="flex items-center justify-center my-2">
          <img src={tarotLogo} className="h-10" alt="logo" />
          <Link to="/home" className="text-3xl font-bold font-serif ml-2 text-white">Tarot Mamoo</Link>
        </div>

        {islogin ? (
          <div className="flex items-center gap-4 mr-4">
            <span className="text-lg font-semibold text-white">{name}</span>
            <Link to="/user" className="text-lg font-semibold text-white">My Card</Link>
          </div>
        ) : (
          <div className="flex items-center gap-4 mr-4">
            <Link to="/" className="text-lg font-semibold text-white">Login</Link>
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
                  <Link to="/user" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                    PROFILE
                  </Link>
                </li>
                <li>
                  <Link to="/allcards" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                    ALL CARDS
                  </Link>
                </li>
                <li>
                  <button onClick={handSignout} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                    SIGN OUT
                  </button>
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
