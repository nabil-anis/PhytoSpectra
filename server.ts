import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import * as fs from 'fs';

dotenv.config();

// Silence TensorFlow logs before any tf loading happens
process.env.TF_CPP_MIN_LOG_LEVEL = '2';
process.env.TF_ENABLE_ONEDNN_OPTS = '0';

let tf: any = null;
let model: any = null;
let CLASS_NAMES: string[] = [];

async function loadTensorFlow() {
  if (!tf) {
    tf = await import('@tensorflow/tfjs-node');
  }
  return tf;
}

try {
  if (fs.existsSync('./class_names.json')) {
    CLASS_NAMES = JSON.parse(fs.readFileSync('./class_names.json', 'utf-8'));
  }
} catch (e) {
  console.error("Failed to load class_names.json:", e);
}

async function loadModel() {
  const tfInstance = await loadTensorFlow();
  if (!model) {
    console.log("Loading CNN model...");
    try {
      if (fs.existsSync('./tfjs_model/model.json')) {
        model = await tfInstance.loadLayersModel('file://./tfjs_model/model.json');
        console.log("CNN model loaded.");
      } else {
        console.warn("CNN model file not found at ./tfjs_model/model.json");
      }
    } catch (e) {
      console.error("Error loading CNN model:", e);
    }
  }
  return model;
}

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
 * Layer 1: Custom Docker Backend API (kiranrajar/nabils-api:latest)
 * Communicates with the user's custom plant identification model container on port 8000.
 */
