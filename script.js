document.addEventListener('DOMContentLoaded', () => {
    // Base WhatsApp Number from user
    const waNumber = '918951275713';

    // Get all enquire buttons
    const enquireButtons = document.querySelectorAll('.wa-enquire-btn');

    enquireButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Get the tour name from the data attribute
            const tourName = button.getAttribute('data-tour');
            
            // Create a custom message
            const message = `Hi! I'm interested in the "${tourName}" tour. Could you provide more details?`;
            
            // Encode the message for URL
            const encodedMessage = encodeURIComponent(message);
            
            // Build the WhatsApp URL
            const waUrl = `https://wa.me/${waNumber}?text=${encodedMessage}`;
            
            // Open WhatsApp in a new tab
            window.open(waUrl, '_blank');
        });
    });

    // Add scroll animation for navbar
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.padding = '1rem 5%';
            navbar.style.background = 'rgba(10, 10, 10, 0.98)';
            navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.5)';
        } else {
            navbar.style.padding = '1.5rem 5%';
            navbar.style.background = 'rgba(10, 10, 10, 0.85)';
            navbar.style.boxShadow = 'none';
        }
    });

    // Simple reveal animation for tour cards
    const tourCards = document.querySelectorAll('.tour-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    tourCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)';
        observer.observe(card);
    });
});
