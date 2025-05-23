import json
import random
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from src.models.user import User
from src.models.conversation import Conversation, Message
from src.extensions import db

chat_bp = Blueprint('chat', __name__)

# Song recommendation database
SONG_RECOMMENDATIONS = [
    {
        "title": "Someone Like You",
        "artist": "Adele",
        "url": "https://www.youtube.com/watch?v=hLQl3WQQoQ0",
        "mood": "heartbreak",
        "description": "A powerful ballad about accepting the end of a relationship while still having feelings."
    },
    {
        "title": "Fix You",
        "artist": "Coldplay",
        "url": "https://www.youtube.com/watch?v=k4V3Mo61fJM",
        "mood": "healing",
        "description": "An uplifting song about helping someone through difficult times and emotional pain."
    },
    {
        "title": "Unbreak My Heart",
        "artist": "Toni Braxton",
        "url": "https://www.youtube.com/watch?v=p2Rch6WvPJE",
        "mood": "heartbreak",
        "description": "A soulful plea for healing after a devastating breakup."
    },
    {
        "title": "Better in Time",
        "artist": "Leona Lewis",
        "url": "https://www.youtube.com/watch?v=qSxyffSB7wA",
        "mood": "healing",
        "description": "A hopeful song about how pain diminishes as time passes after a breakup."
    },
    {
        "title": "Stronger",
        "artist": "Kelly Clarkson",
        "url": "https://www.youtube.com/watch?v=AJt22jaLzXw",
        "mood": "empowerment",
        "description": "An empowering anthem about becoming stronger after heartbreak."
    }
]

@chat_bp.route('/conversations', methods=['GET'])
@jwt_required()
def get_conversations():
    user_id = get_jwt_identity()
    
    # Get all conversations for the user
    conversations = Conversation.query.filter_by(user_id=user_id).order_by(Conversation.updated_at.desc()).all()
    
    return jsonify({
        "conversations": [conversation.to_dict() for conversation in conversations]
    }), 200

@chat_bp.route('/conversations', methods=['POST'])
@jwt_required()
def create_conversation():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate request data
    if not data or 'title' not in data:
        return jsonify({"message": "Title is required"}), 422
    
    # Create new conversation
    conversation = Conversation(
        title=data['title'],
        user_id=user_id
    )
    
    db.session.add(conversation)
    db.session.commit()
    
    # Add initial AI greeting message
    user = User.query.get(user_id)
    greeting = f"Hello {user.name}! It's wonderful to meet you. I'm Heart Heal AI, your companion for emotional healing. How are you feeling today? I'm here to listen and support you through your journey. Would you like to share what brought you here?"
    
    message = Message(
        conversation_id=conversation.id,
        content=greeting,
        sender="ai",
        message_type="text"
    )
    
    db.session.add(message)
    db.session.commit()
    
    return jsonify({
        "message": "Conversation created successfully",
        "conversation": conversation.to_dict()
    }), 201

@chat_bp.route('/conversations/<int:conversation_id>', methods=['GET'])
@jwt_required()
def get_conversation(conversation_id):
    user_id = get_jwt_identity()
    
    # Get conversation
    conversation = Conversation.query.filter_by(id=conversation_id, user_id=user_id).first()
    
    if not conversation:
        return jsonify({"message": "Conversation not found"}), 404
    
    # Get messages for the conversation
    messages = Message.query.filter_by(conversation_id=conversation_id).order_by(Message.created_at).all()
    
    return jsonify({
        "conversation": conversation.to_dict(),
        "messages": [message.to_dict() for message in messages]
    }), 200

