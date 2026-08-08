import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Activity, User as UserIcon, LogOut, ChevronDown, Sparkles, Menu, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Analysis', path: '/upload' },
  { label: 'Digital Twin', path: '/digital-twin' },
  { label: 'About', path: '/about' },
]

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
    setDropdownOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    setDropdownOpen(false)
    setMobileMenuOpen(false)
    try {
      await logout()
      navigate('/login')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  // Get user initial for avatar fallback
  const userInitial = currentUser?.displayName
    ? currentUser.displayName.charAt(0).toUpperCase()
    : currentUser?.email
    ? currentUser.email.charAt(0).toUpperCase()
    : 'U'

  return (
    <nav className="w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-xl sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm sm:text-base tracking-wide leading-tight">
              ThermalRisk<span className="text-cyan-600">AI</span>
            </div>
            <div className="text-[9px] sm:text-[10px] text-slate-500 tracking-widest uppercase font-mono font-medium">
              Research Platform
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Items */}
        <div className="hidden md:flex items-center gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200
                  ${isActive
                    ? 'bg-cyan-50 text-cyan-700 border border-cyan-200/80 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
              >
                {item.label}
              </Link>
            )
          })}

          {/* User Profile Dropdown (Desktop) */}
          {currentUser ? (
            <div className="relative ml-3" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full hover:bg-slate-100 border border-slate-200 transition-all text-slate-800"
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-8 h-8 rounded-full object-cover border border-slate-300"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-xs">
                    {userInitial}
                  </div>
                )}

                <span className="text-xs font-bold text-slate-800 max-w-[120px] truncate">
                  {currentUser.displayName || currentUser.email?.split('@')[0]}
                </span>

                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <div className="font-bold text-slate-900 text-sm truncate">
                      {currentUser.displayName || 'Authenticated User'}
                    </div>
                    <div className="text-xs text-slate-500 font-mono truncate mt-0.5">
                      {currentUser.email}
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/digital-twin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-cyan-700 hover:bg-cyan-50/50 transition-colors"
                    >
                      <Sparkles className="w-4 h-4 text-cyan-600" />
                      <span>Digital Twin</span>
                    </Link>

                    <Link
                      to="/digital-twin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-cyan-700 hover:bg-cyan-50/50 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-slate-500" />
                      <span>My Profile</span>
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="ml-3 px-4 py-2 rounded-lg bg-cyan-600 text-white text-xs font-bold shadow-xs hover:bg-cyan-700 transition-all"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Controls */}
        <div className="flex md:hidden items-center gap-2">
          {currentUser && currentUser.photoURL && (
            <img
              src={currentUser.photoURL}
              alt="User Avatar"
              className="w-7 h-7 rounded-full object-cover border border-slate-300"
            />
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-lg px-4 py-4 space-y-3 shadow-lg animate-in slide-in-from-top-3 duration-200">
          {/* User Header in Mobile Menu */}
          {currentUser && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3 mb-2">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'User'}
                  className="w-9 h-9 rounded-full object-cover border border-slate-300"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-sm">
                  {userInitial}
                </div>
              )}
              <div className="overflow-hidden">
                <div className="font-bold text-slate-900 text-xs truncate">
                  {currentUser.displayName || 'Authenticated User'}
                </div>
                <div className="text-[10px] text-slate-500 font-mono truncate">
                  {currentUser.email}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-cyan-50 text-cyan-700 border border-cyan-200/80'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* Auth Actions in Mobile Menu */}
          <div className="pt-2 border-t border-slate-100">
            {currentUser ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-red-50 text-red-600 border border-red-200 text-xs font-bold hover:bg-red-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="block text-center p-2.5 rounded-xl bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-700 transition-colors shadow-xs"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}