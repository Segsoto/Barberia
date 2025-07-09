// Global variables
let bookedSlots = new Set();
let currentDate = new Date();

// DOM elements
const loadingScreen = document.getElementById('loading-screen');
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const bookingForm = document.getElementById('booking-form');
const contactForm = document.getElementById('contact-form');
const successModal = document.getElementById('success-modal');
const dateInput = document.getElementById('date');
const timeSelect = document.getElementById('time');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Hide loading screen after delay
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 2000);

    // Initialize components
    initNavigation();
    initScrollAnimations();
    initBookingSystem();
    initContactForm();
    initDatePicker();
    
    // Smooth scroll for anchor links
    initSmoothScroll();
});

// Navigation functionality
function initNavigation() {
    // Mobile menu toggle
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
    });

    // Active link highlighting
    window.addEventListener('scroll', updateActiveLink);
}

function updateActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// Smooth scroll functionality
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Scroll animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Add animation classes to elements
    const animateElements = document.querySelectorAll('.service-card, .gallery-item, .contact-item');
    animateElements.forEach((el, index) => {
        el.classList.add('fade-in');
        el.style.animationDelay = `${index * 0.1}s`;
        observer.observe(el);
    });
}

// Date picker initialization
function initDatePicker() {
    // Set minimum date to today
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    dateInput.min = tomorrow.toISOString().split('T')[0];
    
    // Set maximum date to 30 days from now
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 30);
    dateInput.max = maxDate.toISOString().split('T')[0];

    // Load available times when date changes
    dateInput.addEventListener('change', loadAvailableTimes);
}

// Booking system
function initBookingSystem() {
    // Load some demo booked slots
    loadDemoBookedSlots();
    
    bookingForm.addEventListener('submit', handleBookingSubmit);
}

function loadDemoBookedSlots() {
    // Demo booked slots for testing
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const demoSlots = [
        `${tomorrow.toISOString().split('T')[0]}_10:00`,
        `${tomorrow.toISOString().split('T')[0]}_14:00`,
        `${tomorrow.toISOString().split('T')[0]}_16:00`
    ];
    
    demoSlots.forEach(slot => bookedSlots.add(slot));
}

function loadAvailableTimes() {
    const selectedDate = dateInput.value;
    if (!selectedDate) return;

    const selectedDay = new Date(selectedDate).getDay();
    
    // Clear previous options
    timeSelect.innerHTML = '<option value="">Selecciona una hora</option>';
    
    // Define business hours
    let startHour, endHour;
    if (selectedDay === 0) { // Sunday
        startHour = 10;
        endHour = 17;
    } else { // Monday to Saturday
        startHour = 9;
        endHour = 19;
    }
    
    // Generate time slots
    for (let hour = startHour; hour < endHour; hour++) {
        const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
        const slotKey = `${selectedDate}_${timeSlot}`;
        
        if (!bookedSlots.has(slotKey)) {
            const option = document.createElement('option');
            option.value = timeSlot;
            option.textContent = formatTime(timeSlot);
            timeSelect.appendChild(option);
        }
    }
}

function formatTime(time) {
    const [hour, minute] = time.split(':');
    const hour12 = hour % 12 || 12;
    const ampm = hour < 12 ? 'AM' : 'PM';
    return `${hour12}:${minute} ${ampm}`;
}

async function handleBookingSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(bookingForm);
    const bookingData = {
        service: formData.get('service'),
        date: formData.get('date'),
        time: formData.get('time'),
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        notes: formData.get('notes') || 'Sin notas adicionales'
    };

    // Validate form
    if (!validateBookingForm(bookingData)) {
        return;
    }

    // Show loading state
    const submitBtn = bookingForm.querySelector('button[type="submit"]');
    submitBtn.classList.add('loading');
    bookingForm.classList.add('form-loading');

    try {
        // Send booking request
        const response = await fetch('/api/book-appointment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData)
        });

        if (response.ok) {
            // Add slot to booked slots
            const slotKey = `${bookingData.date}_${bookingData.time}`;
            bookedSlots.add(slotKey);
            
            // Show success modal
            showSuccessModal();
            
            // Reset form
            bookingForm.reset();
            timeSelect.innerHTML = '<option value="">Selecciona una hora</option>';
            
        } else {
            throw new Error('Error al procesar la reserva');
        }
    } catch (error) {
        console.error('Error:', error);
        showErrorMessage('Error al enviar la reserva. Por favor, inténtalo de nuevo.');
    } finally {
        // Remove loading state
        submitBtn.classList.remove('loading');
        bookingForm.classList.remove('form-loading');
    }
}

function validateBookingForm(data) {
    const requiredFields = ['service', 'date', 'time', 'name', 'email', 'phone'];
    
    for (const field of requiredFields) {
        if (!data[field] || data[field].trim() === '') {
            showErrorMessage(`Por favor, completa el campo: ${getFieldLabel(field)}`);
            return false;
        }
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showErrorMessage('Por favor, ingresa un email válido');
        return false;
    }

    // Validate phone
    const phoneRegex = /^[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(data.phone)) {
        showErrorMessage('Por favor, ingresa un número de teléfono válido');
        return false;
    }

    return true;
}

function getFieldLabel(field) {
    const labels = {
        service: 'Servicio',
        date: 'Fecha',
        time: 'Hora',
        name: 'Nombre',
        email: 'Email',
        phone: 'Teléfono'
    };
    return labels[field] || field;
}

// Contact form
function initContactForm() {
    contactForm.addEventListener('submit', handleContactSubmit);
}

