#!/bin/bash

# Fix JWT token format in integration test script
echo "Fixing integration test script for JWT compatibility..."

# Start the server if not running
SERVER_PID=$(pgrep -f "python src/main.py" || echo "")
if [ -z "$SERVER_PID" ]; then
    echo "Starting server..."
    cd /home/ubuntu/heart_heal_ai
    source venv/bin/activate
    python src/main.py > server.log 2>&1 &
    SERVER_PID=$!
    echo "Server started with PID: $SERVER_PID"
    sleep 3  # Wait for server to start
else
    echo "Server is already running with PID: $SERVER_PID"
fi

# Test login to get a token
echo "Testing login to get token..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"password123"}')

# Extract token using jq
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token')
echo "Token: $TOKEN"

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    echo "Failed to get token. Login response:"
    echo "$LOGIN_RESPONSE"
    exit 1
else
    echo "Successfully obtained token"
fi

# Test conversation creation with the token
echo "Testing conversation creation with token..."
CONV_RESPONSE=$(curl -s -X POST http://localhost:5000/api/chat/conversations \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"title":"Integration Test Conversation"}')

echo "Conversation creation response:"
echo "$CONV_RESPONSE"

# Check if conversation was created successfully
SUCCESS=$(echo "$CONV_RESPONSE" | grep -c "Conversation created successfully" || echo "0")

if [ "$SUCCESS" -eq "1" ]; then
    echo "✅ Conversation creation successful"
    
    # Extract conversation ID
    CONV_ID=$(echo "$CONV_RESPONSE" | jq -r '.conversation.id')
    echo "Conversation ID: $CONV_ID"
    
    # Test sending a message
    echo "Testing message sending..."
    MSG_RESPONSE=$(curl -s -X POST http://localhost:5000/api/chat/conversations/$CONV_ID/messages \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"content":"I am feeling sad after my breakup. Can you help me?"}')
    
    echo "Message response:"
    echo "$MSG_RESPONSE"
    
    # Check if message was sent successfully
    MSG_SUCCESS=$(echo "$MSG_RESPONSE" | grep -c "Messages sent successfully" || echo "0")
    
    if [ "$MSG_SUCCESS" -eq "1" ]; then
        echo "✅ Message sending successful"
        
        # Test getting conversation with messages
        echo "Testing conversation retrieval..."
        GET_CONV_RESPONSE=$(curl -s -X GET http://localhost:5000/api/chat/conversations/$CONV_ID \
            -H "Authorization: Bearer $TOKEN")
        
        echo "Conversation retrieval response:"
        echo "$GET_CONV_RESPONSE"
        
        # Check if conversation was retrieved successfully
        GET_SUCCESS=$(echo "$GET_CONV_RESPONSE" | jq -r '.messages | length')
        
        if [ "$GET_SUCCESS" -gt "0" ]; then
            echo "✅ Conversation retrieval successful"
            echo "All API tests passed successfully!"
        else
            echo "❌ Conversation retrieval failed"
        fi
    else
        echo "❌ Message sending failed"
    fi
else
    echo "❌ Conversation creation failed"
fi

echo "Integration test complete"
