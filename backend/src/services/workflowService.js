const prisma = require('../config/prisma');
const { callUnboundAI } = require('./aiService');

// Validator Logic
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

// Main Execution Logic
async function executeWorkflow(name, steps) {
  // 1. Create Record
  const workflow = await prisma.workflow.create({
    data: { name: name || "Untitled Run", steps: steps }
  });

  let results = [];
  let currentContext = ""; 
  let overallStatus = "COMPLETED";

  // 2. Loop Steps
  for (const step of steps) {
    // Inject Context
    let finalPrompt = step.prompt;
    if (currentContext) {
      finalPrompt += `\n\n### Context from Previous Step:\n${currentContext}`;
    }

    // AI Call
    const aiOutput = await callUnboundAI(step.model, finalPrompt);
    
    // Validation
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

  // 3. Save Results
  const execution = await prisma.execution.create({
    data: {
      workflowId: workflow.id,
      status: overallStatus,
      results: results
    }
  });

  return { workflowId: workflow.id, execution };
}

async function getHistory() {
  return await prisma.workflow.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: { executions: true }
  });
}

module.exports = { executeWorkflow, getHistory };