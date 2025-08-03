// Import Firebase configuration
import { initializeFirebase, isFirebaseReady, db, auth } from './firebase-config.js';

/**
 * Blog Interactions System
 * Handles likes, comments, and engagement for blog posts
 * Uses Cloud Firestore for data persistence with localStorage fallback
 */

class BlogInteractions {
    constructor() {
        this.storageKey = 'blog-interactions';
        this.data = {};
        this.currentUser = this.getCurrentUser();
        this.db = null;
        this.isFirebaseReady = false;
        this.init();
    }

    // Initialize the system
    async init() {
        await this.initFirebase();
        this.bindEvents();
        await this.loadData();
        this.updateUI();
    }

    // Initialize Firebase/Firestore using the centralized configuration
    async initFirebase() {
        try {
            // Get services from firebase-config
            const { db: firestoreDb, auth: firebaseAuth } = initializeFirebase();
            
            if (firestoreDb && firebaseAuth) {
                this.db = firestoreDb;
                this.auth = firebaseAuth;
                this.isFirebaseReady = true;
                console.log('Firebase services initialized successfully');
                
                // Set up auth state observer
                this.setupAuthStateObserver();
            } else {
                console.warn('Firebase initialization failed. Falling back to localStorage.');
                this.isFirebaseReady = false;
            }
        } catch (error) {
            console.error('Error initializing Firebase:', error);
            this.isFirebaseReady = false;
        }
    }

    // Load data from Firestore or localStorage fallback
    async loadData() {
        if (this.isFirebaseReady) {
            try {
                const snapshot = await this.db.collection('blog-interactions').get();
                const firestoreData = {};

                snapshot.forEach(doc => {
                    firestoreData[doc.id] = doc.data();
                });

                this.data = firestoreData;
                console.log('Data loaded from Firestore');
                return;
            } catch (error) {
                console.error('Error loading from Firestore:', error);
            }
        }

        // Fallback to localStorage
        try {
            const stored = localStorage.getItem(this.storageKey);
            this.data = stored ? JSON.parse(stored) : {};
            console.log('Data loaded from localStorage (fallback)');
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            this.data = {};
        }
    }

