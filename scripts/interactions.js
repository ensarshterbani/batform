// Interactive Features for Social Media Website

// Simple like button functionality
function initializeLikeButtons() {
    const likeButtons = document.querySelectorAll('.action-btn.like-btn');
    
    likeButtons.forEach((button, index) => {
        if (button.dataset.initialized) return; // Skip if already initialized
        
        let liked = false;
        const postFooter = button.closest('.post-footer');
        const likesSpan = postFooter ? postFooter.querySelector('.likes-count') : null;
        let currentLikes = 0;
        
        if (likesSpan) {
            const match = likesSpan.textContent.match(/\d+/);
            currentLikes = match ? parseInt(match[0]) : 0;
        }
        
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (liked) {
                // Unlike
                currentLikes--;
                liked = false;
                button.classList.remove('liked');
            } else {
                // Like
                currentLikes++;
                liked = true;
                button.classList.add('liked');
            }
            
            // Update the like count display if it exists
            if (likesSpan) {
                likesSpan.textContent = `${currentLikes} likes`;
            }
            
            // Visual feedback animation
            button.style.transform = 'scale(1.2)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 150);
            
            // Show notification
            showNotification(liked ? 'Post liked!' : 'Post unliked!');
        });
        
        button.dataset.initialized = 'true';
    });
    
    console.log(`✅ Initialized ${likeButtons.length} like buttons`);
}

// Follow functionality
function initializeFollowButtons() {
    const followButtons = document.querySelectorAll('.follow-btn, .add-friend-btn');
    
    followButtons.forEach(button => {
        if (button.dataset.initialized) return;
        
        let isFollowing = false;
        let hoverListeners = [];
        
        // Function to remove hover listeners
        function removeHoverListeners() {
            hoverListeners.forEach(({ element, event, handler }) => {
                element.removeEventListener(event, handler);
            });
            hoverListeners = [];
        }
        
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const suggestionItem = button.closest('.suggestion-item');
            const userName = suggestionItem.querySelector('.suggestion-name').textContent;
            
            // Remove existing hover listeners
            removeHoverListeners();
            
            if (isFollowing) {
                // Unfollow
                button.textContent = 'Follow';
                button.style.backgroundColor = '#088178';
                button.style.color = 'white';
                button.dataset.following = 'false';
                isFollowing = false;
                
                // Show notification
                showNotification(`Unfollowed ${userName}`);
            } else {
                // Follow
                button.textContent = 'Following';
                button.style.backgroundColor = '#088178';
                button.style.color = 'white';
                button.dataset.following = 'true';
                isFollowing = true;
                
                // Add hover effect for following state
                const mouseEnterHandler = function() {
                    this.textContent = 'Unfollow';
                    this.style.backgroundColor = '#dc3545';
                };
                
                const mouseLeaveHandler = function() {
                    this.textContent = 'Following';
                    this.style.backgroundColor = '#088178';
                };
                
                button.addEventListener('mouseenter', mouseEnterHandler);
                button.addEventListener('mouseleave', mouseLeaveHandler);
                
                // Store listeners for cleanup
                hoverListeners.push(
                    { element: button, event: 'mouseenter', handler: mouseEnterHandler },
                    { element: button, event: 'mouseleave', handler: mouseLeaveHandler }
                );
                
                // Show notification
                showNotification(`Now following ${userName}!`);
            }
            
            // Button animation
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 100);
        });
        
        button.dataset.initialized = 'true';
    });
    
    console.log(`✅ Initialized ${followButtons.length} follow buttons`);
}

// Save button functionality
function initializeSaveButtons() {
    const saveButtons = document.querySelectorAll('.action-btn.save-btn');
    
    saveButtons.forEach(button => {
        if (button.dataset.initialized) return;
        
        let saved = false;
        
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (saved) {
                // Unsave
                saved = false;
                button.classList.remove('saved');
                showNotification('Post removed from saved!');
            } else {
                // Save
                saved = true;
                button.classList.add('saved');
                showNotification('Post saved!');
            }
            
            // Visual feedback animation
            button.style.transform = 'scale(1.2)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 150);
        });
        
        button.dataset.initialized = 'true';
    });
    
    console.log(`✅ Initialized ${saveButtons.length} save buttons`);
}

