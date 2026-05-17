import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Prompt for plant identification
const PLANT_ID_PROMPT = `Identify the plant or leaf in this image. 
Provide the common name, scientific name, and any alternative names it is known by (including regional or common nicknames).
Include a detailed description, comprehensive medicinal properties, and extensive toxic/harmful properties (especially for humans, cats, dogs, and horses). 
Be very specific and thorough with the medicinal/toxicity data, citing traditional uses or specific chemical compounds if helpful for understanding safety.
Format the response as a structured JSON object.
Crucially, include 'irohWisdom': a random fact or profound philosophical insight about this specific plant. 
Tone guide for 'irohWisdom': Channel the voice of a wise, gentle mentor who finds deep meaning in nature. Use heartwarming, philosophical, and calm language. Use metaphors about growth, resilience, patience, or simple joys. Do NOT mention specific characters, TV shows, or pop culture icons. Focus strictly on the wisdom drawn from the plant's nature.`;

const plantSchema = {
  type: Type.OBJECT,
  properties: {
    commonName: { type: Type.STRING },
    scientificName: { type: Type.STRING },
    alternativeNames: { 
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    family: { type: Type.STRING },
    description: { type: Type.STRING },
    medicinalProperties: {
      type: Type.ARRAY,
      description: "Detailed list of medicinal benefits, traditional uses, and specific parts of the plant used for therapy.",
      items: { type: Type.STRING }
    },
    toxicProperties: {
      type: Type.ARRAY,
      description: "Extensive list of toxicity warnings for humans and common pets (cats, dogs), including specific symptoms and severity.",
      items: { type: Type.STRING }
    },
    safetyLevel: { 
      type: Type.STRING,
      description: "One of: Safe, Caution, Toxic"
    },
    careInstructions: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    irohWisdom: { type: Type.STRING }
  },
  required: ["commonName", "scientificName", "alternativeNames", "description", "medicinalProperties", "toxicProperties", "safetyLevel", "irohWisdom"]
};

/**
 * Layer 1: Custom Trained CNN Model
 * (Placeholder for your specific model inference logic)
 */
async function identifyWithCustomCNN(base64Image: string): Promise<string | null> {
  // In a real-world scenario, you would call your Python/TensorFlow/PyTorch microservice here
  // or use a local inference worker. For now, we provide the structure.
  console.log("Layer 1: Checking Custom CNN Model...");
  return null; // Fallback to next layer for now
}

/**
 * Layer 2: PlantNet Botanical API Fallback
 */
async function identifyWithPlantNet(base64Image: string): Promise<string | null> {
  const apiKey = process.env.PLANTNET_API_KEY;
  if (!apiKey || apiKey === "YOUR_PLANTNET_API_KEY" || apiKey.trim() === "") {
    console.warn("Layer 2: PlantNet API key missing, skipping.");
    return null;
  }

  console.log("Layer 2: Checking PlantNet botanical database...");
  try {
    const base64Data = base64Image.split(",")[1] || base64Image;
    const buffer = Buffer.from(base64Data, 'base64');
    const blob = new Blob([buffer]);
    
    const formData = new FormData();
    formData.append('images', blob, 'image.jpg');
    formData.append('organs', 'leaf');

    const response = await fetch(`https://my-api.plantnet.org/v2/identify/all?api-key=${apiKey}`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) return null;
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      return data.results[0].species.scientificNameWithoutAuthor;
    }
    return null;
  } catch (error) {
    console.error("PlantNet Error:", error);
    return null;
  }
}

app.post("/api/identify", async (req, res) => {
  const { image } = req.body;
  try {
    if (!image) {
      return res.status(400).json({ error: "Image is required" });
    }

    // LAYER 1: Custom CNN
    let detectedName = await identifyWithCustomCNN(image);
    let layerSource = "Custom CNN Architecture";

    // LAYER 2: PlantNet Fallback
    if (!detectedName) {
      detectedName = await identifyWithPlantNet(image);
      layerSource = "PlantNet Botanical V2";
    }

    // LAYER 3 & ENRICHMENT: Gemini
    console.log(`Layer 3: Enriching ${detectedName || "visual data"} with Gemini Knowledge...`);
    
    const prompt = detectedName 
      ? `${PLANT_ID_PROMPT}\n\nThe plant has been identified as '${detectedName}'. Provide the full structured data for this species.`
      : PLANT_ID_PROMPT;

    const base64Data = image.split(",")[1] || image;
    const mimeType = image.split(";")[0].split(":")[1] || "image/jpeg";

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: plantSchema,
      }
    });

    const result = JSON.parse(response.text || "{}");
    // Assign source based on where the identification originated
    result.source = detectedName ? layerSource : "Gemini Vision Intelligence (Direct)";
    
    res.json(result);
  } catch (error: any) {
    console.error("System Error:", error);
    res.status(500).json({ error: "Failed to process image through 3-layered system." });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
