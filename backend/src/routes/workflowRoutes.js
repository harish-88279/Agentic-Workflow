const express = require('express');
const router = express.Router();
const controller = require('../controllers/workflowController');

router.post('/run-workflow', controller.runWorkflow);
router.get('/workflows', controller.getHistory);

module.exports = router;