// Post Creator functionality
function initializePostCreator() {
    const postCreator = document.querySelector('.post-creator');
    if (!postCreator) return;
    
    const postInput = postCreator.querySelector('.post-input');
    const postSubmitBtn = postCreator.querySelector('.post-submit-btn');
    const feedContainer = document.querySelector('.feed-container');
    
    if (!postInput || !postSubmitBtn) return;
    
    // Set initial disabled state
    postSubmitBtn.disabled = true;
    postSubmitBtn.style.opacity = '0.6';
    postSubmitBtn.style.cursor = 'not-allowed';
    
    // Enable/disable submit button based on content
    postInput.addEventListener('input', function() {
        if (postInput.value.trim()) {
            postSubmitBtn.disabled = false;
            postSubmitBtn.style.opacity = '1';
            postSubmitBtn.style.cursor = 'pointer';
        } else {
            postSubmitBtn.disabled = true;
            postSubmitBtn.style.opacity = '0.6';
            postSubmitBtn.style.cursor = 'not-allowed';
        }
    });
    
    // Handle form submission
    postSubmitBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        const content = postInput.value.trim();
        if (!content) return;
        
        // Create new post element
        const newPost = createNewPostElement(content);
        
        // Insert new post after post creator
        const newsSection = document.querySelector('.news-feed');
        if (newsSection) {
            newsSection.insertBefore(newPost, newsSection.firstChild);
        }
        
        // Clear form
        postInput.value = '';
        postSubmitBtn.disabled = true;
        postSubmitBtn.style.opacity = '0.6';
        
        // Initialize like button for new post
        initializeLikeButtons();
        
        // Show success notification
        showNotification('Post created successfully!');
        
        // Scroll to new post
        newPost.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    
    console.log('✅ Post creator initialized');
}

// Create new post element
function createNewPostElement(content) {
    const postElement = document.createElement('article');
    postElement.className = 'post';
    postElement.style.border = '2px solid #088178';
    postElement.style.animation = 'fadeInUp 0.5s ease-out';
    
    postElement.innerHTML = `
        <header class="post-header">
            <img src="images/profile_picture.svg" alt="Your profile picture" class="post-avatar">
            <div class="post-author-info">
                <h3 class="post-author">John Doe (You)</h3>
                <time class="post-time">Just now</time>
            </div>
        </header>
        <div class="post-content">
            <p>${content}</p>
        </div>
        <footer class="post-footer">
            <div class="post-stats">
                <span class="likes-count">0 likes</span>
                <a href="comments.html" class="comments-count">0 comments</a>
            </div>
            <div class="post-actions">
                <button class="action-btn like-btn" data-action="like">
                    <span class="action-icon"><i class="fa fa-heart" aria-hidden="true"></i></span>
                </button>
                <a href="comments.html" class="action-btn comment-btn">
                    <span class="action-icon"><i class="fa fa-commenting" aria-hidden="true"></i></span>
                </a>
                <button class="action-btn save-btn" data-action="save">
                    <span class="action-icon"><i class="fa fa-bookmark" aria-hidden="true"></i></span>
                </button>
            </div>
        </footer>
    `;
    
    return postElement;
}

// Show notification function
function showNotification(message) {
    const statusDiv = document.getElementById('status-messages');
    if (statusDiv) {
        statusDiv.textContent = message;
        setTimeout(() => {
            statusDiv.textContent = '';
        }, 3000);
    }
    
    // Also show in console for debugging
    console.log(`📢 Notification: ${message}`);
}

// Comment like button functionality
function initializeCommentLikeButtons() {
    const commentLikeButtons = document.querySelectorAll('.comment-like-btn');
    
    commentLikeButtons.forEach(button => {
        if (button.dataset.initialized) return;
        
        let liked = button.classList.contains('liked');
        const countSpan = button.querySelector('span');
        let currentLikes = 0;
        
        if (countSpan) {
            const match = countSpan.textContent.match(/\d+/);
            currentLikes = match ? parseInt(match[0]) : 0;
        }
        
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (liked) {
                currentLikes--;
                liked = false;
                button.classList.remove('liked');
            } else {
                currentLikes++;
                liked = true;
                button.classList.add('liked');
            }
            
            if (countSpan) {
                countSpan.textContent = currentLikes;
            }
            
            // Animation
            button.style.transform = 'scale(1.2)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 150);
        });
        
        button.dataset.initialized = 'true';
    });
    
    console.log(`✅ Initialized ${commentLikeButtons.length} comment like buttons`);
}

// Initialize all interactive features when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing interactive features...');
    
    initializeLikeButtons();
    initializeFollowButtons();
    initializeSaveButtons();
    initializePostCreator();
    initializeCommentLikeButtons();
    
    console.log('✅ All interactive features initialized');
});
