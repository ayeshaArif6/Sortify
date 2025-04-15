const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const vision = require("@google-cloud/vision");
const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Auth: load your vision key
const client = new vision.ImageAnnotatorClient({
  keyFilename: "./vision-key.json", // 🔐 your private key
});

app.post("/analyze", async (req, res) => {
  const { imageUrl } = req.body;

  if (!imageUrl) return res.status(400).json({ error: "Missing imageUrl" });

  try {
    const [result] = await client.labelDetection(imageUrl);
    const labels = result.labelAnnotations.map(label => label.description);
    console.log("🔍 Tags:", labels);
    res.json({ labels });
  } catch (error) {
    console.error("❌ Vision API error:", error.message);
    res.status(500).json({ error: "Failed to analyze image" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Sortify AI server running on http://localhost:${PORT}`);
});
