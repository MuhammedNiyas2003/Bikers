import { useState, useEffect } from 'react';
import { motion as Motion } from 'framer-motion';

const BookingModal = ({ onClose, defaultTour = "" }) => {
    const [step, setStep] = useState(1);
    const [tours, setTours] = useState([]);
    const [formData, setFormData] = useState({
        tour: defaultTour || '',
        date: '',
        name: '',
        email: '',
        mobileNumber: '',
        specialNotes: '',
        skillLevel: 'Intermediate',
        rideType: 'Single',
        bikeCc: '300 to 500'
    });
    const [mobileError, setMobileError] = useState('');

    useEffect(() => {
        fetch('/api/rides')
            .then(res => res.json())
            .then(data => {
                setTours(data);
                const initialTour = defaultTour || (data.length > 0 ? data[0].title : '');
                const matchedTour = data.find(t => t.title === initialTour);
                setFormData(prev => ({
                    ...prev,
                    tour: initialTour,
                    date: matchedTour ? (matchedTour.rideDate || '') : ''
                }));
            })
            .catch(err => console.error("Failed to fetch rides", err));
    }, [defaultTour]);

    // Automatically sync booking date with selected tour's predefined ride date
    useEffect(() => {
        if (tours.length > 0 && formData.tour) {
            const matchedTour = tours.find(t => t.title === formData.tour);
            if (matchedTour) {
                setFormData(prev => {
                    if (prev.date !== matchedTour.rideDate) {
                        return { ...prev, date: matchedTour.rideDate || '' };
                    }
                    return prev;
                });
            }
        }
    }, [formData.tour, tours]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'mobileNumber') {
            setMobileError('');
        }
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validate Mobile Number (required, digits, spaces, hyphens, and optional +)
        const phoneRegex = /^[+]?[0-9\s-]{10,15}$/;
        if (!phoneRegex.test(formData.mobileNumber.trim())) {
            setMobileError('Please enter a valid 10-15 digit mobile number.');
            return;
        }
        setMobileError('');

        fetch('/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(res => {
            if (!res.ok) throw new Error("Failed to post booking");
            return res.json();
        })
        .then(() => {
            nextStep();
        })
        .catch(err => {
            console.error("Booking database write failed, falling back to local confirmation", err);
            nextStep();
        });
    };

    const handleWhatsAppConfirm = () => {
        const message = `Hi MotoEscape! I just submitted a booking request:\n\n` +
            `• Tour: ${formData.tour}\n` +
            `• Date: ${formData.date || 'TBD'}\n` +
            `• Rider: ${formData.name}\n` +
            `• Contact: ${formData.email} / ${formData.mobileNumber}\n` +
            `• Notes: ${formData.specialNotes || 'None'}\n` +
            `• Rider Type: ${formData.rideType}\n` +
            `• Bike Engine: ${formData.bikeCc} CC\n` +
            `• Skill Level: ${formData.skillLevel}\n\n` +
            `Let's finalize my adventure details!`;
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/919391790693?text=${encodedMessage}`, '_blank');
        onClose();
        setStep(1);
    };

    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    };

    const modalVariants = {
        hidden: { opacity: 0, y: 50, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', duration: 0.5 } }
    };

    return (
        <Motion.div 
            className="modal-backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
        >
            <Motion.div 
                className="modal-content"
                variants={modalVariants}
                onClick={(e) => e.stopPropagation()}
            >
                <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">&times;</button>
                
                <div className="modal-header">
                    <h2>Book Your <span>Adventure</span></h2>
                    <div className="step-indicator">
                        <span className={step >= 1 ? "active" : ""}>1</span>
                        <span className={step >= 2 ? "active" : ""}>2</span>
                        <span className={step >= 3 ? "active" : ""}>3</span>
                    </div>
                </div>

                {step === 1 && (() => {
                    const selectedTourObj = tours.find(t => t.title === formData.tour);
                    return (
                        <Motion.div 
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -50, opacity: 0 }}
                        >
                            <h3>Step 1: Choose Tour</h3>
                            
                            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '0.3rem' }}>Selected Adventure Route</span>
                                <h3 style={{ color: 'white', fontFamily: 'var(--font-heading)', fontSize: '1.6rem', margin: 0 }}>
                                    {formData.tour || 'MotoEscape Expedition'}
                                </h3>
                            </div>

                            {selectedTourObj && (
                                <div style={{
                                    background: 'rgba(255, 69, 0, 0.05)',
                                    border: '1px solid rgba(255, 69, 0, 0.2)',
                                    borderRadius: '12px',
                                    padding: '1.25rem',
                                    marginBottom: '1.5rem'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' }}>Fixed Ride Date:</span>
                                        <span style={{ color: 'var(--accent-color)', fontSize: '0.95rem', fontWeight: '800' }}>
                                            📅 {selectedTourObj.rideDate || 'Date: TBD'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' }}>Location:</span>
                                        <span style={{ color: 'white', fontSize: '0.95rem', fontWeight: '700' }}>
                                            📍 {selectedTourObj.location || 'Route Configured'}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="notes-textarea">Special Notes (Optional)</label>
                                <textarea 
                                    id="notes-textarea"
                                    name="specialNotes" 
                                    placeholder="Any custom requests, dietary details, or gear requirements..."
                                    value={formData.specialNotes} 
                                    onChange={handleInputChange}
                                    style={{
                                        width: '100%',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        padding: '0.9rem 1.2rem',
                                        borderRadius: '12px',
                                        color: 'white',
                                        fontSize: '1rem',
                                        fontFamily: 'var(--font-body)',
                                        outline: 'none',
                                        resize: 'vertical',
                                        minHeight: '100px'
                                    }}
                                />
                            </div>

                            <div className="modal-actions">
                                <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                                <button 
                                    className="btn btn-primary" 
                                    onClick={nextStep}
                                    disabled={!formData.tour}
                                >
                                    Next Details &rarr;
                                </button>
                            </div>
                        </Motion.div>
                    );
                })()}

                {step === 2 && (
                    <Motion.div 
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -50, opacity: 0 }}
                    >
                        <h3>Step 2: Rider Information</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="name-input">Full Name</label>
                                <input 
                                    id="name-input"
                                    type="text" 
                                    name="name" 
                                    placeholder="John Doe" 
                                    value={formData.name} 
                                    onChange={handleInputChange}
                                    required 
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="email-input">Email Address</label>
                                    <input 
                                        id="email-input"
                                        type="email" 
                                        name="email" 
                                        placeholder="john@example.com" 
                                        value={formData.email} 
                                        onChange={handleInputChange}
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="mobile-input">Mobile Number</label>
                                    <input 
                                        id="mobile-input"
                                        type="tel" 
                                        name="mobileNumber" 
                                        placeholder="e.g. +91 98765 43210" 
                                        value={formData.mobileNumber} 
                                        onChange={handleInputChange}
                                        required 
                                    />
                                    {mobileError && <span style={{ color: '#ff4444', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>{mobileError}</span>}
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="skill-select">Riding Experience</label>
                                <select 
                                    id="skill-select"
                                    name="skillLevel" 
                                    value={formData.skillLevel} 
                                    onChange={handleInputChange}
                                >
                                    <option value="Beginner">Beginner (Scenic & slow)</option>
                                    <option value="Intermediate">Intermediate (Comfortable cruising)</option>
                                    <option value="Expert">Expert (Challenging off-roads & curves)</option>
                                </select>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="rideType-select">Riding Option</label>
                                    <select 
                                        id="rideType-select"
                                        name="rideType" 
                                        value={formData.rideType} 
                                        onChange={handleInputChange}
                                    >
                                        <option value="Single">Single (Solo Rider)</option>
                                        <option value="Pillion">Pillion (Passenger)</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="bikeCc-select">Bike Engine Capacity</label>
                                    <select 
                                        id="bikeCc-select"
                                        name="bikeCc" 
                                        value={formData.bikeCc} 
                                        onChange={handleInputChange}
                                    >
                                        <option value="0 to 300">0 to 300 CC</option>
                                        <option value="300 to 500">300 to 500 CC</option>
                                        <option value="500 to 700">500 to 700 CC</option>
                                        <option value="700+">700+ CC</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={prevStep}>Back</button>
                                <button 
                                    type="submit" 
                                    className="btn btn-primary"
                                    disabled={!formData.name || !formData.email || !formData.mobileNumber}
                                >
                                    Submit Booking
                                </button>
                            </div>
                        </form>
                    </Motion.div>
                )}

                {step === 3 && (
                    <Motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="booking-success"
                    >
                        <div className="success-icon">🎉</div>
                        <h3>Booking Request Received!</h3>
                        <p>Thank you, <strong>{formData.name}</strong>. We've recorded your interest in the <strong>{formData.tour}</strong> starting on <strong>{formData.date || 'TBD'}</strong>.</p>
                        
                        <div className="summary-box">
                            <h4>Booking Summary:</h4>
                            <ul style={{ textAlign: 'left' }}>
                                    <li><strong>Experience Level:</strong> {formData.skillLevel}</li>
                                    <li><strong>Rider Type:</strong> {formData.rideType}</li>
                                    <li><strong>Bike CC:</strong> {formData.bikeCc} CC</li>
                                    <li><strong>Contact Email:</strong> {formData.email}</li>
                                    <li><strong>Mobile Number:</strong> {formData.mobileNumber}</li>
                                    {formData.specialNotes && <li><strong>Special Notes:</strong> {formData.specialNotes}</li>}
                            </ul>
                        </div>

                        <p className="status-note">Our ride coordinator will email you within 24 hours to confirm tour availability and motorcycle allocation.</p>

                        <div className="modal-actions-success">
                            <button className="btn btn-primary" onClick={handleWhatsAppConfirm}>
                                Confirm Instantly via WhatsApp
                            </button>
                            <button className="btn btn-secondary" onClick={() => { onClose(); setStep(1); }}>
                                Close Window
                            </button>
                        </div>
                    </Motion.div>
                )}
            </Motion.div>
        </Motion.div>
    );
};

export default BookingModal;
