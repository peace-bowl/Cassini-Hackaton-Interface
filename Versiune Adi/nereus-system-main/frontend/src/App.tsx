import { BrowserRouter, Route, Routes } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import About from './pages/About'
import UnsubscribePage from './pages/UnsubscribePage'
import Demo from './pages/Demo'
import { LanguageProvider } from './contexts/LanguageContext'

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/about" element={<About />} />
          <Route path="/unsubscribe/:token" element={<UnsubscribePage />} />
          <Route path="/demo" element={<Demo />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  )
}
