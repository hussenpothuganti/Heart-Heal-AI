#!/bin/bash

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
