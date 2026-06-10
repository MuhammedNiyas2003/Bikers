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
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [selectedTour, setSelectedTour] = useState('');

  useEffect(() => {
    // Check local storage for persistent admin mode
    const savedAdmin = localStorage.getItem('isAdmin') === 'true';
    
    // Check URL parameters for explicit overrides (?admin=true or ?admin=false / ?logout=true)
    const queryParams = new URLSearchParams(window.location.search);
    const adminParam = queryParams.get('admin');
    
    if (adminParam === 'true') {
      setIsAdminMode(true);
      localStorage.setItem('isAdmin', 'true');
    } else if (adminParam === 'false' || queryParams.get('logout') === 'true') {
      setIsAdminMode(false);
      localStorage.removeItem('isAdmin');
    } else {
      setIsAdminMode(savedAdmin);
    }
  }, []);

  const openBookingModal = (tourName = '') => {
    setSelectedTour(tourName);
    setIsBookingOpen(true);
  };

  return (
    <>
      <Navbar 
        onBookNow={() => openBookingModal('')} 
        onOpenAdmin={isAdminMode ? () => setIsAdminOpen(true) : undefined} 
      />
      <Hero onBookNow={() => openBookingModal('')} />
      <Features />
      <Tours onBookTour={(tourName) => openBookingModal(tourName)} />
      <About />
      <Footer />
      <FloatingWhatsApp />
      
      {/* Conditionally display floating admin gear icon ONLY for authorized admin sessions */}
      {isAdminMode && (
        <button 
          className="floating-admin-btn" 
          onClick={() => setIsAdminOpen(true)}
          title="Admin Dashboard"
        >
          ⚙️
        </button>
      )}

      <AnimatePresence mode="wait">
        {isBookingOpen && (
          <BookingModal 
            isOpen={isBookingOpen} 
            onClose={() => setIsBookingOpen(false)} 
            defaultTour={selectedTour} 
          />
        )}
        {isAdminOpen && (
          <AdminDashboard 
            isOpen={isAdminOpen} 
            onClose={() => setIsAdminOpen(false)} 
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
