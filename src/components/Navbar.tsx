import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Analysis', path: '/upload' },
  { label: 'About', path: '/about' },
]

export default function Navbar() {
  const location = useLocation()

  return (
    <nav className="w-full border-b border-navy-700/50 bg-navy-900/90 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z"/>
              <circle cx="12" cy="9" r="2" fill="white" stroke="none"/>
            </svg>
          </div>
          <div>
            <div className="font-bold text-black text-sm tracking-wide">ThermalRiskAI</div>
            <div className="text-[10px] text-cyan-500/70 tracking-widest uppercase font-mono">Research Platform</div>
          </div>
        </Link>

        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                {item.label}
              </Link>
            )
          })}
          <div className="ml-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
            <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider">Live</span>
          </div>
        </div>
      </div>
    </nav>
  )
}