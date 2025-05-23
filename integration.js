// Integration script to connect frontend with backend API
// This will be used to modify the frontend JavaScript files

// Update auth.js to use the backend API
const updateAuthJs = `// Heart Heal AI - Authentication JavaScript with Backend Integration

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginTab = document.getElementById('login-tab');
    const signupTab = document.getElementById('signup-tab');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const toggleAudioBtn = document.getElementById('toggle-audio');
    const volumeSlider = document.getElementById('volume-slider');
    const backgroundMusic = document.getElementById('background-music');
    
    // API Base URL
    const API_BASE_URL = '/api';
    
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
        
        // Show loading state
        const loginButton = loginForm.querySelector('button[type="submit"]');
        const originalText = loginButton.textContent;
        loginButton.textContent = 'Logging in...';
        loginButton.disabled = true;
        
        // Call the login API
        fetch(\`\${API_BASE_URL}/auth/login\`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Login failed');
            }
            return response.json();
        })
        .then(data => {
            // Store token and user info
            localStorage.setItem('heartHealToken', data.access_token);
            localStorage.setItem('heartHealUser', JSON.stringify(data.user));
            
            // Redirect to chat page
            window.location.href = 'chat.html';
        })
        .catch(error => {
            console.error('Login error:', error);
            alert('Login failed. Please check your email and password.');
            
            // Reset button
            loginButton.textContent = originalText;
            loginButton.disabled = false;
        });
    });
    
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const gender = document.getElementById('signup-gender').value;
        
        // Show loading state
        const signupButton = signupForm.querySelector('button[type="submit"]');
        const originalText = signupButton.textContent;
        signupButton.textContent = 'Creating account...';
        signupButton.disabled = true;
        
        // Call the register API
        fetch(\`\${API_BASE_URL}/auth/register\`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password, gender })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Registration failed');
            }
            return response.json();
        })
        .then(data => {
            // Store token and user info
            localStorage.setItem('heartHealToken', data.access_token);
            localStorage.setItem('heartHealUser', JSON.stringify(data.user));
            
            // Redirect to chat page
            window.location.href = 'chat.html';
        })
        .catch(error => {
            console.error('Registration error:', error);
            alert('Registration failed. This email might already be in use.');
            
            // Reset button
            signupButton.textContent = originalText;
            signupButton.disabled = false;
        });
    });
    
    // Forgot password link
    document.getElementById('forgot-password').addEventListener('click', function(e) {
        e.preventDefault();
        alert('Please contact support to reset your password.');
    });
    
    // Check if user is already logged in
    const token = localStorage.getItem('heartHealToken');
    if (token) {
        // Verify token validity by fetching profile
        fetch(\`\${API_BASE_URL}/auth/profile\`, {
            headers: {
                'Authorization': \`Bearer \${token}\`
            }
        })
        .then(response => {
            if (response.ok) {
                // Token is valid, redirect to chat
                window.location.href = 'chat.html';
            } else {
                // Token is invalid, clear storage
                localStorage.removeItem('heartHealToken');
                localStorage.removeItem('heartHealUser');
            }
        })
        .catch(error => {
            console.error('Token verification error:', error);
            localStorage.removeItem('heartHealToken');
            localStorage.removeItem('heartHealUser');
        });
    }
});`;

