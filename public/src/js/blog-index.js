// blog-index.js

// Import common components initialization
import { initCommonComponents } from './common-components.js';

// Import the BlogInteractions class directly
import { BlogInteractions } from './blog-interactions.js'; // Ensure this path is correct

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
        // Store the instance of BlogInteractions
        this.blogInteractionsInstance = null; 
        this.init();
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
    async updateAllPostStats() {
        if (!this.blogInteractionsInstance) {
            console.warn('Cannot update post stats: BlogInteractions instance is not available.');
            return;
        }

        // Fetch and update stats for each post concurrently
        const updatePromises = this.postIds.map(async postId => {
            try {
                // Use the getPostStats method from the BlogInteractions instance
                const stats = await this.blogInteractionsInstance.getPostStats(postId);

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

                // Update like button states based on the current user's likes
                // This requires checking the current user's like status for this specific post.
                this.updateLikeButtonState(postId);

            } catch (error) {
                console.error(`Failed to update stats for post ${postId}:`, error);
                // Optionally, display a fallback or error message on the UI
            }
        });
        await Promise.all(updatePromises);
    }

    /**
     * Updates the visual state (icon and color) of the like button for a specific post.
     * This needs to check if the current user has liked this specific post.
     * @param {string} postId - The ID of the post.
     */
    updateLikeButtonState(postId) {
        if (!this.blogInteractionsInstance || !this.blogInteractionsInstance.currentUser) {
            // Cannot determine like state without a user or initialized instance
            return;
        }

        // The BlogInteractions instance's postDataCache holds data for the *current* page.
        // For the index page, we need to know if the *current user* has liked *each* post displayed.
        // This means we need to fetch the like status for each post individually if not already in cache.
        // However, the `getPostStats` already fetches the count. To get *if the user liked it*,
        // we'd need to query the `likes` subcollection for the current user's UID for each post.
        // A simpler approach for the index page is to rely on the `getPostStats` to just show count,
        // and let the individual blog post page handle the "liked" state.
        // If you absolutely need the "liked" state on the index page, you'd need to extend
        // `getPostStats` to also return `isLikedByCurrentUser` or perform another query.

        // For now, let's assume `blogInteractionsInstance.getPostData()` is only relevant for the *current* page.
        // To accurately reflect the like status on the index page, we'd need to query each post's likes subcollection
        // for the current user's UID. This can become chatty.

        // A more efficient way for the index page to show if *current user* liked it:
        // When `getPostStats` is called, it could also fetch `postDocRef.collection('likes').doc(this.blogInteractionsInstance.currentUser).get()`
        // and return a boolean `isLikedByCurrentUser`.

        // Since `getPostStats` currently only returns `likes` and `comments` counts,
        // and `postDataCache` is for the *current single blog post*,
        // we need to adapt this or accept that the index page buttons won't show "liked" state
        // unless they are on the actual blog post page.

        // Let's modify `getPostStats` in `blog-interactions.js` to also return `isLikedByCurrentUser`.
        // Assuming `getPostStats` now returns `{ likes: count, comments: count, isLikedByCurrentUser: boolean }`

        // This function will be called after `updatePostStats` which awaits `getPostStats`.
        // So, we need to access the `isLikedByCurrentUser` from the `stats` object.
        // However, `updatePostStats` passes `stats` to `likeDisplays` and `commentDisplays`,
        // but `updateLikeButtonState` is called separately.

        // Re-thinking: The `updateLikeUI` in `blog-interactions.js` already handles the button state
        // for the *current* page's post. For the index page, we need to explicitly check.

        // Let's make `updateLikeButtonState` fetch the specific post's data for the current user.
        // This will make it work, but be aware it adds a read for each post on the index page.
        const buttons = document.querySelectorAll(`[data-post-id="${postId}"].like-btn-simple`);
        buttons.forEach(async button => { // Make this async to await Firestore call
            const icon = button.querySelector('i');
            try {
                // Fetch the specific like document for this post and current user
                const likeDocRef = doc(this.blogInteractionsInstance.db, 'posts', postId, 'likes', this.blogInteractionsInstance.currentUser);
                const likeDoc = await getDoc(likeDocRef);
                const isLiked = likeDoc.exists();

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
            } catch (error) {
                console.error(`Error updating like button state for post ${postId}:`, error);
                // Fallback to default state if error
                button.classList.remove('text-blue-600', 'liked');
                button.classList.add('text-gray-500');
                if (icon) {
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                }
            }
        });
    }


    /**
     * Handles a click event on a "simple like" button on the index page.
     * Toggles the like status and triggers UI updates.
     * @param {HTMLElement} button - The clicked like button element.
     */
    async handleLikeClick(button) {
        const postId = button.dataset.postId;

        if (postId && this.blogInteractionsInstance) {
            try {
                // Call the toggleLike method on the BlogInteractions instance
                // We need to pass the postId to toggleLike if it's not the current page's postId
                // The toggleLike method in blog-interactions.js is currently designed for the *current* page's postId.
                // We need to modify toggleLike in blog-interactions.js to accept a postId parameter.
                await this.blogInteractionsInstance.toggleLike(postId); // Pass postId here

                // Re-fetch and update the stats for the specific post after like/unlike
                await this.updatePostStats(postId); 

                // Immediate visual feedback (animation)
                button.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    button.style.transform = 'scale(1)';
                }, 150);
            } catch (error) {
                console.error(`Error handling like for post ${postId}:`, error);
                this.blogInteractionsInstance.showFeedback('Failed to like post. Please try again.');
            }
        }
    }

    /**
     * Binds all necessary DOM event listeners for the blog index page.
     */
    bindEvents() {
        document.addEventListener('click', async (e) => {
            if (e.target.closest('.like-btn-simple')) {
                e.preventDefault();
                const button = e.target.closest('.like-btn-simple');
                await this.handleLikeClick(button);
            }
        });

        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.blogInteractionsInstance) {
                this.updateAllPostStats();
            }
        });

        window.addEventListener('focus', () => {
            if (this.blogInteractionsInstance) {
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
    window.blogIndex = new BlogIndex();
});

// No module.exports for ES Modules in browser