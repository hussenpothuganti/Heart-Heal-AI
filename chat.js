// Heart Heal AI - Chat JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const userInfo = JSON.parse(localStorage.getItem('heartHealUser') || '{}');
    if (!userInfo.isLoggedIn) {
        // Redirect to login page if not logged in
        window.location.href = 'index.html';
        return;
    }
    
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
    
    // Start chat button
    startChatBtn.addEventListener('click', function() {
        welcomeScreen.style.display = 'none';
        chatMessages.style.display = 'flex';
        chatInputContainer.style.display = 'block';
        
        // Add initial AI message
        setTimeout(() => {
            addMessage('ai', getInitialGreeting(userInfo));
        }, 500);
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
        
        // Add this conversation to the list
        const now = new Date();
        const conversationItem = document.createElement('li');
        conversationItem.className = 'conversation-item';
        conversationItem.textContent = `Conversation ${now.toLocaleTimeString()}`;
        conversationList.prepend(conversationItem);
        
        // Add click event to load this conversation
        conversationItem.addEventListener('click', function() {
            // This would load the conversation from storage in a real implementation
            alert('Loading previous conversations will be implemented with the backend.');
        });
    });
    
    // Function to send a message
    function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;
        
        // Add user message to chat
        addMessage('user', message);
        
        // Clear input
        chatInput.value = '';
        chatInput.style.height = 'auto';
        
        // Show typing indicator
        showTypingIndicator();
        
        // Process the message and get AI response
        setTimeout(() => {
            processUserMessage(message, userInfo);
        }, 1000 + Math.random() * 2000); // Random delay to simulate thinking
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
            messageElement.className = `message message-${sender}`;
            
            // Process content for links
            const processedContent = processLinks(content);
            
            messageElement.innerHTML = `
                ${processedContent}
                <div class="message-time">${new Date().toLocaleTimeString()}</div>
            `;
            
            chatMessages.appendChild(messageElement);
        }
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Function to show typing indicator
    function showTypingIndicator() {
        const typingElement = document.createElement('div');
        typingElement.className = 'typing-indicator';
        typingElement.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        
        chatMessages.appendChild(typingElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Function to process links in messages
    function processLinks(text) {
        // Convert URLs to clickable links
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, url => `<a href="${url}" target="_blank">${url}</a>`);
    }
    
    // Function to get initial greeting based on user gender
    function getInitialGreeting(userInfo) {
        const name = userInfo.name || 'there';
        const gender = userInfo.gender || 'unknown';
        
        if (gender === 'female') {
            return `Hi ${name}! I'm so glad you're here. I've been waiting to talk with you. How are you feeling today? I'm here to listen and support you through whatever you're going through. Would you like to tell me about what's been on your mind?`;
        } else if (gender === 'male') {
            return `Hey ${name}! It's really good to see you. I've been looking forward to our conversation. How have you been feeling lately? I'm here for you, and I'd love to hear what's been going on in your life. Want to share what's on your mind?`;
        } else {
            return `Hello ${name}! It's wonderful to meet you. I'm Heart Heal AI, your companion for emotional healing. How are you feeling today? I'm here to listen and support you through your journey. Would you like to share what brought you here?`;
        }
    }
    
    // Function to process user message and generate AI response
    function processUserMessage(message, userInfo) {
        const gender = userInfo.gender || 'unknown';
        const lowerMessage = message.toLowerCase();
        
        // Check if this is the first message about their love story
        if (lowerMessage.includes('broke up') || 
            lowerMessage.includes('heartbreak') || 
            lowerMessage.includes('love') || 
            lowerMessage.includes('relationship') ||
            lowerMessage.includes('ex')) {
            
            // This appears to be about their love story
            respondToLoveStory(message, gender);
            
            // After a love story, sometimes recommend a song
            if (Math.random() > 0.5) {
                setTimeout(() => {
                    recommendSong(message, gender);
                }, 3000);
            }
        } 
        // Check if they're feeling sad or down
        else if (lowerMessage.includes('sad') || 
                lowerMessage.includes('depressed') || 
                lowerMessage.includes('unhappy') || 
                lowerMessage.includes('miserable') ||
                lowerMessage.includes('crying')) {
            
            respondToSadness(gender);
            
            // Higher chance of song recommendation for sadness
            if (Math.random() > 0.3) {
                setTimeout(() => {
                    recommendSong(message, gender);
                }, 3000);
            }
        }
        // Check if they're asking for advice
        else if (lowerMessage.includes('advice') || 
                lowerMessage.includes('help me') || 
                lowerMessage.includes('what should i do') || 
                lowerMessage.includes('how can i')) {
            
            provideAdvice(gender);
        }
        // General response for other messages
        else {
            generalResponse(message, gender);
        }
    }
    
    // Function to respond to love story
    function respondToLoveStory(message, gender) {
        let response = '';
        
        if (gender === 'female') {
            response = "I'm really sorry you're going through this pain. Thank you for sharing your story with me. It takes courage to open up about heartbreak. Remember that what you're feeling is completely valid, and healing takes time. I'm here for you every step of the way. Would you like to tell me more about how you've been coping?";
        } else if (gender === 'male') {
            response = "I appreciate you opening up about this. Breakups and heartache can be incredibly tough to navigate. It's okay to feel whatever you're feeling right now - there's no right or wrong way to process these emotions. I'm here to listen whenever you need someone. How have you been handling things day to day?";
        } else {
            response = "Thank you for sharing your experience with me. Heartbreak is one of the most difficult human experiences, and your feelings are completely valid. Healing isn't linear, and it's okay to have good and bad days. I'm here to support you through this journey. Would you like to talk more about specific aspects that have been particularly challenging?";
        }
        
        addMessage('ai', response);
    }
    
    // Function to respond to sadness
    function respondToSadness(gender) {
        let response = '';
        
        if (gender === 'female') {
            response = "I can hear the pain in your words, and I want you to know it's okay to feel this way. Your emotions are valid and important. On the darkest days, remember that you have incredible strength within you - strength you might not even realize is there. I believe in you, and I'm here beside you through this. Would a gentle reminder of your worth help right now?";
        } else if (gender === 'male') {
            response = "I understand you're going through a tough time, and it takes real courage to acknowledge these feelings. There's strength in allowing yourself to experience emotions fully. Whatever you're feeling right now doesn't define you or your future. I'm here to support you without judgment. What do you think might help you feel even a little better today?";
        } else {
            response = "I'm truly sorry you're feeling this way. Sadness can be overwhelming, but please remember that you won't feel like this forever. These emotions are like waves - they come and go. You deserve kindness, especially from yourself. Would it help to talk about some small things that might bring you moments of peace right now?";
        }
        
        addMessage('ai', response);
    }
    
    // Function to provide advice
    function provideAdvice(gender) {
        let response = '';
        
        if (gender === 'female') {
            response = "I think one of the most important things is to be gentle with yourself right now. Healing isn't linear, and there will be better and harder days. Try to create small moments of joy in your daily routine - whether that's a walk outside, a favorite song, or connecting with a friend who lifts your spirits. Also, expressing your feelings through journaling or art can be incredibly therapeutic. What self-care activities have helped you in the past?";
        } else if (gender === 'male') {
            response = "Something that might help is finding a balance between acknowledging your feelings and not letting them consume you. Physical activity can be really effective - even just a 20-minute walk can shift your mental state. Connecting with friends, even when it's the last thing you feel like doing, can also provide perspective. And remember, seeking professional support is always a sign of strength, not weakness. What coping strategies have worked for you before?";
        } else {
            response = "One approach that helps many people is the balance of self-reflection and forward movement. Give yourself permission to feel your emotions, but also set small, achievable goals each day. Maintaining routines provides stability, while mindfulness practices can help you stay grounded when emotions feel overwhelming. Most importantly, be patient with your healing process - it takes the time it takes. Does any of this resonate with you?";
        }
        
        addMessage('ai', response);
    }
    
    // Function for general responses
    function generalResponse(message, gender) {
        let response = '';
        
        if (gender === 'female') {
            response = "I'm listening and I care about what you're sharing. Your thoughts and feelings matter to me. Would you like to explore this topic more deeply? I'm here to support you however you need.";
        } else if (gender === 'male') {
            response = "Thanks for sharing that with me. I appreciate your openness and honesty. I'm interested in understanding more about your perspective on this. What else is on your mind?";
        } else {
            response = "Thank you for sharing. I value our conversation and I'm here to listen and support you. Would you like to tell me more about how this makes you feel?";
        }
        
        addMessage('ai', response);
    }
    
    // Function to recommend a song
    function recommendSong(message, gender) {
        // In a real implementation, this would use an API to find relevant songs
        // For now, we'll use a small hardcoded list based on common themes
        
        const sadSongs = [
            {
                title: "Someone Like You",
                artist: "Adele",
                thumbnail: "https://i.ytimg.com/vi/hLQl3WQQoQ0/mqdefault.jpg",
                link: "https://www.youtube.com/watch?v=hLQl3WQQoQ0",
                reason: "This song captures the bittersweet feeling of accepting a relationship's end while still honoring what it meant to you."
            },
            {
                title: "Fix You",
                artist: "Coldplay",
                thumbnail: "https://i.ytimg.com/vi/k4V3Mo61fJM/mqdefault.jpg",
                link: "https://www.youtube.com/watch?v=k4V3Mo61fJM",
                reason: "A gentle reminder that even when things feel broken, healing is possible."
            },
            {
                title: "All Too Well",
                artist: "Taylor Swift",
                thumbnail: "https://i.ytimg.com/vi/tollGa3S0o8/mqdefault.jpg",
                link: "https://www.youtube.com/watch?v=tollGa3S0o8",
                reason: "This song beautifully captures the detailed memories that linger after a relationship ends."
            }
        ];
        
        const hopefulSongs = [
            {
                title: "Rise Up",
                artist: "Andra Day",
                thumbnail: "https://i.ytimg.com/vi/kNKu1uNBVkU/mqdefault.jpg",
                link: "https://www.youtube.com/watch?v=kNKu1uNBVkU",
                reason: "A powerful anthem about finding strength even in your darkest moments."
            },
            {
                title: "Better Days",
                artist: "OneRepublic",
                thumbnail: "https://i.ytimg.com/vi/gpFVMpJv0Ug/mqdefault.jpg",
                link: "https://www.youtube.com/watch?v=gpFVMpJv0Ug",
                reason: "A reminder that even though today might be difficult, better days are coming."
            },
            {
                title: "Unwritten",
                artist: "Natasha Bedingfield",
                thumbnail: "https://i.ytimg.com/vi/b7k0a5hYnSI/mqdefault.jpg",
                link: "https://www.youtube.com/watch?v=b7k0a5hYnSI",
                reason: "A celebration of new beginnings and the unwritten chapters of your life ahead."
            }
        ];
        
        // Choose between sad or hopeful songs based on message content
        const lowerMessage = message.toLowerCase();
        let songList;
        
        if (lowerMessage.includes('sad') || 
            lowerMessage.includes('miss') || 
            lowerMessage.includes('hurt') || 
            lowerMessage.includes('pain') ||
            lowerMessage.includes('crying')) {
            songList = sadSongs;
        } else {
            songList = hopefulSongs;
        }
        
        // Select a random song from the appropriate list
        const song = songList[Math.floor(Math.random() * songList.length)];
        
        // Create song recommendation HTML
        const songHTML = `
            <div class="song-recommendation">
                <img src="${song.thumbnail}" alt="${song.title}" class="song-thumbnail">
                <div class="song-info">
                    <div class="song-title">${song.title} - ${song.artist}</div>
                    <div class="song-reason">${song.reason}</div>
                    <a href="${song.link}" target="_blank" class="btn btn-outline mt-2">
                        <i class="fab fa-youtube"></i> Listen on YouTube
                    </a>
                </div>
            </div>
        `;
        
        // Add a message before the song recommendation
        let introMessage = '';
        if (gender === 'female') {
            introMessage = "I thought of a song that might resonate with what you're feeling right now. Music can sometimes express what words can't:";
        } else if (gender === 'male') {
            introMessage = "This song came to mind while we were talking. Sometimes music can help process emotions in a different way:";
        } else {
            introMessage = "I'd like to share a song that might connect with your experience. Music can be a powerful companion during emotional times:";
        }
        
        addMessage('ai', introMessage);
        
        // Add the song recommendation after a short delay
        setTimeout(() => {
            addMessage('ai', songHTML, true);
        }, 1000);
    }
});
