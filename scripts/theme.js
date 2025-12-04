// Theme Management - Shared across all pages

// Load and apply saved theme
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    switch(savedTheme) {
        case 'dark':
            document.body.classList.add('dark-mode');
            break;
        case 'system':
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.body.classList.add('dark-mode');
            }
            break;
        default:
            document.body.classList.remove('dark-mode');
    }
    
    console.log(`🎨 Theme loaded: ${savedTheme}`);
}

// Listen for system theme changes
if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'system') {
            if (e.matches) {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
            console.log('🖥️ System theme changed');
        }
    });
}

// Load theme immediately (before DOM content loaded)
loadTheme();