    // Save data to Firestore or localStorage fallback
    async saveData(retryCount = 0) {
        const MAX_RETRIES = 3;
        const RETRY_DELAY_MS = 1000; // 1 second

        if (this.isFirebaseReady) {
            try {
                // Save each post's data as a separate document
                const batch = this.db.batch();
                const collectionRef = this.db.collection('blog-interactions');

                for (const [postId, postData] of Object.entries(this.data)) {
                    const docRef = collectionRef.doc(postId);
                    batch.set(docRef, {
                        ...postData,
                        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
                }

                // Add timeout for the operation
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Firestore operation timed out')), 10000);
                });

                // Race between the batch commit and the timeout
                await Promise.race([
                    batch.commit(),
                    timeoutPromise
                ]);
                
                console.log('Data saved to Firestore');
                return true;
            } catch (error) {
                console.error('Error saving to Firestore:', error);
                
                // If it's a network error and we have retries left, try again
                if (error.code === 'unavailable' && retryCount < MAX_RETRIES) {
                    console.log(`Retrying save (${retryCount + 1}/${MAX_RETRIES})...`);
                    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * (retryCount + 1)));
                    return this.saveData(retryCount + 1);
                }
                
                // Log specific error details
                if (error.code === 'permission-denied') {
                    console.error('Firestore Permission Denied. Check your security rules.');
                } else if (error.code === 'resource-exhausted') {
                    console.error('Firestore quota exceeded. Please check your Firebase usage.');
                }
                
                // Fall through to localStorage fallback
            }
        }

        // Fallback to localStorage
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
            console.log('Data saved to localStorage (fallback)');
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    }

    // Get current user (simple implementation - can be enhanced)
    async getCurrentUser() {
        if (this.currentUser) {
            return this.currentUser;
        }

        try {
            // Sign in anonymously
            const userCredential = await firebase.auth().signInAnonymously();
            this.currentUser = userCredential.user.uid;
            console.log('Signed in anonymously with UID:', this.currentUser);
            return this.currentUser;
        } catch (error) {
            console.error('Anonymous authentication failed:', error);
            // Handle error, e.g., by disabling interaction buttons
            return null;
        }
    }

    // Set up authentication state observer
    setupAuthStateObserver() {
        if (!this.auth) return;
        
        this.auth.onAuthStateChanged((user) => {
            if (user) {
                // User is signed in
                this.currentUser = {
                    id: user.uid,
                    name: user.displayName || 'Anonymous',
                    email: user.email,
                    isAuthenticated: true
                };
                console.log('User is signed in:', this.currentUser);
            } else {
                // User is signed out
                const anonymousUser = this.getCurrentUser();
                this.currentUser = {
                    ...anonymousUser,
                    isAuthenticated: false
                };
                console.log('User is signed out, using anonymous user');
            }
            
            // Update UI to reflect authentication state
            this.updateUI();
        });
    }

    // Get post ID from current page
    getPostId() {
        const path = window.location.pathname;
        const filename = path.split('/').pop().replace('.html', '');
        return filename || 'unknown-post';
    }

    // Get post data
    getPostData(postId) {
        if (!this.data[postId]) {
            this.data[postId] = {
                likes: [],
                comments: [],
                likeCount: 0
            };
        }
        return this.data[postId];
    }

    // Toggle like for a post
    async toggleLike(postId) {
        const postData = this.getPostData(postId);
        const userIndex = postData.likes.indexOf(this.currentUser);

        if (userIndex > -1) {
            // Unlike
            postData.likes.splice(userIndex, 1);
        } else {
            // Like
            postData.likes.push(this.currentUser);
        }

        postData.likeCount = postData.likes.length;
        await this.saveData();
        this.updateLikeUI(postId);

        // Show feedback
        this.showFeedback(userIndex > -1 ? 'Like removed' : 'Post liked!');
    }

    // Add comment to a post
    async addComment(postId, commentText, authorName = 'Anonymous') {
        if (!commentText.trim()) return false;

        const postData = this.getPostData(postId);
        const comment = {
            id: Date.now().toString(),
            text: commentText.trim(),
            author: authorName.trim() || 'Anonymous',
            userId: this.currentUser,
            timestamp: new Date().toISOString(),
            likes: []
        };

        postData.comments.unshift(comment); // Add to beginning
        await this.saveData();
        this.updateCommentsUI(postId);

        this.showFeedback('Comment added successfully!');
        return true;
    }

    // Toggle like on comment
    async toggleCommentLike(postId, commentId) {
        const postData = this.getPostData(postId);
        const comment = postData.comments.find(c => c.id === commentId);

        if (comment) {
            const userIndex = comment.likes.indexOf(this.currentUser);
            if (userIndex > -1) {
                comment.likes.splice(userIndex, 1);
            } else {
                comment.likes.push(this.currentUser);
            }
            await this.saveData();
            this.updateCommentsUI(postId);
        }
    }

    // Bind event listeners
    bindEvents() {
        // Like button clicks
        document.addEventListener('click', async (e) => {
            if (e.target.closest('.like-btn')) {
                e.preventDefault();
                const postId = this.getPostId();
                await this.toggleLike(postId);
            }

            // Comment form submission
            if (e.target.closest('.comment-submit-btn')) {
                e.preventDefault();
                await this.handleCommentSubmit();
            }

            // Comment delete
            if (e.target.closest('.comment-delete-btn')) {
                e.preventDefault();
                const commentId = e.target.closest('.comment-delete-btn').dataset.commentId;
                const postId = this.getPostId();
                await this.deleteComment(postId, commentId);
            }

            // Comment like
            if (e.target.closest('.comment-like-btn')) {
                e.preventDefault();
                const commentId = e.target.closest('.comment-like-btn').dataset.commentId;
                const postId = this.getPostId();
                await this.toggleCommentLike(postId, commentId);
            }
        });

        // Comment form enter key
        document.addEventListener('keydown', async (e) => {
            if (e.target.classList.contains('comment-input') && e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                await this.handleCommentSubmit();
            }
        });
    }

    // Handle comment form submission
    async handleCommentSubmit() {
        const commentInput = document.querySelector('.comment-input');
        const authorInput = document.querySelector('.comment-author-input');

        if (commentInput) {
            const commentText = commentInput.value;
            const authorName = authorInput ? authorInput.value : 'Anonymous';
            const postId = this.getPostId();

            if (await this.addComment(postId, commentText, authorName)) {
                commentInput.value = '';
                if (authorInput) authorInput.value = '';
            }
        }
    }

    // Update like button UI
    updateLikeUI(postId) {
        const postData = this.getPostData(postId);
        const isLiked = postData.likes.includes(this.currentUser);
        
        const likeBtn = document.querySelector('.like-btn');
        const likeCount = document.querySelector('.like-count');
        
        if (likeBtn) {
            const icon = likeBtn.querySelector('i');
            if (isLiked) {
                likeBtn.classList.add('liked');
                likeBtn.classList.remove('text-gray-500');
                likeBtn.classList.add('text-blue-600');
                if (icon) {
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                }
            } else {
                likeBtn.classList.remove('liked');
                likeBtn.classList.remove('text-blue-600');
                likeBtn.classList.add('text-gray-500');
                if (icon) {
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                }
            }
        }
        
        if (likeCount) {
            likeCount.textContent = postData.likeCount;
        }
    }

    // Update comments UI
    updateCommentsUI(postId) {
        const postData = this.getPostData(postId);
        const commentsContainer = document.querySelector('.comments-list');
        const commentCount = document.querySelector('.comment-count');
        
        if (commentCount) {
            commentCount.textContent = postData.comments.length;
        }
        
        if (commentsContainer) {
            commentsContainer.innerHTML = this.renderComments(postData.comments);
        }
    }

    // Render comments HTML
    renderComments(comments) {
        if (comments.length === 0) {
            return '<p class="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>';
        }
        
        return comments.map(comment => {
            const isOwner = comment.userId === this.currentUser;
            const isLiked = comment.likes.includes(this.currentUser);
            const timeAgo = this.getTimeAgo(new Date(comment.timestamp));
            
            return `
                <div class="comment bg-gray-50 rounded-lg p-4 mb-4">
                    <div class="flex justify-between items-start mb-2">
                        <div class="flex items-center gap-2">
                            <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                ${comment.author.charAt(0).toUpperCase()}
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
                            <span>${comment.likes.length}</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Update all UI elements
    updateUI() {
        const postId = this.getPostId();
        this.updateLikeUI(postId);
        this.updateCommentsUI(postId);
    }

    // Show feedback message
    showFeedback(message) {
        // Create or update feedback element
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

    // Utility: Get time ago string
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

    // Utility: Escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Get stats for a post (for use in blog index)
    getPostStats(postId) {
        const postData = this.getPostData(postId);
        return {
            likes: postData.likeCount,
            comments: postData.comments.length
        };
    }

    // Generate HTML for blog post interactions
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

    // Generate simple like/comment buttons for blog index
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

// Global functions for HTML-embedded scripts
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

// Global function to initialize interactions on any page
window.initBlogInteractions = async function() {
    if (!window.blogInteractions) {
        // Create the instance
        window.blogInteractions = new BlogInteractions(db, /* postId */);
        
        // Wait for the anonymous user to be ready
        await window.blogInteractions.getCurrentUser();
        
        // Now that the user is authenticated, we can listen for data
        window.blogInteractions.init();
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.blogInteractions = new BlogInteractions();

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
                    counterContainer.classList.add('error');
                }
            }
        }
    });
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlogInteractions;
}
