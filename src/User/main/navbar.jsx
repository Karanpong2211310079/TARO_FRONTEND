import React, { useEffect, useState } from 'react'
import tarotLogo from '../../assets/tarot.png'
import { useNavigate, Link } from 'react-router-dom'
import Swal from 'sweetalert2'

const API_BASE_URL = import.meta.env.VITE_API_URL
console.log("🌐 API_BASE_URL:", API_BASE_URL)

const Navbar = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false)
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
    <nav className="bg-gradient-to-b from-purple-950 via-purple-800 to-purple-950 text-white p-3 shadow-xl relative z-50 w-full max-w-[100vw] overflow-hidden">
      <div className="container mx-auto flex justify-between items-center max-w-screen-sm">
        {/* Logo Section */}
        <div className="flex items-center space-x-2">
          <img src={tarotLogo} className="h-10" alt="logo" />
          <Link to="/home" className="text-xl font-bold font-serif tracking-wide">
            Tarot Mamoo
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden sm:flex items-center space-x-4">
          {islogin ? (
            <>
              <div className="flex items-center space-x-2">
                <img src="https://i.postimg.cc/sX987Gwd/IMG-0870.webp" alt="Logo" className="h-8 w-8 rounded-full object-cover" />
                <span className="text-base font-medium tracking-wide border-2 border-yellow-200 rounded-md px-2 py-1">{name}</span>
              </div>
              <Link to="/user" className="text-base font-medium hover:text-yellow-200 transition-colors border-2 border-yellow-200 rounded-md px-2 py-1">
                My Card
              </Link>
              <Link to="/allcards" className="text-base font-medium hover:text-yellow-200 transition-colors border-2 border-yellow-200 rounded-md px-2 py-1">
                All Cards
              </Link>
              <button
                onClick={handSignout}
                className="text-base font-medium hover:text-yellow-200 transition-colors border-2 border-yellow-200 rounded-md px-2 py-1"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link to="/" className="text-base font-medium hover:text-yellow-200 transition-colors">
              Login
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="sm:hidden">
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="text-white focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-purple-900 py-3">
          <div className="container mx-auto flex flex-col space-y-3 max-w-screen-sm">
            {islogin ? (
              <>
                <div className="flex items-center space-x-2 px-3">
                  <img src="https://i.postimg.cc/sX987Gwd/IMG-0870.webp" alt="Logo" className="h-8 w-8 rounded-full object-cover" />
                  <span className="text-base font-medium">{name}</span>
                </div>
                <Link
                  to="/user"
                  className="text-base font-medium px-3 hover:text-yellow-200 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Card
                </Link>
                <Link
                  to="/allcards"
                  className="text-base font-medium px-3 hover:text-yellow-200 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  All Cards
                </Link>
                <button
                  onClick={() => {
                    handSignout()
                    setMobileMenuOpen(false)
                  }}
                  className="text-base font-medium px-3 text-left hover:text-yellow-200 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/"
                className="text-base font-medium px-3 hover:text-yellow-200 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Starry Background Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-1 h-1 bg-yellow-200 rounded-full top-1 left-[10%] animate-twinkle"></div>
        <div className="absolute w-1.5 h-1.5 bg-yellow-100 rounded-full top-2 right-[15%] animate-twinkle delay-150"></div>
        <div className="absolute w-1 h-1 bg-white rounded-full bottom-1 left-[25%] animate-twinkle delay-300"></div>
        <div className="absolute w-1.2 h-1.2 bg-yellow-200 rounded-full top-3 right-[30%] animate-twinkle delay-450"></div>
        <div className="absolute w-1 h-1 bg-white rounded-full bottom-2 left-[40%] animate-twinkle delay-600"></div>
        <div className="absolute w-1.5 h-1.5 bg-yellow-100 rounded-full top-4 left-[60%] animate-twinkle delay-750"></div>
        <div className="absolute w-1 h-1 bg-yellow-200 rounded-full bottom-1 right-[20%] animate-twinkle delay-900"></div>
        <div className="absolute w-1.2 h-1.2 bg-white rounded-full top-2 left-[80%] animate-twinkle delay-1050"></div>
      </div>
    </nav>
  )
}

export default Navbar