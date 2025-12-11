// Mobile Navigation Functionality
document.addEventListener('DOMContentLoaded', function() {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mobileDropdown = document.getElementById('mobile-dropdown');
    let isMenuOpen = false;
    
    if (!hamburgerBtn || !mobileDropdown) {
        console.log('Mobile navigation elements not found on this page');
        return;
    }
    
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
    
    console.log('✅ Mobile navigation initialized successfully');
});

// Logout confirmation function
function confirmLogout(event) {
    event.preventDefault();
    
    if (confirm('Are you sure you want to log out?')) {
        window.location.href = 'login.html';
    }
}
