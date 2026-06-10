import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Tours from './components/Tours';
import About from './components/About';
import BookingModal from './components/BookingModal';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import Footer from './components/Footer';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedTour, setSelectedTour] = useState('');

  // Path detection to separate admin and customer pages
  const path = window.location.pathname;
  const normalized = path.replace(/^\/Bikers/, '').replace(/\/$/, '');
  const isRouteAdmin = normalized === '/admin';

  const openBookingModal = (tourName = '') => {
    setSelectedTour(tourName);
    setIsBookingOpen(true);
  };

  if (isRouteAdmin) {
    return (
      <AnimatePresence mode="wait">
        <AdminDashboard />
      </AnimatePresence>
    );
  }

  return (
    <>
      <Navbar onBookNow={() => openBookingModal('')} />
      <Hero onBookNow={() => openBookingModal('')} />
      <Features />
      <Tours onBookTour={(tourName) => openBookingModal(tourName)} />
      <About />
      <Footer />
      <FloatingWhatsApp />

      <AnimatePresence mode="wait">
        {isBookingOpen && (
          <BookingModal 
            isOpen={isBookingOpen} 
            onClose={() => setIsBookingOpen(false)} 
            defaultTour={selectedTour} 
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
