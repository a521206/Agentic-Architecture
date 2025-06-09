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
        sections: () => document.querySelectorAll('section[id]'),
        fadeElements: () => document.querySelectorAll('.fade-in'),
        tables: () => document.querySelectorAll('table'),
        images: () => document.querySelectorAll('.pattern-image'),
        interactiveHeaders: () => document.querySelectorAll('.interactive-header')
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

// Navigation Manager Class
class NavigationManager {
    constructor() {
        this.currentSection = null;
        this.sections = utils.getElements.sections();
        this.patternCards = utils.getElements.patternCards();
    }

    init() {
        this.setupEventListeners();
        this.setupSmoothScrolling();
        this.initializeGoToTop();
        this.initializeFadeAnimations();
        this.initializeProgressIndicator();
        this.setupScrollSpy();
        
        // Only setup responsive elements if they exist
        if (document.querySelector('table')) {
            this.setupResponsiveTables();
        }
        if (document.querySelector('.pattern-image')) {
            this.setupResponsiveImages();
        }

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

    setupSmoothScrolling() {
        utils.getElements.patternLinks().forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    utils.smoothScroll(target);
                    // Update URL without page reload
                    history.pushState(null, null, anchor.getAttribute('href'));
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
                
                if (scrollPosition >= sectionTop - 100 && 
                    scrollPosition < sectionTop + sectionHeight - 100) {
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
        if (!goToTopButton) {
            goToTopButton = document.createElement('a');
            goToTopButton.className = 'go-to-top';
            goToTopButton.href = '#';
            goToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
            document.body.appendChild(goToTopButton);
        }

        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
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

        window.addEventListener('scroll', () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            progressBar.style.width = scrolled + '%';
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
                    img.style.maxWidth = '100%';
                    img.style.height = 'auto';
                }
            });
        };

        window.addEventListener('load', handleResponsiveImages);
        window.addEventListener('resize', handleResponsiveImages);
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