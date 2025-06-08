// Main JavaScript for Agentic Design Patterns

// Pattern Manager Class
class PatternManager {
    constructor() {
        this.currentPattern = null;
        this.patternCards = document.querySelectorAll('.pattern-card');
        this.patterns = document.querySelectorAll('.pattern');
        this.isDetailsVisible = false;
    }

    init() {
        this.setupEventListeners();
        this.setupSmoothScrolling();
        this.initializeGoToTop();
        this.initializeFadeAnimations();
        this.setupResponsiveTables();
        this.setupResponsiveImages();
    }

    setupEventListeners() {
        // Pattern card click events
        this.patternCards.forEach(card => {
            card.addEventListener('click', () => {
                const patternId = card.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
                if (patternId) {
                    this.showPattern(patternId);
                    // Add loading state
                    card.classList.add('loading');
                    setTimeout(() => card.classList.remove('loading'), 300);
                }
            });
        });

        // Close button events
        document.querySelectorAll('.close-button').forEach(button => {
            button.addEventListener('click', () => this.hidePattern());
        });

        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hidePattern();
            }
        });

        // Pattern details background click
        const patternDetails = document.getElementById('pattern-details');
        if (patternDetails) {
            patternDetails.addEventListener('click', (event) => {
                if (event.target === event.currentTarget) {
                    this.hidePattern();
                }
            });
        }
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
                if (card.getAttribute('onclick')?.includes(patternId)) {
                    card.classList.add('active');
                }
            });

            // Scroll to pattern details
            selectedPattern.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });

            // Add animation class
            selectedPattern.classList.add('fade-in');
            this.isDetailsVisible = true;

            // Prevent body scrolling
            document.body.style.overflow = 'hidden';
        }
    }

    hidePattern() {
        if (this.currentPattern) {
            this.currentPattern.style.display = 'none';
            this.currentPattern = null;
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
        goToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
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
            const wrapper = document.createElement('div');
            wrapper.className = 'table-responsive';
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
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