// Update chat.js to use the backend API
const updateChatJs = `// Heart Heal AI - Chat JavaScript with Backend Integration

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const token = localStorage.getItem('heartHealToken');
    const userInfo = JSON.parse(localStorage.getItem('heartHealUser') || '{}');
    
    if (!token) {
        // Redirect to login page if not logged in
        window.location.href = 'index.html';
        return;
    }
    
    // API Base URL
    const API_BASE_URL = '/api';
    
    // DOM Elements
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menu-toggle');
    const closeSidebar = document.getElementById('close-sidebar');
    const newChatBtn = document.getElementById('new-chat-btn');
    const conversationList = document.getElementById('conversation-list');
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');
    const userNameWelcome = document.getElementById('user-name-welcome');
    const welcomeScreen = document.getElementById('welcome-screen');
    const startChatBtn = document.getElementById('start-chat-btn');
    const chatMessages = document.getElementById('chat-messages');
    const chatInputContainer = document.getElementById('chat-input-container');
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send-btn');
    const toggleAudioBtn = document.getElementById('toggle-audio');
    const volumeSlider = document.getElementById('volume-slider');
    const backgroundMusic = document.getElementById('background-music');
    
    // Current conversation ID
    let currentConversationId = null;
    
    // Set user information
    userName.textContent = userInfo.name || 'User';
    userNameWelcome.textContent = userInfo.name || 'there';
    userAvatar.textContent = (userInfo.name || 'U').charAt(0).toUpperCase();
    
    // Audio Controls
    let isPlaying = false;
    
    // Start playing background music with lower volume
    backgroundMusic.volume = volumeSlider.value / 100;
    backgroundMusic.play()
        .then(() => {
            isPlaying = true;
            toggleAudioBtn.innerHTML = '<i class="fas fa-volume-down"></i>';
        })
        .catch(error => {
            console.error('Audio playback failed:', error);
        });
    
    // Toggle audio playback
    toggleAudioBtn.addEventListener('click', function() {
        if (isPlaying) {
            backgroundMusic.pause();
            isPlaying = false;
            toggleAudioBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        } else {
            backgroundMusic.play();
            isPlaying = true;
            if (volumeSlider.value == 0) {
                toggleAudioBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
            } else if (volumeSlider.value < 50) {
                toggleAudioBtn.innerHTML = '<i class="fas fa-volume-down"></i>';
            } else {
                toggleAudioBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
            }
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
    
    // Mobile sidebar toggle
    menuToggle.addEventListener('click', function() {
        sidebar.classList.add('active');
    });
    
    closeSidebar.addEventListener('click', function() {
        sidebar.classList.remove('active');
    });
    
    // Load conversation list
    function loadConversations() {
        fetch(\`\${API_BASE_URL}/chat/conversations\`, {
            headers: {
                'Authorization': \`Bearer \${token}\`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load conversations');
            }
            return response.json();
        })
        .then(data => {
            // Clear existing list
            conversationList.innerHTML = '';
            
            // Add conversations to list
            data.conversations.forEach(conv => {
                const conversationItem = document.createElement('li');
                conversationItem.className = 'conversation-item';
                conversationItem.textContent = conv.title;
                conversationItem.dataset.id = conv.id;
                
                // Add click event to load conversation
                conversationItem.addEventListener('click', function() {
                    loadConversation(conv.id);
                    
                    // Update active state
                    document.querySelectorAll('.conversation-item').forEach(item => {
                        item.classList.remove('active');
                    });
                    conversationItem.classList.add('active');
                    
                    // Hide welcome screen, show chat
                    welcomeScreen.style.display = 'none';
                    chatMessages.style.display = 'flex';
                    chatInputContainer.style.display = 'block';
                    
                    // On mobile, close sidebar after selection
                    if (window.innerWidth < 768) {
                        sidebar.classList.remove('active');
                    }
                });
                
                conversationList.appendChild(conversationItem);
            });
        })
        .catch(error => {
            console.error('Error loading conversations:', error);
        });
    }
    
    // Load a specific conversation
    function loadConversation(conversationId) {
        currentConversationId = conversationId;
        
        fetch(\`\${API_BASE_URL}/chat/conversations/\${conversationId}\`, {
            headers: {
                'Authorization': \`Bearer \${token}\`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load conversation');
            }
            return response.json();
        })
        .then(data => {
            // Clear existing messages
            chatMessages.innerHTML = '';
            
            // Add messages to chat
            data.messages.forEach(msg => {
                if (msg.message_type === 'song_recommendation' && msg.metadata) {
                    // This is a song recommendation
                    const songData = typeof msg.metadata === 'string' ? JSON.parse(msg.metadata) : msg.metadata;
                    const songHTML = \`
                        <div class="song-recommendation">
                            <img src="\${songData.thumbnail}" alt="\${songData.title}" class="song-thumbnail">
                            <div class="song-info">
                                <div class="song-title">\${songData.title} - \${songData.artist}</div>
                                <div class="song-reason">\${songData.reason}</div>
                                <a href="\${songData.link}" target="_blank" class="btn btn-outline mt-2">
                                    <i class="fab fa-youtube"></i> Listen on YouTube
                                </a>
                            </div>
                        </div>
                    `;
                    addMessage(msg.sender, songHTML, true);
                } else {
                    // Regular message
                    addMessage(msg.sender, msg.content);
                }
            });
            
            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
        })
        .catch(error => {
            console.error('Error loading conversation:', error);
        });
    }
    
    // Start chat button
    startChatBtn.addEventListener('click', function() {
        // Create a new conversation
        fetch(\`\${API_BASE_URL}/chat/conversations\`, {
            method: 'POST',
            headers: {
                'Authorization': \`Bearer \${token}\`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: \`Conversation \${new Date().toLocaleString()}\`
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to create conversation');
            }
            return response.json();
        })
        .then(data => {
            // Set current conversation
            currentConversationId = data.conversation.id;
            
            // Hide welcome screen, show chat
            welcomeScreen.style.display = 'none';
            chatMessages.style.display = 'flex';
            chatInputContainer.style.display = 'block';
            
            // Load the new conversation
            loadConversation(currentConversationId);
            
            // Refresh conversation list
            loadConversations();
        })
        .catch(error => {
            console.error('Error creating conversation:', error);
            alert('Failed to start a new conversation. Please try again.');
        });
    });
    
    // Auto-resize textarea
    chatInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
    
    // Send message on Enter (but allow Shift+Enter for new line)
    chatInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Send message button
    chatSendBtn.addEventListener('click', sendMessage);
    
    // New chat button
    newChatBtn.addEventListener('click', function() {
        // Clear chat messages
        chatMessages.innerHTML = '';
        
        // Show welcome screen again
        welcomeScreen.style.display = 'flex';
        chatMessages.style.display = 'none';
        chatInputContainer.style.display = 'none';
        
        // Reset current conversation
        currentConversationId = null;
        
        // Refresh conversation list
        loadConversations();
    });
    
    // Function to send a message
    function sendMessage() {
        const message = chatInput.value.trim();
        if (!message || !currentConversationId) return;
        
        // Add user message to chat
        addMessage('user', message);
        
        // Clear input
        chatInput.value = '';
        chatInput.style.height = 'auto';
        
        // Show typing indicator
        showTypingIndicator();
        
        // Send message to API
        fetch(\`\${API_BASE_URL}/chat/conversations/\${currentConversationId}/messages\`, {
            method: 'POST',
            headers: {
                'Authorization': \`Bearer \${token}\`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: message
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to send message');
            }
            return response.json();
        })
        .then(data => {
            // Remove typing indicator
            const typingIndicator = document.querySelector('.typing-indicator');
            if (typingIndicator) {
                typingIndicator.remove();
            }
            
            // Add AI responses
            data.ai_responses.forEach(response => {
                if (response.message_type === 'song_recommendation' && response.metadata) {
                    // This is a song recommendation
                    const songData = typeof response.metadata === 'string' ? JSON.parse(response.metadata) : response.metadata;
                    const songHTML = \`
                        <div class="song-recommendation">
                            <img src="\${songData.thumbnail}" alt="\${songData.title}" class="song-thumbnail">
                            <div class="song-info">
                                <div class="song-title">\${songData.title} - \${songData.artist}</div>
                                <div class="song-reason">\${songData.reason}</div>
                                <a href="\${songData.link}" target="_blank" class="btn btn-outline mt-2">
                                    <i class="fab fa-youtube"></i> Listen on YouTube
                                </a>
                            </div>
                        </div>
                    \`;
                    addMessage('ai', songHTML, true);
                } else {
                    // Regular message
                    addMessage('ai', response.content);
                }
            });
        })
        .catch(error => {
            console.error('Error sending message:', error);
            
            // Remove typing indicator
            const typingIndicator = document.querySelector('.typing-indicator');
            if (typingIndicator) {
                typingIndicator.remove();
            }
            
            // Add error message
            addMessage('ai', 'Sorry, I encountered an error. Please try again.');
        });
    }
    
    // Function to add a message to the chat
    function addMessage(sender, content, isSpecial = false) {
        // Remove typing indicator if it exists
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        
        if (isSpecial) {
            // This is for song recommendations or other special content
            chatMessages.innerHTML += content;
        } else {
            // Regular message
            const messageElement = document.createElement('div');
            messageElement.className = \`message message-\${sender}\`;
            
            // Process content for links
            const processedContent = processLinks(content);
            
            messageElement.innerHTML = \`
                \${processedContent}
                <div class="message-time">\${new Date().toLocaleTimeString()}</div>
            \`;
            
            chatMessages.appendChild(messageElement);
        }
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Function to show typing indicator
    function showTypingIndicator() {
        const typingElement = document.createElement('div');
        typingElement.className = 'typing-indicator';
        typingElement.innerHTML = \`
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        \`;
        
        chatMessages.appendChild(typingElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Function to process links in messages
    function processLinks(text) {
        // Convert URLs to clickable links
        const urlRegex = /(https?:\/\/[^\\s]+)/g;
        return text.replace(urlRegex, url => \`<a href="\${url}" target="_blank">\${url}</a>\`);
    }
    
    // Load conversations on page load
    loadConversations();
    
    // Logout functionality
    document.getElementById('user-info').addEventListener('click', function() {
        if (confirm('Are you sure you want to log out?')) {
            localStorage.removeItem('heartHealToken');
            localStorage.removeItem('heartHealUser');
            window.location.href = 'index.html';
        }
    });
});`;

// Create a test script to verify integration
const testScript = `#!/bin/bash

# Heart Heal AI - Integration Test Script

echo "Starting Heart Heal AI integration tests..."

# Check if the server is running
echo "Checking if server is running..."
curl -s http://localhost:5000 > /dev/null
if [ $? -ne 0 ]; then
    echo "Server is not running. Starting server..."
    cd /home/ubuntu/heart_heal_ai
    source venv/bin/activate
    python src/main.py &
    SERVER_PID=$!
    echo "Server started with PID: $SERVER_PID"
    sleep 3  # Wait for server to start
else
    echo "Server is already running."
fi

# Test user registration
echo "Testing user registration..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"name":"Test User","email":"test@example.com","password":"password123","gender":"other"}')

if [[ $REGISTER_RESPONSE == *"User registered successfully"* ]]; then
    echo "✅ User registration successful"
    # Extract token from response
    TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
else
    echo "❌ User registration failed"
    # Try login instead
    echo "Attempting login..."
    LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email":"test@example.com","password":"password123"}')
    
    if [[ $LOGIN_RESPONSE == *"Login successful"* ]]; then
        echo "✅ Login successful"
        # Extract token from response
        TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
    else
        echo "❌ Login failed"
        exit 1
    fi
fi

# Test creating a conversation
echo "Testing conversation creation..."
CONV_RESPONSE=$(curl -s -X POST http://localhost:5000/api/chat/conversations \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"title":"Test Conversation"}')

if [[ $CONV_RESPONSE == *"Conversation created successfully"* ]]; then
    echo "✅ Conversation creation successful"
    # Extract conversation ID
    CONV_ID=$(echo $CONV_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    echo "Conversation ID: $CONV_ID"
else
    echo "❌ Conversation creation failed"
    exit 1
fi

# Test sending a message
echo "Testing message sending..."
MSG_RESPONSE=$(curl -s -X POST http://localhost:5000/api/chat/conversations/$CONV_ID/messages \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"content":"I am feeling sad after my breakup"}')

if [[ $MSG_RESPONSE == *"Messages sent successfully"* ]]; then
    echo "✅ Message sending successful"
    echo "AI response received"
else
    echo "❌ Message sending failed"
    exit 1
fi

# Test getting conversation history
echo "Testing conversation retrieval..."
HISTORY_RESPONSE=$(curl -s -X GET http://localhost:5000/api/chat/conversations/$CONV_ID \
    -H "Authorization: Bearer $TOKEN")

if [[ $HISTORY_RESPONSE == *"messages"* ]]; then
    echo "✅ Conversation retrieval successful"
    # Count messages
    MSG_COUNT=$(echo $HISTORY_RESPONSE | grep -o '"sender"' | wc -l)
    echo "Message count: $MSG_COUNT"
else
    echo "❌ Conversation retrieval failed"
    exit 1
fi

echo "All tests completed successfully!"

# If we started the server, stop it
if [ ! -z "$SERVER_PID" ]; then
    echo "Stopping server (PID: $SERVER_PID)..."
    kill $SERVER_PID
fi

exit 0
`;

module.exports = {
    updateAuthJs,
    updateChatJs,
    testScript
};
