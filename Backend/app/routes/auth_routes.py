from flask import Blueprint, request, jsonify
import jwt
import os
from datetime import datetime, timedelta
from database.auth_db import verify_user
from app import mongo   # still needed for register (or you can write a create_user function)

auth_bp = Blueprint('auth', __name__)

SECRET_KEY = os.getenv("SECRET_KEY", "secret")
JWT_EXPIRATION_HOURS = int(os.getenv("JWT_EXPIRATION_HOURS", 24))

@auth_bp.route('/register', methods=['POST'])
def register():
    # For simplicity, keep using mongo directly for registration
    # Or you can create a create_user function in auth_db
    data = request.json
    existing_user = mongo.db.users.find_one({"email": data['email']})
    if existing_user:
        return jsonify({"error": "Email déjà utilisé"}), 400
    
    hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
    user = {
        "nom": data['nom'],
        "email": data['email'],
        "password": hashed_password,
        "role": data.get('role', 'archivage'),
        "created_at": datetime.now()
    }
    result = mongo.db.users.insert_one(user)
    user["_id"] = str(result.inserted_id)
    del user["password"]
    return jsonify({"message": "Utilisateur créé", "user": user}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    user_info = verify_user(email, password)   # returns dict with id, nom, email, role or None
    
    if not user_info:
        return jsonify({"error": "Email ou mot de passe incorrect"}), 401
    
    token = jwt.encode(
        {
            "user_id": user_info["id"],
            "email": user_info["email"],
            "role": user_info["role"],
            "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
        },
        SECRET_KEY,
        algorithm="HS256"
    )
    
    return jsonify({
        "token": token,
        "user": user_info
    })