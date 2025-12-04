// Profile Page Specific Functionality

// Profile Tab Navigation
function initializeProfileTabs() {
    const tabButtons = document.querySelectorAll('.profile-nav-link');
    const tabContents = document.querySelectorAll('.tab-content');
    
    if (tabButtons.length === 0) {
        console.log('No profile tabs found on this page');
        return;
    }
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Get tab target
            const tabTarget = this.getAttribute('href') || this.dataset.tab;
            
            // Show notification about tab switch
            const tabName = this.textContent.trim();
            showNotification(`Switched to ${tabName} tab`);
            
            console.log(`📋 Switched to tab: ${tabName}`);
        });
    });
    
    console.log(`✅ Initialized ${tabButtons.length} profile tabs`);
}

// Profile Stats Click Animation
function initializeProfileStats() {
    const statItems = document.querySelectorAll('.stat-item');
    
    statItems.forEach(statItem => {
        if (statItem.dataset.initialized) return;
        
        const statNumber = statItem.querySelector('.stat-number');
        const statLabel = statItem.querySelector('.stat-label');
        
        if (!statNumber || !statLabel) return;
        
        let currentValue = parseInt(statNumber.textContent.replace(/[^\d]/g, ''));
        
        statItem.addEventListener('click', function() {
            // Increment the stat (demo functionality)
            currentValue++;
            
            // Format number (add 'k' for thousands)
            let displayValue = currentValue;
            if (currentValue >= 1000) {
                displayValue = (currentValue / 1000).toFixed(1) + 'k';
            }
            
            statNumber.textContent = displayValue;
            
            // Animation effect
            statItem.style.transform = 'scale(1.1)';
            statItem.style.backgroundColor = '#e3f2fd';
            
            setTimeout(() => {
                statItem.style.transform = 'scale(1)';
                statItem.style.backgroundColor = 'transparent';
            }, 300);
            
            // Show notification
            const statType = statLabel.textContent.toLowerCase();
            showNotification(`${statType} updated! (Demo functionality)`);
        });
        
        // Add cursor pointer to indicate clickable
        statItem.style.cursor = 'pointer';
        statItem.style.transition = 'all 0.3s ease';
        
        statItem.dataset.initialized = 'true';
    });
    
    console.log(`✅ Initialized ${statItems.length} profile stats`);
}

// Edit Profile Button functionality
function initializeEditProfile() {
    const editBtn = document.querySelector('.edit-profile-btn');
    if (!editBtn) return;
    
    editBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Simple demo - change button text temporarily
        const originalText = editBtn.textContent;
        editBtn.textContent = '✏️ Editing...';
        editBtn.disabled = true;
        
        setTimeout(() => {
            editBtn.textContent = originalText;
            editBtn.disabled = false;
            showNotification('Edit profile feature coming soon!');
        }, 1500);
    });
    
    console.log('✅ Edit profile button initialized');
}

// Notification function (shared with interactions.js)
function showNotification(message) {
    const statusDiv = document.getElementById('status-messages');
    if (statusDiv) {
        statusDiv.textContent = message;
        setTimeout(() => {
            statusDiv.textContent = '';
        }, 3000);
    }
    
    console.log(`📢 Notification: ${message}`);
}

// Initialize profile-specific features
document.addEventListener('DOMContentLoaded', function() {
    // Only run on profile page
    if (document.querySelector('.profile-main')) {
        console.log('🚀 Initializing profile page features...');
        
        initializeProfileTabs();
        initializeProfileStats();
        initializeEditProfile();
        
        console.log('✅ Profile page features initialized');
    }
});

