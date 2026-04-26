# app/models/patient_model.py
from database.patient_db import (
    get_all_patients_raw,
    get_patient_by_id_raw,
    create_patient_raw,
    update_patient_raw,
    delete_patient_raw
)

def patient_serializer(patient) -> dict:
    return {
        "id": patient["_id"],
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
    @classmethod
    def get_all(cls):
        return get_all_patients_raw()
    
    @classmethod
    def get_by_id(cls, patient_id):
        return get_patient_by_id_raw(patient_id)
    
    @classmethod
    def create(cls, data):
        return create_patient_raw(data)
    
    @classmethod
    def update(cls, patient_id, data):
        return update_patient_raw(patient_id, data)
    
    @classmethod
    def delete(cls, patient_id):
        return delete_patient_raw(patient_id)