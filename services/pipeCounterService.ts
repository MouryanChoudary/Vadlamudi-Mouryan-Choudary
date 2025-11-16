import type { AnalysisData, Pipe, PipeSize, GeolocationState } from '../types';

// Access the globally loaded library instead of using an import
const { GoogleGenAI, Type } = (window as any).genai;

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const pipeSchema = {
  type: Type.OBJECT,
  properties: {
    pipes: {
      type: Type.ARRAY,
      description: "An array of all detected pipe objects in the image.",
      items: {
        type: Type.OBJECT,
        properties: {
          size: {
            type: Type.STRING,
            enum: ['Small', 'Medium', 'Large', 'Unknown'],
            description: "The classified size of the pipe."
          },
          boundingBox: {
            type: Type.OBJECT,
            description: "The bounding box coordinates as percentages of image dimensions.",
            properties: {
              x: { type: Type.NUMBER, description: "Percentage from the left edge." },
              y: { type: Type.NUMBER, description: "Percentage from the top edge." },
              width: { type: Type.NUMBER, description: "Width as a percentage." },
              height: { type: Type.NUMBER, description: "Height as a percentage." },
            },
            required: ['x', 'y', 'width', 'height']
          },
          confidence: {
            type: Type.NUMBER,
            description: 'A value between 0.0 and 1.0 representing the model\'s confidence in this specific detection.'
          }
        },
        required: ['size', 'boundingBox', 'confidence']
      }
    },
    overallConfidence: {
      type: Type.NUMBER,
      description: 'A value between 0.0 and 1.0 representing the overall confidence in the accuracy of the entire analysis.'
    },
    notes: {
      type: Type.STRING,
      description: 'A brief, human-readable summary of the findings, including total counts for each size.'
    }
  },
  required: ['pipes', 'overallConfidence', 'notes']
};

export const analyzeImage = async (imageDataUrl: string, location: GeolocationState): Promise<AnalysisData> => {
  try {
    const base64Data = imageDataUrl.split(',')[1];
    if (!base64Data) {
      throw new Error("Invalid image data URL.");
    }
    
    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Data,
      },
    };

    const textPart = {
      text: `You are an expert in industrial logistics and inventory management. Your task is to analyze this image of stacked industrial pipes. 
      
      Instructions:
      1. Identify every single visible pipe end.
      2. For each pipe, classify its size as 'Small', 'Medium', 'Large', or 'Unknown' if you cannot determine it.
      3. Provide the bounding box coordinates for each pipe. The coordinates (x, y, width, height) must be percentages of the total image dimensions (e.g., x: 50 means the box starts at 50% from the left).
      4. Provide a confidence score (0.0 to 1.0) for each individual pipe detection.
      5. Provide an overall confidence score (0.0 to 1.0) for the entire analysis.
      6. Provide a brief summary of the findings in the 'notes' field.
      
      Return the data ONLY in the structured JSON format defined by the schema. Do not include any other text or markdown formatting.`,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: pipeSchema,
      },
    });

    const jsonResponse = JSON.parse(response.text);

    const pipes: Pipe[] = jsonResponse.pipes.map((p: any, index: number) => ({
      ...p,
      id: `pipe_${index}_${Date.now()}`
    }));

    const countBySize: Record<PipeSize, number> = { Small: 0, Medium: 0, Large: 0, Unknown: 0 };
    pipes.forEach(pipe => {
      countBySize[pipe.size]++;
    });

    const analysisData: AnalysisData = {
      id: `analysis_${Date.now()}`,
      timestamp: Date.now(),
      imageDataUrl,
      totalCount: pipes.length,
      countBySize,
      pipes,
      notes: jsonResponse.notes,
      location,
      overallConfidence: jsonResponse.overallConfidence || 0,
      modelVersion: 'gemini-2.5-flash',
    };

    return analysisData;
  } catch(error) {
    console.error("Gemini API call failed:", error);
    // Provide a more user-friendly error message
    throw new Error("The AI model could not process the image. It might be too blurry or in an unsupported format. Please try again.");
  }
};


// Mock Inventory Sync Service
export const syncToInventory = (analysisData: AnalysisData): Promise<{ status: 'success' | 'error'; message: string; }> => {
  return new Promise(resolve => {
    setTimeout(() => {
      if (Math.random() > 0.1) { // 90% success rate
        resolve({ status: 'success', message: `Inventory sync successful for Analysis ID: ${analysisData.id.slice(-6)}` });
      } else {
        resolve({ status: 'error', message: 'Inventory system temporarily unavailable. Please retry.' });
      }
    }, 1500);
  });
};

// Mock Active Learning Feedback Loop
export const submitFeedbackForTraining = (correctedData: AnalysisData): Promise<{ status: 'success'; message: string; }> => {
  console.log("Submitting feedback for model fine-tuning:", {
    id: correctedData.id,
    model: correctedData.modelVersion,
    corrections: correctedData.pipes
  });
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ status: 'success', message: 'AI feedback received. The model will be improved with your corrections.' });
    }, 1000);
  });
};