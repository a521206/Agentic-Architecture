// Common Header and Footer Components for RebootingwithAI

// Get current page path for navigation highlighting
function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    return page;
}

// Check if we're on the home page
function isHomePage() {
    const currentPage = getCurrentPage();
    return currentPage === 'index.html' || currentPage === '';
}

// Simple function to get base path for links
function getBasePath() {
    const path = window.location.pathname;
    // For root or public directory, use root path
    if (path === '/' || path.startsWith('/public/')) {
        return '/';
    }
    // For subdirectories, use relative path
    return '../';
}

// Common Header Component
function createHeader() {
    const currentPage = getCurrentPage();
    const isHome = isHomePage();
    const basePath = getBasePath();
    console.log('Current basePath:', basePath, 'Current path:', window.location.pathname);

    // Navigation links
    const navLinks = [
        {
            href: `${basePath}index.html`,
            text: 'Home',
            id: 'home'
        },
        {
            href: `${basePath}src/pages/blog/`,
            text: 'Blog',
            id: 'blog'
        },
        {
            href: `${basePath}learning-hub.html`,
            text: 'Agentic Architecture',
            id: 'agentic'
        },
        {
            href: `${basePath}src/pages/news/`,
            text: 'News & Insights',
            id: 'news'
        },
        {
            href: `${basePath}src/pages/about.html`,
            text: 'About',
            id: 'about'
        }
    ];

    // Contact information
    const contactInfo = `
        <div class="hidden md:flex items-center gap-2 ml-4">
            <i class="fas fa-envelope text-blue-600"></i>
            <a href="mailto:vishal.agrawal@gmail.com" 
               class="text-gray-600 hover:text-blue-600 transition-colors text-sm"
               target="_blank" 
               rel="noopener noreferrer">
                vishal.agrawal@gmail.com
            </a>
        </div>
    `;

    // Determine active link
    function getActiveClass(linkId) {
        if (currentPage === 'index.html' || currentPage === '') {
            return linkId === 'home' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600';
        } else if (currentPage === 'learning-hub.html') {
            return linkId === 'agentic' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600';
        } else if (currentPage.includes('about')) {
            return linkId === 'about' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600';
        }
        return 'text-gray-700 hover:text-blue-600';
    }

    return `
        <header class="bg-white border-b border-gray-200 shadow-sm py-4">
            <div class="max-w-7xl mx-auto px-4">
                <div class="flex flex-col md:flex-row justify-between items-center gap-4">
                    <!-- Logo -->
                    <div class="flex-shrink-0">
                        <a href="${basePath}index.html" class="text-xl font-bold text-gray-900">
                            <i class="fas fa-brain text-blue-600 mr-2"></i>
                            RebootingwithAI
                        </a>
                    </div>
                    
                    <!-- Navigation Links -->
                    <div class="hidden md:flex items-center space-x-6">
                        ${navLinks.map(link => `
                            <a href="${link.href}" 
                               class="${getActiveClass(link.id)} text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                               ${link.target ? `target="${link.target}"` : ''}
                               ${link.rel ? `rel="${link.rel}"` : ''}>
                                ${link.text}
                            </a>
                        `).join('')}
                        
                        <!-- Contact Information -->
                        ${contactInfo}
                    </div>
                    
                    <!-- Mobile menu button -->
                    <div class="md:hidden">
                        <button type="button" onclick="toggleMobileMenu()" class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                            <span class="sr-only">Open main menu</span>
                            <i class="fas fa-bars h-6 w-6"></i>
                        </button>
                    </div>

                    <!-- Mobile menu button -->
                    <div class="md:hidden">
                        <button type="button" class="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600" onclick="toggleMobileMenu()">
                            <i class="fas fa-bars text-xl"></i>
                        </button>
                    </div>
                </div>

                <!-- Mobile Navigation Menu -->
                <div id="mobile-menu" class="md:hidden hidden">
                    <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
                        ${navLinks.map(link => `
                            <a href="${link.href}" class="${getActiveClass(link.id)} block px-3 py-2 rounded-md text-base font-medium">
                                ${link.text}
                            </a>
                        `).join('')}
                    </div>
                </div>
            </div>
        </header>
    `;
}

