from app import mongo
from bson import ObjectId

def patient_serializer(patient) -> dict:
    return {
        "id": str(patient["_id"]),
        "nom": patient.get("nom", ""),
        "prenom": patient.get("prenom", ""),
        "date_naissance": patient.get("date_naissance", ""),
        "wilaya": patient.get("wilaya", ""),
        "num_carte_identite": patient.get("num_carte_identite", ""),
        "telephone": patient.get("telephone", ""),
        "diagnostic": patient.get("diagnostic", ""),
        "medecin_traitant": patient.get("medecin_traitant", ""),
        "statut": patient.get("statut", "hospitalisé"),
        "service": patient.get("service", ""),
        "date_admission": patient.get("date_admission", "")
    }

def list_serializer(patients) -> list:
    return [patient_serializer(patient) for patient in patients]

class PatientModel:
    collection = mongo.db.patients
    
    @classmethod
    def get_all(cls):
        return list(cls.collection.find())
    
    @classmethod
    def get_by_id(cls, patient_id):
        return cls.collection.find_one({"_id": ObjectId(patient_id)})
    
    @classmethod
    def create(cls, data):
        result = cls.collection.insert_one(data)
        return cls.get_by_id(result.inserted_id)
    
    @classmethod
    def update(cls, patient_id, data):
        cls.collection.update_one(
            {"_id": ObjectId(patient_id)},
            {"$set": data}
        )
        return cls.get_by_id(patient_id)
    
    @classmethod
    def delete(cls, patient_id):
        return cls.collection.delete_one({"_id": ObjectId(patient_id)})