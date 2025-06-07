const { CohereClient } = require('cohere-ai'); // using cohere-ai
require('dotenv').config();

if (!process.env.COHERE_API_KEY) {
  console.error("CRITICAL ERROR: COHERE_API_KEY is not set in .env file.");
}

// Initialize Cohere client
const cohere = new CohereClient({ 
  token: process.env.COHERE_API_KEY,
});

const suggestSkillKeywords = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Skill title is required to suggest keywords." });
    }

    const prompt = `
      Given the following skill:
      Title: "${title}"
      Description: "${description || 'No description provided.'}"

      Suggest 3 to 5 relevant keywords or tags for this skill.
      Each keyword/tag should be concise (1-3 words).
      Return the keywords/tags as a comma-separated list.
      Example: JavaScript, Web Development, Frontend, React, Node.js
    `;

    console.log("Sending prompt to Cohere:", prompt);

    // Using Cohere's generate endpoint (similar to OpenAI's completion)
    const response = await cohere.generate({
      prompt: prompt,
      model: 'command-light',
      maxTokens: 60,
      temperature: 0.5,
      k: 0, 
      p: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
      stopSequences: [], 
    });

    console.log("Cohere API Response:", JSON.stringify(response, null, 2));

    if (response.generations && response.generations.length > 0) {
      const rawKeywords = response.generations[0].text.trim();
      const keywordsArray = rawKeywords.split(',').map(keyword => keyword.trim()).filter(keyword => keyword.length > 0);

      res.status(200).json({
        suggestedKeywords: keywordsArray,
        rawResponse: rawKeywords
      });
    } else {
      console.error("Cohere response format unexpected:", response);
      res.status(500).json({ message: "Failed to get valid suggestions from AI. Unexpected Cohere response format." });
    }

  } catch (error) {
    console.error("Error with Cohere API request in suggestSkillKeywords:", error.message);
    
    if (error.statusCode && error.message) {
         return res.status(error.statusCode).json({ message: "Error communicating with Cohere AI service.", error: error.message });
    }
    res.status(500).json({ message: "Internal error processing AI request.", error: error.message });
  }
};

module.exports = {
  suggestSkillKeywords,
};