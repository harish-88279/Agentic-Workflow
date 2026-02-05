const prisma = require('../config/prisma');
const { callUnboundAI } = require('./aiService');

// --- HELPER 1: VALIDATOR LOGIC ---
function validateStep(output, criteria) {
  if (!criteria || criteria.trim() === "") return true;
  
  // Check for Regex: /pattern/flags
  const regexMatch = criteria.match(/^\/(.*?)\/([gimsuy]*)$/);
  if (regexMatch) {
    try {
      const pattern = regexMatch[1];
      const flags = regexMatch[2];
      return new RegExp(pattern, flags).test(output);
    } catch (e) {
      console.error("Invalid Regex:", e);
      return false; 
    }
  }
  
  // Default: Simple text contains
  return output.includes(criteria);
}

// --- HELPER 2: CONTEXT EXTRACTOR ---
function extractRelevantContext(fullOutput) {
  // Regex to find content inside ```code blocks```
  const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)```/g;
  const matches = [...fullOutput.matchAll(codeBlockRegex)];
  
  if (matches.length > 0) {
    // Return only the code parts joined together
    return matches.map(m => m[1]).join('\n\n');
  }
  
  // If no code blocks, return the whole text
  return fullOutput;
}

// --- MAIN FUNCTION: EXECUTE WORKFLOW ---
async function executeWorkflow(name, steps) {
  // 1. Create Workflow Record
  const workflow = await prisma.workflow.create({
    data: { name: name || "Untitled Run", steps: steps }
  });

  let results = [];
  let currentContext = ""; 
  let overallStatus = "COMPLETED";

  // --- CONFIGURATION ---
  const MAX_RETRIES = 3; // Retry up to 3 times

  // 2. Loop through Steps
  for (const step of steps) {
    let stepPassed = false;
    let attemptCount = 0;
    let aiOutput = "";

    // --- RETRY LOOP ---
    while (!stepPassed && attemptCount < MAX_RETRIES) {
      attemptCount++;
      console.log(`Step ${step.id} - Attempt ${attemptCount}/${MAX_RETRIES}`);

      // A. Build Prompt
      let finalPrompt = step.prompt;
      
      // Inject Context
      if (currentContext) {
        finalPrompt += `\n\n### Context from Previous Step:\n${currentContext}`;
      }

      // SMART RETRY PROMPT
      if (attemptCount > 1) {
        finalPrompt += `\n\n⚠️ IMPORTANT: Your previous answer failed validation. It MUST match this criteria: "${step.criteria}". Please try again and strictly follow this rule.`;
      }

      // B. Execute AI
      aiOutput = await callUnboundAI(step.model, finalPrompt);
      
      // C. Validate
      stepPassed = validateStep(aiOutput, step.criteria);

      if (!stepPassed) {
        console.log(`Attempt ${attemptCount} Failed Validation.`);
      }
    }
    // --- END RETRY LOOP ---

    // 3. Record Result (Log the final attempt)
    results.push({
      stepId: step.id,
      output: aiOutput,
      status: stepPassed ? "SUCCESS" : "FAILED",
      criteriaMatch: stepPassed,
      attempts: attemptCount 
    });

    // 4. Decision: Stop or Continue?
    if (!stepPassed) {
      overallStatus = "FAILED";
      console.log("Workflow failed at step", step.id);
      break; // STOP WORKFLOW
    } else {
      // Success! Update context for next step
      currentContext = extractRelevantContext(aiOutput);
    }
  }

  // 5. Save Execution History
  const execution = await prisma.execution.create({
    data: {
      workflowId: workflow.id,
      status: overallStatus,
      results: results
    }
  });

  return { workflowId: workflow.id, execution };
}

// --- HISTORY FUNCTION ---
async function getHistory() {
  return await prisma.workflow.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: { executions: true }
  });
}

module.exports = { executeWorkflow, getHistory };