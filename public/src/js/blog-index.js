/**
 * Blog Index Page JavaScript
 * Handles blog index specific functionality including stats updates and like interactions
 */

class BlogIndex {
    constructor() {
        this.postIds = [
            'scaling-agentic-systems-lessons-field',
            'security-considerations-agentic-architectures',
            'utcp-dns-agentic-world'
        ];
        this.init();
    }

    // Initialize the blog index functionality
    init() {
        this.initCommonComponents();
        this.initBlogInteractions();
        this.bindEvents();
    }

    // Initialize common components
    initCommonComponents() {
        if (typeof initCommonComponents === 'function') {
            initCommonComponents();
        }
    }

    // Initialize blog interactions for index page
    initBlogInteractions() {
        // Wait for blog interactions to be available
        const checkBlogInteractions = () => {
            if (window.blogInteractions) {
                this.updateAllPostStats();
            } else {
                // Retry after a short delay
                setTimeout(checkBlogInteractions, 100);
            }
        };
        
        checkBlogInteractions();
    }

    // Update stats for all posts on the index page
    updateAllPostStats() {
        this.postIds.forEach(postId => {
            this.updatePostStats(postId);
        });
    }

    // Update stats for a specific post
    updatePostStats(postId) {
        if (!window.blogInteractions) return;

        const stats = window.blogInteractions.getPostStats(postId);

        // Update like counts
        const likeDisplays = document.querySelectorAll(`[data-post-id="${postId}"] .like-count-display`);
        likeDisplays.forEach(display => {
            display.textContent = stats.likes;
        });

        // Update comment counts
        const commentDisplays = document.querySelectorAll(`[data-post-id="${postId}"] .comment-count-display`);
        commentDisplays.forEach(display => {
            display.textContent = stats.comments;
        });

        // Update like button states
        this.updateLikeButtonState(postId);
    }

    // Update like button visual state
    updateLikeButtonState(postId) {
        if (!window.blogInteractions) return;

        const postData = window.blogInteractions.getPostData(postId);
        const isLiked = postData.likes.includes(window.blogInteractions.currentUser);
        const buttons = document.querySelectorAll(`[data-post-id="${postId}"].like-btn-simple`);

        buttons.forEach(button => {
            const icon = button.querySelector('i');

            if (isLiked) {
                button.classList.add('text-blue-600');
                button.classList.remove('text-gray-500');
                if (icon) {
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                }
            } else {
                button.classList.remove('text-blue-600');
                button.classList.add('text-gray-500');
                if (icon) {
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                }
            }
        });
    }

    // Handle like button clicks on index page
    async handleLikeClick(button) {
        const postId = button.dataset.postId;

        if (postId && window.blogInteractions) {
            // Toggle the like
            await window.blogInteractions.toggleLike(postId);

            // Update the display after a short delay to ensure data is saved
            setTimeout(() => {
                this.updatePostStats(postId);
            }, 100);

            // Immediate visual feedback
            button.style.transform = 'scale(1.1)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 150);
        }
    }

    // Bind event listeners
    bindEvents() {
        // Handle like button clicks on index page
        document.addEventListener('click', async (e) => {
            if (e.target.closest('.like-btn-simple')) {
                e.preventDefault();
                const button = e.target.closest('.like-btn-simple');
                await this.handleLikeClick(button);
            }
        });

        // Refresh stats when returning to the page (in case data changed)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && window.blogInteractions) {
                this.updateAllPostStats();
            }
        });

        // Handle page focus events
        window.addEventListener('focus', () => {
            if (window.blogInteractions) {
                this.updateAllPostStats();
            }
        });
    }

    // Public method to refresh all stats
    refreshStats() {
        this.updateAllPostStats();
    }

    // Public method to add a new post ID to track
    addPostId(postId) {
        if (!this.postIds.includes(postId)) {
            this.postIds.push(postId);
            this.updatePostStats(postId);
        }
    }

    // Public method to remove a post ID from tracking
    removePostId(postId) {
        const index = this.postIds.indexOf(postId);
        if (index > -1) {
            this.postIds.splice(index, 1);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.blogIndex = new BlogIndex();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlogIndex;
}
