from flask import Blueprint
from app.controllers import patient_controller

patients_bp = Blueprint('patients', __name__)

@patients_bp.route('/patients', methods=['GET'])
def get_patients():
    return patient_controller.get_all_patients()

@patients_bp.route('/patients/<patient_id>', methods=['GET'])
def get_patient(patient_id):
    return patient_controller.get_patient(patient_id)

@patients_bp.route('/patients', methods=['POST'])
def create_patient():
    return patient_controller.create_patient()

@patients_bp.route('/patients/<patient_id>', methods=['PUT'])
def update_patient(patient_id):
    return patient_controller.update_patient(patient_id)

@patients_bp.route('/patients/<patient_id>', methods=['DELETE'])
def delete_patient(patient_id):
    return patient_controller.delete_patient(patient_id)