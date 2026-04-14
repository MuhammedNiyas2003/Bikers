import { motion } from 'framer-motion';

const About = () => {
    return (
        <motion.section 
            id="about" 
            className="about-section"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
        >
            <div className="about-content">
                <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    Why Ride With Us?
                </motion.h2>
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: true }}
                >
                    At Bikers, we don't just rent out motorcycles; we curate unforgettable experiences. Whether you are an experienced rider looking for a challenging mountain route or a weekend warrior wanting a relaxed coastal cruise, we have the perfect itinerary for you.
                </motion.p>
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    viewport={{ once: true }}
                >
                    Every detail is handled, from premium motorcycles to luxury accommodations along the route. Just twist the throttle and enjoy the ride.
                </motion.p>
            </div>
        </motion.section>
    );
};

export default About;
