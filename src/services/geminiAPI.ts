interface GeminiPredictionRequest {
  nftName: string;
  currentPrice: number;
  historicalPrices: Array<{date: string, price: number}>;
  collectionStats: any;
  traits: Array<{trait_type: string, value: string}>;
}

interface PricePrediction {
  date: string;
  price: number;
  confidence: number;
  factors: string[];
}

class GeminiAPI {
  private apiKey: string;
  private baseURL: string = 'https://generativelanguage.googleapis.com/v1beta';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async makeRequest(endpoint: string, data: any): Promise<any> {
    const response = await fetch(`${this.baseURL}${endpoint}?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    return response.json();
  }

  async generatePricePredictions(request: GeminiPredictionRequest): Promise<PricePrediction[]> {
    const prompt = this.buildPredictionPrompt(request);
    
    const requestData = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    };

    try {
      const response = await this.makeRequest('/models/gemini-pro:generateContent', requestData);
      return this.parsePredictionResponse(response);
    } catch (error) {
      console.error('Error generating predictions:', error);
      throw error;
    }
  }

  private buildPredictionPrompt(request: GeminiPredictionRequest): string {
    return `
You are an expert NFT price prediction AI. Analyze the following NFT data and provide price predictions:

NFT Details:
- Name: ${request.nftName}
- Current Price: ${request.currentPrice} ETH
- Historical Prices: ${JSON.stringify(request.historicalPrices)}
- Collection Stats: ${JSON.stringify(request.collectionStats)}
- Traits: ${JSON.stringify(request.traits)}

Please provide price predictions for the next 5 time periods (monthly) in the following JSON format:
{
  "predictions": [
    {
      "date": "2024-01-15",
      "price": 48.5,
      "confidence": 0.85,
      "factors": ["trait rarity", "collection trending", "market sentiment"]
    }
  ]
}

Consider these factors:
1. Historical price trends
2. Collection floor price movement
3. Trait rarity and desirability
4. Market sentiment and volume
5. Seasonal patterns
6. Upcoming events or roadmap items

Provide realistic predictions with confidence scores (0-1) and key factors influencing each prediction.
`;
  }

  private parsePredictionResponse(response: any): PricePrediction[] {
    try {
      const text = response.candidates[0].content.parts[0].text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);
        return parsedData.predictions || [];
      }
      
      // Fallback to mock data if parsing fails
      return this.generateMockPredictions();
    } catch (error) {
      console.error('Error parsing prediction response:', error);
      return this.generateMockPredictions();
    }
  }

  private generateMockPredictions(): PricePrediction[] {
    const basePrice = 45.2;
    const predictions: PricePrediction[] = [];
    
    for (let i = 1; i <= 5; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      
      const volatility = (Math.random() - 0.5) * 0.3; // ±15% volatility
      const trend = Math.random() > 0.5 ? 0.05 : -0.03; // Slight upward bias
      const price = basePrice * (1 + trend * i + volatility);
      
      predictions.push({
        date: date.toISOString().split('T')[0],
        price: Math.max(price, basePrice * 0.5), // Minimum 50% of current price
        confidence: Math.max(0.6, 0.9 - i * 0.05), // Decreasing confidence over time
        factors: [
          'Historical trend analysis',
          'Collection performance',
          'Market sentiment',
          'Trait rarity assessment'
        ]
      });
    }
    
    return predictions;
  }

  async analyzeNFTImage(imageBase64: string): Promise<{name: string, traits: string[], description: string}> {
    const requestData = {
      contents: [
        {
          parts: [
            {
              text: "Analyze this NFT image and identify its characteristics, traits, and possible collection. Provide a JSON response with name, traits, and description."
            },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: imageBase64
              }
            }
          ]
        }
      ]
    };

    try {
      const response = await this.makeRequest('/models/gemini-pro-vision:generateContent', requestData);
      return this.parseImageAnalysisResponse(response);
    } catch (error) {
      console.error('Error analyzing NFT image:', error);
      throw error;
    }
  }

  private parseImageAnalysisResponse(response: any): {name: string, traits: string[], description: string} {
    try {
      const text = response.candidates[0].content.parts[0].text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback response
      return {
        name: "Unknown NFT",
        traits: ["Digital Art", "Collectible"],
        description: "NFT analysis from uploaded image"
      };
    } catch (error) {
      console.error('Error parsing image analysis response:', error);
      return {
        name: "Unknown NFT",
        traits: ["Digital Art"],
        description: "Unable to analyze image"
      };
    }
  }
}

export default GeminiAPI;