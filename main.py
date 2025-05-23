import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))  # DON'T CHANGE THIS !!!

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from datetime import timedelta
import json
import random

from src.extensions import db, bcrypt, jwt
from src.models.user import User
from src.models.conversation import Conversation, Message

# Initialize Flask app
app = Flask(__name__, static_folder='../public')
CORS(app)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'heart_heal_ai_secret_key')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///heart_heal.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'heart_heal_jwt_secret')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)
app.config['JWT_ERROR_MESSAGE_KEY'] = 'message'
app.config['PROPAGATE_EXCEPTIONS'] = True  # Allow exceptions to propagate to see actual errors
app.config['JWT_IDENTITY_CLAIM'] = 'identity'  # Change from default 'sub' which might be causing issues

# Initialize extensions with app
db.init_app(app)
bcrypt.init_app(app)
jwt.init_app(app)

# Import routes after initializing extensions
from src.routes.auth import auth_bp
from src.routes.chat import chat_bp

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(chat_bp, url_prefix='/api/chat')

# Serve static files - Frontend routes
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_static(path):
    if path == "" or not os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, 'index.html')
    return send_from_directory(app.static_folder, path)

# Create database tables
with app.app_context():
    db.create_all()

# Error handlers
@app.errorhandler(422)
def handle_unprocessable_entity(err):
    # Log the error for debugging
    print(f"422 Error: {str(err)}")
    # Return a more helpful error message
    return jsonify({"message": "Invalid request data", "details": str(err)}), 422

@app.errorhandler(500)
def handle_server_error(err):
    # Log the error for debugging
    print(f"500 Error: {str(err)}")
    # Return a more helpful error message
    return jsonify({"message": "Server error", "details": str(err)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
