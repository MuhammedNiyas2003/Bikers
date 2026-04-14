import { motion } from 'framer-motion';
import heroImg from '../../assets/images/hero_biker_1776185308389.png';

const Hero = () => {
    return (
        <section id="home" className="hero">
            <div className="hero-overlay"></div>
            <img src={heroImg} className="hero-bg" alt="Biker on a mountain at sunset" />
            
            <motion.div 
                className="hero-content"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            >
                <motion.h1
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                >
                    Ride the <span className="highlight">Unexplored</span>
                </motion.h1>
                <motion.p
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                >
                    Premium motorcycle tours, trips, and rides across breathtaking landscapes. Start your next adventure today.
                </motion.p>
                
                <motion.div 
                    className="hero-actions"
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                >
                    <a href="#tours" className="btn btn-secondary">Explore Rides</a>
                    <a href="https://wa.me/919391790693?text=Hi!%20I'm%20interested%20in%20planning%20a%20biking%20trip." className="btn btn-primary" target="_blank" rel="noopener noreferrer">Plan Your Trip</a>
                </motion.div>
            </motion.div>
        </section>
    );
};

export default Hero;
