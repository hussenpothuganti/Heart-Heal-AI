#!/bin/bash

# Start the Heart Heal AI website for usability testing
echo "Starting Heart Heal AI website for usability testing..."

# Kill any existing processes
pkill -f "python src/main.py" || true
sleep 2

# Start the server
cd /home/ubuntu/heart_heal_ai
source venv/bin/activate
echo "Starting unified server (frontend + backend)..."
python src/main.py > server.log 2>&1 &
SERVER_PID=$!
echo "Server started with PID: $SERVER_PID"
sleep 3  # Wait for server to start

# Expose the port for testing
echo "Exposing Heart Heal AI website for testing..."
echo "Website available at: http://localhost:5000"

echo "Heart Heal AI website is now running for usability testing."
echo "Use Ctrl+C to stop the server when testing is complete."

# Wait for user to stop the server
tail -f server.log
