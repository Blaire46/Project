# setup_db.py
from pymongo import MongoClient
from dotenv import load_dotenv
import os
import bcrypt
from datetime import datetime

load_dotenv()

uri = os.getenv("MONGO_URI")
client = MongoClient(uri)
db = client["cancer_center"]

# Clear existing collections if any (start fresh)
db.users.drop()
db.patients.drop()

# ---------- 1. Create users collection with bcrypt hashed passwords ----------
users = [
    {"nom": "Archiviste Un", "email": "archiviste@example.com", "password": "pass123", "role": "archivage"},
    {"nom": "Médecin Deux", "email": "medecin@example.com", "password": "pass123", "role": "medical"},
    {"nom": "Statisticien Trois", "email": "stats@example.com", "password": "pass123", "role": "statistiques"}
]

for user in users:
    hashed = bcrypt.hashpw(user["password"].encode('utf-8'), bcrypt.gensalt())
    db.users.insert_one({
        "nom": user["nom"],
        "email": user["email"],
        "password": hashed,
        "role": user["role"],
        "created_at": datetime.now()
    })
print("✅ Users inserted (passwords hashed)")

# ---------- 2. Create patients collection (matches patient_model.py fields) ----------
patients = [
    {
        "nom": "Benali",
        "prenom": "Ahmed",
        "date_naissance": "1980-05-12",
        "wilaya": "Batna",
        "num_carte_identite": "123456789",
        "telephone": "0555123456",
        "diagnostic": "Cancer du sein",
        "medecin_traitant": "Dr. Khelil",
        "statut": "hospitalisé",
        "service": "Oncologie",
        "date_admission": "2024-03-01"
    },
    {
        "nom": "Slimani",
        "prenom": "Fatima",
        "date_naissance": "1992-08-25",
        "wilaya": "Constantine",
        "num_carte_identite": "987654321",
        "telephone": "0555987654",
        "diagnostic": "Tumeur bénigne",
        "medecin_traitant": "Dr. Larbi",
        "statut": "suivi",
        "service": "Radiologie",
        "date_admission": "2024-03-10"
    },
    {
        "nom": "Kaci",
        "prenom": "Mohamed",
        "date_naissance": "1965-11-02",
        "wilaya": "Alger",
        "num_carte_identite": "555666777",
        "telephone": "0555998877",
        "diagnostic": "Cancer du poumon",
        "medecin_traitant": "Dr. Bouzid",
        "statut": "sorti",
        "service": "Chirurgie",
        "date_admission": "2023-12-15"
    },
    {
        "nom": "Boudiaf",
        "prenom": "Samira",
        "date_naissance": "1975-03-22",
        "wilaya": "Oran",
        "num_carte_identite": "111222333",
        "telephone": "0555112233",
        "diagnostic": "Leucémie",
        "medecin_traitant": "Dr. Merabet",
        "statut": "hospitalisé",
        "service": "Oncologie",
        "date_admission": "2020-06-15"
    }
]

db.patients.insert_many(patients)
print("✅ Patients inserted (matching backend schema)")

print("\n🎉 Database setup complete!")
print(f"Database: cancer_center")
print(f"Users: {db.users.count_documents({})}")
print(f"Patients: {db.patients.count_documents({})}")