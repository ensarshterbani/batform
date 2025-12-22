/**
 * Batform App Module
 * Main application logic
 * 
 * This module demonstrates modern JavaScript features including:
 * - ES6+ syntax (const, let, arrow functions, template literals)
 * - Destructuring, spread/rest operators
 * - Array methods (map, filter, reduce, find)
 * - Async/await and Promises
 * - DOM manipulation with querySelector
 * - Event handling with addEventListener
 */

const App = (function() {
    // Default avatar SVG as data URL
    const DEFAULT_AVATAR = 'images/profile_picture.svg';
    
    // ==================== UTILITY FUNCTIONS ====================
    
    /**
     * Simulates fetching data from a server using localStorage
     * Demonstrates: async/await, Promises, fetch-like API
     * @param {string} key - The data key to fetch
     * @returns {Promise} - Resolves with the data
     */
    async function fetchLocalData(key) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    const data = localStorage.getItem(key);
                    resolve(data ? JSON.parse(data) : null);
                } catch (error) {
                    reject(new Error(`Failed to fetch ${key}`));
                }
            }, 50); // Simulate network delay
        });
    }
    
    /**
     * Calculates total engagement (likes) across all posts
     * Demonstrates: reduce method, destructuring
     * @param {Array} posts - Array of post objects
     * @returns {number} - Total engagement count
     */
    function calculateTotalEngagement(posts) {
        const likes = Storage.getLikes();
        // Using reduce to sum up all likes
        return likes.reduce((total, like) => total + 1, 0);
    }
    
    /**
     * Formats user data for display
     * Demonstrates: destructuring, rest operator
     * @param {Object} user - User object
     * @returns {Object} - Formatted user data
     */
    function formatUserForDisplay(user) {
        if (!user) return null;
        // Destructuring with rest operator
        const { password, ...safeUserData } = user;
        const { fullName, username, avatar } = safeUserData;
        return {
            displayName: fullName,
            handle: `@${username}`,
            profileImage: avatar || DEFAULT_AVATAR,
            ...safeUserData
        };
    }
    
    /**
     * Validates multiple form fields
     * Demonstrates: rest parameters, for loop
     * @param {...string} fields - Field values to validate
     * @returns {boolean} - Whether all fields are valid
     */
    function validateFields(...fields) {
        // Using traditional for loop for demonstration
        for (let i = 0; i < fields.length; i++) {
            if (!fields[i] || fields[i].trim() === '') {
                return false;
            }
        }
        return true;
    }
    
    /**
     * Finds the first matching item in array
     * Demonstrates: while loop
     * @param {Array} array - Array to search
     * @param {Function} predicate - Test function
     * @returns {*} - Found item or undefined
     */
    function findFirst(array, predicate) {
        let index = 0;
        while (index < array.length) {
            if (predicate(array[index])) {
                return array[index];
            }
            index++;
        }
        return undefined;
    }

    // ==================== AUTHENTICATION ====================

    function checkAuth() {
        const publicPages = ['login.html', 'signup.html'];
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        if (!Storage.isLoggedIn() && !publicPages.includes(currentPage)) {
            window.location.href = 'login.html';
            return false;
        }
        
        if (Storage.isLoggedIn() && publicPages.includes(currentPage)) {
            window.location.href = 'index.html';
            return false;
        }
        
        return true;
    }

    function handleSignup(e) {
        e.preventDefault();
        
        const form = e.target;
        const fullName = form.querySelector('#fullname')?.value.trim();
        const username = form.querySelector('#username')?.value.trim().toLowerCase();
        const email = form.querySelector('#email')?.value.trim().toLowerCase();
        const password = form.querySelector('#password')?.value;
        const confirmPassword = form.querySelector('#confirm-password')?.value;
        
        // Validation
        if (!fullName || !username || !email || !password) {
            showToast('Please fill in all fields', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }
        
        if (password.length < 6) {
            showToast('Password must be at least 6 characters', 'error');
            return;
        }
        
        if (Storage.getUserByUsername(username)) {
            showToast('Username already taken', 'error');
            return;
        }
        
        if (Storage.getUserByEmail(email)) {
            showToast('Email already registered', 'error');
            return;
        }
        
        // Create user
        const newUser = Storage.createUser({
            fullName,
            username,
            email,
            password
        });
        
        // Auto login
        Storage.setCurrentUser(newUser);
        
        showToast('Account created successfully!', 'success');
        
        // Redirect after delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }

    function handleLogin(e) {
        e.preventDefault();
        
        const form = e.target;
        const identifier = form.querySelector('#email')?.value.trim().toLowerCase();
        const password = form.querySelector('#password')?.value;
        
        if (!identifier || !password) {
            showToast('Please fill in all fields', 'error');
            return;
        }
        
        // Find user by email or username
        let user = Storage.getUserByEmail(identifier) || Storage.getUserByUsername(identifier);
        
        if (!user) {
            showToast('User not found', 'error');
            return;
        }
        
        if (user.password !== password) {
            showToast('Incorrect password', 'error');
            return;
        }
        
        // Login successful
        Storage.setCurrentUser(user);
        showToast('Welcome back, ' + user.fullName + '!', 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }

    function handleLogout() {
        Storage.logoutUser();
        showToast('Logged out successfully', 'success');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 500);
    }

    // ==================== FEED RENDERING ====================

    function renderFeed(containerId = 'feed-container') {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const posts = Storage.getFeedPosts();
        const currentUser = Storage.getCurrentUser();
        
        if (posts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa fa-newspaper-o"></i>
                    <h3>No posts yet</h3>
                    <p>Be the first to share something!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = posts.map(post => renderPostCard(post, currentUser)).join('');
        
        // Initialize post interactions
        initializePostInteractions();
    }

    function renderPostCard(post, currentUser) {
        const author = Storage.getUserById(post.authorId);
        if (!author) return '';
        
        // Using destructuring to extract values
        const { id: postId, content, image, createdAt } = post;
        const { fullName, username, avatar } = author;
        
        const likeCount = Storage.getLikeCount(postId);
        const commentCount = Storage.getCommentCount(postId);
        const isLiked = currentUser ? Storage.hasUserLiked(postId, currentUser.id) : false;
        const isSaved = currentUser ? Storage.hasUserSaved(postId, currentUser.id) : false;
        const timeAgo = Storage.formatTimeAgo(createdAt);
        
        // Using figure and figcaption for semantic image markup
        const imageMarkup = image ? `
            <figure class="post-figure">
                <img src="${image}" alt="Image shared by ${fullName}" class="post-image" />
                <figcaption class="visually-hidden">Image shared by ${fullName}</figcaption>
            </figure>
        ` : '';
        
        return `
            <article class="post" data-post-id="${postId}">
                <header class="post-header">
                    <a href="profile.html?user=${username}" class="post-author-link">
                        <img src="${avatar || DEFAULT_AVATAR}" alt="${fullName}'s profile picture" class="post-avatar" />
                    </a>
                    <div class="post-author-info">
                        <a href="profile.html?user=${username}" class="post-author-link">
                            <h3 class="post-author">${fullName}</h3>
                        </a>
                        <time class="post-time" datetime="${new Date(createdAt).toISOString()}">${timeAgo}</time>
                    </div>
                    ${currentUser && post.authorId === currentUser.id ? `
                        <button class="post-menu-btn" data-post-id="${postId}" aria-label="Post options">
                            <i class="fa fa-ellipsis-h" aria-hidden="true"></i>
                        </button>
                    ` : ''}
                </header>
                
                <div class="post-content">
                    <p>${escapeHtml(content || '')}</p>
                    ${imageMarkup}
                </div>
                
                <footer class="post-footer">
                    <div class="post-stats">
                        <span class="likes-count"><strong>${likeCount}</strong> ${likeCount === 1 ? 'like' : 'likes'}</span>
                        <a href="comments.html?post=${postId}" class="comments-count"><strong>${commentCount}</strong> ${commentCount === 1 ? 'comment' : 'comments'}</a>
                    </div>
                    <div class="post-actions">
                        <button class="action-btn like-btn ${isLiked ? 'liked' : ''}" data-post-id="${postId}" data-action="like" aria-label="${isLiked ? 'Unlike post' : 'Like post'}">
                            <span class="action-icon"><i class="fa fa-heart" aria-hidden="true"></i></span>
                        </button>
                        <a href="comments.html?post=${postId}" class="action-btn comment-btn" aria-label="View comments">
                            <span class="action-icon"><i class="fa fa-commenting" aria-hidden="true"></i></span>
                        </a>
                        <button class="action-btn save-btn ${isSaved ? 'saved' : ''}" data-post-id="${postId}" data-action="save" aria-label="${isSaved ? 'Unsave post' : 'Save post'}">
                            <span class="action-icon"><i class="fa fa-bookmark" aria-hidden="true"></i></span>
                        </button>
                    </div>
                </footer>
            </article>
        `;
    }

    function initializePostInteractions() {
        // Like buttons
        document.querySelectorAll('.like-btn[data-post-id]').forEach(btn => {
            btn.addEventListener('click', handleLikeClick);
        });
        
        // Save buttons
        document.querySelectorAll('.save-btn[data-post-id]').forEach(btn => {
            btn.addEventListener('click', handleSaveClick);
        });
        
        // Delete buttons
        document.querySelectorAll('.post-menu-btn[data-post-id]').forEach(btn => {
            btn.addEventListener('click', handlePostMenuClick);
        });
    }

    function handleLikeClick(e) {
        e.preventDefault();
        const btn = e.currentTarget;
        const postId = btn.dataset.postId;
        const currentUser = Storage.getCurrentUser();
        
        if (!currentUser) {
            showToast('Please log in to like posts', 'error');
            return;
        }
        
        const isNowLiked = Storage.toggleLike(postId, currentUser.id);
        
        // Update UI
        btn.classList.toggle('liked', isNowLiked);
        
        // Update count
        const post = btn.closest('.post');
        const countSpan = post.querySelector('.likes-count');
        const newCount = Storage.getLikeCount(postId);
        countSpan.textContent = `${newCount} ${newCount === 1 ? 'like' : 'likes'}`;
        
        // Animation
        btn.style.transform = 'scale(1.2)';
        setTimeout(() => btn.style.transform = 'scale(1)', 150);
        
        // Create notification if liking someone else's post
        const postData = Storage.getPostById(postId);
        if (isNowLiked && postData && postData.authorId !== currentUser.id) {
            Storage.createNotification({
                userId: postData.authorId,
                type: 'like',
                fromUserId: currentUser.id,
                postId: postId
            });
        }
    }

    function handleSaveClick(e) {
        e.preventDefault();
        const btn = e.currentTarget;
        const postId = btn.dataset.postId;
        const currentUser = Storage.getCurrentUser();
        
        if (!currentUser) {
            showToast('Please log in to save posts', 'error');
            return;
        }
        
        const isNowSaved = Storage.toggleSavePost(postId, currentUser.id);
        
        // Update UI
        btn.classList.toggle('saved', isNowSaved);
        
        // Animation
        btn.style.transform = 'scale(1.2)';
        setTimeout(() => btn.style.transform = 'scale(1)', 150);
        
        showToast(isNowSaved ? 'Post saved!' : 'Post removed from saved', 'success');
    }

    function handlePostMenuClick(e) {
        e.preventDefault();
        const postId = e.currentTarget.dataset.postId;
        
        if (confirm('Are you sure you want to delete this post?')) {
            Storage.deletePost(postId);
            showToast('Post deleted', 'success');
            renderFeed();
        }
    }

    // ==================== POST CREATION ====================

    function initializePostCreator() {
        const form = document.getElementById('post-form');
        const textarea = document.getElementById('post-input');
        const submitBtn = document.getElementById('post-submit-btn');
        const imageInput = document.getElementById('post-image-input');
        const imagePreview = document.getElementById('image-preview');
        
        if (!form || !textarea || !submitBtn) return;
        
        let selectedImage = null;
        
        // Helper function to update button state
        function updatePostButtonState() {
            const hasText = textarea.value.trim().length > 0;
            const hasImage = selectedImage !== null;
            const canPost = hasText || hasImage;
            
            submitBtn.disabled = !canPost;
            submitBtn.style.opacity = canPost ? '1' : '0.6';
            submitBtn.style.cursor = canPost ? 'pointer' : 'not-allowed';
        }
        
        // Initial state
        updatePostButtonState();
        
        // Enable/disable button based on content
        textarea.addEventListener('input', updatePostButtonState);
        
        // Image selection
        if (imageInput) {
            imageInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    if (file.size > 5 * 1024 * 1024) {
                        showToast('Image must be less than 5MB', 'error');
                        return;
                    }
                    
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        selectedImage = e.target.result;
                        updatePostButtonState();
                        if (imagePreview) {
                            imagePreview.innerHTML = `
                                <div class="preview-image-container">
                                    <img src="${selectedImage}" alt="Preview" />
                                    <button type="button" class="remove-image-btn" id="remove-image">
                                        <i class="fa fa-times"></i>
                                    </button>
                                </div>
                            `;
                            document.getElementById('remove-image')?.addEventListener('click', () => {
                                selectedImage = null;
                                imagePreview.innerHTML = '';
                                imageInput.value = '';
                                updatePostButtonState();
                            });
                        }
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
        
        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const content = textarea.value.trim();
            if (!content && !selectedImage) return;
            
            const currentUser = Storage.getCurrentUser();
            if (!currentUser) {
                showToast('Please log in to create posts', 'error');
                return;
            }
            
            // Disable button during submission
            submitBtn.disabled = true;
            submitBtn.textContent = 'Posting...';
            
            // Simulate network delay
            setTimeout(() => {
                const newPost = Storage.createPost({
                    authorId: currentUser.id,
                    content: content,
                    image: selectedImage
                });
                
                // Reset form
                textarea.value = '';
                selectedImage = null;
                if (imagePreview) imagePreview.innerHTML = '';
                if (imageInput) imageInput.value = '';
                
                submitBtn.disabled = true;
                submitBtn.style.opacity = '0.6';
                submitBtn.textContent = 'Post';
                
                showToast('Post created successfully!', 'success');
                
                // Re-render feed
                renderFeed();
            }, 500);
        });
    }

    // ==================== PROFILE POST CREATOR ====================

    function initializeProfilePostCreator() {
        const form = document.getElementById('profile-post-form');
        const textarea = document.getElementById('profile-post-input');
        const submitBtn = document.getElementById('profile-post-submit-btn');
        const imageInput = document.getElementById('profile-post-image-input');
        const imagePreview = document.getElementById('profile-image-preview');
        
        if (!form || !textarea || !submitBtn) return;
        
        let selectedImage = null;
        
        // Helper function to update button state
        function updatePostButtonState() {
            const hasText = textarea.value.trim().length > 0;
            const hasImage = selectedImage !== null;
            const canPost = hasText || hasImage;
            
            submitBtn.disabled = !canPost;
            submitBtn.style.opacity = canPost ? '1' : '0.6';
            submitBtn.style.cursor = canPost ? 'pointer' : 'not-allowed';
        }
        
        // Initial state
        updatePostButtonState();
        
        // Enable/disable button based on content
        textarea.addEventListener('input', updatePostButtonState);
        
        // Image selection
        if (imageInput) {
            imageInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    if (file.size > 5 * 1024 * 1024) {
                        showToast('Image must be less than 5MB', 'error');
                        return;
                    }
                    
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        selectedImage = e.target.result;
                        updatePostButtonState();
                        if (imagePreview) {
                            imagePreview.innerHTML = `
                                <div class="preview-image-container">
                                    <img src="${selectedImage}" alt="Preview" />
                                    <button type="button" class="remove-image-btn" id="profile-remove-image">
                                        <i class="fa fa-times"></i>
                                    </button>
                                </div>
                            `;
                            document.getElementById('profile-remove-image')?.addEventListener('click', () => {
                                selectedImage = null;
                                imagePreview.innerHTML = '';
                                imageInput.value = '';
                                updatePostButtonState();
                            });
                        }
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
        
        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const content = textarea.value.trim();
            if (!content && !selectedImage) return;
            
            const currentUser = Storage.getCurrentUser();
            if (!currentUser) {
                showToast('Please log in to create posts', 'error');
                return;
            }
            
            // Disable button during submission
            submitBtn.disabled = true;
            submitBtn.textContent = 'Posting...';
            
            // Simulate network delay
            setTimeout(() => {
                Storage.createPost({
                    authorId: currentUser.id,
                    content: content,
                    image: selectedImage
                });
                
                // Reset form
                textarea.value = '';
                selectedImage = null;
                if (imagePreview) imagePreview.innerHTML = '';
                if (imageInput) imageInput.value = '';
                
                submitBtn.disabled = true;
                submitBtn.style.opacity = '0.6';
                submitBtn.textContent = 'Post';
                
                showToast('Post created successfully!', 'success');
                
                // Re-render user posts
                const userPosts = Storage.getPostsByUser(currentUser.id);
                renderUserPosts(userPosts, currentUser);
                
                // Update post count
                const postsCount = document.getElementById('posts-count');
                if (postsCount) postsCount.textContent = userPosts.length;
            }, 500);
        });
    }

    // ==================== PROFILE PAGE ====================

    function initializeProfilePage() {
        const urlParams = new URLSearchParams(window.location.search);
        const username = urlParams.get('user');
        const currentUser = Storage.getCurrentUser();
        
        let profileUser;
        
        if (username) {
            profileUser = Storage.getUserByUsername(username);
        } else if (currentUser) {
            profileUser = Storage.getUserById(currentUser.id);
        }
        
        if (!profileUser) {
            document.body.innerHTML = `
                <div class="error-page">
                    <h1>User not found</h1>
                    <a href="index.html">Go home</a>
                </div>
            `;
            return;
        }
        
        renderProfile(profileUser, currentUser);
    }

    function renderProfile(user, currentUser) {
        const isOwnProfile = currentUser && currentUser.id === user.id;
        const isFollowing = currentUser ? Storage.isFollowing(currentUser.id, user.id) : false;
        
        // Show post creator only on own profile
        const postCreator = document.getElementById('profile-post-creator');
        if (postCreator) {
            postCreator.style.display = isOwnProfile ? 'block' : 'none';
            if (isOwnProfile) {
                // Update the creator avatar
                const creatorAvatar = postCreator.querySelector('.creator-avatar');
                if (creatorAvatar && currentUser) {
                    creatorAvatar.src = currentUser.avatar || DEFAULT_AVATAR;
                }
                initializeProfilePostCreator();
            }
        }
        
        // Using destructuring to get DOM elements
        const profileElements = {
            name: document.getElementById('profile-name'),
            username: document.getElementById('profile-username'),
            bio: document.getElementById('profile-bio'),
            avatar: document.getElementById('profile-avatar'),
            cover: document.getElementById('profile-cover'),
            posts: document.getElementById('posts-count'),
            followers: document.getElementById('followers-count'),
            following: document.getElementById('following-count'),
            actions: document.getElementById('profile-actions')
        };
        
        // Destructure user properties
        const { fullName, username, bio, avatar, coverPhoto, website } = user;
        
        if (profileElements.name) profileElements.name.textContent = fullName;
        if (profileElements.username) profileElements.username.textContent = '@' + username;
        
        // Bio with optional website link (using target/rel for external links)
        if (profileElements.bio) {
            if (website) {
                profileElements.bio.innerHTML = `${escapeHtml(bio || 'No bio yet')} <br><a href="${escapeHtml(website)}" target="_blank" rel="noopener noreferrer" class="profile-website-link"><i class="fa fa-link" aria-hidden="true"></i> ${escapeHtml(website.replace(/^https?:\/\//, ''))}</a>`;
            } else {
                profileElements.bio.textContent = bio || 'No bio yet';
            }
        }
        
        if (profileElements.avatar) profileElements.avatar.src = avatar || DEFAULT_AVATAR;
        if (profileElements.cover && coverPhoto) profileElements.cover.style.backgroundImage = `url(${coverPhoto})`;
        
        // Alias for cleaner code below
        const profileName = profileElements.name;
        const profileUsername = profileElements.username;
        const profileBio = profileElements.bio;
        const profileAvatar = profileElements.avatar;
        const profileCover = profileElements.cover;
        const postsCount = profileElements.posts;
        const followersCount = profileElements.followers;
        const followingCount = profileElements.following;
        const profileActions = profileElements.actions;
        
        const userPosts = Storage.getPostsByUser(user.id);
        if (postsCount) postsCount.textContent = userPosts.length;
        if (followersCount) followersCount.textContent = Storage.getFollowerCount(user.id);
        if (followingCount) followingCount.textContent = Storage.getFollowingCount(user.id);
        
        // Profile actions
        if (profileActions) {
            if (isOwnProfile) {
                profileActions.innerHTML = `
                    <button class="edit-profile-btn" id="edit-profile-btn">
                        <i class="fa fa-pencil"></i> Edit Profile
                    </button>
                `;
                document.getElementById('edit-profile-btn')?.addEventListener('click', openEditProfileModal);
            } else if (currentUser) {
                profileActions.innerHTML = `
                    <button class="follow-btn ${isFollowing ? 'following' : ''}" id="follow-btn" data-user-id="${user.id}">
                        ${isFollowing ? 'Following' : 'Follow'}
                    </button>
                `;
                initializeFollowButton();
            }
        }
        
        // Render user's posts
        renderUserPosts(userPosts, currentUser);
    }

    function renderUserPosts(posts, currentUser) {
        const container = document.getElementById('user-posts');
        if (!container) return;
        
        if (posts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa fa-camera"></i>
                    <h3>No posts yet</h3>
                </div>
            `;
            return;
        }
        
        container.innerHTML = posts.map(post => renderPostCard(post, currentUser)).join('');
        initializePostInteractions();
    }

    function initializeFollowButton() {
        const btn = document.getElementById('follow-btn');
        if (!btn) return;
        
        btn.addEventListener('click', () => {
            const userId = btn.dataset.userId;
            const currentUser = Storage.getCurrentUser();
            
            if (!currentUser) {
                showToast('Please log in to follow users', 'error');
                return;
            }
            
            const isNowFollowing = Storage.toggleFollow(currentUser.id, userId);
            
            btn.classList.toggle('following', isNowFollowing);
            btn.textContent = isNowFollowing ? 'Following' : 'Follow';
            
            // Update follower count
            const followersCount = document.getElementById('followers-count');
            if (followersCount) {
                followersCount.textContent = Storage.getFollowerCount(userId);
            }
            
            // Create notification
            if (isNowFollowing) {
                Storage.createNotification({
                    userId: userId,
                    type: 'follow',
                    fromUserId: currentUser.id
                });
            }
            
            showToast(isNowFollowing ? 'Now following!' : 'Unfollowed', 'success');
        });
        
        // Hover effect for following state
        btn.addEventListener('mouseenter', () => {
            if (btn.classList.contains('following')) {
                btn.textContent = 'Unfollow';
                btn.style.backgroundColor = '#dc3545';
            }
        });
        
        btn.addEventListener('mouseleave', () => {
            if (btn.classList.contains('following')) {
                btn.textContent = 'Following';
                btn.style.backgroundColor = '#088178';
            }
        });
    }

    function openEditProfileModal() {
        const currentUser = Storage.getCurrentUser();
        if (!currentUser) return;
        
        // Fetch user with async pattern demonstration
        const user = Storage.getUserById(currentUser.id);
        
        // Using destructuring to extract user properties
        const { fullName, bio, website } = user;
        
        // Create modal using setAttribute for attribute manipulation
        const modal = document.createElement('div');
        modal.setAttribute('class', 'modal-overlay');
        modal.setAttribute('id', 'edit-profile-modal');
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'modal-title');
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 id="modal-title">Edit Profile</h2>
                    <button class="modal-close" id="close-modal" aria-label="Close modal">&times;</button>
                </div>
                <form id="edit-profile-form">
                    <fieldset class="modal-fieldset">
                        <legend class="visually-hidden">Profile Information</legend>
                        <div class="form-group">
                            <label for="edit-fullname">Full Name</label>
                            <input type="text" id="edit-fullname" value="${fullName}" maxlength="50" required />
                        </div>
                        <div class="form-group">
                            <label for="edit-bio">Bio</label>
                            <textarea id="edit-bio" rows="3" maxlength="200">${bio || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label for="edit-website">Website</label>
                            <input type="url" id="edit-website" value="${website || ''}" placeholder="https://yourwebsite.com" />
                            <small class="form-help"><em>Your website will open in a new tab</em></small>
                        </div>
                        <div class="form-group">
                            <label for="edit-avatar">Profile Picture</label>
                            <input type="file" id="edit-avatar" accept="image/*" />
                        </div>
                    </fieldset>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" id="cancel-edit">Cancel</button>
                        <button type="submit" class="btn-primary">Save Changes</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close handlers
        document.getElementById('close-modal').addEventListener('click', () => modal.remove());
        document.getElementById('cancel-edit').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        
        // Form submission with async handling
        document.getElementById('edit-profile-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Using destructuring on form elements
            const fullNameInput = document.getElementById('edit-fullname');
            const bioInput = document.getElementById('edit-bio');
            const websiteInput = document.getElementById('edit-website');
            const avatarInput = document.getElementById('edit-avatar');
            
            const updates = { 
                fullName: fullNameInput.value.trim(), 
                bio: bioInput.value.trim(),
                website: websiteInput.value.trim()
            };
            
            // Using Promise-based async/await pattern
            const processUpdate = async (avatarData = null) => {
                if (avatarData) {
                    updates.avatar = avatarData;
                }
                
                // Simulate async operation
                await new Promise(resolve => setTimeout(resolve, 300));
                Storage.updateUser(currentUser.id, updates);
                modal.remove();
                showToast('Profile updated!', 'success');
                location.reload();
            };
            
            if (avatarInput.files[0]) {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    await processUpdate(e.target.result);
                };
                reader.readAsDataURL(avatarInput.files[0]);
            } else {
                await processUpdate();
            }
        });
    }

    // ==================== COMMENTS PAGE ====================

    function initializeCommentsPage() {
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('post');
        
        if (!postId) {
            window.location.href = 'index.html';
            return;
        }
        
        const post = Storage.getPostById(postId);
        if (!post) {
            window.location.href = 'index.html';
            return;
        }
        
        renderPostWithComments(post);
    }

    function renderPostWithComments(post) {
        const currentUser = Storage.getCurrentUser();
        const author = Storage.getUserById(post.authorId);
        
        // Render the original post
        const postContainer = document.getElementById('original-post');
        if (postContainer && author) {
            postContainer.innerHTML = renderPostCard(post, currentUser);
            initializePostInteractions();
        }
        
        // Render comments
        renderComments(post.id);
        
        // Initialize comment form
        initializeCommentForm(post.id);
    }

    function renderComments(postId) {
        const container = document.getElementById('comments-list');
        if (!container) return;
        
        const comments = Storage.getCommentsByPost(postId);
        const currentUser = Storage.getCurrentUser();
        
        // Update count
        const countEl = document.querySelector('.comments-total');
        if (countEl) countEl.textContent = `(${comments.length})`;
        
        if (comments.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No comments yet. Be the first to comment!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = comments.map(comment => {
            const author = Storage.getUserById(comment.authorId);
            if (!author) return '';
            
            const post = Storage.getPostById(postId);
            const isAuthor = post && post.authorId === comment.authorId;
            
            return `
                <article class="comment-item" data-comment-id="${comment.id}">
                    <img src="${author.avatar || DEFAULT_AVATAR}" alt="${author.fullName}" class="comment-avatar" />
                    <div class="comment-body">
                        <div class="comment-header">
                            <strong class="comment-author-name">${author.fullName}</strong>
                            ${isAuthor ? '<span class="author-badge">Author</span>' : ''}
                            <time class="comment-timestamp">${Storage.formatTimeAgo(comment.createdAt)}</time>
                        </div>
                        <p class="comment-text">${escapeHtml(comment.text)}</p>
                        ${currentUser && comment.authorId === currentUser.id ? `
                            <button class="delete-comment-btn" data-comment-id="${comment.id}">
                                <i class="fa fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </article>
            `;
        }).join('');
        
        // Delete handlers
        document.querySelectorAll('.delete-comment-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const commentId = btn.dataset.commentId;
                if (confirm('Delete this comment?')) {
                    Storage.deleteComment(commentId);
                    renderComments(postId);
                    showToast('Comment deleted', 'success');
                }
            });
        });
    }

    function initializeCommentForm(postId) {
        const form = document.querySelector('.comment-form');
        const input = document.querySelector('.comment-input-field');
        const submitBtn = document.querySelector('.comment-post-btn');
        
        if (!form || !input) return;
        
        // Initial state
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.6';
        }
        
        input.addEventListener('input', () => {
            const hasContent = input.value.trim().length > 0;
            if (submitBtn) {
                submitBtn.disabled = !hasContent;
                submitBtn.style.opacity = hasContent ? '1' : '0.6';
            }
        });
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const text = input.value.trim();
            if (!text) return;
            
            const currentUser = Storage.getCurrentUser();
            if (!currentUser) {
                showToast('Please log in to comment', 'error');
                return;
            }
            
            // Create comment
            const newComment = Storage.createComment({
                postId: postId,
                authorId: currentUser.id,
                text: text
            });
            
            // Create notification
            const post = Storage.getPostById(postId);
            if (post && post.authorId !== currentUser.id) {
                Storage.createNotification({
                    userId: post.authorId,
                    type: 'comment',
                    fromUserId: currentUser.id,
                    postId: postId
                });
            }
            
            // Reset form
            input.value = '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.style.opacity = '0.6';
            }
            
            showToast('Comment posted!', 'success');
            renderComments(postId);
        });
    }

    // ==================== SAVED PAGE ====================

    function initializeSavedPage() {
        const currentUser = Storage.getCurrentUser();
        if (!currentUser) return;
        
        const container = document.getElementById('saved-posts');
        if (!container) return;
        
        const savedPosts = Storage.getUserSavedPosts(currentUser.id);
        
        if (savedPosts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa fa-bookmark-o"></i>
                    <h3>No saved posts</h3>
                    <p>Posts you save will appear here</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = savedPosts.map(post => renderPostCard(post, currentUser)).join('');
        initializePostInteractions();
    }

    // ==================== NOTIFICATIONS PAGE ====================

    function initializeNotificationsPage() {
        const currentUser = Storage.getCurrentUser();
        if (!currentUser) return;
        
        const container = document.getElementById('notifications-list');
        if (!container) return;
        
        const notifications = Storage.getUserNotifications(currentUser.id);
        
        if (notifications.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa fa-bell-o"></i>
                    <h3>No notifications</h3>
                    <p>When someone interacts with your posts, you'll see it here</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = notifications.map(notif => {
            const fromUser = Storage.getUserById(notif.fromUserId);
            if (!fromUser) return '';
            
            let message = '';
            let icon = '';
            let link = '#';
            
            switch (notif.type) {
                case 'like':
                    message = 'liked your post';
                    icon = 'fa-heart';
                    link = notif.postId ? `comments.html?post=${notif.postId}` : '#';
                    break;
                case 'comment':
                    message = 'commented on your post';
                    icon = 'fa-comment';
                    link = notif.postId ? `comments.html?post=${notif.postId}` : '#';
                    break;
                case 'follow':
                    message = 'started following you';
                    icon = 'fa-user-plus';
                    link = `profile.html?user=${fromUser.username}`;
                    break;
            }
            
            return `
                <a href="${link}" class="notification-item ${notif.read ? '' : 'unread'}" data-notif-id="${notif.id}">
                    <img src="${fromUser.avatar || DEFAULT_AVATAR}" alt="${fromUser.fullName}" class="notification-avatar" />
                    <div class="notification-content">
                        <p><strong>${fromUser.fullName}</strong> ${message}</p>
                        <time>${Storage.formatTimeAgo(notif.createdAt)}</time>
                    </div>
                    <i class="fa ${icon} notification-icon"></i>
                </a>
            `;
        }).join('');
        
        // Mark as read on click
        document.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', () => {
                const notifId = item.dataset.notifId;
                Storage.markNotificationRead(notifId);
            });
        });
    }

    // ==================== UI HELPERS ====================

    function updateNavbar() {
        const currentUser = Storage.getCurrentUser();
        
        // Update profile avatar in navbar if exists
        const navAvatar = document.querySelector('.nav-profile-avatar');
        if (navAvatar && currentUser) {
            navAvatar.src = currentUser.avatar || DEFAULT_AVATAR;
        }
        
        // Update notification badge
        if (currentUser) {
            const unreadCount = Storage.getUnreadNotificationCount(currentUser.id);
            const badge = document.querySelector('.notification-badge');
            if (badge) {
                badge.textContent = unreadCount;
                badge.style.display = unreadCount > 0 ? 'flex' : 'none';
            }
        }
    }

    function updateUserInfo() {
        const currentUser = Storage.getCurrentUser();
        if (!currentUser) return;
        
        // Update all elements showing current user info
        document.querySelectorAll('.current-user-name').forEach(el => {
            el.textContent = currentUser.fullName;
        });
        
        document.querySelectorAll('.current-user-avatar').forEach(el => {
            el.src = currentUser.avatar || DEFAULT_AVATAR;
        });
        
        document.querySelectorAll('.current-user-username').forEach(el => {
            el.textContent = '@' + currentUser.username;
        });
    }

    function showToast(message, type = 'info') {
        // Remove existing toast
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fa ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Auto remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ==================== SUGGESTIONS SIDEBAR ====================

    function renderSuggestions() {
        const container = document.getElementById('suggestions-list');
        if (!container) return;
        
        const currentUser = Storage.getCurrentUser();
        if (!currentUser) return;
        
        const allUsers = Storage.getUsers();
        const suggestions = allUsers
            .filter(u => u.id !== currentUser.id && !Storage.isFollowing(currentUser.id, u.id))
            .slice(0, 5);
        
        if (suggestions.length === 0) {
            container.innerHTML = '<p class="no-suggestions">No suggestions available</p>';
            return;
        }
        
        container.innerHTML = suggestions.map(user => `
            <div class="suggestion-item" data-user-id="${user.id}">
                <a href="profile.html?user=${user.username}" class="suggestion-avatar-link">
                    <img src="${user.avatar || DEFAULT_AVATAR}" alt="${user.fullName}" class="suggestion-avatar" />
                </a>
                <div class="suggestion-info">
                    <a href="profile.html?user=${user.username}" class="suggestion-name">${user.fullName}</a>
                    <span class="suggestion-username">@${user.username}</span>
                </div>
                <button class="follow-btn suggestion-follow-btn" data-user-id="${user.id}">Follow</button>
            </div>
        `).join('');
        
        // Initialize follow buttons
        container.querySelectorAll('.suggestion-follow-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const userId = btn.dataset.userId;
                const isNowFollowing = Storage.toggleFollow(currentUser.id, userId);
                
                if (isNowFollowing) {
                    btn.textContent = 'Following';
                    btn.classList.add('following');
                    
                    Storage.createNotification({
                        userId: userId,
                        type: 'follow',
                        fromUserId: currentUser.id
                    });
                    
                    showToast('Now following!', 'success');
                }
            });
        });
    }

    // ==================== INITIALIZATION ====================

    function init() {
        // Check authentication
        if (!checkAuth()) return;
        
        // Update UI with current user info
        updateNavbar();
        updateUserInfo();
        
        // Page-specific initialization
        const page = window.location.pathname.split('/').pop() || 'index.html';
        
        switch (page) {
            case 'index.html':
                initializePostCreator();
                renderFeed();
                renderSuggestions();
                break;
            case 'profile.html':
                initializeProfilePage();
                break;
            case 'comments.html':
                initializeCommentsPage();
                break;
            case 'saved.html':
                initializeSavedPage();
                break;
            case 'notification.html':
                initializeNotificationsPage();
                break;
        }
        
        console.log('✅ Batform App initialized');
    }

    // Public API
    return {
        init,
        checkAuth,
        handleSignup,
        handleLogin,
        handleLogout,
        showToast,
        renderFeed,
        updateNavbar
    };
})();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', App.init);

