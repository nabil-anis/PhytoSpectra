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

  console.log("Layer 2: Querying PlantNet botanical database...");
  try {
    const base64Data = base64Image.split(",")[1] || base64Image;
    const buffer = Buffer.from(base64Data, 'base64');
    
    // PlantNet expects a multipart/form-data request
    // We use the global FormData and Blob available in Node 18+
    const formData = new FormData();
    const blob = new Blob([buffer], { type: 'image/jpeg' });
    formData.append('images', blob, 'image.jpg');
    formData.append('organs', 'leaf');

    const response = await fetch(`https://my-api.plantnet.org/v2/identify/all?api-key=${apiKey}`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn("PlantNet API call failed:", response.status, errorText);
      return null;
    }

    const data = await response.json();
    if (data.results && data.results.length > 0) {
      // Pick the top result with highest score if available
      const bestMatch = data.results[0];
      console.log(`PlantNet match found: ${bestMatch.species.scientificNameWithoutAuthor} (Score: ${bestMatch.score})`);
      return bestMatch.species.scientificNameWithoutAuthor;
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

    // LAYER 1: Custom CNN Architecture (Placeholder for local model)
    let detectedName = await identifyWithCustomCNN(image);
    let layerSource = "Custom CNN Intelligence";

    // LAYER 2: PlantNet Botanical Database (Fallback for precise scientific naming)
    if (!detectedName) {
      detectedName = await identifyWithPlantNet(image);
      layerSource = "PlantNet Botanical V2 Database";
    }

    // LAYER 3 & ENRICHMENT: Gemini Vision or Knowledge Engine
    console.log(`Layer 3: Processing with Gemini (${detectedName ? "Text Intelligence" : "Vision Intelligence"})...`);
    
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }

    const base64Data = image.split(",")[1] || image;
    const mimeType = image.split(";")[0]?.split(":")[1] || "image/jpeg";

    try {
      let response;
      
      if (detectedName) {
        // OPTIMIZATION: If we already have a name, use text-only prompt to save Vision quota/tokens
        console.log(`Using text-only enrichment for: ${detectedName}`);
        response = await ai.models.generateContent({
          model: "gemini-2.0-flash", 
          contents: {
            parts: [
              { text: `The botanical name for this plant is confirmed as '${detectedName}'. 
                        ${PLANT_ID_PROMPT} 
                        Generate the detailed report for this species.` }
            ]
          },
          config: {
            responseMimeType: "application/json",
            responseSchema: plantSchema,
          }
        });
      } else {
        // FALLBACK: Use full Vision capabilities if other layers failed
        console.log("Using full Vision Identification...");
        response = await ai.models.generateContent({
          model: "gemini-2.0-flash", 
          contents: {
            parts: [
              { inlineData: { data: base64Data, mimeType } },
              { text: PLANT_ID_PROMPT }
            ]
          },
          config: {
            responseMimeType: "application/json",
            responseSchema: plantSchema,
          }
        });
      }

      const text = response.text || "{}";
      const result = JSON.parse(text);
      
      // Finalize source tagging based on which layer provided the primary identification
      result.source = detectedName ? layerSource : "Gemini Vision Identification (Global)";
      
      console.log(`Success: Identified as ${result.commonName} (${result.scientificName})`);
      res.json(result);
    } catch (apiError: any) {
      const errorMessage = apiError.message || "";
      if (errorMessage.includes("429") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
        throw new Error("PhytoSpectra is experiencing heavy traffic on the free tier. Please wait 60 seconds and try your scan again.");
      }
      throw apiError;
    }
  } catch (error: any) {
    console.error("Critical System Failure:", error.message);
    res.status(500).json({ 
      error: "Identification Engine Unavailable",
      details: error.message 
    });
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