// Common Footer Component
function createFooter() {
    const currentYear = new Date().getFullYear();
    const basePath = getRelativePath();

    return `
        <footer class="bg-gray-900 text-white py-12">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <!-- Brand Section -->
                    <div class="col-span-1 md:col-span-2">
                        <div class="flex items-center mb-4">
                            <i class="fas fa-brain text-2xl text-blue-400 mr-3"></i>
                            <h3 class="text-xl font-bold">RebootingwithAI</h3>
                        </div>
                        <p class="text-gray-300 mb-4 max-w-md">
                            My personal journey through the AI revolution, exploring enterprise architecture,
                            intelligent systems, and the future of autonomous agents.
                        </p>
                        <div class="flex space-x-4">
                            <a href="https://www.youtube.com/@RebootingwithAI" target="_blank" rel="noopener noreferrer"
                               class="text-gray-400 hover:text-white transition-colors">
                                <i class="fab fa-youtube text-xl"></i>
                            </a>
                            <a href="https://www.linkedin.com/in/vishalagrawal1999/" target="_blank" rel="noopener noreferrer"
                               class="text-gray-400 hover:text-white transition-colors">
                                <i class="fab fa-linkedin text-xl"></i>
                            </a>
                            <a href="https://github.com/a521206" target="_blank" rel="noopener noreferrer"
                               class="text-gray-400 hover:text-white transition-colors">
                                <i class="fab fa-github text-xl"></i>
                            </a>
                            <a href="mailto:vishalagrawal@gmail.com" class="text-gray-400 hover:text-white transition-colors">
                                <i class="fas fa-envelope text-xl"></i>
                            </a>
                        </div>
                    </div>

                    <!-- Quick Links -->
                    <div>
                        <h4 class="text-lg font-semibold mb-4">Quick Links</h4>
                        <ul class="space-y-2">
                            <li><a href="/index.html" class="text-gray-300 hover:text-white transition-colors">Home</a></li>
                            <li><a href="/src/pages/blog/index.html" class="text-gray-300 hover:text-white transition-colors">Blog</a></li>
                            <li><a href="/learning-hub.html" class="text-gray-300 hover:text-white transition-colors">Agentic Architecture</a></li>
                            <li><a href="/src/pages/news/index.html" class="text-gray-300 hover:text-white transition-colors">News & Insights</a></li>
                            <li><a href="/src/pages/about.html" class="text-gray-300 hover:text-white transition-colors">About</a></li>
                        </ul>
                    </div>

                    <!-- Resources -->
                    <div>
                        <h4 class="text-lg font-semibold mb-4">Resources</h4>
                        <ul class="space-y-2">
                            <li><a href="/learning-hub.html#frameworks" class="text-gray-300 hover:text-white transition-colors">Frameworks</a></li>
                            <li><a href="/learning-hub.html#patterns" class="text-gray-300 hover:text-white transition-colors">Design Patterns</a></li>
                            <li><a href="/learning-hub.html#case-studies" class="text-gray-300 hover:text-white transition-colors">Case Studies</a></li>
                            <li><a href="https://github.com/a521206/Agentic-Architecture" target="_blank" rel="noopener noreferrer" class="text-gray-300 hover:text-white transition-colors">GitHub Repository</a></li>
                        </ul>
                    </div>
                </div>

                <!-- Bottom Bar -->
                <div class="border-t border-gray-800 mt-8 pt-8">
                    <div class="flex flex-col md:flex-row justify-between items-center">
                        <div class="text-gray-400 text-sm">
                            © ${currentYear} RebootingwithAI by Vishal Agrawal. All rights reserved.
                        </div>
                        <div class="text-gray-400 text-sm mt-2 md:mt-0">
                            <span>Built with passion for AI and enterprise architecture</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    `;
}

// Mobile menu toggle function
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('hidden');
    }
}

// Function to initialize header and footer
function initCommonComponents() {
    // Check if we should skip header/footer (for pages that have their own)
    const skipHeader = document.querySelector('[data-skip-common-header]');
    const skipFooter = document.querySelector('[data-skip-common-footer]');

    if (!skipHeader) {
        // Insert header at the beginning of body or replace existing placeholder
        const headerPlaceholder = document.querySelector('[data-header-placeholder]');
        const headerHTML = createHeader();

        if (headerPlaceholder) {
            headerPlaceholder.outerHTML = headerHTML;
        } else {
            document.body.insertAdjacentHTML('afterbegin', headerHTML);
        }
    }

    if (!skipFooter) {
        // Insert footer at the end of body or replace existing placeholder
        const footerPlaceholder = document.querySelector('[data-footer-placeholder]');
        const footerHTML = createFooter();

        if (footerPlaceholder) {
            footerPlaceholder.outerHTML = footerHTML;
        } else {
            // Insert before scripts or at the very end
            const scripts = document.querySelector('script');
            if (scripts) {
                scripts.insertAdjacentHTML('beforebegin', footerHTML);
            } else {
                document.body.insertAdjacentHTML('beforeend', footerHTML);
            }
        }
    }

    // Make toggleMobileMenu globally available
    window.toggleMobileMenu = toggleMobileMenu;

    // Close mobile menu when clicking on links
    document.addEventListener('click', function(e) {
        if (e.target.matches('#mobile-menu a')) {
            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileMenu) {
                mobileMenu.classList.add('hidden');
            }
        }
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        const mobileMenu = document.getElementById('mobile-menu');
        const menuButton = document.querySelector('[onclick="toggleMobileMenu()"]');

        if (mobileMenu && !mobileMenu.classList.contains('hidden') &&
            !mobileMenu.contains(e.target) && !menuButton.contains(e.target)) {
            mobileMenu.classList.add('hidden');
        }
    });
}

// Initialize components when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCommonComponents);
} else {
    initCommonComponents();
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createHeader,
        createFooter,
        initCommonComponents,
        toggleMobileMenu
    };
}