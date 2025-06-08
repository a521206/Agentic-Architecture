// Main JavaScript for Agentic Design Patterns

// Pattern Details Data
const patternDetails = {
    "prompt-chaining": {
        description: "Sequential execution of prompts where each output feeds into the next prompt.",
        characteristics: [
            "Modular prompt design",
            "Data flow management",
            "Error handling between steps"
        ],
        implementation: "Use a pipeline architecture with clear input/output contracts between steps.",
        enterpriseImpact: "Enables complex workflows while maintaining maintainability and testability."
    },
    "routing": {
        description: "Directing inputs to appropriate handlers based on content or context.",
        characteristics: [
            "Content analysis",
            "Dynamic routing rules",
            "Fallback handling"
        ],
        implementation: "Implement a router component that evaluates input and directs to specialized handlers.",
        enterpriseImpact: "Improves system efficiency by directing tasks to optimal handlers."
    }
};

// Utility Functions
const utils = {
    // DOM element selectors
    getElements: {
        patternCards: () => document.querySelectorAll('.pattern-card'),
        patternLinks: () => document.querySelectorAll('a[href^="#"]'),
        closeButtons: () => document.querySelectorAll('.close-button'),
        overlay: () => document.querySelector('.overlay'),
        fadeElements: () => document.querySelectorAll('.fade-in'),
        tables: () => document.querySelectorAll('table'),
        images: () => document.querySelectorAll('.pattern-image'),
        interactiveHeaders: () => document.querySelectorAll('.interactive-header'),
        patternDetails: () => document.querySelectorAll('.pattern-details')
    },

    // Animation helpers
    fadeIn: (element) => {
        element.style.opacity = '0';
        setTimeout(() => {
            element.style.opacity = '1';
        }, 100);
    },

    // Scroll helpers
    smoothScroll: (element) => {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    },

    // Page state helpers
    isPatternPage: () => document.body.classList.contains('pattern-page'),
    isMainPage: () => !document.body.classList.contains('pattern-page')
};

// Pattern Manager Class
class PatternManager {
    constructor() {
        this.currentPattern = null;
        this.patternCards = utils.getElements.patternCards();
        this.patternDetails = utils.getElements.patternDetails();
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

        // Initialize page-specific functionality
        if (utils.isPatternPage()) {
            this.initPatternPage();
        } else {
            this.initMainPage();
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
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    const patternId = href.substring(1);
                    if (patternId) {
                        this.showPattern(patternId);
                        card.classList.add('loading');
                        setTimeout(() => card.classList.remove('loading'), 300);
                    }
                }
            });
        });

        // Close button events
        utils.getElements.closeButtons().forEach(button => {
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

        // Hash change handling
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.substring(1);
            if (hash) {
                this.showPattern(hash);
            } else {
                this.hidePattern();
            }
        });
    }

    showPattern(patternId) {
        this.hidePattern();

        const selectedPattern = document.getElementById(patternId);
        if (selectedPattern) {
            selectedPattern.style.display = 'block';
            this.currentPattern = selectedPattern;

            this.patternCards.forEach(card => {
                card.classList.remove('active');
                if (card.getAttribute('href') === `#${patternId}`) {
                    card.classList.add('active');
                }
            });

            setTimeout(() => {
                selectedPattern.classList.add('fade-in');
            }, 50);

            this.isDetailsVisible = true;
            document.body.style.overflow = 'hidden';
            window.location.hash = patternId;
        }
    }

    hidePattern() {
        if (this.currentPattern) {
            this.currentPattern.classList.remove('fade-in');
            setTimeout(() => {
                this.currentPattern.style.display = 'none';
                this.currentPattern = null;
            }, 300);
        }

        this.patternCards.forEach(card => {
            card.classList.remove('active');
        });

        document.body.style.overflow = 'auto';
        this.isDetailsVisible = false;
        window.history.pushState("", document.title, window.location.pathname);
    }

    setupSmoothScrolling() {
        utils.getElements.patternLinks().forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    utils.smoothScroll(target);
                }
            });
        });
    }

    initializeGoToTop() {
        const goToTopButton = document.createElement('div');
        goToTopButton.className = 'go-to-top';
        goToTopButton.innerHTML = '↑';
        document.body.appendChild(goToTopButton);

        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                goToTopButton.classList.add('visible');
            } else {
                goToTopButton.classList.remove('visible');
            }
        });

        goToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    initializeFadeAnimations() {
        utils.getElements.fadeElements().forEach(element => {
            utils.fadeIn(element);
        });
    }

    setupResponsiveTables() {
        utils.getElements.tables().forEach(table => {
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
            utils.getElements.images().forEach(img => {
                if (img.naturalWidth > img.parentElement.offsetWidth) {
                    img.style.width = '100%';
                    img.style.height = 'auto';
                }
            });
        };

        handleResponsiveImages();
        window.addEventListener('resize', handleResponsiveImages);
    }

    initMainPage() {
        utils.getElements.interactiveHeaders().forEach(header => {
            header.addEventListener('click', () => {
                const targetId = header.getAttribute('data-target');
                if (targetId) {
                    const target = document.getElementById(targetId);
                    if (target) {
                        utils.smoothScroll(target);
                    }
                }
            });
        });
    }

    initPatternPage() {
        // Pattern page specific initialization if needed
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.patternManager = new PatternManager();
    window.patternManager.init();

    // Handle initial hash
    if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        window.patternManager.showPattern(hash);
    }
}); 