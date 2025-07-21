// Common Header and Footer Components for Enterprise Agentic Architecture Patterns

// Common Header Component
function createHeader() {
    return `
        <div id="common-header" class="bg-white border-b border-gray-200 shadow-sm py-4 mb-6">
            <div class="max-w-6xl mx-auto px-4">
                <div class="flex flex-col md:flex-row justify-between items-center gap-4">
                    <!-- Contact Information -->
                    <div class="flex flex-col md:flex-row items-center gap-4 text-sm text-gray-600">
                        <div class="flex items-center gap-2">
                            <i class="fas fa-envelope text-blue-600"></i>
                            <a href="mailto:contact@terragonlabs.com" class="hover:text-blue-600 transition-colors">
                                contact@terragonlabs.com
                            </a>
                        </div>
                        <div class="flex items-center gap-2">
                            <i class="fas fa-phone text-blue-600"></i>
                            <span>+1 (555) 123-4567</span>
                        </div>
                    </div>
                    
                    <!-- Social Media Links -->
                    <div class="flex items-center gap-4">
                        <a href="https://github.com/terragonlabs" target="_blank" rel="noopener noreferrer" 
                           class="text-gray-600 hover:text-blue-600 transition-colors text-lg">
                            <i class="fab fa-github"></i>
                        </a>
                        <a href="https://linkedin.com/company/terragonlabs" target="_blank" rel="noopener noreferrer"
                           class="text-gray-600 hover:text-blue-600 transition-colors text-lg">
                            <i class="fab fa-linkedin"></i>
                        </a>
                        <a href="https://twitter.com/terragonlabs" target="_blank" rel="noopener noreferrer"
                           class="text-gray-600 hover:text-blue-600 transition-colors text-lg">
                            <i class="fab fa-twitter"></i>
                        </a>
                        <a href="https://youtube.com/@terragonlabs" target="_blank" rel="noopener noreferrer"
                           class="text-gray-600 hover:text-blue-600 transition-colors text-lg">
                            <i class="fab fa-youtube"></i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Common Footer Component
function createFooter() {
    const currentYear = new Date().getFullYear();
    return `
        <footer id="common-footer" class="bg-gray-900 text-white py-8 mt-16">
            <div class="max-w-6xl mx-auto px-4">
                <div class="flex flex-col md:flex-row justify-between items-center gap-6">
                    <!-- Copyright Information -->
                    <div class="text-center md:text-left">
                        <p class="text-gray-300 text-sm">
                            © ${currentYear} Terragon Labs. All rights reserved.
                        </p>
                        <p class="text-gray-400 text-xs mt-1">
                            Enterprise Agentic Architecture Patterns
                        </p>
                    </div>
                    
                    <!-- Additional Links -->
                    <div class="flex flex-col md:flex-row items-center gap-6 text-sm">
                        <div class="flex items-center gap-4">
                            <a href="#" class="text-gray-300 hover:text-white transition-colors">
                                Privacy Policy
                            </a>
                            <a href="#" class="text-gray-300 hover:text-white transition-colors">
                                Terms of Service
                            </a>
                            <a href="mailto:contact@terragonlabs.com" class="text-gray-300 hover:text-white transition-colors">
                                Contact Us
                            </a>
                        </div>
                        
                        <!-- Social Media (Footer) -->
                        <div class="flex items-center gap-3">
                            <a href="https://github.com/terragonlabs" target="_blank" rel="noopener noreferrer"
                               class="text-gray-400 hover:text-white transition-colors">
                                <i class="fab fa-github"></i>
                            </a>
                            <a href="https://linkedin.com/company/terragonlabs" target="_blank" rel="noopener noreferrer"
                               class="text-gray-400 hover:text-white transition-colors">
                                <i class="fab fa-linkedin"></i>
                            </a>
                            <a href="https://twitter.com/terragonlabs" target="_blank" rel="noopener noreferrer"
                               class="text-gray-400 hover:text-white transition-colors">
                                <i class="fab fa-twitter"></i>
                            </a>
                            <a href="https://youtube.com/@terragonlabs" target="_blank" rel="noopener noreferrer"
                               class="text-gray-400 hover:text-white transition-colors">
                                <i class="fab fa-youtube"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    `;
}

// Function to initialize header and footer
function initCommonComponents() {
    // Insert header at the beginning of body
    const body = document.body;
    const headerHTML = createHeader();
    body.insertAdjacentHTML('afterbegin', headerHTML);
    
    // Insert footer at the end of body (before existing scripts)
    const footerHTML = createFooter();
    body.insertAdjacentHTML('beforeend', footerHTML);
}

// Initialize components when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCommonComponents);
} else {
    initCommonComponents();
}