import React from 'react';

const Footer = () => {
    return (
        <footer>
            <div className="footer-content">
                <div className="logo">RideQuest<span>.</span></div>
                <p>Your ultimate motorcycle adventure partner. Ride Beyond Limits.</p>
            </div>
            <div className="footer-bottom">
                &copy; {new Date().getFullYear()} RideQuest. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
