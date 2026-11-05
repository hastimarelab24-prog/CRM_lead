

 const express = require('express');
const router = express.Router();

const {
  getDashboardData,
  exportLeadsCSV
} = require('../controllers/dashboardController');

// Dashboard routes
router.get('/', getDashboardData);
router.get('/stats', getDashboardData);
router.get('/export-csv', exportLeadsCSV);

module.exports = router;
module.exports = router;