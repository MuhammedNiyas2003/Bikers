import { useState, useEffect } from 'react';
import { motion as Motion } from 'framer-motion';
import mountainImg from '../../assets/images/mountain_tour_1776185326597.png';
import coastalImg from '../../assets/images/coastal_tour_1776185344542.png';
import heroImg from '../../assets/images/hero_biker_1776185308389.png';

const IMAGE_MAP = {
    'mountain': mountainImg,
    'coastal': coastalImg,
    'hero': heroImg,
    'mountain_tour_1776185326597.png': mountainImg,
    'coastal_tour_1776185344542.png': coastalImg,
    'hero_biker_1776185308389.png': heroImg
};

const Tours = ({ onBookTour }) => {
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const waNumber = '919391790693';

    const fetchTours = () => {
        setLoading(true);
        fetch('/api/rides')
            .then(res => {
                if (!res.ok) throw new Error("Failed to load rides");
                return res.json();
            })
            .then(data => {
                setTours(data);
                setError(null);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError(err.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchTours();
        
        // Custom event to trigger re-fetching when Admin updates rides
        window.addEventListener('ridesUpdated', fetchTours);
        return () => window.removeEventListener('ridesUpdated', fetchTours);
    }, []);

    const handleEnquire = (tourName) => {
        const message = `Hi! I'm interested in the "${tourName}" tour. Could you provide more details?`;
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${waNumber}?text=${encodedMessage}`, '_blank');
    };

    const getTourImage = (imgName) => {
        if (!imgName) return heroImg;
        if (IMAGE_MAP[imgName]) return IMAGE_MAP[imgName];
        if (imgName.startsWith('data:image') || imgName.startsWith('http://') || imgName.startsWith('https://')) return imgName;
        return heroImg;
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

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', fontSize: '1.2rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
                    Loading available rides...
                </div>
            ) : error ? (
                <div style={{ textAlign: 'center', padding: '3rem', fontSize: '1.2rem', color: '#ff4444', fontFamily: 'var(--font-body)' }}>
                    Error: {error}. Please try again later.
                </div>
            ) : tours.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', fontSize: '1.2rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
                    No rides found. Add rides from the Admin Panel!
                </div>
            ) : (
                <div className={`tours-grid ${tours.length > 3 ? 'scrollable-slider' : ''}`}>
                    {tours.map((tour, index) => (
                        <Motion.div 
                            className="tour-card" 
                            key={tour.id}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <div className="tour-img-wrapper">
                                <img src={getTourImage(tour.image)} alt={tour.title} style={tour.image === 'hero' ? { objectPosition: 'top center' } : {}} />
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
            )}
        </section>
    );
};

export default Tours;
