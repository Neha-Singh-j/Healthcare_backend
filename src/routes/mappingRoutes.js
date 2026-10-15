const express = require('express');
const {
  assignDoctor,
  getAllMappings,
  getDoctorsByPatient,
  removeMapping
} = require('../controllers/mappingController');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Apply authentication middleware to all mapping routes
router.use(verifyToken);

router.post('/', assignDoctor);
router.get('/', getAllMappings);
router.get('/:patient_id', getDoctorsByPatient);
router.delete('/:id', removeMapping);
module.exports = router;
