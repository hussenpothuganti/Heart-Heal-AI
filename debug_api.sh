#!/bin/bash

# Debug the conversation creation API issue
echo "Debugging conversation creation API..."

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

# Install jq for JSON parsing if not already installed
if ! command -v jq &> /dev/null; then
    echo "Installing jq for JSON parsing..."
    sudo apt-get update && sudo apt-get install -y jq
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

# Test conversation creation with explicit Content-Type header and valid JSON
echo "Testing conversation creation with explicit headers..."
CONV_RESPONSE=$(curl -v -X POST http://localhost:5000/api/chat/conversations \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"title":"Debug Test Conversation"}')

echo "Conversation creation response:"
echo "$CONV_RESPONSE"

# If still failing, try with different JSON format
echo "Testing with minimal JSON..."
CONV_RESPONSE2=$(curl -v -X POST http://localhost:5000/api/chat/conversations \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{}")

echo "Minimal JSON response:"
echo "$CONV_RESPONSE2"

echo "Debug complete"
