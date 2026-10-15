const express = require('express');
const {
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient
} = require('../controllers/patientController');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Apply authentication middleware to all patient routes
router.use(verifyToken);
router.post('/', createPatient);
router.get('/', getAllPatients);
router.get('/:id', getPatientById);
router.put('/:id', updatePatient);
router.delete('/:id', deletePatient);

module.exports = router;
