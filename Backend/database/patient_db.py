# patient_db.py (raw MongoDB documents with string _id, for backend to serialize)
from pymongo import MongoClient
from dotenv import load_dotenv
import os
from bson import ObjectId

load_dotenv()

uri = os.getenv("MONGO_URI")
client = MongoClient(uri)
db = client["cancer_center"]

def convert_id(doc):
    """Convert _id to string and return the document."""
    if doc:
        doc["_id"] = str(doc["_id"])
    return doc

def convert_ids(docs):
    return [convert_id(doc) for doc in docs]

def get_all_patients_raw():
    patients = list(db.patients.find())
    return convert_ids(patients)
def get_distinct_services():

    return db.patients.distinct("service")
def get_distinct_years():
    pipeline = [
        {"$group": {"_id": {"$substr": ["$date_admission", 0, 4]}}},
        {"$sort": {"_id": 1}}
    ]
    years = list(db.patients.aggregate(pipeline))
    return [y["_id"] for y in years if y["_id"]]
def get_patient_by_id_raw(patient_id):
    try:
        patient = db.patients.find_one({"_id": ObjectId(patient_id)})
        return convert_id(patient)
    except:
        return None

def create_patient_raw(data):
    # Remove '_id' if present
    if "_id" in data:
        del data["_id"]
    result = db.patients.insert_one(data)
    return get_patient_by_id_raw(result.inserted_id)

def update_patient_raw(patient_id, data):
    if "_id" in data:
        del data["_id"]
    db.patients.update_one({"_id": ObjectId(patient_id)}, {"$set": data})
    return get_patient_by_id_raw(patient_id)

def delete_patient_raw(patient_id):
    return db.patients.delete_one({"_id": ObjectId(patient_id)})

# Statistics and filter functions also return raw docs
def get_patients_by_service_raw(service_name):
    patients = list(db.patients.find({"service": service_name}))
    return convert_ids(patients)

def get_statistics_raw(service_name=None, year=None):
    match = {}
    if service_name:
        match["service"] = service_name
    if year:
        # Match patients whose date_admission starts with the year (YYYY-MM-DD)
        match["date_admission"] = {"$regex": f"^{year}"}
    
    total = db.patients.count_documents(match)
    hospitalises = db.patients.count_documents({**match, "statut": "hospitalisé"})
    suivis = db.patients.count_documents({**match, "statut": "suivi"})
    sortis = db.patients.count_documents({**match, "statut": "sorti"})
    
    print(f"DEBUG - service: {service_name}, year: {year}")  # Debug log
    print(f"DEBUG - total: {total}, hospitalises: {hospitalises}, suivis: {suivis}, sortis: {sortis}")
    
    return {
        "total": total,
        "hospitalises": hospitalises,
        "suivis": suivis,
        "sortis": sortis
    }