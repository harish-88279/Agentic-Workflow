require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Helper function to call Unbound API
async function callUnboundAI(model, prompt) {
  try {
    const response = await fetch(process.env.UNBOUND_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.UNBOUND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model, // "kimi-k2p5" or "kimi-k2-instruct-0905"
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API Error: ${errText}`);
    }

    const data = await response.json();
    // OpenAI format usually puts the text here:
    return data.choices[0].message.content;
  } catch (error) {
    console.error("AI Call Failed:", error);
    return `[Error calling AI: ${error.message}]`;
  }
}

app.post('/api/run-workflow', async (req, res) => {
  const { name, steps } = req.body;

  try {
    // 1. Create Workflow Record
    const workflow = await prisma.workflow.create({
      data: {
        name: name || "Untitled Workflow",
        steps: steps 
      }
    });

    let results = [];
    let currentContext = ""; 
    let status = "COMPLETED";

    // 2. Loop through steps
    for (const step of steps) {
      console.log(`Running Step with Model: ${step.model}`);

      // Inject Context (Simple concatenation for now)
      // If previous step had output, append it to the prompt
      let finalPrompt = step.prompt;
      if (currentContext) {
        finalPrompt += `\n\nContext from previous step:\n${currentContext}`;
      }

      // --- REAL API CALL ---
      const aiOutput = await callUnboundAI(step.model, finalPrompt);
      
      // --- CRITERIA CHECK (Basic "Contains" check for now) ---
      // If user typed "SUCCESS", we check if output has "SUCCESS"
      // If criteria is empty, we assume it passed.
      let passed = true;
      if (step.criteria && !aiOutput.includes(step.criteria)) {
        passed = false;
        status = "FAILED";
      }

      results.push({
        stepId: step.id,
        output: aiOutput,
        status: passed ? "SUCCESS" : "FAILED"
      });

      if (!passed) break; // Stop workflow on failure

      // Update Context for next step
      currentContext = aiOutput;
    }

    // 3. Save Execution
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