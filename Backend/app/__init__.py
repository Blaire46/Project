from flask import Flask
from flask_pymongo import PyMongo
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

mongo = PyMongo()

def create_app():
    app = Flask(__name__)
    app.config["MONGO_URI"] = os.getenv("MONGO_URI")
    mongo.init_app(app)
    CORS(app)
    
    from app.routes import patients_routes, auth_routes
    app.register_blueprint(patients_routes.patients_bp, url_prefix='/api')
    app.register_blueprint(auth_routes.auth_bp, url_prefix='/api')
    
    return app