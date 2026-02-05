require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// --- HELPER: CALL AI ---
async function callUnboundAI(model, prompt) {
  try {
    const response = await fetch(process.env.UNBOUND_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.UNBOUND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API Error: ${errText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("AI Call Failed:", error);
    return `[Error calling AI: ${error.message}]`;
  }
}

// --- HELPER: VALIDATOR ---
function validateStep(output, criteria) {
  if (!criteria || criteria.trim() === "") return true;
  const regexMatch = criteria.match(/^\/(.*?)\/([gimsuy]*)$/);
  if (regexMatch) {
    try {
      return new RegExp(regexMatch[1], regexMatch[2]).test(output);
    } catch (e) { return false; }
  }
  return output.includes(criteria);
}

// --- ROUTE 1: RUN WORKFLOW ---
app.post('/api/run-workflow', async (req, res) => {
  const { name, steps } = req.body;

  try {
    // Save Workflow
    const workflow = await prisma.workflow.create({
      data: { name: name || "Untitled Run", steps: steps }
    });

    let results = [];
    let currentContext = ""; 
    let overallStatus = "COMPLETED";

    // Execute Steps
    for (const step of steps) {
      // 1. Context Injection
      let finalPrompt = step.prompt;
      if (currentContext) {
        finalPrompt += `\n\n### Context from Previous Step:\n${currentContext}`;
      }

      // 2. AI Call
      const aiOutput = await callUnboundAI(step.model, finalPrompt);
      
      // 3. Validation
      const passed = validateStep(aiOutput, step.criteria);

      results.push({
        stepId: step.id,
        output: aiOutput,
        status: passed ? "SUCCESS" : "FAILED",
        criteriaMatch: passed
      });

      if (!passed) {
        overallStatus = "FAILED";
        break;
      }
      currentContext = aiOutput;
    }

    // Save Execution
    const execution = await prisma.execution.create({
      data: {
        workflowId: workflow.id,
        status: overallStatus,
        results: results
      }
    });

    res.json({ success: true, workflowId: workflow.id, execution });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Execution Failed" });
  }
});

// --- ROUTE 2: GET HISTORY (LIST) ---
app.get('/api/workflows', async (req, res) => {
  try {
    const workflows = await prisma.workflow.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20, // Limit to last 20 runs
      include: { executions: true } // Include status
    });
    res.json(workflows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// --- ROUTE 3: GET DETAILS (SINGLE) ---
app.get('/api/workflows/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const workflow = await prisma.workflow.findUnique({
      where: { id },
      include: { executions: true }
    });
    res.json(workflow);
  } catch (error) {
    res.status(404).json({ error: "Workflow not found" });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});