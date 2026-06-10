import { motion as Motion } from 'framer-motion';
import mountainImg from '../../assets/images/mountain_tour_1776185326597.png';
import coastalImg from '../../assets/images/coastal_tour_1776185344542.png';
import heroImg from '../../assets/images/hero_biker_1776185308389.png';

const toursData = [
    {
        id: 1,
        title: "Mountain Pass Expedition",
        image: mountainImg,
        duration: "7 Days",
        desc: "Conquer the high-altitude twisting roads and breathe in the thin, crisp mountain air. The ultimate test of endurance.",
        price: "$1,499"
    },
    {
        id: 2,
        title: "Coastal Highway Cruise",
        image: coastalImg,
        duration: "4 Days",
        desc: "Cruise the stunning coastal cliffs with the ocean breeze in your face. A relaxed, scenic ride packed with stunning views.",
        price: "$899"
    },
    {
        id: 3,
        title: "Twilight Explorer",
        image: heroImg,
        duration: "5 Days",
        desc: "Ride into the sunset on open, endless highways. Perfect for those who love night-riding and campfire stories.",
        price: "$1,199"
    }
];

const Tours = ({ onBookTour }) => {
    const waNumber = '919391790693';

    const handleEnquire = (tourName) => {
        const message = `Hi! I'm interested in the "${tourName}" tour. Could you provide more details?`;
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${waNumber}?text=${encodedMessage}`, '_blank');
    };

    return (
        <section id="tours" className="tours-section">
            <Motion.div 
                className="section-header"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
            >
                <h2>Featured <span>Rides</span></h2>
                <p>Select your next unforgettable journey and let's configure the details.</p>
            </Motion.div>

            <div className="tours-grid">
                {toursData.map((tour, index) => (
                    <Motion.div 
                        className="tour-card" 
                        key={tour.id}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.2 }}
                        viewport={{ once: true }}
                    >
                        <div className="tour-img-wrapper">
                            <img src={tour.image} alt={tour.title} style={tour.id === 3 ? { objectPosition: 'top center' } : {}} />
                            <div className="tour-badge">{tour.duration}</div>
                        </div>
                        <div className="tour-info">
                            <h3>{tour.title}</h3>
                            <p>{tour.desc}</p>
                            <div className="tour-footer">
                                <span className="price">{tour.price}</span>
                                <div className="tour-actions-btns">
                                    <button 
                                        className="btn btn-primary btn-sm"
                                        onClick={() => onBookTour(tour.title)}
                                    >
                                        Book Now
                                    </button>
                                    <button 
                                        className="btn btn-outline btn-sm wa-enquire-btn"
                                        onClick={() => handleEnquire(tour.title)}
                                    >
                                        Enquire
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Motion.div>
                ))}
            </div>
        </section>
    );
};

export default Tours;
