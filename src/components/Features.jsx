import { motion } from 'framer-motion';

const features = [
    { icon: "🏍️", title: "Premium Fleet", desc: "Top-of-the-line touring and adventure motorcycles included." },
    { icon: "🗺️", title: "Curated Routes", desc: "Epic scenic highways and hidden off-road trails." },
    { icon: "🔧", title: "Full Support", desc: "Dedicated guides and backup vehicles on every trip." }
];

const containerVariants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.2 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const Features = () => {
    return (
        <motion.section 
            className="features"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
        >
            {features.map((feat, i) => (
                <motion.div className="feature-box" key={i} variants={itemVariants}>
                    <div className="feature-icon">{feat.icon}</div>
                    <h3>{feat.title}</h3>
                    <p>{feat.desc}</p>
                </motion.div>
            ))}
        </motion.section>
    );
};

export default Features;
