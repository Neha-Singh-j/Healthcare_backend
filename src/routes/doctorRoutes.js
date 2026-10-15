const express = require('express');
const {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor
} = require('../controllers/doctorController');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Apply authentication middleware to all doctor routes
router.use(verifyToken);
router.post('/', createDoctor);
router.get('/', getAllDoctors);
router.get('/:id', getDoctorById);
router.put('/:id', updateDoctor);
router.delete('/:id', deleteDoctor);

module.exports = router;
