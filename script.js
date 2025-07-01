// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    // Counter tracking variables (declared at top for proper scope)
    let countersTriggered = false;
    let serviceCountersTriggered = false;
    
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu a');

    // Toggle mobile menu
    mobileMenuToggle.addEventListener('click', function() {
        this.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    });

    // Close mobile menu when clicking on nav links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!navMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
            mobileMenuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Clear focus after scrolling starts to allow scroll-based highlighting
                setTimeout(() => {
                    this.blur();
                }, 1000);
            }
        });
    });



    // Animated counters
    function animateCounters() {
        const counters = document.querySelectorAll('.stat-number[data-target]');
        
        counters.forEach(counter => {
            // Skip if already animated (prevent multiple animations)
            if (counter.textContent !== '0') {
                return;
            }
            
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000; // 2 seconds
            const steps = 60;
            const increment = target / steps;
            let current = 0;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                
                // Format the number
                if (target >= 1000) {
                    counter.textContent = Math.floor(current).toLocaleString() + '+';
                } else {
                    counter.textContent = Math.floor(current) + (target === 100 ? '%' : '+');
                }
            }, duration / steps);
        });
    }
    
    // Animated service counters
    function animateServiceCounters() {
        const serviceCounters = document.querySelectorAll('.service-stat-number[data-target]');
        console.log(`Found ${serviceCounters.length} service counters to animate`);
        
        serviceCounters.forEach((counter, index) => {
            console.log(`Counter ${index}: current text = "${counter.textContent}", target = "${counter.getAttribute('data-target')}"`);
            
            // Skip if already animated (prevent multiple animations)
            // Check if it's already been animated by looking for '+' or numbers > 0
            const currentText = counter.textContent.trim();
            if (currentText.includes('+') || (parseInt(currentText) > 0 && parseInt(currentText) >= parseInt(counter.getAttribute('data-target')))) {
                console.log(`Skipping counter ${index} - already animated (text: "${currentText}")`);
                return;
            }
            
            console.log(`Starting animation for counter ${index}`);
            // Reset to 0 to ensure clean start
            counter.textContent = '0';
            
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 1500; // 1.5 seconds for faster animation
            const steps = 50;
            const increment = target / steps;
            let current = 0;
            
            // Add staggered delay based on the card index
            const delay = Math.floor(index / 2) * 200; // 200ms delay per service card
            
            setTimeout(() => {
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    
                    // Format the number
                    if (target >= 100) {
                        counter.textContent = Math.floor(current) + '+';
                    } else {
                        counter.textContent = Math.floor(current);
                    }
                }, duration / steps);
            }, delay);
        });
    }

    // Intersection Observer for animations
    const observerOptions = {
        threshold: [0.1, 0.3, 0.5], // Multiple thresholds for better mobile compatibility
        rootMargin: '0px 0px -20px 0px' // Reduced margin for mobile screens
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                
                // Trigger counter animation when stats section is visible
                if (entry.target.classList.contains('stats')) {
                    countersTriggered = true; // Mark as triggered to prevent fallback
                    // Add a small delay to ensure proper timing on mobile
                    setTimeout(() => {
                        animateCounters();
                    }, 100);
                }
                
                // Add staggered animation for service cards and trigger service counters
                if (entry.target.classList.contains('services-grid')) {
                    serviceCountersTriggered = true; // Mark as triggered to prevent fallback
                    const cards = entry.target.querySelectorAll('.service-card');
                    cards.forEach((card, index) => {
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0) scale(1)';
                        }, index * 150);
                    });
                    
                    // Trigger service counter animations after a short delay
                    setTimeout(() => {
                        animateServiceCounters();
                    }, 500);
                }
                
                // Add staggered animation for location cards
                if (entry.target.classList.contains('locations-grid')) {
                    const cards = entry.target.querySelectorAll('.location-card');
                    cards.forEach((card, index) => {
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, index * 100);
                    });
                }
            }
        });
    }, observerOptions);

    // Observe sections for animations
    document.querySelectorAll('.stats, .services-grid, .about-content, .locations-grid').forEach(section => {
        observer.observe(section);
    });

    // Fallback for mobile devices - trigger counters on scroll if not already triggered
    function checkCountersOnScroll() {
        // Check main stats section
        if (!countersTriggered) {
            const statsSection = document.querySelector('.stats');
            if (statsSection) {
                const rect = statsSection.getBoundingClientRect();
                const windowHeight = window.innerHeight;
                
                // Trigger if section is visible or has been scrolled past
                if (rect.top < windowHeight && rect.bottom > 0) {
                    countersTriggered = true;
                    animateCounters();
                }
            }
        }
        
        // Check service section separately
        if (!serviceCountersTriggered) {
            const servicesSection = document.querySelector('.services-grid');
            if (servicesSection) {
                const rect = servicesSection.getBoundingClientRect();
                const windowHeight = window.innerHeight;
                
                // Trigger if section is visible or has been scrolled past
                if (rect.top < windowHeight * 0.8 && rect.bottom > 0) {
                    serviceCountersTriggered = true;
                    animateServiceCounters();
                }
            }
        }
    }
    
    // Add scroll listener for mobile fallback
    window.addEventListener('scroll', throttle(checkCountersOnScroll, 100));

    // Mobile device detection
    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
               (navigator.maxTouchPoints && navigator.maxTouchPoints > 2) ||
               window.innerWidth <= 768;
    }

    // Aggressive mobile fallback - immediately trigger counters on mobile
    if (isMobileDevice()) {
        console.log('Mobile device detected - triggering counters immediately');
        setTimeout(() => {
            if (!countersTriggered) {
                console.log('Triggering main counters on mobile');
                countersTriggered = true;
                animateCounters();
            }
            if (!serviceCountersTriggered) {
                console.log('Triggering service counters on mobile');
                serviceCountersTriggered = true;
                animateServiceCounters();
            }
        }, 1000); // Shorter delay for mobile
    }

    // Final fallback - trigger counters after page load if not already triggered
    setTimeout(() => {
        if (!countersTriggered) {
            console.log('Final fallback: triggering main counters');
            countersTriggered = true;
            animateCounters();
        }
        if (!serviceCountersTriggered) {
            console.log('Final fallback: triggering service counters');
            serviceCountersTriggered = true;
            animateServiceCounters();
        }
    }, 3000); // Wait 3 seconds after page load

    // Initialize service cards with animation-ready state
    document.querySelectorAll('.service-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(40px) scale(0.95)';
        card.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    });

    // Initialize location cards with animation-ready state
    document.querySelectorAll('.location-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });

    // Contact form handling (if you add a contact form later)
    const contactForm = document.querySelector('#contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const formObject = {};
            formData.forEach((value, key) => {
                formObject[key] = value;
            });

            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            // Simulate form submission (replace with actual form handling)
            setTimeout(() => {
                showNotification('Thank you for your message! We\'ll get back to you soon.', 'success');
                this.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 1500);
        });
    }

    // Notification system
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 2000;
            display: flex;
            align-items: center;
            gap: 1rem;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 400px;
        `;

        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 1.2rem;
            cursor: pointer;
            padding: 0;
            margin-left: auto;
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove after 5 seconds
        const autoRemove = setTimeout(() => {
            removeNotification(notification);
        }, 5000);

        // Manual close
        closeBtn.addEventListener('click', () => {
            clearTimeout(autoRemove);
            removeNotification(notification);
        });
    }

    function removeNotification(notification) {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    // Active navigation highlighting
    function updateActiveNavigation() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
        
        let currentSection = '';
        const scrollPosition = window.scrollY + 150; // Offset for header

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }

    // Update active navigation on scroll
    window.addEventListener('scroll', updateActiveNavigation);
    updateActiveNavigation(); // Initial call

    // Lazy loading for images
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[loading="lazy"]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // Performance optimization: Throttle scroll events
    let ticking = false;
    function throttle(func) {
        if (!ticking) {
            requestAnimationFrame(func);
            ticking = true;
            setTimeout(() => ticking = false, 16); // ~60fps
        }
    }

    // Enhanced scroll handling
    window.addEventListener('scroll', () => {
        throttle(() => {
            updateActiveNavigation();
        });
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        // Close mobile menu with Escape key
        if (e.key === 'Escape') {
            mobileMenuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
        }

        // Navigate with arrow keys when focus is on nav menu
        if (document.activeElement.closest('.nav-menu')) {
            const navItems = Array.from(navLinks);
            const currentIndex = navItems.indexOf(document.activeElement);
            
            if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                e.preventDefault();
                const nextIndex = (currentIndex + 1) % navItems.length;
                navItems[nextIndex].focus();
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                e.preventDefault();
                const prevIndex = (currentIndex - 1 + navItems.length) % navItems.length;
                navItems[prevIndex].focus();
            }
        }
    });

    // Add loading class to body for initial animations
    document.body.classList.add('loaded');

    // Service card hover effects
    document.querySelectorAll('.service-card.main-service').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Sub-service item interactions
    document.querySelectorAll('.sub-service-item').forEach(item => {
        item.addEventListener('click', function() {
            const imageType = this.getAttribute('data-image');
            const serviceCard = this.closest('.service-card');
            const mainImage = serviceCard.querySelector('.service-image img');
            
            // Update main image to show the clicked sub-service
            if (imageType && mainImage) {
                mainImage.src = `images/${imageType}.avif`;
                mainImage.alt = this.querySelector('h4').textContent;
            }

            // Add active state
            serviceCard.querySelectorAll('.sub-service-item').forEach(subItem => {
                subItem.classList.remove('active');
            });
            this.classList.add('active');
        });

        // Add hover effect for image preview
        item.addEventListener('mouseenter', function() {
            const imageType = this.getAttribute('data-image');
            const serviceCard = this.closest('.service-card');
            const mainImage = serviceCard.querySelector('.service-image img');
            
            // Store original image source
            if (!serviceCard.dataset.originalImage) {
                serviceCard.dataset.originalImage = mainImage.src;
            }

            // Preview the sub-service image
            if (imageType && mainImage) {
                mainImage.src = `images/${imageType}.avif`;
                mainImage.alt = this.querySelector('h4').textContent;
            }
        });

        item.addEventListener('mouseleave', function() {
            // Only restore original if no item is active
            const serviceCard = this.closest('.service-card');
            const activeItem = serviceCard.querySelector('.sub-service-item.active');
            
            if (!activeItem && serviceCard.dataset.originalImage) {
                const mainImage = serviceCard.querySelector('.service-image img');
                mainImage.src = serviceCard.dataset.originalImage;
            }
        });
    });

    // Service CTA button interactions
    document.querySelectorAll('.service-cta-btn').forEach(button => {
        button.addEventListener('click', function() {
            const serviceCard = this.closest('.service-card');
            const serviceName = serviceCard.querySelector('.service-title').textContent;
            
            // Future: Navigate to dedicated service page
            // For now, show notification
            showNotification(`${serviceName} page coming soon! Contact us for more information.`, 'info');
        });
    });

    // Location card hover effects
    document.querySelectorAll('.location-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Initialize scroll animations for fade-in elements
    function initializeScrollAnimations() {
        if ('IntersectionObserver' in window) {
            const animationObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const element = entry.target;
                        
                        // Add the animation class if it has fade-in, slide-in, or scale-in
                        if (element.classList.contains('fade-in') || 
                            element.classList.contains('slide-in-left') || 
                            element.classList.contains('slide-in-right') || 
                            element.classList.contains('scale-in')) {
                            
                            element.style.animationPlayState = 'running';
                            
                            // For elements that start invisible, make them visible
                            if (element.style.opacity === '0' || window.getComputedStyle(element).opacity === '0') {
                                element.style.opacity = '1';
                            }
                        }
                        
                        // Unobserve after animation starts
                        animationObserver.unobserve(element);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });

            // Observe all animation elements
            document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .scale-in').forEach(element => {
                animationObserver.observe(element);
            });
        }
    }

    // Initialize scroll animations
    initializeScrollAnimations();
    
    // Initialize header scroll behavior
    initializeHeaderScrollBehavior();

    // Add stagger effect to service cards
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.2}s`;
    });

    // Add stagger effect to location cards
    const locationCards = document.querySelectorAll('.location-card');
    locationCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });

    // Header scroll behavior - hide top bar and adjust header position
    function initializeHeaderScrollBehavior() {
        const topBar = document.getElementById('topBar');
        const mainHeader = document.getElementById('mainHeader');
        const hero = document.querySelector('.hero');
        const navMenu = document.querySelector('.nav-menu');
        let lastScrollTop = 0;
        const topBarHeight = 50; // Height of top bar
        
        function handleScroll() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > topBarHeight) {
                // Hide top bar and move header to top
                topBar.classList.add('hidden');
                mainHeader.classList.add('scrolled');
                hero.classList.add('header-scrolled');
                if (navMenu) {
                    navMenu.classList.add('scrolled');
                }
            } else {
                // Show top bar and return header to normal position
                topBar.classList.remove('hidden');
                mainHeader.classList.remove('scrolled');
                hero.classList.remove('header-scrolled');
                if (navMenu) {
                    navMenu.classList.remove('scrolled');
                }
            }
            
            lastScrollTop = scrollTop;
        }
        
        // Throttled scroll handling for better performance
        let ticking = false;
        function throttledScroll() {
            if (!ticking) {
                requestAnimationFrame(() => {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        }
        
        window.addEventListener('scroll', throttledScroll);
        
        // Initial call to set correct state
        handleScroll();
    }

    // Interactive Leaflet Map Functionality
    let map;
    let markers = [];
    
    const locations = [
        {
            id: 'houston',
            name: 'Houston, TX',
            lat: 29.9474,
            lng: -95.1947,
            address: '633 Rankin Circle N, Houston, TX 77073',
            phone: '(832) 900-4768'
        },
        {
            id: 'fortworth',
            name: 'Fort Worth, TX',
            lat: 32.8241,
            lng: -97.4074,
            address: '4851 Blue Mound Rd, Fort Worth, TX 76106',
            phone: '(682) 708-6375'
        },
        {
            id: 'midland',
            name: 'Midland, TX',
            lat: 32.0241,
            lng: -102.1547,
            address: '11426 W County Rd 33, Midland, TX 79707',
            phone: '(432) 363-0669'
        },
        {
            id: 'perryton',
            name: 'Perryton, TX',
            lat: 36.3241,
            lng: -100.8047,
            address: '14488 Northwest Loop 143, Perryton, TX 79070',
            phone: '(806) 435-4043'
        },
        {
            id: 'ingleside',
            name: 'Ingleside, TX',
            lat: 27.8741,
            lng: -97.2047,
            address: '2701 Main Street, Ingleside, TX 78362',
            phone: '(361) 345-4017'
        },
        {
            id: 'carlsbad',
            name: 'Carlsbad, NM',
            lat: 32.4241,
            lng: -104.2547,
            address: '1500 Industrial Dr, Carlsbad, NM 88220',
            phone: '(575) 234-2198'
        },
        {
            id: 'henryetta',
            name: 'Henryetta, OK',
            lat: 35.4341,
            lng: -95.9847,
            address: '69803 Hornbeam Rd, Henryetta, OK 74478',
            phone: '(918) 650-0018'
        },
        {
            id: 'watford',
            name: 'Watford City, ND',
            lat: 47.8041,
            lng: -103.2847,
            address: '1509 21st Ave NW, Watford City, ND 58854',
            phone: '(701) 672-1589'
        }
    ];

    function initInteractiveMap() {
        const mapContainer = document.getElementById('leafletMap');
        if (!mapContainer) return;

        // Initialize the map
        map = L.map('leafletMap').setView([37.5, -100.0], 4);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Custom icon for markers
        const customIcon = L.divIcon({
            className: 'custom-div-icon',
            html: '<div style="background-color: #d4af37; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        // Add markers for all locations
        locations.forEach(location => {
            const marker = L.marker([location.lat, location.lng], { icon: customIcon })
                .addTo(map)
                .bindPopup(`
                    <div style="text-align: center; min-width: 200px;">
                        <h4 style="margin: 0 0 8px 0; color: #1e3a8a; font-size: 16px;">${location.name}</h4>
                        <p style="margin: 0 0 8px 0; font-size: 13px; line-height: 1.4;">${location.address}</p>
                        <p style="margin: 0; font-weight: 600; color: #d4af37; font-size: 14px;">${location.phone}</p>
                    </div>
                `);
            
            markers.push({ id: location.id, marker: marker });
        });

        // Fit bounds to show all locations with extra padding
        setTimeout(() => {
            const group = new L.featureGroup(markers.map(m => m.marker));
            map.fitBounds(group.getBounds().pad(0.2));
        }, 100);

        // Add click event listeners to interactive pins
        const interactivePins = document.querySelectorAll('.interactive-pin');
        interactivePins.forEach(pin => {
            pin.addEventListener('click', function() {
                const locationId = this.getAttribute('data-location');
                const location = locations.find(loc => loc.id === locationId);
                
                if (location) {
                    // Remove active class from all pins
                    interactivePins.forEach(p => p.classList.remove('active'));
                    
                    // Add active class to clicked pin
                    this.classList.add('active');
                    
                    // Zoom to specific location
                    map.setView([location.lat, location.lng], 12);
                    
                    // Open popup for this location
                    const markerData = markers.find(m => m.id === locationId);
                    if (markerData) {
                        markerData.marker.openPopup();
                    }
                    
                    // Show notification
                    showNotification(`Showing ${location.name} on map`, 'success');
                }
            });
        });
    }

    // Reset map to show all locations
    window.resetMapView = function() {
        const interactivePins = document.querySelectorAll('.interactive-pin');
        
        // Remove active class from all pins
        interactivePins.forEach(pin => pin.classList.remove('active'));
        
        if (map) {
            // Create bounds that include all markers with extra padding
            const group = new L.featureGroup(markers.map(m => m.marker));
            map.fitBounds(group.getBounds().pad(0.2));
        }
        
        showNotification('Showing all 8 office locations', 'info');
    }

    // Initialize interactive map
    initInteractiveMap();

    console.log('Superior Integrity Services website loaded successfully with enhanced animations!');
}); 