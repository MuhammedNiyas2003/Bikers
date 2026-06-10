import { motion as Motion } from 'framer-motion';
import heroImg from '../../assets/images/hero_biker_1776185308389.png';

const Hero = ({ onBookNow }) => {
    return (
        <section id="home" className="hero">
            <div className="hero-overlay"></div>
            <img src={heroImg} className="hero-bg" alt="Biker on a mountain at sunset" />
            
            <Motion.div 
                className="hero-content"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            >
                <Motion.h1
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                >
                    Ride Beyond <span className="highlight">Limits</span>
                </Motion.h1>
                <Motion.p
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                >
                    Welcome to MotoEscape – where every ride becomes an adventure. Discover expertly planned routes, guided motorcycle tours, group adventures, and connect with a passionate riding community.
                </Motion.p>
                
                <Motion.div 
                    className="hero-actions"
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                >
                    <button onClick={onBookNow} className="btn btn-primary">Book Adventure</button>
                    <a href="#tours" className="btn btn-secondary">Explore Rides</a>
                </Motion.div>
            </Motion.div>
        </section>
    );
};

export default Hero;
