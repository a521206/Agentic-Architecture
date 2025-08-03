// Common Header and Footer Components for RebootingwithAI

// Get current page for navigation highlighting
function getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop() || 'index.html';
    // Handle cases where filename might be just '/' or empty
    return filename === '' ? 'index.html' : filename;
}

// Check if we're on the home page
function isHomePage() {
    const currentPage = getCurrentPage();
    return currentPage === 'index.html' || currentPage === '/';
}

// Navigation links configuration for header
const navLinksConfig = [
    { href: '/index.html', text: 'Home', id: 'home' },
    { href: '/src/pages/blog/index.html', text: 'Blog', id: 'blog' },
    { href: '/learning-hub.html', text: 'Agentic Architecture', id: 'agentic' },
    { href: '/src/pages/news/index.html', text: 'News & Insights', id: 'news' },
    { href: '/src/pages/about.html', text: 'About', id: 'about' },
];

// Common Header Component
function createHeader() {
    const currentPage = getCurrentPage();

    // Set active link based on current page
    function getActiveClass(linkId) {
        const activeMap = {
            'index.html': 'home',
            '': 'home',
            'learning-hub.html': 'agentic',
            'about.html': 'about',
            'blog': 'blog', // Simplified id for blog
            'news': 'news'   // Simplified id for news
        };
        const activeId = activeMap[currentPage] || currentPage.split('.')[0];
        return linkId === activeId ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600';
    }
    
    return `
        <header class="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="flex-shrink-0 flex items-center">
                        <a href="/" class="flex items-center group">
                            <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600 text-white group-hover:bg-blue-700 transition-colors duration-200">
                                <i class="fas fa-brain text-lg"></i>
                            </div>
                            <span class="ml-3 text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                                RebootingwithAI
                            </span>
                        </a>
                    </div>
                    
                    <div class="hidden md:ml-10 md:flex md:items-center md:space-x-1">
                        ${navLinksConfig.map(link => `
                            <a href="${link.href}" 
                               class="${getActiveClass(link.id)} relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-gray-50 group"
                               ${link.target ? `target="${link.target}"` : ''}
                               ${link.rel ? `rel="${link.rel}"` : ''}>
                                <span class="relative z-10">${link.text}</span>
                                <span class="absolute bottom-1 left-1/2 w-0 h-0.5 bg-blue-600 -translate-x-1/2 group-hover:w-4/5 transition-all duration-300"></span>
                            </a>
                        `).join('')}
                    </div>
                    
                    <div class="hidden md:ml-4 md:flex md:items-center space-x-6">
                        <div class="relative group">
                            <div class="flex items-center text-gray-500 hover:text-blue-600 cursor-pointer transition-colors duration-200">
                                <i class="fas fa-envelope text-blue-500 group-hover:text-blue-600"></i>
                            </div>
                            <div class="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-100 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-1 group-hover:translate-y-0 z-50">
                                <p class="text-sm text-gray-600 mb-2">Email me at:</p>
                                <a href="mailto:vishal.agrawal@gmail.com" class="text-blue-600 hover:text-blue-800 font-medium break-all">vishal.agrawal@gmail.com</a>
                            </div>
                        </div>
                        
                        <div class="flex items-center space-x-4 border-l border-gray-200 pl-6">
                            <a href="https://github.com/a521206/simple-agent-examples" 
                               target="_blank" 
                               rel="noopener noreferrer" 
                               class="text-gray-400 hover:text-gray-700 transition-colors duration-200"
                               aria-label="GitHub">
                                <i class="fab fa-github text-xl"></i>
                            </a>
                            <a href="https://www.linkedin.com/in/vishalagrawal1999/" 
                               target="_blank" 
                               rel="noopener noreferrer"
                               class="text-gray-400 hover:text-blue-600 transition-colors duration-200"
                               aria-label="LinkedIn">
                                <i class="fab fa-linkedin text-xl"></i>
                            </a>
                            <a href="https://www.youtube.com/@RebootingwithAI" 
                               target="_blank" 
                               rel="noopener noreferrer"
                               class="text-gray-400 hover:text-red-600 transition-colors duration-200"
                               aria-label="YouTube">
                                <i class="fab fa-youtube text-xl"></i>
                            </a>
                        </div>
                    </div>
                    
                    <div class="md:hidden flex items-center">
                        <button type="button" 
                                onclick="toggleMobileMenu()" 
                                class="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                                aria-expanded="false"
                                aria-label="Toggle menu">
                            <span class="sr-only">Open main menu</span>
                            <i class="fas fa-bars text-xl"></i>
                        </button>
                    </div>
                </div>

                <div id="mobile-menu" class="md:hidden hidden transition-all duration-300 ease-in-out">
                    <div class="pt-2 pb-3 space-y-1 bg-white shadow-lg rounded-b-lg mx-2">
                        ${navLinksConfig.map(link => `
                            <a href="${link.href}" 
                               class="${getActiveClass(link.id)} block px-6 py-3 text-base font-medium hover:bg-gray-50 transition-colors duration-150">
                                ${link.text}
                            </a>
                        `).join('')}
                        
                        <div class="px-6 py-4 border-t border-gray-100">
                            <p class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Connect</p>
                            <div class="flex space-x-6">
                                <a href="mailto:vishal.agrawal@gmail.com" class="text-gray-500 hover:text-blue-600">
                                    <i class="fas fa-envelope text-xl"></i>
                                </a>
                                <a href="https://github.com/a521206/simple-agent-examples" target="_blank" rel="noopener noreferrer" class="text-gray-500 hover:text-gray-700">
                                    <i class="fab fa-github text-xl"></i>
                                </a>
                                <a href="https://www.linkedin.com/in/vishalagrawal1999/" target="_blank" rel="noopener noreferrer" class="text-gray-500 hover:text-blue-600">
                                    <i class="fab fa-linkedin text-xl"></i>
                                </a>
                                <a href="https://www.youtube.com/@RebootingwithAI" target="_blank" rel="noopener noreferrer" class="text-gray-500 hover:text-red-600">
                                    <i class="fab fa-youtube text-xl"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    `;
}

// Common Footer Component
function createFooter() {
    const currentYear = new Date().getFullYear();

    return `
        <footer class="bg-gray-900 text-gray-400 py-6">
            <div class="container mx-auto px-4 text-center">
                <p class="text-sm">
                    © ${currentYear} RebootingwithAI by Vishal Agrawal. All rights reserved.
                </p>
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

// Make toggleMobileMenu globally available
window.toggleMobileMenu = toggleMobileMenu;

// Function to initialize header and footer
function initCommonComponents() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        headerPlaceholder.outerHTML = createHeader();
    }
    
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        footerPlaceholder.outerHTML = createFooter();
    }

    // Add event listener to close mobile menu
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        const menuButton = document.querySelector('[onclick="toggleMobileMenu()"]');
        
        document.addEventListener('click', function(e) {
            // Check if the click is outside the menu and the button
            if (!mobileMenu.contains(e.target) && !menuButton.contains(e.target)) {
                mobileMenu.classList.add('hidden');
            }
        });
    }
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

// Ensure initCommonComponents is available as an ES6 module export
export { initCommonComponents };