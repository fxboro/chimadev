export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Retrieve the API key from server environment variables
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set in the environment variables.");
    return res.status(500).json({ error: 'Server configuration error: API key missing.' });
  }

  try {
    // Forward the request to Google's Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      // req.body already contains the correctly formatted JSON from the frontend
      body: JSON.stringify(req.body)
    });

    const data = await response.json();

    // If the Google API responds with an error, forward that error to the client
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    // Return the successful response to the frontend
    return res.status(200).json(data);
  } catch (error) {
    console.error("Proxy Error:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
