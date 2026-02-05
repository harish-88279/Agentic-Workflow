require('dotenv').config();

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
    console.error("AI Service Error:", error);
    return `[Error calling AI: ${error.message}]`;
  }
}

module.exports = { callUnboundAI };