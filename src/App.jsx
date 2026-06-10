import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Tours from './components/Tours';
import About from './components/About';
import BookingModal from './components/BookingModal';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import Footer from './components/Footer';

function App() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedTour, setSelectedTour] = useState('');

  const openBookingModal = (tourName = '') => {
    setSelectedTour(tourName);
    setIsBookingOpen(true);
  };

  return (
    <>
      <Navbar onBookNow={() => openBookingModal('')} />
      <Hero onBookNow={() => openBookingModal('')} />
      <Features />
      <Tours onBookTour={(tourName) => openBookingModal(tourName)} />
      <About />
      <Footer />
      <FloatingWhatsApp />
      <AnimatePresence>
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
