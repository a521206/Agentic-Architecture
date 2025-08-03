// blog-interactions.js

// Import Firebase services from your centralized config file
import { db, auth } from './firebase-config.js';
import { serverTimestamp, collection, doc, getDoc, getDocs, setDoc, deleteDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/**
 * Blog Interactions System
 * Handles likes, comments, and engagement for blog posts
 * Uses Cloud Firestore for data persistence.
 */
class BlogInteractions {
    constructor() {
        this.db = db; // Firestore instance
        this.auth = auth; // Auth instance
        this.postId = this.getPostId(); // Determine post ID from URL
        this.currentUser = null; // Will be set by auth state observer (Firebase UID)
        this.isAuthReady = false; // Flag to indicate if auth state is known

        // Local cache for post data, updated by Firestore listeners
        // This will store the actual likes (array of user UIDs) and comments (array of comment objects)
        this.postDataCache = {
            likes: [],
            comments: []
        };

        this.init();
    }

    /**
     * Initializes the BlogInteractions system.
     * Ensures user authentication, sets up Firestore listeners, and binds events.
     */
    async init() {
        // Ensure user is authenticated before setting up listeners
        // This makes sure this.currentUser is populated with a UID
        await this.ensureAuthenticatedUser();

        // Set up real-time listeners for the current post's data
        this.listenForPostData();
        
        this.bindEvents(); // Bind DOM events
        // Initial UI update. This will be quickly overwritten by the listeners
        // once data arrives from Firestore.
        this.updateUI(); 
    }

    /**
     * Ensures a Firebase authenticated user exists.
     * Attempts anonymous sign-in if no user is currently authenticated.
     * Sets `this.currentUser` to the user's UID and `this.isAuthReady` to true.
     * @returns {Promise<void>} A promise that resolves once authentication state is known.
     */
    async ensureAuthenticatedUser() {
        return new Promise(resolve => {
            // onAuthStateChanged is the recommended way to get the current user.
            // It fires once on page load (with current user or null) and then again on any auth state change.
            this.auth.onAuthStateChanged(async (user) => {
                if (user) {
                    // User is signed in (could be anonymous or another provider)
                    this.currentUser = user.uid;
                    console.log('User is signed in with UID:', this.currentUser);
                    this.isAuthReady = true;
                    resolve();
                } else {
                    // No user signed in, attempt anonymous sign-in
                    try {
                        const userCredential = await this.auth.signInAnonymously();
                        this.currentUser = userCredential.user.uid;
                        console.log('Signed in anonymously with UID:', this.currentUser);
                        this.isAuthReady = true;
                        resolve();
                    } catch (error) {
                        console.error('Anonymous authentication failed:', error);
                        this.currentUser = null; // Explicitly set to null if auth fails
                        this.isAuthReady = true;
                        // Even if auth fails, resolve so the app can continue (perhaps with disabled interaction features)
                        resolve();
                    }
                }
            });
        });
    }

    /**
     * Sets up real-time listeners for likes and comments of the current blog post.
     * Updates `postDataCache` and triggers UI updates on data changes.
     */
    listenForPostData() {
        // Ensure Firestore instance and Post ID are available
        if (!this.db || !this.postId) {
            console.warn("Firestore or Post ID not ready for listening. Interactions might not be real-time.");
            return;
        }

        const postDocRef = doc(this.db, 'posts', this.postId);

        // Listen for real-time changes to the 'likes' subcollection
        onSnapshot(collection(postDocRef, 'likes'), snapshot => {
            // Map documents to their IDs (which are the user UIDs who liked)
            const likes = snapshot.docs.map(doc => doc.id); 
            this.postDataCache.likes = likes;
            this.updateLikeUI(); // Update UI for likes
        }, error => {
            console.error("Error listening to likes:", error);
            this.showFeedback('Failed to load likes. Please refresh.');
        });

        // Listen for real-time changes to the 'comments' subcollection, ordered by timestamp
        onSnapshot(query(collection(postDocRef, 'comments'), orderBy('timestamp', 'desc')), snapshot => {
            // Map documents to their data, including their Firestore document ID
            const comments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.postDataCache.comments = comments;
            this.updateCommentsUI(); // Update UI for comments
        }, error => {
            console.error("Error listening to comments:", error);
            this.showFeedback('Failed to load comments. Please refresh.');
        });
    }

    /**
     * Extracts the post ID from the current page's URL.
     * @returns {string} The post ID.
     */
    getPostId() {
        const path = window.location.pathname;
        const filename = path.split('/').pop().replace('.html', '');
        return filename || 'unknown-post'; // Fallback for root or unexpected paths
    }

    /**
     * Gets the current post data from the local cache.
     * This cache is kept in sync by the Firestore `onSnapshot` listeners.
     * @returns {object} The cached post data (likes and comments).
     */
    getPostData() {
        return this.postDataCache;
    }

    /**
     * Toggles the like status for the current post.
     * Creates or deletes a like document in Firestore.
     * @returns {Promise<void>}
     */
    async toggleLike() {
        // Ensure user is authenticated before allowing interaction
        if (!this.isAuthReady || !this.currentUser) {
            this.showFeedback('Please wait for authentication or sign in to like posts.');
            return;
        }

        const likeDocRef = doc(collection(doc(this.db, 'posts', this.postId), 'likes'), this.currentUser);

        try {
            const likeDoc = await likeDocRef.get();
            if (likeDoc.exists) {
                await likeDocRef.delete(); // User has liked, so unlike
                this.showFeedback('Like removed!');
            } else {
                await likeDocRef.set({
                    timestamp: serverTimestamp() // Use Firestore server timestamp
                }); // User has not liked, so like
                this.showFeedback('Post liked!');
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            this.showFeedback('Failed to update like. Please check console for details.');
        }
        // UI will be automatically updated by the onSnapshot listener for likes
    }

    /**
     * Adds a new comment to the current post.
     * @param {string} commentText - The text of the comment.
     * @param {string} [authorName='Anonymous'] - The author's name.
     * @returns {Promise<boolean>} True if comment was added, false otherwise.
     */
    async addComment(commentText, authorName = 'Anonymous') {
        // Ensure user is authenticated and comment text is not empty
        if (!this.isAuthReady || !this.currentUser) {
            this.showFeedback('Please wait for authentication or sign in to comment.');
            return false;
        }
        if (!commentText.trim()) {
            this.showFeedback('Comment cannot be empty.');
            return false;
        }

        try {
            await setDoc(doc(collection(doc(this.db, 'posts', this.postId), 'comments'), Date.now().toString()), {
                text: commentText.trim(),
                author: authorName.trim() || 'Anonymous',
                userId: this.currentUser, // Store the Firebase UID
                timestamp: serverTimestamp(), // Use Firestore server timestamp
                likes: [] // Initialize comment likes as an empty array
            });
            this.showFeedback('Comment added successfully!');
            return true;
        } catch (error) {
            console.error('Error adding comment:', error);
            this.showFeedback('Failed to add comment. Please check console for details.');
            return false;
        }
        // UI will be automatically updated by the onSnapshot listener for comments
    }

    /**
     * Deletes a comment from the current post.
     * Only allows deletion if the current user is the author of the comment.
     * @param {string} commentId - The ID of the comment document to delete.
     * @returns {Promise<boolean>} True if comment was deleted, false otherwise.
     */
    async deleteComment(commentId) {
        if (!this.isAuthReady || !this.currentUser) {
            this.showFeedback('Please wait for authentication to delete comments.');
            return false;
        }

        const commentDocRef = doc(collection(doc(this.db, 'posts', this.postId), 'comments'), commentId);

        try {
            const doc = await commentDocRef.get();
            if (doc.exists && doc.data().userId === this.currentUser) {
                await commentDocRef.delete();
                this.showFeedback('Comment deleted!');
                return true;
            } else {
                this.showFeedback('You can only delete your own comments.');
                return false;
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
            this.showFeedback('Failed to delete comment. Please check console for details.');
            return false;
        }
        // UI will be automatically updated by the onSnapshot listener for comments
    }

    /**
     * Toggles the like status for a specific comment.
     * Updates the 'likes' array within the comment document in Firestore.
     * @param {string} commentId - The ID of the comment to like/unlike.
     * @returns {Promise<void>}
     */
    async toggleCommentLike(commentId) {
        if (!this.isAuthReady || !this.currentUser) {
            this.showFeedback('Please wait for authentication to like comments.');
            return;
        }

        const commentDocRef = doc(collection(doc(this.db, 'posts', this.postId), 'comments'), commentId);

        try {
            const commentDoc = await commentDocRef.get();
            if (commentDoc.exists) {
                const currentLikes = commentDoc.data().likes || []; // Ensure it's an array
                const userIndex = currentLikes.indexOf(this.currentUser);
                
                let newLikes;
                if (userIndex > -1) {
                    newLikes = currentLikes.filter(uid => uid !== this.currentUser); // User has liked, so remove
                } else {
                    newLikes = [...currentLikes, this.currentUser]; // User has not liked, so add
                }
                
                await commentDocRef.update({ likes: newLikes });
            }
        } catch (error) {
            console.error('Error toggling comment like:', error);
            this.showFeedback('Failed to update comment like. Please try again.');
        }
        // UI will be automatically updated by the onSnapshot listener for comments
    }

    /**
     * Binds all necessary DOM event listeners for interactions.
     * Uses event delegation for efficiency.
     */
    bindEvents() {
        // Event delegation for all interaction buttons (like, comment submit, delete, comment like)
        document.addEventListener('click', async (e) => {
            if (e.target.closest('.like-btn')) {
                e.preventDefault();
                await this.toggleLike();
            } else if (e.target.closest('.comment-submit-btn')) {
                e.preventDefault();
                await this.handleCommentSubmit();
            } else if (e.target.closest('.comment-delete-btn')) {
                e.preventDefault();
                const commentId = e.target.closest('.comment-delete-btn').dataset.commentId;
                await this.deleteComment(commentId);
            } else if (e.target.closest('.comment-like-btn')) {
                e.preventDefault();
                const commentId = e.target.closest('.comment-like-btn').dataset.commentId;
                await this.toggleCommentLike(commentId);
            }
        });

        // Character counter for comment input
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('comment-input')) {
                const counter = document.querySelector('.character-counter .current-count');
                const counterContainer = document.querySelector('.character-counter');
                const length = e.target.value.length;

                if (counter) {
                    counter.textContent = length;
                    counterContainer.classList.remove('warning', 'error');
                    if (length > 400) {
                        counterContainer.classList.add('warning');
                    }
                    if (length >= 500) {
                        counterContainer.classList.add('error');
                    }
                }
            }
        });

        // Comment form enter key (Ctrl+Enter to submit)
        document.addEventListener('keydown', async (e) => {
            if (e.target.classList.contains('comment-input') && e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                await this.handleCommentSubmit();
            }
        });
    }

    /**
     * Handles the submission of a new comment from the form.
     * @returns {Promise<void>}
     */
    async handleCommentSubmit() {
        const commentInput = document.querySelector('.comment-input');
        const authorInput = document.querySelector('.comment-author-input');
        
        if (commentInput) {
            const commentText = commentInput.value;
            const authorName = authorInput ? authorInput.value : 'Anonymous';
            
            if (await this.addComment(commentText, authorName)) {
                commentInput.value = ''; // Clear comment input
                if (authorInput) authorInput.value = ''; // Clear author input
            }
        }
    }

    /**
     * Updates the UI elements related to post likes.
     */
    updateLikeUI() {
        const likes = this.postDataCache.likes;
        const likeCount = likes.length;
        const isLiked = likes.includes(this.currentUser);
        
        const likeBtn = document.querySelector('.like-btn');
        const likeCountDisplay = document.querySelector('.like-count');
        
        // Update the main like button on the blog post page
        if (likeBtn) {
            const icon = likeBtn.querySelector('i');
            if (isLiked) {
                likeBtn.classList.add('liked', 'text-blue-600');
                likeBtn.classList.remove('text-gray-500');
                if (icon) {
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                }
            } else {
                likeBtn.classList.remove('liked', 'text-blue-600');
                likeBtn.classList.add('text-gray-500');
                if (icon) {
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                }
            }
        }
        
        if (likeCountDisplay) {
            likeCountDisplay.textContent = likeCount;
        }

        // Update like counts and button states for simple like buttons on the index page
        const simpleLikeDisplays = document.querySelectorAll(`[data-post-id="${this.postId}"] .like-count-display`);
        simpleLikeDisplays.forEach(display => {
            display.textContent = likeCount;
        });

        const simpleLikeButtons = document.querySelectorAll(`[data-post-id="${this.postId}"] .like-btn-simple`);
        simpleLikeButtons.forEach(button => {
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

    /**
     * Updates the UI elements related to post comments.
     */
    updateCommentsUI() {
        const comments = this.postDataCache.comments;
        const commentsContainer = document.querySelector('.comments-list');
        const commentCountDisplay = document.querySelector('.comment-count');
        
        if (commentCountDisplay) {
            commentCountDisplay.textContent = comments.length;
        }
        
        if (commentsContainer) {
            commentsContainer.innerHTML = this.renderComments(comments);
        }

        // Update comment counts for simple comment displays on the index page
        const simpleCommentDisplays = document.querySelectorAll(`[data-post-id="${this.postId}"] .comment-count-display`);
        simpleCommentDisplays.forEach(display => {
            display.textContent = comments.length;
        });
    }

    /**
     * Renders the HTML for comments based on the provided comments array.
     * @param {Array<object>} comments - An array of comment objects.
     * @returns {string} The HTML string for the comments list.
     */
    renderComments(comments) {
        if (comments.length === 0) {
            return '<p class="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>';
        }
        
        return comments.map(comment => {
            // Ensure comment.userId is used for comparison
            const isOwner = this.currentUser && comment.userId === this.currentUser;
            const isLiked = this.currentUser && (comment.likes || []).includes(this.currentUser);
            // Convert Firestore Timestamp to JavaScript Date for getTimeAgo
            const timeAgo = this.getTimeAgo(comment.timestamp ? comment.timestamp.toDate() : new Date()); 
            
            return `
                <div class="comment bg-gray-50 rounded-lg p-4 mb-4">
                    <div class="flex justify-between items-start mb-2">
                        <div class="flex items-center gap-2">
                            <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                ${this.escapeHtml(comment.author.charAt(0).toUpperCase())}
                            </div>
                            <div>
                                <span class="font-semibold text-gray-900">${this.escapeHtml(comment.author)}</span>
                                <span class="text-gray-500 text-sm ml-2">${timeAgo}</span>
                            </div>
                        </div>
                        ${isOwner ? `<button class="comment-delete-btn text-red-500 hover:text-red-700 text-sm" data-comment-id="${comment.id}"><i class="fas fa-trash"></i></button>` : ''}
                    </div>
                    <p class="text-gray-700 mb-3">${this.escapeHtml(comment.text)}</p>
                    <div class="flex items-center gap-4">
                        <button class="comment-like-btn flex items-center gap-1 text-sm ${isLiked ? 'text-blue-600' : 'text-gray-500'} hover:text-blue-600" data-comment-id="${comment.id}">
                            <i class="${isLiked ? 'fas' : 'far'} fa-heart"></i>
                            <span>${(comment.likes || []).length}</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Updates all UI elements on the page.
     * This method is now primarily a wrapper to trigger sub-UI updates.
     */
    updateUI() {
        this.updateLikeUI();
        this.updateCommentsUI();
    }

    /**
     * Displays a temporary feedback message to the user.
     * @param {string} message - The message to display.
     */
    showFeedback(message) {
        let feedback = document.querySelector('.blog-feedback');
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.className = 'blog-feedback fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
            document.body.appendChild(feedback);
        }
        
        feedback.textContent = message;
        feedback.classList.remove('translate-x-full');
        
        setTimeout(() => {
            feedback.classList.add('translate-x-full');
        }, 3000);
    }

    /**
     * Calculates and returns a human-readable "time ago" string.
     * @param {Date} date - The date object to calculate from.
     * @returns {string} The time ago string.
     */
    getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    }

    /**
     * Escapes HTML entities in a string to prevent XSS attacks.
     * @param {string} text - The text to escape.
     * @returns {string} The HTML-escaped string.
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Gets the current like and comment counts for a given post ID.
     * This method is used by the index page to display stats without loading all data.
     * It performs a one-time fetch, not a real-time listen.
     * @param {string} postId - The ID of the post.
     * @returns {Promise<object>} A promise that resolves with an object containing likes and comments count.
     */
    getPostStats(postId) {
        if (!this.db) {
            console.warn("Firestore not initialized for getting post stats.");
            return Promise.resolve({ likes: 0, comments: 0 });
        }

        const postDocRef = doc(this.db, 'posts', postId);
        
        return new Promise(async (resolve, reject) => {
            try {
                // Fetch likes count
                const likesSnapshot = await getDocs(collection(postDocRef, 'likes'));
                const likesCount = likesSnapshot.size;

                // Fetch comments count
                const commentsSnapshot = await getDocs(collection(postDocRef, 'comments'));
                const commentsCount = commentsSnapshot.size;

                resolve({ likes: likesCount, comments: commentsCount });
            } catch (error) {
                console.error(`Error fetching stats for post ${postId}:`, error);
                reject(error);
            }
        });
    }

    // Static methods for generating HTML (unchanged as they are pure HTML strings)
    static generateInteractionsHTML(postId = null) {
        const id = postId || 'current-post';
        return `
            <!-- Blog Interactions Section -->
            <div class="blog-interactions bg-white rounded-2xl shadow-lg p-6 mt-8">
                <!-- Engagement Stats -->
                <div class="engagement-stats">
                    <div class="engagement-stat">
                        <i class="fas fa-heart"></i>
                        <span class="like-count">0</span>
                        <span>likes</span>
                    </div>
                    <div class="engagement-stat">
                        <i class="fas fa-comment"></i>
                        <span class="comment-count">0</span>
                        <span>comments</span>
                    </div>
                </div>

                <!-- Interaction Buttons -->
                <div class="interaction-buttons">
                    <button class="like-btn text-gray-500 hover:text-blue-600" data-post-id="${id}">
                        <i class="far fa-heart"></i>
                        <span>Like</span>
                    </button>
                    <button class="comment-toggle-btn text-gray-500 hover:text-blue-600" onclick="toggleComments()">
                        <i class="far fa-comment"></i>
                        <span>Comment</span>
                    </button>
                </div>

                <!-- Comments Container -->
                <div class="comments-container" id="comments-container">
                    <!-- Comment Form -->
                    <div class="comment-form">
                        <h4 class="text-lg font-semibold text-gray-900 mb-4">Leave a Comment</h4>
                        <div class="space-y-4">
                            <div>
                                <label for="comment-author" class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input type="text" id="comment-author" class="comment-author-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Your name" maxlength="50">
                            </div>
                            <div>
                                <label for="comment-text" class="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                                <textarea id="comment-text" class="comment-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Share your thoughts..." rows="4" maxlength="500"></textarea>
                                <div class="character-counter">
                                    <span class="current-count">0</span>/500 characters
                                </div>
                            </div>
                            <div class="flex justify-between items-center">
                                <p class="text-sm text-gray-500">Press Ctrl+Enter to submit quickly</p>
                                <button class="comment-submit-btn bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium">
                                    <i class="fas fa-paper-plane mr-2"></i>
                                    Post Comment
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Comments List -->
                    <div class="comments-list">
                        <!-- Comments will be dynamically loaded here -->
                    </div>
                </div>
            </div>
        `;
    }

    static generateSimpleInteractionsHTML(postId) {
        return `
            <div class="flex items-center gap-4 text-sm text-gray-500 mt-4">
                <button class="like-btn-simple flex items-center gap-1 hover:text-blue-600 transition-colors" data-post-id="${postId}">
                    <i class="far fa-heart"></i>
                    <span class="like-count-simple">0</span>
                </button>
                <div class="flex items-center gap-1">
                    <i class="far fa-comment"></i>
                    <span class="comment-count-simple">0</span>
                </div>
            </div>
        `;
    }
}

// Global function for toggling comments visibility (used by onclick in HTML)
window.toggleComments = function() {
    const container = document.getElementById('comments-container');
    const toggleBtn = document.querySelector('.comment-toggle-btn span');

    if (container.classList.contains('open')) {
        container.classList.remove('open');
        toggleBtn.textContent = 'Comment';
    } else {
        container.classList.add('open');
        toggleBtn.textContent = 'Hide Comments';
    }
};

// Global function to initialize blog interactions on any page
// This function will be called from other scripts (e.g., index-init.js or the individual blog post page script)
window.initBlogInteractions = async function() {
    if (!window.blogInteractions) {
        window.blogInteractions = new BlogInteractions();
    }
    // No need to await getCurrentUser or init() here, as it's done in the constructor of BlogInteractions
};

// Initialize when DOM is loaded (for character counter, not the main BlogInteractions class itself)
document.addEventListener('DOMContentLoaded', () => {
    // Character counter for comment input
    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('comment-input')) {
            const counter = document.querySelector('.character-counter .current-count');
            const counterContainer = document.querySelector('.character-counter');
            const length = e.target.value.length;

            if (counter) {
                counter.textContent = length;

                // Update counter styling based on length
                counterContainer.classList.remove('warning', 'error');
                if (length > 400) {
                    counterContainer.classList.add('warning');
                }
                if (length >= 500) {
                    e.target.value = e.target.value.substring(0, 500); // Truncate if over limit
                    counterContainer.classList.add('error');
                }
            }
        }
    });
});

// Export for use in other scripts (e.g., for testing or if bundled)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlogInteractions;
}