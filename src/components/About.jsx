import { useState } from 'react';
import { motion as Motion } from 'framer-motion';

const About = () => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email.trim()) {
            setIsSubmitted(true);
        }
    };

    return (
        <section id="about" className="about-section">
            <Motion.div 
                className="about-content"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
            >
                <h2>More Than <span>a Ride</span></h2>
                <Motion.p
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: true }}
                >
                    At RideQuest, we believe biking is not just transportation—it's a lifestyle. Our mission is to connect riders, explore new destinations, and create lifelong memories on two wheels.
                </Motion.p>
                <Motion.p
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    viewport={{ once: true }}
                >
                    Every detail is handled, from expertly mapped routes to professional leadership and support on every cruise. Just twist the throttle, feel the breeze, and experience the road like never before.
                </Motion.p>
            </Motion.div>

            {/* Join the Journey Subscription Card */}
            <Motion.div 
                className="join-card"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
            >
                <div className="join-overlay"></div>
                <div className="join-content">
                    <h3>Join the <span>Journey</span></h3>
                    <p>Discover exciting routes, connect with fellow riders, and experience the road like never before. Start your next adventure today.</p>
                    <p className="journey-tagline">Ride. Explore. Experience.</p>
                    
                    {!isSubmitted ? (
                        <form onSubmit={handleSubscribe} className="join-form">
                            <input 
                                type="email" 
                                placeholder="Enter your email address" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                aria-label="Email Address for newsletter"
                            />
                            <button type="submit" className="btn btn-primary">Join Club</button>
                        </form>
                    ) : (
                        <Motion.div 
                            className="subscribe-success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <span className="success-check">✓</span>
                            <p><strong>Welcome to the crew!</strong> We've sent a welcome pack and our upcoming tour schedule to <em>{email}</em>.</p>
                        </Motion.div>
                    )}
                </div>
            </Motion.div>
        </section>
    );
};

export default About;
