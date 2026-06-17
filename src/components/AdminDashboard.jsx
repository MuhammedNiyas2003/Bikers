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

const AdminDashboard = () => {
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
        price: '',
        rideDate: '',
        location: ''
    });
    const [editingId, setEditingId] = useState(null);

    // Login and Authentication states
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loginData, setLoginData] = useState({ username: '', password: '' });
    const [loginError, setLoginError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    // Search & Filter & Sorting state for bookings
    const [searchTerm, setSearchTerm] = useState('');
    const [tourFilter, setTourFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest'

    // Custom dialog configuration
    const [dialogConfig, setDialogConfig] = useState({
        isOpen: false,
        type: 'alert', // 'alert' or 'confirm'
        variant: 'error', // 'error', 'success', 'confirm'
        title: '',
        message: '',
        onConfirm: null,
        onCancel: null
    });

    // Form modal overlay open state
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Double-submit prevention / loading states
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    // Inline field validation errors state
    const [validationErrors, setValidationErrors] = useState({});

    // Dialog trigger helpers
    const showCustomAlert = (title, message, variant = 'error') => {
        setDialogConfig({
            isOpen: true,
            type: 'alert',
            variant,
            title,
            message,
            onConfirm: () => setDialogConfig(prev => ({ ...prev, isOpen: false }))
        });
    };

    const showCustomConfirm = (title, message, onConfirm) => {
        setDialogConfig({
            isOpen: true,
            type: 'confirm',
            variant: 'confirm',
            title,
            message,
            onConfirm: () => {
                setDialogConfig(prev => ({ ...prev, isOpen: false }));
                onConfirm();
            },
            onCancel: () => setDialogConfig(prev => ({ ...prev, isOpen: false }))
        });
    };

    // Client-side form validation check
    const validateForm = () => {
        const errors = {};
        const titleTrimmed = formData.title ? formData.title.trim() : '';
        const durationTrimmed = formData.duration ? formData.duration.trim() : '';
        const priceTrimmed = formData.price ? formData.price.trim() : '';
        const descTrimmed = formData.desc ? formData.desc.trim() : '';
        const rideDateTrimmed = formData.rideDate ? formData.rideDate.trim() : '';
        const locationTrimmed = formData.location ? formData.location.trim() : '';

        if (!titleTrimmed) {
            errors.title = "Tour Name is required.";
        } else if (titleTrimmed.length < 3) {
            errors.title = "Tour Name must be at least 3 characters long.";
        }

        if (!durationTrimmed) {
            errors.duration = "Duration is required.";
        } else if (durationTrimmed.length < 2) {
            errors.duration = "Please enter a valid duration (e.g., '5 Days').";
        }

        if (!priceTrimmed) {
            errors.price = "Price is required.";
        } else if (!/\d/.test(priceTrimmed)) {
            errors.price = "Price must contain numbers (e.g. ₹99,000 or 99000).";
        }

        if (!descTrimmed) {
            errors.desc = "Description is required.";
        } else if (descTrimmed.length < 10) {
            errors.desc = "Description must be at least 10 characters long.";
        }

        if (!formData.image) {
            errors.image = "An image selection is required.";
        }

        if (!rideDateTrimmed) {
            errors.rideDate = "Fixed Ride Date is required.";
        }

        if (!locationTrimmed) {
            errors.location = "Location is required.";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const calculateTotalToursValue = () => {
        return tours.reduce((acc, tour) => {
            if (!tour.price) return acc;
            const numeric = parseInt(tour.price.replace(/[^\d]/g, ''), 10);
            return acc + (isNaN(numeric) ? 0 : numeric);
        }, 0);
    };

    const formatPrice = (val) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
    };

    const filteredBookings = bookings
        .filter(booking => {
            const matchesSearch = 
                (booking.name && booking.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (booking.email && booking.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (booking.tour && booking.tour.toLowerCase().includes(searchTerm.toLowerCase()));
            
            const matchesTour = tourFilter === 'all' || booking.tour === tourFilter;
            
            return matchesSearch && matchesTour;
        })
        .sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
        });

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
        const auth = sessionStorage.getItem('isAdminAuth') === 'true';
        setIsAuthenticated(auth);
        
        if (auth) {
            fetchBookings();
            fetchTours();
        }
    }, []);

    const handleClose = () => {
        const rootPath = window.location.pathname.startsWith('/Bikers') ? '/Bikers/' : '/';
        window.location.href = rootPath;
    };

    const handleLoginSubmit = (e) => {
        e.preventDefault();
        setLoginError('');
        setIsLoggingIn(true);
        
        fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        })
        .then(res => {
            if (!res.ok) throw new Error("Invalid username or password");
            return res.json();
        })
        .then(() => {
            setIsAuthenticated(true);
            sessionStorage.setItem('isAdminAuth', 'true');
            fetchBookings();
            fetchTours();
            setIsLoggingIn(false);
        })
        .catch(err => {
            setLoginError(err.message);
            setIsLoggingIn(false);
        });
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        sessionStorage.removeItem('isAdminAuth');
        setLoginData({ username: '', password: '' });
        setLoginError('');
    };

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
        // Clean error inline
        if (validationErrors[name]) {
            setValidationErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();

        // Validate form fields first
        if (!validateForm()) return;

        // Double submit prevention
        if (isSubmitting) return;
        setIsSubmitting(true);

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
            if (!res.ok) throw new Error("Failed to save ride. Verify the ride name is unique.");
            return res.json();
        })
        .then(() => {
            fetchTours();
            // Trigger home page update
            window.dispatchEvent(new Event('ridesUpdated'));
            
            showCustomAlert(
                editingId ? "Tour Updated" : "Tour Published",
                `Biking tour "${formData.title}" was saved successfully.`,
                'success'
            );

            // Reset form
            setFormData({
                title: '',
                image: 'mountain',
                duration: '',
                desc: '',
                price: '',
                rideDate: '',
                location: ''
            });
            setEditingId(null);
            setImageType('preset');
            setValidationErrors({});
            setIsFormOpen(false);
            setIsSubmitting(false);
        })
        .catch(err => {
            console.error("Error saving ride:", err);
            setIsSubmitting(false);
            showCustomAlert("Failed to Save Tour", err.message, 'error');
        });
    };

    const handleAddNewClick = () => {
        setEditingId(null);
        setImageType('preset');
        setFormData({
            title: '',
            image: 'mountain',
            duration: '',
            desc: '',
            price: '',
            rideDate: '',
            location: ''
        });
        setValidationErrors({});
        setIsFormOpen(true);
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
            price: tour.price,
            rideDate: tour.rideDate || '',
            location: tour.location || ''
        });
        setValidationErrors({});
        setIsFormOpen(true);
    };

    const handleDeleteClick = (id) => {
        if (deletingId) return;

        showCustomConfirm(
            "Delete Tour?",
            "Are you sure you want to delete this ride? This action cannot be undone.",
            () => {
                setDeletingId(id);
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
                    
                    showCustomAlert("Tour Deleted", "The tour has been successfully removed.", 'success');
                    
                    if (editingId === id) {
                        setEditingId(null);
                        setFormData({
                            title: '',
                            image: 'mountain',
                            duration: '',
                            desc: '',
                            price: ''
                        });
                        setValidationErrors({});
                        setIsFormOpen(false);
                    }
                    setDeletingId(null);
                })
                .catch(err => {
                    console.error("Error deleting ride:", err);
                    setDeletingId(null);
                    showCustomAlert("Delete Failed", err.message, 'error');
                });
            }
        );
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setImageType('preset');
        setFormData({
            title: '',
            image: 'mountain',
            duration: '',
            desc: '',
            price: '',
            rideDate: '',
            location: ''
        });
        setValidationErrors({});
        setIsFormOpen(false);
    };

    // Sub-render: Custom Dialog Modal Overlay (Success, Error, Confirmation)
    const renderCustomModalDialog = () => {
        if (!dialogConfig.isOpen) return null;

        const getIcon = () => {
            switch(dialogConfig.variant) {
                case 'success': return '✅';
                case 'confirm': return '❓';
                case 'error':
                default: return '⚠️';
            }
        };

        return (
            <div className="custom-dialog-backdrop" onClick={(e) => e.stopPropagation()}>
                <Motion.div 
                    className={`custom-dialog-content dialog-${dialogConfig.variant}`}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: 'spring', duration: 0.4 }}
                >
                    <div className="custom-dialog-icon">{getIcon()}</div>
                    <div className="custom-dialog-title">{dialogConfig.title}</div>
                    <div className="custom-dialog-message">{dialogConfig.message}</div>
                    <div className="custom-dialog-actions">
                        {dialogConfig.type === 'confirm' && (
                            <button 
                                className="custom-dialog-btn custom-dialog-btn-secondary"
                                onClick={dialogConfig.onCancel}
                            >
                                Cancel
                            </button>
                        )}
                        <button 
                            className="custom-dialog-btn custom-dialog-btn-primary"
                            onClick={dialogConfig.onConfirm}
                        >
                            {dialogConfig.type === 'confirm' ? 'Delete' : 'OK'}
                        </button>
                    </div>
                </Motion.div>
            </div>
        );
    };

    // Sub-render: Create/Edit Tour Form Modal Overlay
    const renderFormModal = () => {
        if (!isFormOpen) return null;

        return (
            <div className="admin-form-modal-backdrop" onClick={(e) => e.stopPropagation()}>
                <Motion.div 
                    className="admin-form-modal-content"
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: 'spring', duration: 0.4 }}
                >
                    <button 
                        className="admin-close-btn" 
                        onClick={handleCancelEdit} 
                        aria-label="Close Form"
                        disabled={isSubmitting}
                    >
                        &times;
                    </button>
                    
                    <h3>
                        {editingId ? 'Edit ' : 'Create '}
                        <span>Biking Tour</span>
                    </h3>

                    {Object.keys(validationErrors).length > 0 && (
                        <div className="form-validation-errors-container">
                            <div className="form-validation-errors-header">
                                <span>⚠️ Please correct the following errors:</span>
                            </div>
                            <ul className="form-validation-errors-list">
                                {Object.values(validationErrors).map((err, idx) => (
                                    <li key={idx}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <form onSubmit={handleFormSubmit}>
                        <div className={`admin-input-group ${validationErrors.title ? 'has-error' : ''}`}>
                            <label htmlFor="admin-tour-title">Tour Name</label>
                            <input 
                                id="admin-tour-title"
                                type="text" 
                                name="title" 
                                placeholder="e.g. Desert Oasis Ride" 
                                value={formData.title}
                                onChange={handleInputChange}
                                disabled={isSubmitting}
                            />
                            {validationErrors.title && <div className="field-error-text">{validationErrors.title}</div>}
                        </div>

                        <div className={`admin-input-group ${validationErrors.duration ? 'has-error' : ''}`}>
                            <label htmlFor="admin-tour-duration">Duration</label>
                            <input 
                                id="admin-tour-duration"
                                type="text" 
                                name="duration" 
                                placeholder="e.g. 5 Days" 
                                value={formData.duration}
                                onChange={handleInputChange}
                                disabled={isSubmitting}
                            />
                            {validationErrors.duration && <div className="field-error-text">{validationErrors.duration}</div>}
                        </div>

                        <div className={`admin-input-group ${validationErrors.price ? 'has-error' : ''}`}>
                            <label htmlFor="admin-tour-price">Price</label>
                            <input 
                                id="admin-tour-price"
                                type="text" 
                                name="price" 
                                placeholder="e.g. ₹99,000" 
                                value={formData.price}
                                onChange={handleInputChange}
                                disabled={isSubmitting}
                            />
                            {validationErrors.price && <div className="field-error-text">{validationErrors.price}</div>}
                        </div>

                        <div className={`admin-input-group ${validationErrors.rideDate ? 'has-error' : ''}`}>
                            <label htmlFor="admin-tour-rideDate">Fixed Ride Date</label>
                            <input 
                                id="admin-tour-rideDate"
                                type="text" 
                                name="rideDate" 
                                placeholder="e.g. June 25, 2026" 
                                value={formData.rideDate}
                                onChange={handleInputChange}
                                disabled={isSubmitting}
                            />
                            {validationErrors.rideDate && <div className="field-error-text">{validationErrors.rideDate}</div>}
                        </div>

                        <div className={`admin-input-group ${validationErrors.location ? 'has-error' : ''}`}>
                            <label htmlFor="admin-tour-location">Location</label>
                            <input 
                                id="admin-tour-location"
                                type="text" 
                                name="location" 
                                placeholder="e.g. Manali to Leh" 
                                value={formData.location}
                                onChange={handleInputChange}
                                disabled={isSubmitting}
                            />
                            {validationErrors.location && <div className="field-error-text">{validationErrors.location}</div>}
                        </div>

                        <div className={`admin-input-group ${validationErrors.image ? 'has-error' : ''}`}>
                            <label>Ride Image</label>
                            <div className="image-selector-tabs">
                                <button 
                                    type="button"
                                    className={`image-type-btn ${imageType === 'preset' ? 'active' : ''}`}
                                    onClick={() => {
                                        setImageType('preset');
                                        setFormData(prev => ({ ...prev, image: 'mountain' }));
                                    }}
                                    disabled={isSubmitting}
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
                                    disabled={isSubmitting}
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
                                    disabled={isSubmitting}
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
                                            onClick={() => !isSubmitting && setFormData(prev => ({ ...prev, image: p.key }))}
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
                                    disabled={isSubmitting}
                                />
                            ) : (
                                <div className="upload-container">
                                    <label className="custom-file-upload">
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            onChange={handleFileChange}
                                            disabled={isSubmitting}
                                        />
                                        {formData.image && formData.image.startsWith('data:image') ? '✓ Image Loaded (Click to Change)' : 'Choose Image File'}
                                    </label>
                                </div>
                            )}

                            {validationErrors.image && <div className="field-error-text">{validationErrors.image}</div>}

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

                        <div className={`admin-input-group ${validationErrors.desc ? 'has-error' : ''}`}>
                            <label htmlFor="admin-tour-desc">Description</label>
                            <textarea 
                                id="admin-tour-desc"
                                name="desc" 
                                placeholder="Describe the roads, sights, experience and pace..." 
                                value={formData.desc}
                                onChange={handleInputChange}
                                disabled={isSubmitting}
                            />
                            {validationErrors.desc && <div className="field-error-text">{validationErrors.desc}</div>}
                        </div>

                        <div className="admin-form-actions">
                            <button 
                                type="button" 
                                className="btn btn-secondary btn-sm"
                                onClick={handleCancelEdit}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="btn btn-primary btn-sm"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="spinner"></span>
                                        Saving...
                                    </>
                                ) : editingId ? (
                                    'Save Changes'
                                ) : (
                                    'Publish Ride'
                                )}
                            </button>
                        </div>
                    </form>
                </Motion.div>
            </div>
        );
    };

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
        >
            <Motion.div 
                className="admin-modal-content"
                style={!isAuthenticated ? { maxWidth: '450px', height: 'auto', padding: '3rem' } : {}}
                variants={modalVariants}
                onClick={(e) => e.stopPropagation()}
            >
                <button className="admin-close-btn" onClick={handleClose} aria-label="Close Admin Dashboard">&times;</button>
                
                {!isAuthenticated ? (
                    <div className="admin-login-container" style={{ width: '100%' }}>
                        <div className="admin-login-header" style={{ marginBottom: '2rem', textAlign: 'center' }}>
                            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
                                MotoEscape <span>Admin Login</span>
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                Enter credentials to access dashboard configuration.
                            </p>
                        </div>
                        {loginError && (
                            <div className="admin-login-error" style={{ background: 'rgba(255, 68, 68, 0.1)', border: '1px solid rgba(255, 68, 68, 0.3)', color: '#ff4444', borderRadius: '8px', padding: '0.8rem', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
                                {loginError}
                            </div>
                        )}
                        <form onSubmit={handleLoginSubmit} className="admin-login-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <div className="admin-input-group">
                                <label htmlFor="login-username">Username</label>
                                <input 
                                    id="login-username"
                                    type="text" 
                                    placeholder="Enter username" 
                                    value={loginData.username}
                                    onChange={(e) => setLoginData(prev => ({ ...prev, username: e.target.value }))}
                                    required 
                                />
                            </div>
                            <div className="admin-input-group">
                                <label htmlFor="login-password">Password</label>
                                <input 
                                    id="login-password"
                                    type="password" 
                                    placeholder="Enter password" 
                                    value={loginData.password}
                                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                                    required 
                                />
                            </div>
                            <button type="submit" className="btn btn-primary login-btn" style={{ width: '100%', marginTop: '0.5rem', padding: '0.8rem' }} disabled={isLoggingIn}>
                                {isLoggingIn ? 'Logging in...' : 'Access Dashboard'}
                            </button>
                        </form>
                    </div>
                ) : (
                    <>
                        <div className="admin-header">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <h2 style={{ marginBottom: 0 }}>MotoEscape <span>Admin Dashboard</span></h2>
                                <button className="admin-btn-action admin-btn-delete" style={{ padding: '0.5rem 1rem' }} onClick={handleLogout}>Log Out</button>
                            </div>
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
                            {/* Overview Statistics Cards */}
                            <div className="admin-stats-container">
                                <div className="admin-stat-card">
                                    <div className="admin-stat-icon">📊</div>
                                    <div className="admin-stat-info">
                                        <h4>Total Bookings</h4>
                                        <p className="admin-stat-value">{bookings.length}</p>
                                    </div>
                                </div>
                                <div className="admin-stat-card">
                                    <div className="admin-stat-icon">🏍️</div>
                                    <div className="admin-stat-info">
                                        <h4>Active Tours</h4>
                                        <p className="admin-stat-value">{tours.length}</p>
                                    </div>
                                </div>
                                <div className="admin-stat-card">
                                    <div className="admin-stat-icon">💰</div>
                                    <div className="admin-stat-info">
                                        <h4>Tours Total Value</h4>
                                        <p className="admin-stat-value">{formatPrice(calculateTotalToursValue())}</p>
                                    </div>
                                </div>
                                <div className="admin-stat-card">
                                    <div className="admin-stat-icon">📈</div>
                                    <div className="admin-stat-info">
                                        <h4>Rider Exp Levels</h4>
                                        <div className="admin-stat-breakdown">
                                            <span title="Beginner" className="stat-bd-item badge-beg">Beg: {bookings.filter(b => b.skillLevel?.toLowerCase() === 'beginner').length}</span>
                                            <span title="Intermediate" className="stat-bd-item badge-int">Int: {bookings.filter(b => b.skillLevel?.toLowerCase() === 'intermediate').length}</span>
                                            <span title="Expert" className="stat-bd-item badge-exp">Exp: {bookings.filter(b => b.skillLevel?.toLowerCase() === 'expert').length}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="admin-stat-card">
                                    <div className="admin-stat-icon">👥</div>
                                    <div className="admin-stat-info">
                                        <h4>Rider Options</h4>
                                        <div className="admin-stat-breakdown">
                                            <span title="Single" className="stat-bd-item badge-beg">Solo: {bookings.filter(b => b.rideType?.toLowerCase() === 'single' || !b.rideType).length}</span>
                                            <span title="Pillion" className="stat-bd-item badge-exp">Pillion: {bookings.filter(b => b.rideType?.toLowerCase() === 'pillion').length}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                    {activeTab === 'bookings' && (
                        <div>
                            {/* Search & Filter Controls */}
                            <div className="admin-controls-bar">
                                <div className="admin-search-wrapper">
                                    <span className="admin-search-icon">🔍</span>
                                    <input 
                                        type="text" 
                                        placeholder="Search rider name, email, or tour..." 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="admin-search-input"
                                    />
                                    {searchTerm && (
                                        <button type="button" className="admin-search-clear" onClick={() => setSearchTerm('')}>&times;</button>
                                    )}
                                </div>
                                <div className="admin-filters-group">
                                    <div className="admin-filter-control">
                                        <label htmlFor="tour-filter">Tour:</label>
                                        <select 
                                            id="tour-filter"
                                            value={tourFilter}
                                            onChange={(e) => setTourFilter(e.target.value)}
                                        >
                                            <option value="all">All Rides</option>
                                            {tours.map(t => (
                                                <option key={t.id} value={t.title}>{t.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="admin-filter-control">
                                        <label htmlFor="sort-by">Sort:</label>
                                        <select 
                                            id="sort-by"
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                        >
                                            <option value="newest">Newest First</option>
                                            <option value="oldest">Oldest First</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {loadingBookings ? (
                                <div className="admin-empty">Loading bookings...</div>
                            ) : filteredBookings.length === 0 ? (
                                <div className="admin-empty">
                                    {bookings.length === 0 ? "No bookings have been made yet." : "No bookings match the search or filter criteria."}
                                </div>
                            ) : (
                                <div className="admin-table-container">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Date Submitted</th>
                                                <th>Rider</th>
                                                <th>Contact Info</th>
                                                <th>Selected Ride</th>
                                                <th>Rider Details</th>
                                                <th>Special Notes</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredBookings.map(booking => (
                                                <tr key={booking.id}>
                                                    <td>{new Date(booking.createdAt).toLocaleString()}</td>
                                                    <td style={{ fontWeight: '600', color: 'white' }}>{booking.name}</td>
                                                    <td>
                                                        <div>{booking.email}</div>
                                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>📞 {booking.mobileNumber || 'N/A'}</div>
                                                    </td>
                                                    <td style={{ color: 'var(--accent-color)', fontWeight: '600' }}>
                                                        <div>{booking.tour}</div>
                                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>📅 {booking.date || 'TBD'}</div>
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                                            <span className={`admin-badge ${booking.rideType?.toLowerCase() === 'pillion' ? 'admin-badge-expert' : 'admin-badge-beginner'}`} style={{ textAlign: 'center' }}>
                                                                {booking.rideType || 'Single'}
                                                            </span>
                                                            <span className="admin-badge admin-badge-bike" style={{ borderColor: 'rgba(255, 69, 0, 0.4)', color: 'var(--accent-color)', textAlign: 'center' }}>
                                                                {booking.bikeCc || '300-500'} CC
                                                            </span>
                                                            <span className={`admin-badge admin-badge-${booking.skillLevel ? booking.skillLevel.toLowerCase() : 'intermediate'}`} style={{ textAlign: 'center' }}>
                                                                {booking.skillLevel}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td style={{ fontSize: '0.85rem', maxWidth: '200px', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                                                        {booking.specialNotes || <em style={{ color: '#555' }}>None</em>}
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
                        <div>
                            <div className="admin-rides-header-bar">
                                <h3>Active Rides ({tours.length})</h3>
                                <button 
                                    className="btn btn-primary btn-sm"
                                    onClick={handleAddNewClick}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    🏍️ + Create New Tour
                                </button>
                            </div>

                            {loadingTours ? (
                                <div className="admin-empty">Loading active rides...</div>
                            ) : tours.length === 0 ? (
                                <div className="admin-empty">No active rides. Click "+ Create New Tour" to create one!</div>
                            ) : (
                                <div className="admin-rides-grid">
                                    {tours.map(tour => {
                                        const isThisDeleting = deletingId === tour.id;
                                        return (
                                            <div className="admin-ride-card" key={tour.id}>
                                                <div className="admin-ride-card-img">
                                                    <img 
                                                        src={
                                                            tour.image === 'mountain' ? mountainImg :
                                                            tour.image === 'coastal' ? coastalImg :
                                                            tour.image === 'hero' ? heroImg :
                                                            tour.image.startsWith('http') || tour.image.startsWith('data:image') ? tour.image : mountainImg
                                                        } 
                                                        alt={tour.title} 
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=300&auto=format&fit=crop';
                                                        }}
                                                    />
                                                    <div className="admin-ride-card-badges">
                                                        <span className="admin-ride-card-badge-dur">{tour.duration}</span>
                                                        {tour.rideDate && <span className="admin-ride-card-badge-dur" style={{ background: 'var(--accent-color)' }}>📅 {tour.rideDate}</span>}
                                                    </div>
                                                </div>
                                                <div className="admin-ride-card-content">
                                                    <h4>{tour.title}</h4>
                                                    {tour.location && <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '-0.3rem 0 0.5rem 0' }}>📍 {tour.location}</p>}
                                                    <p className="admin-ride-card-desc">{tour.desc}</p>
                                                    <div className="admin-ride-card-footer">
                                                        <span className="admin-ride-card-price">{tour.price}</span>
                                                        <div className="admin-ride-card-actions">
                                                            <button 
                                                                className="admin-btn-action admin-btn-edit"
                                                                onClick={() => handleEditClick(tour)}
                                                                disabled={deletingId !== null}
                                                            >
                                                                Edit
                                                            </button>
                                                            <button 
                                                                className="admin-btn-action admin-btn-delete"
                                                                onClick={() => handleDeleteClick(tour.id)}
                                                                disabled={deletingId !== null}
                                                            >
                                                                {isThisDeleting ? (
                                                                    <>
                                                                        <span className="spinner" style={{ marginRight: 0 }}></span>
                                                                    </>
                                                                ) : (
                                                                    'Delete'
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                        </div>
                    </>
                )}
            </Motion.div>

            {/* Custom overlays / popup wrappers */}
            {renderFormModal()}
            {renderCustomModalDialog()}
        </Motion.div>
    );
};

export default AdminDashboard;

