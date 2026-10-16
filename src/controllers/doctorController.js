const prisma = require('../config/db');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//  Add a new doctor (Authenticated users only)
 
const createDoctor = async (req, res, next) => {
  try {
    const { name, specialty, email, phone } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return sendError(res, 'Doctor name is required.', 400);
    }

    let normalizedEmail = null;
    if (email !== undefined && email !== null && email !== '') {
      normalizedEmail = String(email).trim().toLowerCase();
      if (!EMAIL_REGEX.test(normalizedEmail)) {
        return sendError(res, 'A valid email address is required for the doctor.', 400);
      }

      // Check for duplicate doctor email
      const existingDoctor = await prisma.doctor.findUnique({
        where: { email: normalizedEmail }
      });
      if (existingDoctor) {
        return sendError(res, 'A doctor with this email already exists.', 409);
      }
    }

    const doctor = await prisma.doctor.create({
      data: {
        name: name.trim(),
        specialty: specialty ? String(specialty).trim() : null,
        email: normalizedEmail,
        phone: phone ? String(phone).trim() : null
      }
    });

    return sendSuccess(res, 'Doctor created successfully', doctor, 201);
  } catch (error) {
    next(error);
  }
};

// get all doctors 
const getAllDoctors = async (req, res, next) => {
  try {
    const doctors = await prisma.doctor.findMany({
      include: {
        _count: {
          select: { mappings: true }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return sendSuccess(res, 'Doctors retrieved successfully', {
      count: doctors.length,
      doctors
    });
  } catch (error) {
    next(error);
  }
};


// Get details of a specific doctor

const getDoctorById = async (req, res, next) => {
  try {
    const doctorId = parseInt(req.params.id, 10);

    if (isNaN(doctorId)) {
      return sendError(res, 'Invalid doctor ID format. ID must be an integer.', 400);
    }

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: {
        mappings: {
          select: {
            id: true,
            createdAt: true,
            patient: {
              select: {
                id: true,
                name: true,
                age: true,
                gender: true,
                phone: true
              }
            }
          }
        }
      }
    });

    if (!doctor) {
      return sendError(res, 'Doctor not found.', 404);
    }

    return sendSuccess(res, 'Doctor details retrieved successfully', doctor);
  } catch (error) {
    next(error);
  }
};


//  Update doctor details
 //PUT /api/doctors/:id
const updateDoctor = async (req, res, next) => {
  try {
    const doctorId = parseInt(req.params.id, 10);

    if (isNaN(doctorId)) {
      return sendError(res, 'Invalid doctor ID format. ID must be an integer.', 400);
    }

    const existingDoctor = await prisma.doctor.findUnique({
      where: { id: doctorId }
    });

    if (!existingDoctor) {
      return sendError(res, 'Doctor not found.', 404);
    }

    const { name, specialty, email, phone } = req.body;
    const updateData = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return sendError(res, 'Doctor name cannot be empty.', 400);
      }
      updateData.name = name.trim();
    }

    if (specialty !== undefined) {
      updateData.specialty = specialty ? String(specialty).trim() : null;
    }

    if (email !== undefined) {
      if (email === null || email === '') {
        updateData.email = null;
      } else {
        const normalizedEmail = String(email).trim().toLowerCase();
        if (!EMAIL_REGEX.test(normalizedEmail)) {
          return sendError(res, 'A valid email address is required.', 400);
        }

        // Check if another doctor is already using this email
        const duplicateDoctor = await prisma.doctor.findFirst({
          where: {
            email: normalizedEmail,
            NOT: { id: doctorId }
          }
        });

        if (duplicateDoctor) {
          return sendError(res, 'A doctor with this email already exists.', 409);
        }

        updateData.email = normalizedEmail;
      }
    }

    if (phone !== undefined) {
      updateData.phone = phone ? String(phone).trim() : null;
    }

    const updatedDoctor = await prisma.doctor.update({
      where: { id: doctorId },
      data: updateData
    });

    return sendSuccess(res, 'Doctor details updated successfully', updatedDoctor);
  } catch (error) {
    next(error);
  }
};

//Delete a doctor record
//DELETE /api/doctors/:id

const deleteDoctor = async (req, res, next) => {
  try {
    const doctorId = parseInt(req.params.id, 10);

    if (isNaN(doctorId)) {
      return sendError(res, 'Invalid doctor ID format. ID must be an integer.', 400);
    }

    const existingDoctor = await prisma.doctor.findUnique({
      where: { id: doctorId }
    });

    if (!existingDoctor) {
      return sendError(res, 'Doctor not found.', 404);
    }

    await prisma.doctor.delete({
      where: { id: doctorId }
    });

    return sendSuccess(res, 'Doctor record deleted successfully', { id: doctorId });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor
};
