import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <motion.header 
            className="navbar"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
                padding: scrolled ? '1rem 5%' : '1.5rem 5%',
                background: scrolled ? 'rgba(10, 10, 10, 0.98)' : 'rgba(10, 10, 10, 0.85)',
                boxShadow: scrolled ? '0 4px 30px rgba(0, 0, 0, 0.5)' : 'none'
            }}
        >
            <div className="logo">
                Bikers<span>.</span>
            </div>
            <nav className="nav-links">
                <a href="#home">Home</a>
                <a href="#tours">Tours</a>
                <a href="#about">About</a>
            </nav>
            <a href="https://wa.me/919391790693" className="btn btn-primary nav-btn" target="_blank" rel="noopener noreferrer">Chat Now</a>
        </motion.header>
    );
};

export default Navbar;
