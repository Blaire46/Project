from flask import Blueprint, request, jsonify
import jwt
import bcrypt
import os
from datetime import datetime, timedelta
from app import mongo

auth_bp = Blueprint('auth', __name__)

SECRET_KEY = os.getenv("SECRET_KEY", "secret")

@auth_bp.route('/register', methods=['POST'])
def register():
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
    
    user = mongo.db.users.find_one({"email": data['email']})
    if not user:
        return jsonify({"error": "Email ou mot de passe incorrect"}), 401
    
    if not bcrypt.checkpw(data['password'].encode('utf-8'), user['password']):
        return jsonify({"error": "Email ou mot de passe incorrect"}), 401
    
    token = jwt.encode(
        {
            "user_id": str(user["_id"]),
            "email": user["email"],
            "role": user["role"],
            "exp": datetime.utcnow() + timedelta(hours=int(os.getenv("JWT_EXPIRATION_HOURS", 24)))
        },
        SECRET_KEY,
        algorithm="HS256"
    )
    
    return jsonify({
        "token": token,
        "user": {
            "id": str(user["_id"]),
            "nom": user["nom"],
            "email": user["email"],
            "role": user["role"]
        }
    })