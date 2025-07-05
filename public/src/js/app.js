// Main JavaScript for Agentic Design Patterns

// Pattern Details Data (No changes needed, already good)
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
    // DOM element selectors (will be called once in NavigationManager constructor)
    getElements: {
        patternCards: () => document.querySelectorAll('.pattern-card'),
        patternLinks: () => document.querySelectorAll('a[href^="#"]'),
        sections: () => document.querySelectorAll('section[id]'),
        fadeElements: () => document.querySelectorAll('.fade-in'),
        tables: () => document.querySelectorAll('table'),
        // Responsive image handling will be primarily via CSS, removing JS image selector
        // images: () => document.querySelectorAll('.pattern-image'),
        interactiveHeaders: () => document.querySelectorAll('.interactive-header')
    },

    // Animation helpers - Use CSS transitions for better performance
    fadeIn: (element) => {
        // Add a class that triggers CSS transition for opacity
        element.classList.add('fade-in-active');
    },

    // Scroll helpers (No changes needed, already good)
    smoothScroll: (element) => {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    },

    // Page state helpers (No changes needed, already good)
    isPatternPage: () => document.body.classList.contains('pattern-page'),
    isMainPage: () => !document.body.classList.contains('pattern-page')
};

// Navigation Manager Class
class NavigationManager {
    constructor() {
        this.currentSection = null;
        // Cache common DOM elements once for performance
        this.sections = utils.getElements.sections();
        this.patternCards = utils.getElements.patternCards();
        this.patternLinks = utils.getElements.patternLinks();
        this.interactiveHeaders = utils.getElements.interactiveHeaders();
        this.fadeElements = utils.getElements.fadeElements();
        this.tables = utils.getElements.tables();

        // Configuration for scroll spy and go-to-top
        this.scrollOffset = 100; // Offset for scroll spy
        this.goToTopThreshold = 300; // Scroll position for go-to-top button
    }

    init() {
        this.setupEventListeners();
        this.setupSmoothScrolling();
        this.initializeGoToTop();
        this.initializeFadeAnimations();
        this.initializeProgressIndicator();
        this.setupScrollSpy();

        // Only setup responsive elements if they exist
        if (this.tables.length > 0) {
            this.setupResponsiveTables();
        }
        // Removed setupResponsiveImages - handled by CSS

        // Initialize page-specific functionality
        if (utils.isPatternPage()) {
            this.initPatternPage();
        } else {
            this.initMainPage();
        }
    }

    setupEventListeners() {
        // Pattern card click events
        this.patternCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const href = card.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        utils.smoothScroll(target);
                        // Update URL without page reload
                        history.pushState(null, null, href);
                    }
                }
            });
        });

        // Interactive headers
        this.interactiveHeaders.forEach(header => {
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

    setupSmoothScrolling() {
        this.patternLinks.forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const href = anchor.getAttribute('href');
                const target = document.querySelector(href);
                if (target) {
                    utils.smoothScroll(target);
                    // Update URL without page reload
                    history.pushState(null, null, href);
                }
            });
        });
    }

    setupScrollSpy() {
        const updateActiveSection = () => {
            const scrollPosition = window.scrollY;

            this.sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;

                // Use the configured scroll offset
                if (scrollPosition >= sectionTop - this.scrollOffset &&
                    scrollPosition < sectionTop + sectionHeight - this.scrollOffset) {
                    section.classList.add('active');
                    this.currentSection = section;

                    // Update corresponding navigation link
                    const id = section.getAttribute('id');
                    if (id) {
                        document.querySelectorAll(`a[href="#${id}"]`).forEach(link => {
                            link.classList.add('active');
                        });
                    }
                } else {
                    section.classList.remove('active');
                    const id = section.getAttribute('id');
                    if (id) {
                        document.querySelectorAll(`a[href="#${id}"]`).forEach(link => {
                            link.classList.remove('active');
                        });
                    }
                }
            });
        };

        window.addEventListener('scroll', updateActiveSection);
        // Initial check
        updateActiveSection();
    }

    initializeGoToTop() {
        let goToTopButton = document.querySelector('.go-to-top');
        // Prefer to have the button in HTML, but create if not found
        if (!goToTopButton) {
            goToTopButton = document.createElement('a');
            goToTopButton.className = 'go-to-top';
            goToTopButton.href = '#';
            goToTopButton.setAttribute('aria-label', 'Go to top of page'); // Accessibility improvement
            // Assuming Font Awesome is used for the icon
            goToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
            document.body.appendChild(goToTopButton);
        }

        window.addEventListener('scroll', () => {
            // Use the configured go-to-top threshold
            if (window.scrollY > this.goToTopThreshold) {
                goToTopButton.classList.add('visible');
            } else {
                goToTopButton.classList.remove('visible');
            }
        });

        goToTopButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    initializeProgressIndicator() {
        const progressBar = document.createElement('div');
        progressBar.className = 'reading-progress';
        document.body.appendChild(progressBar);

        // Optimized scroll event listener for progress bar
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
                    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                    const scrolled = (winScroll / height) * 100;
                    progressBar.style.width = scrolled + '%';
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    initializeFadeAnimations() {
        // Apply a class immediately that has a CSS transition for opacity
        this.fadeElements.forEach(element => {
            utils.fadeIn(element);
        });
    }

    setupResponsiveTables() {
        this.tables.forEach(table => {
            if (!table.parentElement.classList.contains('table-responsive')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'table-responsive';
                table.parentNode.insertBefore(wrapper, table);
                wrapper.appendChild(table);
            }
        });
    }

    initMainPage() {
        // Add any main page specific initialization here
    }

    initPatternPage() {
        // Add any pattern page specific initialization here
    }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const navigationManager = new NavigationManager();
    navigationManager.init();
});