// Common JavaScript for Agentic Design Patterns

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

// Pattern Details Management
const patternManager = {
    show: (patternId) => {
        const detailsContainer = document.getElementById(patternId);
        if (!detailsContainer) return;

        // Hide all pattern details first
        document.querySelectorAll('.pattern-details').forEach(detail => {
            detail.classList.remove('active');
        });

        // Show the selected pattern
        detailsContainer.classList.add('active');

        // Show overlay
        const overlay = utils.getElements.overlay();
        if (overlay) {
            overlay.classList.add('active');
        }

        // Scroll to the pattern
        utils.smoothScroll(detailsContainer);

        // Update URL hash
        window.location.hash = patternId;
    },

    hide: () => {
        // Hide all pattern details
        document.querySelectorAll('.pattern-details').forEach(detail => {
            detail.classList.remove('active');
        });

        // Hide overlay
        const overlay = utils.getElements.overlay();
        if (overlay) {
            overlay.classList.remove('active');
        }

        // Clear URL hash
        window.history.pushState("", document.title, window.location.pathname);
    }
};

// Event Handlers
const eventHandlers = {
    handlePatternCardClick: (e) => {
        const href = e.currentTarget.getAttribute('href');
        if (href && href.startsWith('#')) {
            e.preventDefault();
            const patternId = href.substring(1);
            patternManager.show(patternId);
        }
    },

    handlePatternLinkClick: (e) => {
        const href = e.currentTarget.getAttribute('href');
        if (href && href.startsWith('#')) {
            e.preventDefault();
            const patternId = href.substring(1);
            patternManager.show(patternId);
        }
    },

    handleCloseButtonClick: () => patternManager.hide(),

    handleOverlayClick: () => patternManager.hide(),

    handleEscapeKey: (e) => {
        if (e.key === 'Escape') {
            patternManager.hide();
        }
    },

    handleHashChange: () => {
        const hash = window.location.hash.substring(1);
        if (hash) {
            patternManager.show(hash);
        } else {
            patternManager.hide();
        }
    },

    handleResponsiveImages: () => {
        utils.getElements.images().forEach(img => {
            if (img.naturalWidth > img.parentElement.offsetWidth) {
                img.style.width = '100%';
                img.style.height = 'auto';
            }
        });
    },

    handleInteractiveHeaders: () => {
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
};

// Page-specific functionality
const pageSpecific = {
    initMainPage: () => {
        // Initialize any main page specific functionality
        eventHandlers.handleInteractiveHeaders();
    },

    initPatternPage: () => {
        // Initialize any pattern page specific functionality
        // Currently no specific functionality needed
    }
};

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize fade-in animations
    utils.getElements.fadeElements().forEach(utils.fadeIn);

    // Set up pattern card interactions
    utils.getElements.patternCards().forEach(card => {
        card.addEventListener('click', eventHandlers.handlePatternCardClick);
    });

    // Set up pattern link interactions
    utils.getElements.patternLinks().forEach(link => {
        link.addEventListener('click', eventHandlers.handlePatternLinkClick);
    });

    // Set up close button interactions
    utils.getElements.closeButtons().forEach(button => {
        button.addEventListener('click', eventHandlers.handleCloseButtonClick);
    });

    // Set up overlay interaction
    const overlay = utils.getElements.overlay();
    if (overlay) {
        overlay.addEventListener('click', eventHandlers.handleOverlayClick);
    }

    // Set up keyboard interactions
    document.addEventListener('keydown', eventHandlers.handleEscapeKey);

    // Set up hash change handling
    window.addEventListener('hashchange', eventHandlers.handleHashChange);

    // Handle initial hash
    if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        patternManager.show(hash);
    }

    // Set up responsive tables
    utils.getElements.tables().forEach(table => {
        const wrapper = document.createElement('div');
        wrapper.className = 'table-responsive';
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
    });

    // Set up responsive images
    window.addEventListener('resize', eventHandlers.handleResponsiveImages);
    eventHandlers.handleResponsiveImages();

    // Initialize page-specific functionality
    if (utils.isPatternPage()) {
        pageSpecific.initPatternPage();
    } else {
        pageSpecific.initMainPage();
    }
}); 