import { motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Tours from './components/Tours';
import About from './components/About';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import Footer from './components/Footer';

function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <Tours />
      <About />
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}

export default App;
