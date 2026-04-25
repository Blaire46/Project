from flask import request, jsonify
from app.models.patient_model import PatientModel, list_serializer, patient_serializer
from bson import ObjectId

def get_all_patients():
    patients = PatientModel.get_all()
    return jsonify(list_serializer(patients))

def get_patient(patient_id):
    patient = PatientModel.get_by_id(patient_id)
    if patient:
        return jsonify(patient_serializer(patient))
    return jsonify({"error": "Patient non trouvé"}), 404

def create_patient():
    data = request.json
    required_fields = ["nom", "prenom", "wilaya", "service"]
    
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Champ '{field}' manquant"}), 400
    
    new_patient = PatientModel.create(data)
    return jsonify(patient_serializer(new_patient)), 201

def update_patient(patient_id):
    data = request.json
    patient = PatientModel.get_by_id(patient_id)
    
    if not patient:
        return jsonify({"error": "Patient non trouvé"}), 404
    
    updated_patient = PatientModel.update(patient_id, data)
    return jsonify(patient_serializer(updated_patient))

def delete_patient(patient_id):
    result = PatientModel.delete(patient_id)
    if result.deleted_count == 0:
        return jsonify({"error": "Patient non trouvé"}), 404
    return jsonify({"message": "Patient supprimé avec succès"})