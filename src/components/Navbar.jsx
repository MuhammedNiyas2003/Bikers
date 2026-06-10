import { useState, useEffect } from 'react';
import { motion as Motion } from 'framer-motion';

const Navbar = ({ onBookNow, onOpenAdmin }) => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <Motion.header 
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
            <a href="#home" className="logo">
                MotoEscape<span>.</span>
            </a>
            <nav className="nav-links">
                <a href="#home">Home</a>
                <a href="#tours">Tours</a>
                <a href="#about">About</a>
                {onOpenAdmin && <button onClick={onOpenAdmin} className="admin-nav-btn">Admin</button>}
            </nav>
            <button onClick={onBookNow} className="btn btn-primary nav-btn">Book Now</button>
        </Motion.header>
    );
};

export default Navbar;
