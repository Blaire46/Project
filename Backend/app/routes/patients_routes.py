from flask import Blueprint, jsonify
from app.controllers import patient_controller
from app.middleware.auth_middleware import token_required
from database.patient_db import get_distinct_services, get_distinct_years

patients_bp = Blueprint('patients', __name__)

@patients_bp.route('/patients', methods=['GET'])
@token_required
def get_patients():
    return patient_controller.get_all_patients()

@patients_bp.route('/patients/<patient_id>', methods=['GET'])
@token_required
def get_patient(patient_id):
    return patient_controller.get_patient(patient_id)

@patients_bp.route('/patients', methods=['POST'])
@token_required
def create_patient():
    return patient_controller.create_patient()

@patients_bp.route('/patients/<patient_id>', methods=['PUT'])
@token_required
def update_patient(patient_id):
    return patient_controller.update_patient(patient_id)

@patients_bp.route('/patients/<patient_id>', methods=['DELETE'])
@token_required
def delete_patient(patient_id):
    return patient_controller.delete_patient(patient_id)

# NEW ENDPOINTS for services and years
@patients_bp.route('/services/distinct', methods=['GET'])
@token_required
def get_services_distinct():
    services = get_distinct_services()
    return jsonify(services)

@patients_bp.route('/years/distinct', methods=['GET'])
@token_required
def get_years_distinct():
    years = get_distinct_years()
    return jsonify(years)