// Settings Page Functionality

// Mock current user settings (in real app, this would come from backend)
const currentSettings = {
    displayName: 'John Doe',
    username: 'johndoe',
    email: 'john@example.com',
    bio: 'Computer Science Student at Tech University | Web Developer | React Enthusiast',
    website: 'johndoe.dev',
    location: 'San Francisco, CA',
    profileVisibility: 'public',
    postsVisibility: 'public',
    showEmail: true,
    showLocation: true,
    requireTagApproval: false,
    searchableByEmail: true,
    shareLocation: false,
    emailLikes: true,
    emailComments: true,
    emailFollowers: true,
    emailMentions: true,
    pushMessages: true,
    pushLikes: false,
    pushFollows: true,
    notificationFrequency: 'realtime',
    themeMode: 'light',
    language: 'en',
    fontSize: 'medium',
    compactMode: false,
    autoplayMedia: true,
    reducedMotion: false,
    followRequests: 'everyone',
    messagePermissions: 'followers',
    muteVideos: true,
    contentFiltering: true,
    hideOffensiveContent: true,
    requireFollowToMessage: true,
    analyticsConsent: true,
    marketingConsent: false,
    thirdPartySharing: false
};

// Load user settings into form
function loadUserSettings() {
    console.log('📥 Loading user settings...');
    
    // Load text inputs
    Object.keys(currentSettings).forEach(key => {
        const element = document.querySelector(`[name="${key}"]`);
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = currentSettings[key];
            } else {
                element.value = currentSettings[key];
            }
        }
    });
    
    console.log('✅ User settings loaded');
}

// Save settings function
function saveSettings(formData) {
    console.log('💾 Saving settings...', formData);
    
    // Show loading state
    const saveBtn = document.querySelector('.save-btn');
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Saving...';
    saveBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // In real app, this would be an API call to backend
        // fetch('/api/settings', { method: 'POST', body: JSON.stringify(formData) })
        
        saveBtn.innerHTML = '<i class="fa fa-check"></i> Saved!';
        saveBtn.style.backgroundColor = '#28a745';
        
        showNotification('Settings saved successfully!');
        
        // Reset button after 2 seconds
        setTimeout(() => {
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
            saveBtn.style.backgroundColor = '#088178';
        }, 2000);
        
    }, 1500);
}

// Form validation
function validateForm(formData) {
    const errors = [];
    
    // Required fields
    if (!formData.displayName.trim()) {
        errors.push('Display name is required');
    }
    
    if (!formData.username.trim()) {
        errors.push('Username is required');
    }
    
    if (!formData.email.trim()) {
        errors.push('Email is required');
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
        errors.push('Please enter a valid email address');
    }
    
    // Username format validation
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (formData.username && !usernameRegex.test(formData.username)) {
        errors.push('Username must be 3-20 characters, letters, numbers, and underscores only');
    }
    
    // Password validation (if changing password)
    if (formData.newPassword) {
        if (formData.newPassword.length < 8) {
            errors.push('New password must be at least 8 characters');
        }
        if (formData.newPassword !== formData.confirmPassword) {
            errors.push('Passwords do not match');
        }
        if (!formData.currentPassword) {
            errors.push('Current password is required to change password');
        }
    }
    
    return errors;
}

