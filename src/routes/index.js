const express = require('express');
const authRoutes = require('./authRoutes');
const patientRoutes = require('./patientRoutes');
const doctorRoutes = require('./doctorRoutes');
const mappingRoutes = require('./mappingRoutes');
const { sendSuccess } = require('../utils/apiResponse');

const router = express.Router();

// System Health Check
router.get('/health', (req, res) => {
  return sendSuccess(res, 'Healthcare Backend API is running smoothly', {
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Register Module Routes
router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/doctors', doctorRoutes);
router.use('/mappings', mappingRoutes);

module.exports = router;
