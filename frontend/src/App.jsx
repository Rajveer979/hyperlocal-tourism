import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/layout/Navbar.jsx'
import Footer from './components/layout/Footer.jsx'
import Home from './pages/Home.jsx'
import Explore from './pages/Explore.jsx'
import CitySearch from './pages/CitySearch.jsx'
import ExperienceDetail from './pages/ExperienceDetail.jsx'
import BookingConfirm from './pages/BookingConfirm.jsx'
import MyBookings from './pages/MyBookings.jsx'
import Itinerary from './pages/Itinerary.jsx'
import DayPass from './pages/DayPass.jsx'
import HostHome from './pages/host/HostHome.jsx'
import VoiceListing from './pages/host/VoiceListing.jsx'
import ListingReview from './pages/host/ListingReview.jsx'
import ManualListing from './pages/host/ManualListing.jsx'
import HostDashboard from './pages/host/HostDashboard.jsx'
import Login from './pages/Login.jsx'
import AdminPanel from './pages/admin/AdminPanel.jsx'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-earth-light text-stone-800">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/search" element={<CitySearch />} />
          <Route path="/route" element={<CitySearch />} />
          <Route path="/experience/:id" element={<ExperienceDetail />} />
          <Route path="/book/:id" element={<BookingConfirm />} />
          <Route path="/bookings" element={<MyBookings />} />
          <Route path="/itinerary/:bookingId" element={<Itinerary />} />
          <Route path="/daypass" element={<DayPass />} />
          <Route path="/host" element={<HostHome />} />
          <Route path="/host/voice" element={<VoiceListing />} />
          <Route path="/host/voice/review" element={<ListingReview />} />
          <Route path="/host/manual" element={<ManualListing />} />
          <Route path="/host/dashboard" element={<HostDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
