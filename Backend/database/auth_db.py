# auth_db.py
from pymongo import MongoClient
from dotenv import load_dotenv
import os
import bcrypt

load_dotenv()

uri = os.getenv("MONGO_URI")
client = MongoClient(uri)
db = client["cancer_center"]

def verify_user(email, password):
    """Check email and password against the users collection.
       Returns the user document (with role) if valid, None otherwise."""
    
    # Find user by email
    user = db.users.find_one({"email": email})
    
    if not user:
        print(f"No user found with email: {email}")
        return None
    
    # Check password using bcrypt
    if bcrypt.checkpw(password.encode('utf-8'), user["password"]):
        # Return user info without the password hash
        return {
            "id": str(user["_id"]),
            "nom": user["nom"],
            "email": user["email"],
            "role": user["role"]
        }
    else:
        print("Password incorrect")
        return None

# Quick test (will run when you execute this file directly)
if __name__ == "__main__":
    # Test valid login
    print("Testing valid login (archiviste@example.com / pass123):")
    result = verify_user("archiviste@example.com", "pass123")
    print(result)
    
    print("\nTesting invalid login (wrong email):")
    result = verify_user("wrong@example.com", "pass123")
    print(result)
    
    print("\nTesting invalid login (wrong password):")
    result = verify_user("archiviste@example.com", "wrongpassword")
    print(result)