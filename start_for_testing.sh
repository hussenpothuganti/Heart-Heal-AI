#!/bin/bash

# Start the Heart Heal AI website for usability testing
echo "Starting Heart Heal AI website for usability testing..."

# Start the server if not running
SERVER_PID=$(pgrep -f "python src/main.py" || echo "")
if [ -z "$SERVER_PID" ]; then
    echo "Starting backend server..."
    cd /home/ubuntu/heart_heal_ai
    source venv/bin/activate
    python src/main.py > server.log 2>&1 &
    SERVER_PID=$!
    echo "Server started with PID: $SERVER_PID"
    sleep 3  # Wait for server to start
else
    echo "Backend server is already running with PID: $SERVER_PID"
fi

# Create a simple HTTP server to serve the frontend
echo "Starting frontend server..."
cd /home/ubuntu/heart_heal_ai/public
python3 -m http.server 8080 &
FRONTEND_PID=$!
echo "Frontend server started with PID: $FRONTEND_PID"

# Expose the frontend port for testing
echo "Exposing frontend for testing..."
echo "Frontend available at: http://localhost:8080"
echo "Backend API available at: http://localhost:5000"

echo "Heart Heal AI website is now running for usability testing."
echo "Use Ctrl+C to stop the servers when testing is complete."

# Wait for user to stop the servers
wait $FRONTEND_PID