async function handleContactSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(contactForm);
    const contactData = {
        name: formData.get('contact_name'),
        email: formData.get('contact_email'),
        subject: formData.get('subject'),
        message: formData.get('message')
    };

    // Validate contact form
    if (!validateContactForm(contactData)) {
        return;
    }

    // Show loading state
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Enviando...';
    submitBtn.disabled = true;
    contactForm.classList.add('form-loading');

    try {
        // Send contact request
        const response = await fetch('/api/send-contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(contactData)
        });

        if (response.ok) {
            showSuccessMessage('Mensaje enviado exitosamente. Te responderemos pronto.');
            contactForm.reset();
        } else {
            throw new Error('Error al enviar el mensaje');
        }
    } catch (error) {
        console.error('Error:', error);
        showErrorMessage('Error al enviar el mensaje. Por favor, inténtalo de nuevo.');
    } finally {
        // Remove loading state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        contactForm.classList.remove('form-loading');
    }
}

function validateContactForm(data) {
    const requiredFields = ['name', 'email', 'subject', 'message'];
    
    for (const field of requiredFields) {
        if (!data[field] || data[field].trim() === '') {
            showErrorMessage(`Por favor, completa el campo: ${getContactFieldLabel(field)}`);
            return false;
        }
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showErrorMessage('Por favor, ingresa un email válido');
        return false;
    }

    return true;
}

function getContactFieldLabel(field) {
    const labels = {
        name: 'Nombre',
        email: 'Email',
        subject: 'Asunto',
        message: 'Mensaje'
    };
    return labels[field] || field;
}

// Modal functions
function showSuccessModal() {
    successModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    successModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside or on close button
successModal.addEventListener('click', (e) => {
    if (e.target === successModal || e.target.classList.contains('close')) {
        closeModal();
    }
});

// Message functions
function showSuccessMessage(message) {
    showNotification(message, 'success');
}

function showErrorMessage(message) {
    showNotification(message, 'error');
}

function showNotification(message, type) {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.classList.add('notification', `notification-${type}`);
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 20px',
        borderRadius: '8px',
        color: '#fff',
        fontWeight: '500',
        zIndex: '10001',
        maxWidth: '400px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease',
        background: type === 'success' ? 
            'linear-gradient(135deg, #4CAF50, #45a049)' : 
            'linear-gradient(135deg, #f44336, #da190b)'
    });

    // Add to page
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Remove after delay
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}

// Gallery lightbox functionality
function initGalleryLightbox() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            const title = item.querySelector('h4').textContent;
            const description = item.querySelector('p').textContent;
            
            showLightbox(img.src, title, description);
        });
    });
}

function showLightbox(src, title, description) {
    // Create lightbox
    const lightbox = document.createElement('div');
    lightbox.classList.add('lightbox');
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <span class="lightbox-close">&times;</span>
            <img src="${src}" alt="${title}">
            <div class="lightbox-info">
                <h4>${title}</h4>
                <p>${description}</p>
            </div>
        </div>
    `;
    
    // Style lightbox
    Object.assign(lightbox.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '10000',
        padding: '20px'
    });
    
    const content = lightbox.querySelector('.lightbox-content');
    Object.assign(content.style, {
        position: 'relative',
        maxWidth: '90vw',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    });
    
    const img = lightbox.querySelector('img');
    Object.assign(img.style, {
        maxWidth: '100%',
        maxHeight: '80vh',
        objectFit: 'contain',
        borderRadius: '10px'
    });
    
    const close = lightbox.querySelector('.lightbox-close');
    Object.assign(close.style, {
        position: 'absolute',
        top: '-40px',
        right: '0',
        fontSize: '30px',
        color: '#fff',
        cursor: 'pointer',
        background: 'rgba(0, 0, 0, 0.5)',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    });
    
    const info = lightbox.querySelector('.lightbox-info');
    Object.assign(info.style, {
        marginTop: '20px',
        textAlign: 'center',
        color: '#fff'
    });
    
    // Add to page
    document.body.appendChild(lightbox);
    document.body.style.overflow = 'hidden';
    
    // Close functionality
    function closeLightbox() {
        lightbox.remove();
        document.body.style.overflow = 'auto';
    }
    
    close.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // Escape key to close
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeLightbox();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

// Initialize gallery lightbox when page loads
document.addEventListener('DOMContentLoaded', initGalleryLightbox);

// Form validation helpers
function addValidationListeners() {
    // Real-time validation for booking form
    const bookingInputs = bookingForm.querySelectorAll('input, select, textarea');
    bookingInputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearFieldError(input));
    });

    // Real-time validation for contact form
    const contactInputs = contactForm.querySelectorAll('input, textarea');
    contactInputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearFieldError(input));
    });
}

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    
    // Remove previous error styling
    clearFieldError(field);
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'Este campo es obligatorio');
        return false;
    }
    
    // Email validation
    if (fieldName.includes('email') && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(field, 'Por favor, ingresa un email válido');
            return false;
        }
    }
    
    // Phone validation
    if (fieldName === 'phone' && value) {
        const phoneRegex = /^[\d\s\-\(\)]+$/;
        if (!phoneRegex.test(value)) {
            showFieldError(field, 'Por favor, ingresa un número válido');
            return false;
        }
    }
    
    return true;
}

function showFieldError(field, message) {
    field.classList.add('form-error');
    
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Add error message
    const errorDiv = document.createElement('div');
    errorDiv.classList.add('field-error');
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        color: #f44336;
        font-size: 0.8rem;
        margin-top: 5px;
        display: block;
    `;
    
    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
    field.classList.remove('form-error');
    const errorDiv = field.parentNode.querySelector('.field-error');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// Initialize validation listeners when page loads
document.addEventListener('DOMContentLoaded', addValidationListeners);

// Performance optimization
function initLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }
}

// Initialize lazy loading
document.addEventListener('DOMContentLoaded', initLazyLoading);

// Service worker registration for PWA capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
