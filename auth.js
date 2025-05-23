// Heart Heal AI - Authentication JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginTab = document.getElementById('login-tab');
    const signupTab = document.getElementById('signup-tab');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const toggleAudioBtn = document.getElementById('toggle-audio');
    const volumeSlider = document.getElementById('volume-slider');
    const backgroundMusic = document.getElementById('background-music');
    
    // Audio Controls
    let isPlaying = false;
    
    // Start playing background music with user interaction
    document.body.addEventListener('click', function() {
        if (!isPlaying) {
            playBackgroundMusic();
        }
    }, { once: true });
    
    function playBackgroundMusic() {
        backgroundMusic.volume = volumeSlider.value / 100;
        backgroundMusic.play()
            .then(() => {
                isPlaying = true;
                toggleAudioBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
            })
            .catch(error => {
                console.error('Audio playback failed:', error);
            });
    }
    
    // Toggle audio playback
    toggleAudioBtn.addEventListener('click', function() {
        if (isPlaying) {
            backgroundMusic.pause();
            isPlaying = false;
            toggleAudioBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        } else {
            playBackgroundMusic();
        }
    });
    
    // Volume control
    volumeSlider.addEventListener('input', function() {
        backgroundMusic.volume = this.value / 100;
        
        // Update icon based on volume level
        if (this.value == 0) {
            toggleAudioBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        } else if (this.value < 50) {
            toggleAudioBtn.innerHTML = '<i class="fas fa-volume-down"></i>';
        } else {
            toggleAudioBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
        }
    });
    
    // Tab switching
    loginTab.addEventListener('click', function() {
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
    });
    
    signupTab.addEventListener('click', function() {
        signupTab.classList.add('active');
        loginTab.classList.remove('active');
        signupForm.style.display = 'block';
        loginForm.style.display = 'none';
    });
    
    // Form submissions
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const rememberMe = document.getElementById('remember-me').checked;
        
        // For now, just log the values and simulate login
        console.log('Login attempt:', { email, password, rememberMe });
        
        // Simulate successful login (will be replaced with actual backend call)
        simulateLogin(email);
    });
    
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const gender = document.getElementById('signup-gender').value;
        
        // For now, just log the values and simulate signup
        console.log('Signup attempt:', { name, email, password, gender });
        
        // Simulate successful signup (will be replaced with actual backend call)
        simulateSignup(name, email, gender);
    });
    
    // Forgot password link
    document.getElementById('forgot-password').addEventListener('click', function(e) {
        e.preventDefault();
        alert('Password reset functionality will be implemented in the backend integration phase.');
    });
    
    // Simulated authentication functions (to be replaced with actual backend calls)
    function simulateLogin(email) {
        // Show loading state
        const loginButton = loginForm.querySelector('button[type="submit"]');
        const originalText = loginButton.textContent;
        loginButton.textContent = 'Logging in...';
        loginButton.disabled = true;
        
        // Simulate API call delay
        setTimeout(() => {
            // Store user info in localStorage (temporary solution until backend is implemented)
            localStorage.setItem('heartHealUser', JSON.stringify({
                email: email,
                name: email.split('@')[0], // Extract name from email as placeholder
                gender: 'unknown', // Default gender until profile is completed
                isLoggedIn: true
            }));
            
            // Redirect to chat page (will be implemented later)
            window.location.href = 'chat.html';
        }, 1500);
    }
    
    function simulateSignup(name, email, gender) {
        // Show loading state
        const signupButton = signupForm.querySelector('button[type="submit"]');
        const originalText = signupButton.textContent;
        signupButton.textContent = 'Creating account...';
        signupButton.disabled = true;
        
        // Simulate API call delay
        setTimeout(() => {
            // Store user info in localStorage (temporary solution until backend is implemented)
            localStorage.setItem('heartHealUser', JSON.stringify({
                email: email,
                name: name,
                gender: gender,
                isLoggedIn: true
            }));
            
            // Redirect to chat page (will be implemented later)
            window.location.href = 'chat.html';
        }, 1500);
    }
});
