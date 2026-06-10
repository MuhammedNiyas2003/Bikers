import { useState, useEffect } from 'react';
import { motion as Motion } from 'framer-motion';
import './AdminDashboard.css';
import mountainImg from '../../assets/images/mountain_tour_1776185326597.png';
import coastalImg from '../../assets/images/coastal_tour_1776185344542.png';
import heroImg from '../../assets/images/hero_biker_1776185308389.png';

const presets = [
    { key: 'mountain', label: 'Mountain Pass', img: mountainImg },
    { key: 'coastal', label: 'Coastal Highway', img: coastalImg },
    { key: 'hero', label: 'Twilight Explorer', img: heroImg }
];

const AdminDashboard = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('bookings');
    const [bookings, setBookings] = useState([]);
    const [tours, setTours] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [loadingTours, setLoadingTours] = useState(false);
    const [imageType, setImageType] = useState('preset'); // 'preset' or 'custom'

    // Form state for creating/editing rides
    const [formData, setFormData] = useState({
        title: '',
        image: 'mountain',
        duration: '',
        desc: '',
        price: ''
    });
    const [editingId, setEditingId] = useState(null);

    const fetchBookings = () => {
        setLoadingBookings(true);
        fetch('/api/bookings')
            .then(res => res.json())
            .then(data => {
                setBookings(data);
                setLoadingBookings(false);
            })
            .catch(err => {
                console.error("Error fetching bookings:", err);
                setLoadingBookings(false);
            });
    };

    const fetchTours = () => {
        setLoadingTours(true);
        fetch('/api/rides')
            .then(res => res.json())
            .then(data => {
                setTours(data);
                setLoadingTours(false);
            })
            .catch(err => {
                console.error("Error fetching rides:", err);
                setLoadingTours(false);
            });
    };

    useEffect(() => {
        if (isOpen) {
            fetchBookings();
            fetchTours();
        }
    }, [isOpen]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                let width = img.width;
                let height = img.height;

                if (width > MAX_WIDTH) {
                    height = Math.round((height * MAX_WIDTH) / width);
                    width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
                setFormData(prev => ({ ...prev, image: compressedDataUrl }));
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const url = editingId ? `/api/rides/${editingId}` : '/api/rides';
        const method = editingId ? 'PUT' : 'POST';

        fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(res => {
            if (!res.ok) throw new Error("Failed to save ride");
            return res.json();
        })
        .then(() => {
            fetchTours();
            // Trigger home page update
            window.dispatchEvent(new Event('ridesUpdated'));
            // Reset form
            setFormData({
                title: '',
                image: 'mountain',
                duration: '',
                desc: '',
                price: ''
            });
            setEditingId(null);
            setImageType('preset');
        })
        .catch(err => {
            console.error("Error saving ride:", err);
            alert("Failed to save ride: " + err.message);
        });
    };

    const handleEditClick = (tour) => {
        setEditingId(tour.id);
        const isPreset = ['mountain', 'coastal', 'hero'].includes(tour.image);
        const isBase64 = tour.image && tour.image.startsWith('data:image');
        if (isPreset) {
            setImageType('preset');
        } else if (isBase64) {
            setImageType('upload');
        } else {
            setImageType('custom');
        }
        setFormData({
            title: tour.title,
            image: tour.image,
            duration: tour.duration,
            desc: tour.desc,
            price: tour.price
        });
    };

    const handleDeleteClick = (id) => {
        if (!confirm("Are you sure you want to delete this ride?")) return;

        fetch(`/api/rides/${id}`, {
            method: 'DELETE'
        })
        .then(res => {
            if (!res.ok) throw new Error("Failed to delete ride");
            return res.json();
        })
        .then(() => {
            fetchTours();
            // Trigger home page update
            window.dispatchEvent(new Event('ridesUpdated'));
            if (editingId === id) {
                setEditingId(null);
                setFormData({
                    title: '',
                    image: 'mountain',
                    duration: '',
                    desc: '',
                    price: ''
                });
            }
        })
        .catch(err => {
            console.error("Error deleting ride:", err);
            alert("Failed to delete ride: " + err.message);
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setImageType('preset');
        setFormData({
            title: '',
            image: 'mountain',
            duration: '',
            desc: '',
            price: ''
        });
    };

    if (!isOpen) return null;

    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    };

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.9, y: 30 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', duration: 0.5 } }
    };

    return (
        <Motion.div 
            className="admin-modal-backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
        >
            <Motion.div 
                className="admin-modal-content"
                variants={modalVariants}
                onClick={(e) => e.stopPropagation()}
            >
                <button className="admin-close-btn" onClick={onClose} aria-label="Close Admin Dashboard">&times;</button>
                
                <div className="admin-header">
                    <h2>MotoEscape <span>Admin Dashboard</span></h2>
                    <div className="admin-tabs">
                        <button 
                            className={`admin-tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
                            onClick={() => setActiveTab('bookings')}
                        >
                            Bookings ({bookings.length})
                        </button>
                        <button 
                            className={`admin-tab-btn ${activeTab === 'rides' ? 'active' : ''}`}
                            onClick={() => setActiveTab('rides')}
                        >
                            Manage Rides ({tours.length})
                        </button>
                    </div>
                </div>

                <div className="admin-body">
                    {activeTab === 'bookings' && (
                        <div>
                            {loadingBookings ? (
                                <div className="admin-empty">Loading bookings...</div>
                            ) : bookings.length === 0 ? (
                                <div className="admin-empty">No bookings have been made yet.</div>
                            ) : (
                                <div className="admin-table-container">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Date Submitted</th>
                                                <th>Rider</th>
                                                <th>Contact Info</th>
                                                <th>Selected Ride</th>
                                                <th>Start Date</th>
                                                <th>Exp Level</th>
                                                <th>Bike Preference</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bookings.map(booking => (
                                                <tr key={booking.id}>
                                                    <td>{new Date(booking.createdAt).toLocaleString()}</td>
                                                    <td style={{ fontWeight: '600', color: 'white' }}>{booking.name}</td>
                                                    <td>{booking.email}</td>
                                                    <td style={{ color: 'var(--accent-color)', fontWeight: '600' }}>{booking.tour}</td>
                                                    <td>{booking.date}</td>
                                                    <td>
                                                        <span className={`admin-badge admin-badge-${booking.skillLevel ? booking.skillLevel.toLowerCase() : 'intermediate'}`}>
                                                            {booking.skillLevel}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="admin-badge admin-badge-bike">
                                                            {booking.bikePreference}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'rides' && (
                        <div className="admin-rides-layout">
                            {/* Left Column: Form */}
                            <div className="admin-form-card">
                                <h3>{editingId ? 'Edit Biking Tour' : 'Add New Biking Tour'}</h3>
                                <form onSubmit={handleFormSubmit}>
                                    <div className="admin-input-group">
                                        <label htmlFor="admin-tour-title">Tour Name</label>
                                        <input 
                                            id="admin-tour-title"
                                            type="text" 
                                            name="title" 
                                            placeholder="e.g. Desert Oasis Ride" 
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="admin-input-group">
                                        <label htmlFor="admin-tour-duration">Duration</label>
                                        <input 
                                            id="admin-tour-duration"
                                            type="text" 
                                            name="duration" 
                                            placeholder="e.g. 5 Days" 
                                            value={formData.duration}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="admin-input-group">
                                        <label htmlFor="admin-tour-price">Price</label>
                                        <input 
                                            id="admin-tour-price"
                                            type="text" 
                                            name="price" 
                                            placeholder="e.g. ₹99,000" 
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="admin-input-group">
                                        <label>Ride Image</label>
                                        <div className="image-selector-tabs">
                                            <button 
                                                type="button"
                                                className={`image-type-btn ${imageType === 'preset' ? 'active' : ''}`}
                                                onClick={() => {
                                                    setImageType('preset');
                                                    setFormData(prev => ({ ...prev, image: 'mountain' }));
                                                }}
                                            >
                                                Presets
                                            </button>
                                            <button 
                                                type="button"
                                                className={`image-type-btn ${imageType === 'custom' ? 'active' : ''}`}
                                                onClick={() => {
                                                    setImageType('custom');
                                                    setFormData(prev => ({ ...prev, image: '' }));
                                                }}
                                            >
                                                Web URL
                                            </button>
                                            <button 
                                                type="button"
                                                className={`image-type-btn ${imageType === 'upload' ? 'active' : ''}`}
                                                onClick={() => {
                                                    setImageType('upload');
                                                    setFormData(prev => ({ ...prev, image: '' }));
                                                }}
                                            >
                                                Upload
                                            </button>
                                        </div>

                                        {imageType === 'preset' ? (
                                            <div className="preset-thumbnails">
                                                {presets.map(p => (
                                                    <div 
                                                        key={p.key}
                                                        className={`preset-thumb-card ${formData.image === p.key ? 'selected' : ''}`}
                                                        onClick={() => setFormData(prev => ({ ...prev, image: p.key }))}
                                                        title={p.label}
                                                    >
                                                        <img src={p.img} alt={p.label} />
                                                        {formData.image === p.key && <div className="preset-check">✓</div>}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : imageType === 'custom' ? (
                                            <input 
                                                type="url" 
                                                name="image" 
                                                placeholder="Paste custom image URL (e.g. https://...)" 
                                                value={formData.image && !['mountain', 'coastal', 'hero'].includes(formData.image) && !formData.image.startsWith('data:image') ? formData.image : ''}
                                                onChange={handleInputChange}
                                                required={imageType === 'custom'}
                                            />
                                        ) : (
                                            <div className="upload-container">
                                                <label className="custom-file-upload">
                                                    <input 
                                                        type="file" 
                                                        accept="image/*" 
                                                        onChange={handleFileChange}
                                                    />
                                                    {formData.image && formData.image.startsWith('data:image') ? '✓ Image Loaded (Click to Change)' : 'Choose Image File'}
                                                </label>
                                            </div>
                                        )}

                                        <div className="image-preview-container">
                                            {formData.image ? (
                                                <img 
                                                    src={
                                                        formData.image === 'mountain' ? mountainImg :
                                                        formData.image === 'coastal' ? coastalImg :
                                                        formData.image === 'hero' ? heroImg :
                                                        formData.image
                                                    } 
                                                    alt="Ride Preview" 
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                <div className="image-preview-placeholder">
                                                    Image Preview will appear here
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="admin-input-group">
                                        <label htmlFor="admin-tour-desc">Description</label>
                                        <textarea 
                                            id="admin-tour-desc"
                                            name="desc" 
                                            placeholder="Describe the roads, sights, experience and pace..." 
                                            value={formData.desc}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="admin-form-actions">
                                        {editingId && (
                                            <button 
                                                type="button" 
                                                className="btn btn-secondary btn-sm"
                                                onClick={handleCancelEdit}
                                            >
                                                Cancel
                                            </button>
                                        )}
                                        <button 
                                            type="submit" 
                                            className="btn btn-primary btn-sm"
                                        >
                                            {editingId ? 'Save Changes' : 'Publish Ride'}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Right Column: List */}
                            <div>
                                <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem' }}>Active Rides</h3>
                                {loadingTours ? (
                                    <div className="admin-empty">Loading active rides...</div>
                                ) : tours.length === 0 ? (
                                    <div className="admin-empty">No active rides. Use the form to create one!</div>
                                ) : (
                                    <div className="admin-rides-list">
                                        {tours.map(tour => (
                                            <div className="admin-ride-item" key={tour.id}>
                                                <div className="admin-ride-thumb">
                                                    <img 
                                                        src={
                                                            tour.image === 'mountain' ? mountainImg :
                                                            tour.image === 'coastal' ? coastalImg :
                                                            tour.image === 'hero' ? heroImg :
                                                            tour.image.startsWith('http') ? tour.image : mountainImg
                                                        } 
                                                        alt={tour.title} 
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=200&auto=format&fit=crop';
                                                        }}
                                                    />
                                                </div>
                                                <div className="admin-ride-info">
                                                    <h4>{tour.title}</h4>
                                                    <div className="admin-ride-meta">
                                                        <span><strong>Duration:</strong> {tour.duration}</span>
                                                        <span><strong>Price:</strong> {tour.price}</span>
                                                    </div>
                                                </div>
                                                <div className="admin-ride-actions">
                                                    <button 
                                                        className="admin-btn-action admin-btn-edit"
                                                        onClick={() => handleEditClick(tour)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        className="admin-btn-action admin-btn-delete"
                                                        onClick={() => handleDeleteClick(tour.id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </Motion.div>
        </Motion.div>
    );
};

export default AdminDashboard;
