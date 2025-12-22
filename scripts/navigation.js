// Mobile Navigation Functionality
document.addEventListener('DOMContentLoaded', function() {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mobileDropdown = document.getElementById('mobile-dropdown');
    let isMenuOpen = false;
    
    if (hamburgerBtn && mobileDropdown) {
        // Toggle mobile menu
        hamburgerBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            isMenuOpen = !isMenuOpen;
            
            if (isMenuOpen) {
                mobileDropdown.classList.add('show');
                hamburgerBtn.classList.add('active');
                hamburgerBtn.querySelector('i').classList.remove('fa-bars');
                hamburgerBtn.querySelector('i').classList.add('fa-times');
            } else {
                mobileDropdown.classList.remove('show');
                hamburgerBtn.classList.remove('active');
                hamburgerBtn.querySelector('i').classList.remove('fa-times');
                hamburgerBtn.querySelector('i').classList.add('fa-bars');
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (isMenuOpen && !hamburgerBtn.contains(e.target) && !mobileDropdown.contains(e.target)) {
                isMenuOpen = false;
                mobileDropdown.classList.remove('show');
                hamburgerBtn.classList.remove('active');
                hamburgerBtn.querySelector('i').classList.remove('fa-times');
                hamburgerBtn.querySelector('i').classList.add('fa-bars');
            }
        });
        
        // Close menu when clicking on a link
        const mobileLinks = document.querySelectorAll('.mobile-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', function() {
                isMenuOpen = false;
                mobileDropdown.classList.remove('show');
                hamburgerBtn.classList.remove('active');
                hamburgerBtn.querySelector('i').classList.remove('fa-times');
                hamburgerBtn.querySelector('i').classList.add('fa-bars');
            });
        });
        
        console.log('✅ Mobile navigation initialized');
    }
    
    // Logout button handler (sidebar)
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    }
    
    // Mobile logout button handler
    const mobileLogoutBtns = document.querySelectorAll('.mobile-logout-btn');
    mobileLogoutBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    });
    
    // Update sidebar user info
    updateSidebarUserInfo();
});

// Update sidebar with current user info
function updateSidebarUserInfo() {
    if (typeof Storage === 'undefined' || !Storage.getCurrentUser) return;
    
    const currentUser = Storage.getCurrentUser();
    if (!currentUser) return;
    
    // Update user name
    document.querySelectorAll('.current-user-name').forEach(el => {
        el.textContent = currentUser.fullName;
    });
    
    // Update username
    document.querySelectorAll('.current-user-username').forEach(el => {
        el.textContent = '@' + currentUser.username;
    });
    
    // Update avatar
    document.querySelectorAll('.current-user-avatar').forEach(el => {
        el.src = currentUser.avatar || 'images/profile_picture.svg';
    });
    
    // Update stats
    const followersEl = document.getElementById('sidebar-followers');
    const postsEl = document.getElementById('sidebar-posts');
    
    if (followersEl) {
        followersEl.textContent = Storage.getFollowerCount ? Storage.getFollowerCount(currentUser.id) : 0;
    }
    
    if (postsEl) {
        const posts = Storage.getPostsByUser ? Storage.getPostsByUser(currentUser.id) : [];
        postsEl.textContent = posts.length;
    }
    
    // Update post creator placeholder
    const postInput = document.getElementById('post-input');
    if (postInput) {
        postInput.placeholder = `What's on your mind, ${currentUser.fullName.split(' ')[0]}?`;
    }
}

// Centralized logout handler
function handleLogout() {
    if (confirm('Are you sure you want to log out?')) {
        if (typeof Storage !== 'undefined' && Storage.logoutUser) {
            Storage.logoutUser();
        }
        if (typeof App !== 'undefined' && App.showToast) {
            App.showToast('Logged out successfully', 'success');
        }
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 500);
    }
}

// Legacy logout function for backward compatibility
function confirmLogout(event) {
    event.preventDefault();
    handleLogout();
}
