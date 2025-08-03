// blog-index.js

// Import the BlogInteractions class
import { BlogInteractions } from './blog-interactions.js';

// Import Firestore functions
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

/**
 * Blog Index Page JavaScript
 * Handles blog index specific functionality including stats updates and like interactions
 */
class BlogIndex {
    constructor() {
        // Store post IDs that should be tracked on the index page
        this.postIds = [
            'scaling-agentic-systems-lessons-field',
            'security-considerations-agentic-architectures',
            'utcp-dns-agentic-world'
        ];
        
        // Store the BlogInteractions instance
        this.blogInteractionsInstance = null;
        
        // Bind methods to maintain correct 'this' context
        this.handleLikeClick = this.handleLikeClick.bind(this);
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
        this.handleWindowFocus = this.handleWindowFocus.bind(this);
        
        // Initialize when the instance is created
        this.init().catch(error => {
            console.error('Failed to initialize BlogIndex:', error);
        });
    }

    /**
     * Initializes the blog index functionality.
     * Ensures common components and blog interactions are ready, then loads post stats.
     */
    async init() {
        initCommonComponents(); // Initialize common UI components

        // Initialize BlogInteractions instance
        this.blogInteractionsInstance = new BlogInteractions();
        // Wait for the BlogInteractions instance to complete its internal initialization
        // (which includes Firebase auth and Firestore listeners).
        await this.blogInteractionsInstance.init(); 
        
        this.bindEvents(); // Bind DOM events
        await this.updateAllPostStats(); // Load initial stats for all posts
    }

    /**
     * Updates stats (likes and comments) for all posts displayed on the index page.
     */
    /**
     * Updates stats (likes and comments) for all posts displayed on the index page
     */
    async updateAllPostStats() {
        if (!this.blogInteractionsInstance) {
            console.warn('Cannot update post stats: BlogInteractions instance is not available.');
            return;
        }

        if (!this.postIds.length) {
            console.debug('No post IDs to update');
            return;
        }

        try {
            // Process posts in batches to avoid overwhelming the browser
            const BATCH_SIZE = 3; // Adjust based on performance needs
            
            for (let i = 0; i < this.postIds.length; i += BATCH_SIZE) {
                const batch = this.postIds.slice(i, i + BATCH_SIZE);
                await Promise.all(batch.map(async postId => {
                    try {
                        const stats = await this.blogInteractionsInstance.getPostStats(postId);
                        this.updatePostUI(postId, stats);
                        await this.updateLikeButtonState(postId);
                    } catch (error) {
                        console.error(`Failed to update stats for post ${postId}:`, error);
                        // Update UI to show error state if needed
                    }
                }));
            }
        } catch (error) {
            console.error('Error in updateAllPostStats:', error);
            throw error; // Re-throw to allow callers to handle the error
        }
    }
    
    /**
     * Updates the UI for a single post with the latest stats
     * @param {string} postId - The ID of the post to update
     * @param {Object} stats - The post statistics (likes, comments)
     */
    updatePostUI(postId, stats) {
        // Update like counts
        document.querySelectorAll(`[data-post-id="${postId}"] .like-count-display`).forEach(display => {
            display.textContent = stats.likes || '0';
        });

        // Update comment counts
        document.querySelectorAll(`[data-post-id="${postId}"] .comment-count-display`).forEach(display => {
            display.textContent = stats.comments || '0';
        });
    }

    /**
     * Updates the visual state (icon and color) of the like button for a specific post.
     * This needs to check if the current user has liked this specific post.
     * @param {string} postId - The ID of the post.
     */
    /**
     * Updates the visual state of the like button for a specific post
     * @param {string} postId - The ID of the post to update
     */
    async updateLikeButtonState(postId) {
        if (!this.blogInteractionsInstance?.currentUser) {
            // Cannot determine like state without a user or initialized instance
            return;
        }

        const buttons = document.querySelectorAll(`[data-post-id="${postId}"].like-btn-simple`);
        if (!buttons.length) return;

        try {
            // Check if the current user has liked this post
            const likeDocRef = doc(
                this.blogInteractionsInstance.db, 
                'posts', 
                postId, 
                'likes', 
                this.blogInteractionsInstance.currentUser.uid
            );
            
            const likeDoc = await getDoc(likeDocRef);
            const isLiked = likeDoc.exists();
            
            // Update all like buttons for this post
            buttons.forEach(button => {
                this.updateLikeButtonUI(button, isLiked);
            });
            
        } catch (error) {
            console.error(`Error updating like button state for post ${postId}:`, error);
            // Fallback to default state for all buttons if there's an error
            buttons.forEach(button => {
                this.updateLikeButtonUI(button, false);
            });
        }
    }
    
