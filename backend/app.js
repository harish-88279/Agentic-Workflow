require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// 1. Route to Save & Run a Workflow
app.post('/api/run-workflow', async (req, res) => {
  const { name, steps } = req.body;

  try {
    // A. Save the Blueprint
    const workflow = await prisma.workflow.create({
      data: {
        name: name || "Untitled Workflow",
        steps: steps // Array of objects
      }
    });

    console.log(`Starting Workflow: ${workflow.id}`);

    // B. Execute Logic (Simplified for First Pass)
    let results = [];
    let currentContext = ""; 
    let status = "COMPLETED";

    for (const step of steps) {
      console.log(`Executing Step: Using ${step.model}`);
      
      // --- MOCK LLM CALL (Replace with Real Unbound API later) ---
      // Simulating a delay and a response
      await new Promise(r => setTimeout(r, 1000)); 
      
      const mockOutput = `[Mock Output from ${step.model}] for prompt: "${step.prompt}". Context used: ${currentContext.substring(0, 20)}...`;
      
      // --- MOCK VALIDATION ---
      const passed = true; // Hardcoded pass for now

      if (!passed) {
        status = "FAILED";
        break;
      }

      results.push({
        stepId: step.id,
        output: mockOutput,
        status: "SUCCESS"
      });

      // Update Context for next step
      currentContext = mockOutput;
    }

    // C. Save Execution History
    const execution = await prisma.execution.create({
      data: {
        workflowId: workflow.id,
        status: status,
        results: results
      }
    });

    res.json({ success: true, execution });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Execution Failed" });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});