// Show validation errors
function showValidationErrors(errors) {
    // Remove existing error messages
    const existingErrors = document.querySelectorAll('.settings-message.error');
    existingErrors.forEach(error => error.remove());
    
    if (errors.length > 0) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'settings-message error';
        errorDiv.innerHTML = `
            <i class="fa fa-exclamation-triangle"></i>
            <div>
                <strong>Please fix the following errors:</strong>
                <ul style="margin: 8px 0 0 0; padding-left: 20px;">
                    ${errors.map(error => `<li>${error}</li>`).join('')}
                </ul>
            </div>
        `;
        
        const form = document.getElementById('settings-form');
        form.insertBefore(errorDiv, form.firstChild);
        
        // Scroll to top to show errors
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Special functionality buttons
function initializeSpecialButtons() {
    // 2FA Setup
    const setup2faBtn = document.getElementById('setup-2fa');
    setup2faBtn?.addEventListener('click', function() {
        showNotification('2FA setup would open here (backend integration needed)');
        console.log('🔐 2FA setup requested');
    });
    
    // Manage Sessions
    const manageSessionsBtn = document.getElementById('manage-sessions');
    manageSessionsBtn?.addEventListener('click', function() {
        showNotification('Session management would open here (backend integration needed)');
        console.log('💻 Session management requested');
    });
    
    // Export Data
    const exportDataBtn = document.getElementById('export-data');
    exportDataBtn?.addEventListener('click', function() {
        showNotification('Data export started (this would generate a download)');
        console.log('📤 Data export requested');
    });
    
    // Manage Blocked Users
    const manageBlockedBtn = document.getElementById('manage-blocked');
    manageBlockedBtn?.addEventListener('click', function() {
        showNotification('Blocked users management would open here');
        console.log('🚫 Blocked users management requested');
    });
    
    // Deactivate Account
    const deactivateBtn = document.getElementById('deactivate-account');
    deactivateBtn?.addEventListener('click', function() {
        if (confirm('Are you sure you want to deactivate your account? You can reactivate it anytime.')) {
            showNotification('Account deactivation would be processed (backend needed)');
            console.log('⏸️ Account deactivation requested');
        }
    });
    
    // Delete Account
    const deleteBtn = document.getElementById('delete-account');
    deleteBtn?.addEventListener('click', function() {
        const confirmation = prompt('Type "DELETE" to confirm account deletion:');
        if (confirmation === 'DELETE') {
            showNotification('Account deletion would be processed (backend needed)');
            console.log('🗑️ Account deletion requested');
        } else if (confirmation !== null) {
            showNotification('Account deletion cancelled - confirmation text did not match');
        }
    });
    
    // Cancel Changes
    const cancelBtn = document.getElementById('cancel-changes');
    cancelBtn?.addEventListener('click', function() {
        if (confirm('Discard all unsaved changes?')) {
            loadUserSettings();
            showNotification('Changes discarded');
        }
    });
    
    // Reset to Defaults
    const resetBtn = document.getElementById('reset-defaults');
    resetBtn?.addEventListener('click', function() {
        if (confirm('Reset all settings to default values?')) {
            // Reset form to default values
            document.getElementById('settings-form').reset();
            showNotification('Settings reset to defaults');
        }
    });
}

// Theme switching functionality
function initializeThemeToggle() {
    const themeSelect = document.getElementById('theme-mode');
    if (!themeSelect) return;
    
    themeSelect.addEventListener('change', function() {
        const theme = this.value;
        
        // Apply theme immediately
        if (theme === 'dark') {
            applyDarkMode();
            showNotification('Dark mode applied');
        } else if (theme === 'light') {
            applyLightMode();
            showNotification('Light mode applied');
        } else {
            applySystemTheme();
            showNotification('System theme applied');
        }
        
        console.log(`🎨 Theme changed to: ${theme}`);
    });
}

// Apply dark mode with beautiful, cohesive colors
function applyDarkMode() {
    console.log('🌙 Applying dark mode...');
    
    // Simply add the dark-mode class - CSS handles everything
    document.body.classList.add('dark-mode');
    
    // Store preference
    localStorage.setItem('theme', 'dark');
    
    console.log('✅ Dark mode applied successfully');
}

// Apply light mode 
function applyLightMode() {
    console.log('☀️ Applying light mode...');
    
    // Remove dark-mode class - returns to original CSS
    document.body.classList.remove('dark-mode');
    
    // Store preference
    localStorage.setItem('theme', 'light');
    
    console.log('✅ Light mode applied successfully');
}

// Apply system theme
function applySystemTheme() {
    console.log('🖥️ Applying system theme...');
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    
    // Store preference
    localStorage.setItem('theme', 'system');
    
    console.log('✅ System theme applied successfully');
}

// Load saved theme on page load
function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const themeSelect = document.getElementById('theme-mode');
    
    if (themeSelect) {
        themeSelect.value = savedTheme;
    }
    
    // Apply the saved theme
    switch(savedTheme) {
        case 'dark':
            applyDarkMode();
            break;
        case 'system':
            applySystemTheme();
            break;
        default:
            applyLightMode();
    }
}

// Font size adjustment
function initializeFontSizeToggle() {
    const fontSizeSelect = document.getElementById('font-size');
    if (!fontSizeSelect) return;
    
    fontSizeSelect.addEventListener('change', function() {
        const fontSize = this.value;
        
        // Apply font size immediately (demo)
        const root = document.documentElement;
        switch(fontSize) {
            case 'small':
                root.style.fontSize = '14px';
                break;
            case 'large':
                root.style.fontSize = '18px';
                break;
            default:
                root.style.fontSize = '16px';
        }
        
        showNotification(`Font size changed to ${fontSize}`);
        console.log(`📝 Font size changed to: ${fontSize}`);
    });
}

// Show notification function
function showNotification(message) {
    const statusDiv = document.getElementById('status-messages');
    if (statusDiv) {
        statusDiv.textContent = message;
        setTimeout(() => {
            statusDiv.textContent = '';
        }, 4000);
    }
    
    console.log(`📢 Settings Notification: ${message}`);
}

// Initialize settings page
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing settings page...');
    
    // Load current user settings
    loadUserSettings();
    
    // Load saved theme
    loadSavedTheme();
    
    // Initialize special buttons
    initializeSpecialButtons();
    
    // Initialize theme and font controls
    initializeThemeToggle();
    initializeFontSizeToggle();
    
    // Handle form submission
    const settingsForm = document.getElementById('settings-form');
    settingsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Collect form data
        const formData = new FormData(this);
        const settingsData = {};
        
        // Convert FormData to object
        for (let [key, value] of formData.entries()) {
            settingsData[key] = value;
        }
        
        // Add checkbox values (unchecked checkboxes don't appear in FormData)
        const checkboxes = this.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            settingsData[checkbox.name] = checkbox.checked;
        });
        
        console.log('📋 Form data collected:', settingsData);
        
        // Validate form
        const errors = validateForm(settingsData);
        
        if (errors.length > 0) {
            showValidationErrors(errors);
            return;
        }
        
        // Save settings
        saveSettings(settingsData);
    });
    
    console.log('✅ Settings page initialized');
});
