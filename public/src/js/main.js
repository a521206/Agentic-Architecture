// Smooth scrolling for anchor links
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Back to top functionality
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    // Show/hide back to top button
    const backToTopButton = document.querySelector('button[onclick="scrollToTop()"]');
    
    if (backToTopButton) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.remove('opacity-0', 'invisible');
                backToTopButton.classList.add('opacity-100', 'visible');
            } else {
                backToTopButton.classList.add('opacity-0', 'invisible');
                backToTopButton.classList.remove('opacity-100', 'visible');
            }
        });
    }

    // Statistics update
    const updateStatistics = async () => {
        try {
            const statsResponse = await fetch('src/data/stats.json');
            const stats = await statsResponse.json();
            
            const elements = document.querySelectorAll('[data-stat]');
            elements.forEach(el => {
                const stat = el.getAttribute('data-stat');
                if (stats[stat]) {
                    el.textContent = stats[stat] + '+';
                }
            });
        } catch (error) {
            console.log('Using fallback statistics');
        }
    };

    // Initialize statistics
    updateStatistics();
});
