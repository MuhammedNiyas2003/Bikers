import { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ onBookNow }) => {
    const [scrolled, setScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => setIsOpen(!isOpen);
    const closeMenu = () => setIsOpen(false);

    const menuVariants = {
        closed: {
            opacity: 0,
            y: "-100%",
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 30
            }
        },
        open: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 30
            }
        }
    };

    return (
        <>
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
                <a href="#home" className="logo" onClick={closeMenu}>
                    MotoEscape<span>.</span>
                </a>
                <nav className="nav-links">
                    <a href="#home">Home</a>
                    <a href="#tours">Tours</a>
                    <a href="#about">About</a>
                </nav>
                
                <div className="nav-actions-desktop">
                    <button onClick={onBookNow} className="btn btn-primary nav-btn">Book Now</button>
                </div>

                <button 
                    className={`mobile-menu-toggle ${isOpen ? 'open' : ''}`} 
                    onClick={toggleMenu}
                    aria-label="Toggle Navigation Menu"
                >
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                </button>
            </Motion.header>

            {/* Mobile Navigation Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <Motion.div 
                        className="mobile-nav-overlay"
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={menuVariants}
                    >
                        <nav className="mobile-nav-links">
                            <a href="#home" onClick={closeMenu}>Home</a>
                            <a href="#tours" onClick={closeMenu}>Tours</a>
                            <a href="#about" onClick={closeMenu}>About</a>
                            <button 
                                onClick={() => {
                                    closeMenu();
                                    onBookNow();
                                }} 
                                className="btn btn-primary mobile-nav-btn"
                            >
                                Book Now
                            </button>
                        </nav>
                    </Motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
