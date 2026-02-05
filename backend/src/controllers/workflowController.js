const workflowService = require('../services/workflowService');

exports.runWorkflow = async (req, res) => {
  // 1. Set Headers for Streaming
  res.setHeader('Content-Type', 'text/plain'); // Simple text stream
  res.setHeader('Transfer-Encoding', 'chunked');

  const { name, steps } = req.body;

  try {
    // 2. Run Workflow with a Callback
    await workflowService.executeWorkflow(name, steps, (update) => {
      // 3. Whenever there is an update, write it to the response stream
      // We send it as a JSON line so frontend can parse it easily
      res.write(JSON.stringify(update) + "\n");
    });

    res.end(); // Close connection when done
  } catch (error) {
    console.error(error);
    res.write(JSON.stringify({ type: 'ERROR', message: error.message }) + "\n");
    res.end();
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