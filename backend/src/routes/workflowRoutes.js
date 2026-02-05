const express = require('express');
const router = express.Router();
const controller = require('../controllers/workflowController');

router.post('/run-workflow', controller.runWorkflow);
router.get('/workflows', controller.getHistory);
router.delete('/workflows/:id', controller.deleteWorkflow); // <--- NEW ROUTE

module.exports = router;