    /**
     * Updates the UI of a like button based on its liked state
     * @param {HTMLElement} button - The like button element
     * @param {boolean} isLiked - Whether the post is liked by the current user
     */
    updateLikeButtonUI(button, isLiked) {
        const icon = button.querySelector('i');
        if (!icon) return;
        
        // Toggle button classes based on like state
        button.classList.toggle('text-blue-600', isLiked);
        button.classList.toggle('text-gray-500', !isLiked);
        
        // Toggle icon classes based on like state
        icon.classList.toggle('fas', isLiked);
        icon.classList.toggle('far', !isLiked);
        
        // Update ARIA attributes for accessibility
        button.setAttribute('aria-pressed', isLiked ? 'true' : 'false');
        button.setAttribute('title', isLiked ? 'Unlike this post' : 'Like this post');
    }


    /**
     * Handles a click event on a "simple like" button on the index page.
     * Toggles the like status and triggers UI updates.
     * @param {HTMLElement} button - The clicked like button element.
     */
    /**
     * Handles click events on like buttons using event delegation
     * @param {Event} event - The click event
     */
    async handleLikeClick(event) {
        // Find the closest like button ancestor of the clicked element
        const button = event.target.closest('.like-btn-simple');
        if (!button) return; // Not a like button click
               
        event.preventDefault();
        
        const postId = button.dataset.postId;
        if (!postId || !this.blogInteractionsInstance) return;

        try {
            // Toggle the like status for this post
            await this.blogInteractionsInstance.toggleLike(postId);
            
            // Re-fetch and update the stats for all posts after like/unlike
            await this.updateAllPostStats();
            
            // Add visual feedback
            const originalTransform = button.style.transform;
            button.style.transform = 'scale(1.1)';
            
            // Reset animation after a short delay
            setTimeout(() => {
                button.style.transform = originalTransform || '';
            }, 150);
            
        } catch (error) {
            console.error(`Error handling like for post ${postId}:`, error);
            this.blogInteractionsInstance.showFeedback('Failed to like post. Please try again.');
        }
    }

    /**
     * Binds all necessary DOM event listeners for the blog index page.
     */
    /**
     * Handles visibility change events to refresh stats when the page becomes visible
     */
    handleVisibilityChange() {
        if (!document.hidden && this.blogInteractionsInstance) {
            this.updateAllPostStats().catch(console.error);
        }
    }

    /**
     * Handles window focus events to refresh stats when the window regains focus
     */
    handleWindowFocus() {
        if (this.blogInteractionsInstance) {
            this.updateAllPostStats().catch(console.error);
        }
    }

    /**
     * Binds all necessary DOM event listeners for the blog index page
     */
    bindEvents() {
        // Use event delegation for like buttons
        document.body.addEventListener('click', this.handleLikeClick);
        
        // Add visibility and focus event listeners
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
        window.addEventListener('focus', this.handleWindowFocus);
        
        // Cleanup function to be called when needed
        this.cleanup = () => {
            document.body.removeEventListener('click', this.handleLikeClick);
            document.removeEventListener('visibilitychange', this.handleVisibilityChange);
            window.removeEventListener('focus', this.handleWindowFocus);
        };
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
            this.updatePostStats(postId);
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
    // Create an instance of BlogIndex without exposing it globally
    const blogIndex = new BlogIndex();
    
    // Store the instance in a non-global way if needed for debugging
    if (process.env.NODE_ENV === 'development') {
        // Only expose in development for debugging
        window.__blogIndex = blogIndex;
    }
});

export { BlogIndex };
// No module.exports for ES Modules in browser