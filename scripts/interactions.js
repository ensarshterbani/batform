// Interactive Features for Social Media Website

// Simple like button functionality
function initializeLikeButtons() {
    const likeButtons = document.querySelectorAll('.action-btn.like-btn');
    
    likeButtons.forEach((button, index) => {
        if (button.dataset.initialized) return; // Skip if already initialized
        
        let liked = false;
        const postFooter = button.closest('.post-footer');
        const likesSpan = postFooter.querySelector('.likes-count');
        const initialLikes = parseInt(likesSpan.textContent.match(/\d+/)[0]);
        let currentLikes = initialLikes;
        
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (liked) {
                currentLikes--;
                liked = false;
                button.classList.remove('liked');
                button.querySelector('.action-icon').textContent = '♡';
                button.style.color = '#6c757d';
            } else {
                currentLikes++;
                liked = true;
                button.classList.add('liked');
                button.querySelector('.action-icon').textContent = '♥';
                button.style.color = '#e74c3c';
            }
            
            // Update the like count display
            button.querySelector('.action-text').textContent = `Like (${currentLikes})`;
            likesSpan.textContent = `${currentLikes} likes`;
            
            // Visual feedback animation
            button.style.transform = 'scale(1.1)';
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

// Post Creator functionality
function initializePostCreator() {
    const postCreator = document.querySelector('.post-creator');
    if (!postCreator) return;
    
    const postInput = postCreator.querySelector('.post-input');
    const postSubmitBtn = postCreator.querySelector('.post-submit-btn');
    const feedContainer = document.querySelector('.feed-container');
    
    if (!postInput || !postSubmitBtn) return;
    
    // Enable/disable submit button based on content
    postInput.addEventListener('input', function() {
        if (postInput.value.trim()) {
            postSubmitBtn.disabled = false;
            postSubmitBtn.style.opacity = '1';
        } else {
            postSubmitBtn.disabled = true;
            postSubmitBtn.style.opacity = '0.6';
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
                <span class="comments-count">0 comments</span>
            </div>
            <div class="post-actions">
                <button class="action-btn like-btn" data-action="like">
                    <span class="action-icon">♡</span>
                    <span class="action-text">Like (0)</span>
                </button>
                <button class="action-btn comment-btn" data-action="comment">
                    <span class="action-icon">💬</span>
                    <span class="action-text">Comment</span>
                </button>
                <button class="action-btn share-btn" data-action="share">
                    <span class="action-icon">↗</span>
                    <span class="action-text">Share</span>
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

// Initialize all interactive features when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing interactive features...');
    
    initializeLikeButtons();
    initializeFollowButtons();
    initializePostCreator();
    
    console.log('✅ All interactive features initialized');
});
