const prisma = require('../config/db');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// Add a new patient (Authenticated users only)
// POST /api/patients

const createPatient = async (req, res, next) => {
  try {
    const { name, age, gender, address, phone } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return sendError(res, 'Patient name is required.', 400);
    }

    let parsedAge = null;
    if (age !== undefined && age !== null && age !== '') {
      parsedAge = parseInt(age, 10);
      if (isNaN(parsedAge) || parsedAge < 0 || parsedAge > 150) {
        return sendError(res, 'Age must be a valid number between 0 and 150.', 400);
      }
    }

    const patient = await prisma.patient.create({
      data: {
        name: name.trim(),
        age: parsedAge,
        gender: gender ? String(gender).trim() : null,
        address: address ? String(address).trim() : null,
        phone: phone ? String(phone).trim() : null,
        userId: req.user.id
      }
    });

    return sendSuccess(res, 'Patient created successfully', patient, 201);
  } catch (error) {
    next(error);
  }
};


 //Retrieve all patients created by the authenticated user
 //GET /api/patients

const getAllPatients = async (req, res, next) => {
  try {
    const patients = await prisma.patient.findMany({
      where: {
        userId: req.user.id
      },
      include: {
        mappings: {
          select: {
            id: true,
            createdAt: true,
            doctor: {
              select: {
                id: true,
                name: true,
                specialty: true,
                email: true,
                phone: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return sendSuccess(res, 'Patients retrieved successfully', {
      count: patients.length,
      patients
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get details of a specific patient
 * GET /api/patients/:id
 */
const getPatientById = async (req, res, next) => {
  try {
    const patientId = parseInt(req.params.id, 10);

    if (isNaN(patientId)) {
      return sendError(res, 'Invalid patient ID format. ID must be an integer.', 400);
    }

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        mappings: {
          select: {
            id: true,
            createdAt: true,
            doctor: {
              select: {
                id: true,
                name: true,
                specialty: true,
                email: true,
                phone: true
              }
            }
          }
        }
      }
    });

    if (!patient) {
      return sendError(res, 'Patient not found.', 404);
    }

    // Permission check: Authenticated user must be the creator of the patient
    if (patient.userId !== req.user.id) {
      return sendError(res, 'Forbidden: You do not have permission to view this patient record.', 403);
    }

    return sendSuccess(res, 'Patient details retrieved successfully', patient);
  } catch (error) {
    next(error);
  }
};


 // Update patient details
 // PUT /api/patients/:id

const updatePatient = async (req, res, next) => {
  try {
    const patientId = parseInt(req.params.id, 10);

    if (isNaN(patientId)) {
      return sendError(res, 'Invalid patient ID format. ID must be an integer.', 400);
    }

    // Check if patient exists
    const existingPatient = await prisma.patient.findUnique({
      where: { id: patientId }
    });

    if (!existingPatient) {
      return sendError(res, 'Patient not found.', 404);
    }

    // Permission check
    if (existingPatient.userId !== req.user.id) {
      return sendError(res, 'Forbidden: You do not have permission to update this patient record.', 403);
    }

    const { name, age, gender, address, phone } = req.body;
    const updateData = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return sendError(res, 'Patient name cannot be empty.', 400);
      }
      updateData.name = name.trim();
    }

    if (age !== undefined) {
      if (age === null || age === '') {
        updateData.age = null;
      } else {
        const parsedAge = parseInt(age, 10);
        if (isNaN(parsedAge) || parsedAge < 0 || parsedAge > 150) {
          return sendError(res, 'Age must be a valid number between 0 and 150.', 400);
        }
        updateData.age = parsedAge;
      }
    }

    if (gender !== undefined) {
      updateData.gender = gender ? String(gender).trim() : null;
    }

    if (address !== undefined) {
      updateData.address = address ? String(address).trim() : null;
    }

    if (phone !== undefined) {
      updateData.phone = phone ? String(phone).trim() : null;
    }

    const updatedPatient = await prisma.patient.update({
      where: { id: patientId },
      data: updateData
    });

    return sendSuccess(res, 'Patient details updated successfully', updatedPatient);
  } catch (error) {
    next(error);
  }
};

// Delete a patient record
 // DELETE /api/patients/:id

const deletePatient = async (req, res, next) => {
  try {
    const patientId = parseInt(req.params.id, 10);

    if (isNaN(patientId)) {
      return sendError(res, 'Invalid patient ID format. ID must be an integer.', 400);
    }

    // Check if patient exists
    const existingPatient = await prisma.patient.findUnique({
      where: { id: patientId }
    });

    if (!existingPatient) {
      return sendError(res, 'Patient not found.', 404);
    }

    // Permission check
    if (existingPatient.userId !== req.user.id) {
      return sendError(res, 'Forbidden: You do not have permission to delete this patient record.', 403);
    }

    await prisma.patient.delete({
      where: { id: patientId }
    });

    return sendSuccess(res, 'Patient record deleted successfully', { id: patientId });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient
};
