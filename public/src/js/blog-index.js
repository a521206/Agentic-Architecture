// index-init.js

// Import common components initialization (assuming it's exported from common-components.js)
import { initCommonComponents } from './common-components.js';

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

    /**
     * Initializes the blog index functionality.
     * Ensures common components and blog interactions are ready, then loads post stats.
     */
    async init() {
        this.initCommonComponents(); // Initialize common UI components
        await this.initBlogInteractions(); // Ensure blog interactions (including auth) are ready
        this.bindEvents(); // Bind DOM events
        this.updateAllPostStats(); // Load initial stats for all posts
    }

    /**
     * Calls the global function to initialize common components.
     * Assumes `initCommonComponents` is available globally or imported.
     */
    initCommonComponents() {
        if (typeof initCommonComponents === 'function') {
            initCommonComponents();
        } else {
            console.warn('initCommonComponents function not found. Common components might not initialize.');
        }
    }

    /**
     * Initializes the global BlogInteractions instance and waits for it to be ready.
     * This ensures Firebase (Auth & Firestore) is set up before attempting data operations.
     * @returns {Promise<void>} A promise that resolves when BlogInteractions is ready.
     */
    async initBlogInteractions() {
        if (typeof window.initBlogInteractions === 'function') {
            await window.initBlogInteractions(); // This creates and initializes window.blogInteractions
            // The BlogInteractions instance's init() method handles auth and listeners.
            // We can now assume window.blogInteractions is ready.
            console.log('BlogInteractions instance is ready.');
        } else {
            console.error('window.initBlogInteractions function not found. Blog interactions will not work.');
            // Potentially disable interaction features if this critical dependency is missing
        }
    }

    /**
     * Updates stats (likes and comments) for all posts displayed on the index page.
     */
    async updateAllPostStats() {
        if (!window.blogInteractions) {
            console.warn('Cannot update post stats: window.blogInteractions is not available.');
            return;
        }

        // Fetch and update stats for each post concurrently
        const updatePromises = this.postIds.map(postId => this.updatePostStats(postId));
        await Promise.all(updatePromises);
    }

    /**
     * Fetches and updates the like and comment counts for a specific post.
     * @param {string} postId - The ID of the post to update.
     */
    async updatePostStats(postId) {
        if (!window.blogInteractions) return;

        try {
            // getPostStats is now async, so await its result
            const stats = await window.blogInteractions.getPostStats(postId);

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

            // The like button state (color/icon) is handled by blog-interactions.js's onSnapshot listener
            // no need for updateLikeButtonState here.
        } catch (error) {
            console.error(`Failed to update stats for post ${postId}:`, error);
            // Optionally, display a fallback or error message on the UI
        }
    }

    /**
     * Handles a click event on a "simple like" button on the index page.
     * Toggles the like status and triggers UI updates.
     * @param {HTMLElement} button - The clicked like button element.
     */
    async handleLikeClick(button) {
        const postId = button.dataset.postId;

        if (postId && window.blogInteractions) {
            try {
                // Toggle the like in Firestore
                await window.blogInteractions.toggleLike(postId);

                // The UI will be automatically updated by the onSnapshot listener in blog-interactions.js
                // No need for setTimeout or manual updatePostStats here for immediate consistency.

                // Immediate visual feedback (animation)
                button.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    button.style.transform = 'scale(1)';
                }, 150);
            } catch (error) {
                console.error(`Error handling like for post ${postId}:`, error);
                // Provide user feedback, e.g., "Failed to like post."
                window.blogInteractions.showFeedback('Failed to like post. Please try again.');
            }
        }
    }

    /**
     * Binds all necessary DOM event listeners for the blog index page.
     */
    bindEvents() {
        // Handle like button clicks on index page using event delegation
        document.addEventListener('click', async (e) => {
            if (e.target.closest('.like-btn-simple')) {
                e.preventDefault(); // Prevent default link behavior if button is inside an anchor
                const button = e.target.closest('.like-btn-simple');
                await this.handleLikeClick(button);
            }
        });

        // Refresh stats when returning to the page or tab gains focus
        // This is a good fallback, though Firestore listeners keep things real-time
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && window.blogInteractions) {
                this.updateAllPostStats();
            }
        });

        window.addEventListener('focus', () => {
            if (window.blogInteractions) {
                this.updateAllPostStats();
            }
        });
    }

    /**
     * Public method to manually refresh all post statistics.
     */
    refreshStats() {
        this.updateAllPostStats();
    }

    /**
     * Public method to add a new post ID to the list of tracked posts.
     * @param {string} postId - The ID of the new post.
     */
    addPostId(postId) {
        if (!this.postIds.includes(postId)) {
            this.postIds.push(postId);
            this.updatePostStats(postId); // Immediately update stats for the new post
        }
    }

    /**
     * Public method to remove a post ID from the list of tracked posts.
     * @param {string} postId - The ID of the post to remove.
     */
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

// Export for use in other scripts (e.g., for testing or if bundled)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlogIndex;
}