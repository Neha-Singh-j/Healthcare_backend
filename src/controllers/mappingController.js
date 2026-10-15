const prisma = require('../config/db');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * Assign a doctor to a patient
 * POST /api/mappings
 */
const assignDoctor = async (req, res, next) => {
  try {
    const rawPatientId = req.body.patientId !== undefined ? req.body.patientId : req.body.patient_id;
    const rawDoctorId = req.body.doctorId !== undefined ? req.body.doctorId : req.body.doctor_id;

    if (rawPatientId === undefined || rawPatientId === null || rawDoctorId === undefined || rawDoctorId === null) {
      return sendError(res, 'Both patientId and doctorId are required.', 400);
    }

    const patientId = parseInt(rawPatientId, 10);
    const doctorId = parseInt(rawDoctorId, 10);

    if (isNaN(patientId) || isNaN(doctorId)) {
      return sendError(res, 'patientId and doctorId must be valid integers.', 400);
    }

    // Verify patient exists and belongs to the authenticated user
    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    });

    if (!patient) {
      return sendError(res, 'Patient not found.', 404);
    }

    if (patient.userId !== req.user.id) {
      return sendError(res, 'Forbidden: You can only assign doctors to your own patients.', 403);
    }

    // Verify doctor exists
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId }
    });

    if (!doctor) {
      return sendError(res, 'Doctor not found.', 404);
    }

    // Check if mapping already exists
    const existingMapping = await prisma.patientDoctorMapping.findUnique({
      where: {
        patientId_doctorId: {
          patientId,
          doctorId
        }
      }
    });

    if (existingMapping) {
      return sendError(res, 'This doctor is already assigned to this patient.', 409);
    }

    // Create mapping
    const mapping = await prisma.patientDoctorMapping.create({
      data: {
        patientId,
        doctorId
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        },
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
    });

    return sendSuccess(res, 'Doctor assigned to patient successfully', mapping, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve all patient-doctor mappings
 * GET /api/mappings
 */
const getAllMappings = async (req, res, next) => {
  try {
    // Return mappings for patients created by the authenticated user
    const mappings = await prisma.patientDoctorMapping.findMany({
      where: {
        patient: {
          userId: req.user.id
        }
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            age: true,
            gender: true,
            phone: true
          }
        },
        doctor: {
          select: {
            id: true,
            name: true,
            specialty: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return sendSuccess(res, 'Mappings retrieved successfully', {
      count: mappings.length,
      mappings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all doctors assigned to a specific patient
 * GET /api/mappings/:patient_id
 */
const getDoctorsByPatient = async (req, res, next) => {
  try {
    const patientId = parseInt(req.params.patient_id, 10);

    if (isNaN(patientId)) {
      return sendError(res, 'Invalid patient ID format. ID must be an integer.', 400);
    }

    // Verify patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    });

    if (!patient) {
      return sendError(res, 'Patient not found.', 404);
    }

    // Authorization check
    if (patient.userId !== req.user.id) {
      return sendError(res, 'Forbidden: You do not have permission to view mappings for this patient.', 403);
    }

    const mappings = await prisma.patientDoctorMapping.findMany({
      where: { patientId },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialty: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const doctors = mappings.map((m) => ({
      mappingId: m.id,
      assignedAt: m.createdAt,
      doctor: m.doctor
    }));

    return sendSuccess(res, 'Assigned doctors retrieved successfully', {
      patient: {
        id: patient.id,
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        phone: patient.phone
      },
      count: doctors.length,
      assignedDoctors: doctors
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove a doctor from a patient (delete mapping)
 * DELETE /api/mappings/:id
 */
const removeMapping = async (req, res, next) => {
  try {
    const mappingId = parseInt(req.params.id, 10);

    if (isNaN(mappingId)) {
      return sendError(res, 'Invalid mapping ID format. ID must be an integer.', 400);
    }

    // Find mapping and include patient to check user ownership
    const mapping = await prisma.patientDoctorMapping.findUnique({
      where: { id: mappingId },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            userId: true
          }
        },
        doctor: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!mapping) {
      return sendError(res, 'Patient-doctor mapping not found.', 404);
    }

    // Authorization check: patient must belong to authenticated user
    if (mapping.patient.userId !== req.user.id) {
      return sendError(res, 'Forbidden: You do not have permission to delete this mapping.', 403);
    }

    await prisma.patientDoctorMapping.delete({
      where: { id: mappingId }
    });

    return sendSuccess(res, 'Doctor removed from patient successfully', {
      deletedMappingId: mappingId,
      patientName: mapping.patient.name,
      doctorName: mapping.doctor.name
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  assignDoctor,
  getAllMappings,
  getDoctorsByPatient,
  removeMapping
};
