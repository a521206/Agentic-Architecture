// Main JavaScript for Agentic Design Patterns

// Pattern Manager Class
class PatternManager {
    constructor() {
        this.currentPattern = null;
        this.patternCards = document.querySelectorAll('.pattern-card');
        this.patternDetails = document.querySelectorAll('.pattern-details');
        this.isDetailsVisible = false;
    }

    init() {
        this.setupEventListeners();
        this.setupSmoothScrolling();
        this.initializeGoToTop();
        this.initializeFadeAnimations();
        
        // Only setup responsive elements if they exist
        if (document.querySelector('table')) {
            this.setupResponsiveTables();
        }
        if (document.querySelector('.pattern-image')) {
            this.setupResponsiveImages();
        }
        
        // Only hide patterns if they exist
        if (this.patternDetails.length > 0) {
            this.hideAllPatterns();
        }
    }

    hideAllPatterns() {
        if (this.patternDetails.length === 0) return;
        
        this.patternDetails.forEach(pattern => {
            pattern.style.display = 'none';
            pattern.classList.remove('fade-in');
        });
    }

    setupEventListeners() {
        // Pattern card click events
        this.patternCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const href = card.getAttribute('href');
                // Only prevent default for hash links
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    const patternId = href.substring(1);
                    if (patternId) {
                        this.showPattern(patternId);
                        // Add loading state
                        card.classList.add('loading');
                        setTimeout(() => card.classList.remove('loading'), 300);
                    }
                }
                // For actual page links, let the default behavior happen
            });
        });

        // Close button events
        document.querySelectorAll('.close-button').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.hidePattern();
            });
        });

        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hidePattern();
            }
        });

        // Pattern details background click
        this.patternDetails.forEach(details => {
            details.addEventListener('click', (event) => {
                if (event.target === event.currentTarget) {
                    this.hidePattern();
                }
            });
        });
    }

    showPattern(patternId) {
        // Hide current pattern if any
        this.hidePattern();

        // Show selected pattern
        const selectedPattern = document.getElementById(patternId);
        if (selectedPattern) {
            selectedPattern.style.display = 'block';
            this.currentPattern = selectedPattern;

            // Update active state of pattern cards
            this.patternCards.forEach(card => {
                card.classList.remove('active');
                if (card.getAttribute('href') === `#${patternId}`) {
                    card.classList.add('active');
                }
            });

            // Add animation class after a small delay
            setTimeout(() => {
                selectedPattern.classList.add('fade-in');
            }, 50);

            this.isDetailsVisible = true;

            // Prevent body scrolling
            document.body.style.overflow = 'hidden';
        }
    }

    hidePattern() {
        if (this.currentPattern) {
            this.currentPattern.classList.remove('fade-in');
            setTimeout(() => {
                this.currentPattern.style.display = 'none';
                this.currentPattern = null;
            }, 300); // Match the animation duration
        }

        // Remove active class from pattern cards
        this.patternCards.forEach(card => {
            card.classList.remove('active');
        });

        // Restore body scrolling
        document.body.style.overflow = 'auto';
        this.isDetailsVisible = false;
    }

    setupSmoothScrolling() {
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    initializeGoToTop() {
        // Create and append the go-to-top button
        const goToTopButton = document.createElement('div');
        goToTopButton.className = 'go-to-top';
        goToTopButton.innerHTML = '↑'; // Using Unicode arrow instead of Font Awesome
        document.body.appendChild(goToTopButton);

        // Add scroll event listener
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                goToTopButton.classList.add('visible');
            } else {
                goToTopButton.classList.remove('visible');
            }
        });

        // Add click event listener
        goToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    initializeFadeAnimations() {
        const fadeElements = document.querySelectorAll('.fade-in');
        fadeElements.forEach(element => {
            element.style.opacity = '0';
            setTimeout(() => {
                element.style.opacity = '1';
            }, 100);
        });
    }

    setupResponsiveTables() {
        const tables = document.querySelectorAll('table');
        tables.forEach(table => {
            // Only wrap if not already wrapped
            if (!table.parentElement.classList.contains('table-responsive')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'table-responsive';
                table.parentNode.insertBefore(wrapper, table);
                wrapper.appendChild(table);
            }
        });
    }

    setupResponsiveImages() {
        const handleResponsiveImages = () => {
            const images = document.querySelectorAll('.pattern-image');
            images.forEach(img => {
                if (img.naturalWidth > img.parentElement.offsetWidth) {
                    img.style.width = '100%';
                    img.style.height = 'auto';
                }
            });
        };

        // Initial setup
        handleResponsiveImages();

        // Handle window resize
        window.addEventListener('resize', handleResponsiveImages);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.patternManager = new PatternManager();
    window.patternManager.init();
}); 