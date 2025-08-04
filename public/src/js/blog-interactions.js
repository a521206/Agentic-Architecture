// blog-interactions.js

// Import Firebase service instances and functions from the modular SDK
import { db, auth } from './firebase-config.js';
import { 
    serverTimestamp, 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    setDoc, 
    deleteDoc, 
    onSnapshot, 
    query, 
    orderBy,
    updateDoc
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

import { 
    onAuthStateChanged, 
    signInAnonymously 
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js'; 

/**
 * Blog Interactions System
 * Handles likes, comments, and engagement for blog posts
 * Uses Cloud Firestore for data persistence.
 */
export class BlogInteractions { // Export the class directly
    constructor() {
        this.db = db; // Firestore instance
        this.auth = auth; // Auth instance
        this.postId = this.getPostId(); // Determine post ID from URL
        this.currentUser = null; // Will be set by auth state observer (Firebase UID)
        this.isAuthReady = false; // Flag to indicate if auth state is known

        // Local cache for post data, updated by Firestore listeners
        this.postDataCache = {
            likes: []
        };

        // Bind methods that will be used as event handlers
        this.handleClick = this.handleClick.bind(this);

        this.init(); // Call init in constructor
    }

    /**
     * Initializes the BlogInteractions system.
     * Ensures user authentication, sets up Firestore listeners, and binds events.
     */
    async init() {
        await this.ensureAuthenticatedUser(); // Ensure user is authenticated
        this.listenForPostData(); // Set up real-time listeners
        this.bindEvents(); // Bind DOM events
        this.updateUI(); // Initial UI update
    }

    /**
     * Ensures a Firebase authenticated user exists.
     * Attempts anonymous sign-in if no user is currently authenticated.
     * Sets `this.currentUser` to the user's UID and `this.isAuthReady` to true.
     * @returns {Promise<void>} A promise that resolves once authentication state is known.
     */
    async ensureAuthenticatedUser() {
        return new Promise(resolve => {
            onAuthStateChanged(this.auth, async (user) => { 
                if (user) {
                    this.currentUser = user.uid;
                    console.log('User is signed in with UID:', this.currentUser);
                    this.isAuthReady = true;
                    resolve();
                } else {
                    try {
                        const userCredential = await signInAnonymously(this.auth); 
                        this.currentUser = userCredential.user.uid;
                        console.log('Signed in anonymously with UID:', this.currentUser);
                        this.isAuthReady = true;
                        resolve();
                    } catch (error) {
                        console.error('Anonymous authentication failed:', error);
                        this.currentUser = null; 
                        this.isAuthReady = true;
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
        if (!this.db || !this.postId) {
            console.warn("Firestore or Post ID not ready for listening. Interactions might not be real-time.");
            return;
        }

        const postDocRef = doc(this.db, 'posts', this.postId);

        onSnapshot(collection(postDocRef, 'likes'), snapshot => {
            const likes = snapshot.docs.map(doc => doc.id); 
            this.postDataCache.likes = likes;
            this.updateLikeUI(); 
        }, error => {
            console.error("Error listening to likes:", error);
            this.showFeedback('Failed to load likes. Please refresh.');
        });
    }

    /**
     * Extracts the post ID from the current page's URL.
     * @returns {string} The post ID.
     */
    getPostId() {
        const path = window.location.pathname;
        const filename = path.split('/').pop().replace('.html', '');
        return filename || 'unknown-post'; 
    }

    /**
     * Gets the current post data from the local cache.
     * @returns {object} The cached post data (likes and comments).
     */
    getPostData() {
        return this.postDataCache;
    }

    /**
     * Toggles the like status for the current post.
     * @returns {Promise<void>}
     */
    async toggleLike() {
        if (!this.isAuthReady || !this.currentUser) {
            this.showFeedback('Please wait for authentication or sign in to like posts.');
            return;
        }

        const likeDocRef = doc(collection(doc(this.db, 'posts', this.postId), 'likes'), this.currentUser);

        try {
            const likeDoc = await getDoc(likeDocRef); 
            if (likeDoc.exists()) { 
                await deleteDoc(likeDocRef); 
                this.showFeedback('Like removed!');
            } else {
                await setDoc(likeDocRef, { 
                    timestamp: serverTimestamp() 
                }); 
                this.showFeedback('Post liked!');
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            this.showFeedback('Failed to update like. Please check console for details.');
        }
    }



    /**
     * Binds all necessary DOM event listeners for interactions.
     */
    bindEvents() {
        // Use event delegation with a single click handler
        document.body.addEventListener('click', this.handleClick.bind(this));
    }

    /**
     * Handles click events for the blog interactions
     * @private
     */
    handleClick(e) {
        // Handle like button click
        const likeBtn = e.target.closest('.like-btn');
        if (likeBtn) {
            e.preventDefault();
            // Update current post ID from the clicked button's data attribute
            const postId = likeBtn.dataset.postId;
            if (postId) {
                this.postId = postId;
            }
            this.toggleLike();
            return;
        }
    }

    /**
     * Handles the submission of a new comment from the form.
     * @returns {Promise<void>}
     */


    /**
     * Updates the UI elements related to post likes.
     */
    updateLikeUI() {
        const likes = this.postDataCache.likes;
        const likeCount = likes.length;
        const isLiked = likes.includes(this.currentUser);
        
        const likeBtn = document.querySelector('.like-btn');
        const likeCountDisplay = document.querySelector('.like-count');
        
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
     * Updates all UI elements on the page.
     */
    updateUI() {
        this.updateLikeUI();
    }

    /**
     * Displays a temporary feedback message to the user.
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
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Gets the current like and comment counts for a given post ID.
     * @returns {Promise<object>} A promise that resolves with an object containing likes and comments count.
     */
    getPostStats(postId) {
        if (!this.db) {
            console.warn("Firestore not initialized for getting post stats.");
            return Promise.resolve({ likes: 0 });
        }

        const postDocRef = doc(this.db, 'posts', postId);
        
        return new Promise(async (resolve, reject) => {
            try {
                const likesSnapshot = await getDocs(collection(postDocRef, 'likes'));
                const likesCount = likesSnapshot.size;

                resolve({ likes: likesCount });
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
            <div class="blog-interactions bg-white rounded-2xl shadow-lg p-6 mt-8" data-blog-interactions>
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
                    <button class="comment-toggle-btn text-gray-500 hover:text-blue-600" data-action="toggle-comments">
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Disable comment form inputs on page load
    document.querySelectorAll('.comment-input, .comment-author-input, .comment-submit-btn')
        .forEach(el => {
            el.disabled = true;
            el.placeholder = 'Comments are temporarily disabled';
        });
    
    // Create a single instance of BlogInteractions
    const blogInteractions = new BlogInteractions();
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