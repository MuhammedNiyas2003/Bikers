import { motion as Motion } from 'framer-motion';

const features = [
    { icon: "🗺️", title: "Expertly Planned Routes", desc: "Meticulously crafted routes and scenic tours designed for riders of all skill levels." },
    { icon: "🛡️", title: "Professional Support", desc: "Experienced ride leaders, support crew, and backup vehicles accompany every journey." },
    { icon: "🔒", title: "Safety-First Riding", desc: "Guided by strict safety protocols, comprehensive briefings, and backup assistance." },
    { icon: "👥", title: "Vibrant Community", desc: "Connect with a passionate community of fellow riders who share your love for adventure." },
    { icon: "📅", title: "Easy Online Booking", desc: "Manage your bookings and tour registrations easily through our digital platform." },
    { icon: "⛰️", title: "Stunning Destinations", desc: "Unforgettable rides across breathtaking mountain passes, coastal routes, and hidden trails." }
];

const containerVariants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const Features = () => {
    return (
        <section id="features" className="features-section">
            <Motion.div 
                className="section-header"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
            >
                <h2>Why Choose <span>MotoEscape</span></h2>
                <p>We provide the ultimate blend of freedom, exploration, and community on two wheels.</p>
            </Motion.div>

            <Motion.div 
                className="features-grid"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
            >
                {features.map((feat, i) => (
                    <Motion.div 
                        className="feature-box" 
                        key={i} 
                        variants={itemVariants}
                        whileHover={{ scale: 1.03, translateY: -5 }}
                    >
                        <div className="feature-icon">{feat.icon}</div>
                        <h3>{feat.title}</h3>
                        <p>{feat.desc}</p>
                    </Motion.div>
                ))}
            </Motion.div>
        </section>
    );
};

export default Features;
