import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Upload from './pages/Upload'
import DigitalTwin from './pages/DigitalTwin'
import About from './pages/About'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { DigitalTwinProvider } from './context/DigitalTwinContext'

/* ==================== MAIN APP COMPONENT ==================== */

function App() {
  return (
    <AuthProvider>
      <DigitalTwinProvider>
        <div className="min-h-screen bg-slate-50 text-slate-900 bg-grid font-sans">
          <Navbar />
          <Routes>
            {/* Public Authentication Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected Application Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Home />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/digital-twin" element={<DigitalTwin />} />
              <Route path="/about" element={<About />} />
            </Route>
          </Routes>
        </div>
      </DigitalTwinProvider>
    </AuthProvider>
  )
}

export default App