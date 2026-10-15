const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorMiddleware');

const app = express();

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// Parse incoming URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Root welcome route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the Healthcare Management System API',
    documentation: '/api/health'
  });
});

// Mount all API routes under /api
app.use('/api', apiRoutes);
// Catch 404 and forward to error handler
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);
module.exports = app;