async function identifyWithCustomBackend(base64Image: string): Promise<string | null> {
  const backendUrl = process.env.BACKEND_API_URL || "http://localhost:8000";
  console.log(`Layer 1: Querying Custom Backend API at ${backendUrl}...`);
  
  const base64Clean = base64Image.split(",")[1] || base64Image;
  const mimeType = base64Image.split(";")[0]?.split(":")[1] || "image/jpeg";
  const buffer = Buffer.from(base64Clean, 'base64');
  
  // 1. Probe standard Gradio JSON endpoint: /api/predict (Gradio maps to 7860 internally)
  try {
    console.log(`Layer 1 -> Probing Gradio: ${backendUrl}/api/predict`);
    const response = await fetch(`${backendUrl}/api/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [base64Image] // Gradio expects Data URI or base64 structure
      }),
      signal: AbortSignal.timeout(5000) // 5s timeout
    });

    if (response.ok) {
      const resData = await response.json();
      if (resData && Array.isArray(resData.data) && resData.data.length > 0) {
        const value = resData.data[0];
        if (typeof value === 'string' && value.trim() !== '') {
          console.log(`Layer 1 (Backend - Gradio) Match Succeeded: ${value}`);
          return value;
        } else if (typeof value === 'object' && value !== null) {
          if (value.label) {
            console.log(`Layer 1 (Backend - Gradio Object Label) Match Succeeded: ${value.label}`);
            return value.label;
          }
          if (value.confidences && Array.isArray(value.confidences)) {
            const best = value.confidences[0];
            if (best && best.label) return best.label;
          }
        }
      }
    } else {
      console.warn(`Layer 1: Gradio /api/predict responded with status: ${response.status}`);
    }
  } catch (err: any) {
    console.warn(`Layer 1: Gradio probe skipped/failed: ${err.message}`);
  }

  // 2. Probe standard FastAPI /predict JSON endpoint
  try {
    console.log(`Layer 1 -> Probing FastAPI JSON: ${backendUrl}/predict`);
    const response = await fetch(`${backendUrl}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: base64Image,
        file: base64Image,
        data: base64Clean
      }),
      signal: AbortSignal.timeout(5000)
    });

    if (response.ok) {
      const resData = await response.json();
      const label = resData.label || resData.prediction || resData.class || resData.species || resData.className;
      if (label && typeof label === 'string' && label.trim() !== '') {
        console.log(`Layer 1 (Backend - FastAPI /predict) Match Succeeded: ${label}`);
        return label;
      }
    } else {
      console.warn(`Layer 1: FastAPI JSON /predict responded with status: ${response.status}`);
    }
  } catch (err: any) {
    console.warn(`Layer 1: FastAPI JSON probe skipped/failed: ${err.message}`);
  }

  // 3. Probe standard FastAPI multipart/form-data endpoint to /predict
  try {
    console.log(`Layer 1 -> Probing Multipart upload: ${backendUrl}/predict`);
    const formData = new FormData();
    const blob = new Blob([buffer], { type: mimeType });
    formData.append('file', blob, 'image.jpg');
    formData.append('image', blob, 'image.jpg');

    const response = await fetch(`${backendUrl}/predict`, {
      method: "POST",
      body: formData,
      signal: AbortSignal.timeout(8000)
    });

    if (response.ok) {
      const resData = await response.json();
      const label = resData.label || resData.prediction || resData.class || resData.species || resData.className;
      if (label && typeof label === 'string' && label.trim() !== '') {
        console.log(`Layer 1 (Backend - Multipart Form) Match Succeeded: ${label}`);
        return label;
      }
    } else {
      console.warn(`Layer 1: Multipart file upload responded with status: ${response.status}`);
    }
  } catch (err: any) {
    console.warn(`Layer 1: Multipart probe skipped/failed: ${err.message}`);
  }

  // 4. Try Direct Root POST endpoint
  try {
    console.log(`Layer 1 -> Probing Direct Root POST: ${backendUrl}/`);
    const response = await fetch(`${backendUrl}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: base64Image,
        data: base64Clean
      }),
      signal: AbortSignal.timeout(5000)
    });

    if (response.ok) {
      const resData = await response.json();
      const label = resData.label || resData.prediction || resData.class || resData.species || resData.className || (Array.isArray(resData.data) ? resData.data[0] : null);
      if (label && typeof label === 'string' && label.trim() !== '') {
        console.log(`Layer 1 (Backend - Root POST) Match Succeeded: ${label}`);
        return label;
      }
    }
  } catch (err: any) {
    console.warn(`Layer 1: Root POST probe skipped/failed: ${err.message}`);
  }

  // Fallback to local CNN model if available
  return await identifyWithLocalCNNFallback(base64Image);
}

/**
 * Fallback to local TensorFlow.js CNN if files exist
 */
async function identifyWithLocalCNNFallback(base64Image: string): Promise<string | null> {
  console.log("Layer 1 Fallback: Checking Local CNN Model...");
  try {
    const tfInstance = await loadTensorFlow();
    const m = await loadModel();
    if (!m || CLASS_NAMES.length === 0) {
      console.log("Local CNN skipped: Model or class names not loaded.");
      return null;
    }

    const base64Data = base64Image.split(",")[1] || base64Image;
    const buffer = Buffer.from(base64Data, 'base64');

    const tensor = tfInstance.node.decodeImage(buffer, 3)
      .resizeNearestNeighbor([96, 96])
      .toFloat()
      .div(255.0)
      .expandDims(0);

    const predictions = await (m.predict(tensor) as any).data() as any;
    tensor.dispose();

    const maxIdx = Array.from(predictions).indexOf(Math.max(...Array.from(predictions) as number[]));
    const confidence = predictions[maxIdx] as number;

    console.log(`Local CNN identification: ${CLASS_NAMES[maxIdx]} (${(confidence * 100).toFixed(1)}%)`);

    if (confidence > 0.6) {
      return CLASS_NAMES[maxIdx];
    }
    return null;
  } catch (e) {
    console.error("Local CNN Fallback Error:", e);
    return null;
  }
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

    // LAYER 1: Custom Docker Backend API (kiranrajar/nabils-api:latest on port 8000)
    let detectedName = await identifyWithCustomBackend(image);
    let layerSource = "Custom Backend API (kiranrajar/nabils-api)";

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