@chat_bp.route('/conversations/<int:conversation_id>/messages', methods=['POST'])
@jwt_required()
def send_message(conversation_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate request data
    if not data or 'content' not in data:
        return jsonify({"message": "Message content is required"}), 422
    
    # Check if conversation exists and belongs to user
    conversation = Conversation.query.filter_by(id=conversation_id, user_id=user_id).first()
    
    if not conversation:
        return jsonify({"message": "Conversation not found"}), 404
    
    # Create user message
    user_message = Message(
        conversation_id=conversation_id,
        content=data['content'],
        sender="user",
        message_type="text"
    )
    
    db.session.add(user_message)
    db.session.commit()
    
    # Get user for gender info
    user = User.query.get(user_id)
    
    # Generate AI response based on user message
    ai_responses = []
    
    # Check if message contains keywords related to song recommendations
    message_lower = data['content'].lower()
    song_keywords = ['song', 'music', 'listen', 'recommend', 'playlist', 'track', 'melody', 'tune']
    
    # Always recommend a song if explicitly asked for one
    should_recommend_song = any(keyword in message_lower for keyword in song_keywords)
    
    # If the message mentions feeling sad or heartbreak, recommend a song with 100% probability
    heartbreak_keywords = ['sad', 'heartbreak', 'breakup', 'broke up', 'miss', 'lonely', 'alone', 'hurt']
    if any(keyword in message_lower for keyword in heartbreak_keywords):
        should_recommend_song = True
    
    # First, add a text response
    if should_recommend_song:
        # Choose a song based on the mood
        if any(keyword in message_lower for keyword in ['healing', 'better', 'hope', 'future']):
            mood = "healing"
        elif any(keyword in message_lower for keyword in ['strong', 'power', 'overcome']):
            mood = "empowerment"
        else:
            mood = "heartbreak"
        
        # Filter songs by mood
        mood_songs = [song for song in SONG_RECOMMENDATIONS if song['mood'] == mood]
        
        # If no songs match the mood, use all songs
        if not mood_songs:
            mood_songs = SONG_RECOMMENDATIONS
        
        # Select a random song
        song_data = random.choice(mood_songs)
        
        # Create empathetic text response
        text_response = Message(
            conversation_id=conversation_id,
            content=f"I understand how you're feeling. Music can be healing during difficult times. I'd like to recommend '{song_data['title']}' by {song_data['artist']}. {song_data['description']} You can listen to it here: {song_data['url']}",
            sender="ai",
            message_type="text"
        )
        
        # Create song recommendation response
        song_response = Message(
            conversation_id=conversation_id,
            content=f"Song recommendation: {song_data['title']} by {song_data['artist']}",
            sender="ai",
            message_type="song_recommendation",
            extra_data=json.dumps(song_data)
        )
        
        db.session.add(text_response)
        db.session.add(song_response)
        db.session.commit()
        
        ai_responses.append(text_response.to_dict())
        ai_responses.append(song_response.to_dict())
    else:
        # Generate empathetic response based on user message
        empathetic_responses = [
            "I'm truly sorry you're feeling this way. Sadness can be overwhelming, but please remember that you won't feel like this forever. These emotions are like waves - they come and go. You deserve kindness, especially from yourself. Would it help to talk about some small things that might bring you moments of peace right now?",
            "Thank you for sharing your experience with me. Heartbreak is one of the most difficult human experiences, and your feelings are completely valid. Healing isn't linear, and it's okay to have good and bad days. I'm here to support you through this journey. Would you like to talk more about specific aspects that have been particularly challenging?",
            "I appreciate you opening up about your heartbreak. These experiences can be deeply painful, and everyone's healing journey looks different. I'm here to listen and support you without judgment. What aspects of this situation have been most difficult for you?",
            "One approach that helps many people is the balance of self-reflection and forward movement. Give yourself permission to feel your emotions, but also set small, achievable goals each day. Maintaining routines provides stability, while mindfulness practices can help you stay grounded when emotions feel overwhelming. Most importantly, be patient with your healing process - it takes the time it takes. Does any of this resonate with you?"
        ]
        
        # Choose a random empathetic response
        response_text = random.choice(empathetic_responses)
        
        # Create AI response
        ai_response = Message(
            conversation_id=conversation_id,
            content=response_text,
            sender="ai",
            message_type="text"
        )
        
        db.session.add(ai_response)
        db.session.commit()
        
        ai_responses.append(ai_response.to_dict())
    
    # Update conversation timestamp
    conversation.updated_at = db.func.current_timestamp()
    db.session.commit()
    
    return jsonify({
        "message": "Messages sent successfully",
        "user_message": user_message.to_dict(),
        "ai_responses": ai_responses
    }), 201

@chat_bp.route('/conversations/<int:conversation_id>', methods=['DELETE'])
@jwt_required()
def delete_conversation(conversation_id):
    user_id = get_jwt_identity()
    
    # Check if conversation exists and belongs to user
    conversation = Conversation.query.filter_by(id=conversation_id, user_id=user_id).first()
    
    if not conversation:
        return jsonify({"message": "Conversation not found"}), 404
    
    # Delete all messages in the conversation
    Message.query.filter_by(conversation_id=conversation_id).delete()
    
    # Delete the conversation
    db.session.delete(conversation)
    db.session.commit()
    
    return jsonify({"message": "Conversation deleted successfully"}), 200
