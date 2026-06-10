import { useState } from 'react';
import { motion as Motion } from 'framer-motion';

const BookingModal = ({ onClose, defaultTour = "" }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        tour: defaultTour || 'Mountain Pass Expedition',
        date: '',
        name: '',
        email: '',
        skillLevel: 'Intermediate',
        bikePreference: 'Adventure'
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate API call
        nextStep();
    };

    const handleWhatsAppConfirm = () => {
        const message = `Hi RideQuest! I just submitted a booking request:\n\n` +
            `• Tour: ${formData.tour}\n` +
            `• Date: ${formData.date}\n` +
            `• Rider: ${formData.name}\n` +
            `• Skill Level: ${formData.skillLevel}\n` +
            `• Bike: ${formData.bikePreference}\n\n` +
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

                {step === 1 && (
                    <Motion.div 
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -50, opacity: 0 }}
                    >
                        <h3>Step 1: Choose Tour & Date</h3>
                        <div className="form-group">
                            <label htmlFor="tour-select">Select Adventure Route</label>
                            <select 
                                id="tour-select"
                                name="tour" 
                                value={formData.tour} 
                                onChange={handleInputChange}
                            >
                                <option value="Mountain Pass Expedition">Mountain Pass Expedition (7 Days)</option>
                                <option value="Coastal Highway Cruise">Coastal Highway Cruise (4 Days)</option>
                                <option value="Twilight Explorer">Twilight Explorer (5 Days)</option>
                                <option value="Custom Group Ride">Custom Group Ride / Private Tour</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="date-input">Preferred Start Date</label>
                            <input 
                                id="date-input"
                                type="date" 
                                name="date" 
                                value={formData.date} 
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                            <button 
                                className="btn btn-primary" 
                                onClick={nextStep}
                                disabled={!formData.date}
                            >
                                Next Details &rarr;
                            </button>
                        </div>
                    </Motion.div>
                )}

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
                            <div className="form-row">
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
                                <div className="form-group">
                                    <label htmlFor="bike-select">Motorcycle Preference</label>
                                    <select 
                                        id="bike-select"
                                        name="bikePreference" 
                                        value={formData.bikePreference} 
                                        onChange={handleInputChange}
                                    >
                                        <option value="Adventure">Adventure Tourer (BMW GS Style)</option>
                                        <option value="Cruiser">Cruiser (Harley-Davidson Style)</option>
                                        <option value="Sport-Touring">Sport Touring (Kawasaki/Honda Style)</option>
                                        <option value="Bring Own Bike">I will bring my own motorcycle</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={prevStep}>Back</button>
                                <button 
                                    type="submit" 
                                    className="btn btn-primary"
                                    disabled={!formData.name || !formData.email}
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
                        <p>Thank you, <strong>{formData.name}</strong>. We've recorded your interest in the <strong>{formData.tour}</strong> starting on <strong>{formData.date}</strong>.</p>
                        
                        <div className="summary-box">
                            <h4>Booking Summary:</h4>
                            <ul>
                                    <li><strong>Experience Level:</strong> {formData.skillLevel}</li>
                                    <li><strong>Selected Motorcycle:</strong> {formData.bikePreference}</li>
                                    <li><strong>Contact Email:</strong> {formData.email}</li>
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
