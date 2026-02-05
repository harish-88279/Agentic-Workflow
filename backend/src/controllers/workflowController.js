const workflowService = require('../services/workflowService');

exports.runWorkflow = async (req, res) => {
  try {
    const { name, steps } = req.body;
    const result = await workflowService.executeWorkflow(name, steps);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Execution Failed" });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const history = await workflowService.getHistory();
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
};