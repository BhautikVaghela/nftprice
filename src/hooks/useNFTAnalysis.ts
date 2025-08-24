import { useState, useCallback } from 'react';
import OpenSeaAPI from '../services/openSeaAPI';
import GeminiAPI from '../services/geminiAPI';
import { API_CONFIG } from '../config/api';

interface NFTAnalysisResult {
  name: string;
  collection: string;
  currentPrice: number;
  image: string;
  predictions: Array<{
    date: string;
    price: number;
    confidence: number;
  }>;
}

export const useNFTAnalysis = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<NFTAnalysisResult | null>(null);

  const openSeaAPI = new OpenSeaAPI(API_CONFIG.openSea.apiKey);
  const geminiAPI = new GeminiAPI(API_CONFIG.gemini.apiKey);

  const analyzeNFT = useCallback(async (searchQuery: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Search for NFT on OpenSea
      const searchResults = await openSeaAPI.searchAssets(searchQuery);
      
      if (searchResults.length === 0) {
        throw new Error('NFT not found. Please check the name and try again.');
      }

      const nft = searchResults[0];
      
      // Get current price
      const currentPrice = await openSeaAPI.getCurrentPrice(
        nft.collection.slug,
        nft.id
      );

      // Get historical prices
      const historicalPrices = await openSeaAPI.getHistoricalPrices(
        nft.collection.slug,
        nft.id
      );

      // Get collection stats
      const collectionStats = await openSeaAPI.getCollectionStats(nft.collection.slug);

      // Generate predictions using Gemini AI
      const predictions = await geminiAPI.generatePricePredictions({
        nftName: nft.name,
        currentPrice,
        historicalPrices,
        collectionStats,
        traits: nft.traits,
      });

      const analysisResult: NFTAnalysisResult = {
        name: nft.name,
        collection: nft.collection.name,
        currentPrice,
        image: nft.image_url,
        predictions: predictions.map(p => ({
          date: p.date,
          price: p.price,
          confidence: p.confidence,
        })),
      };

      setResult(analysisResult);
      return analysisResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during analysis';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const analyzeNFTImage = useCallback(async (imageFile: File) => {
    setIsLoading(true);
    setError(null);

    try {
      // Convert image to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // Remove data URL prefix
        };
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });

      // Analyze image with Gemini AI
      const imageAnalysis = await geminiAPI.analyzeNFTImage(base64);
      
      // Search for similar NFTs based on analysis
      const searchResults = await openSeaAPI.searchAssets(imageAnalysis.name);
      
      if (searchResults.length === 0) {
        throw new Error('Could not identify the NFT from the image. Please try searching by name.');
      }

      // Continue with regular analysis
      return await analyzeNFT(imageAnalysis.name);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during image analysis';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [analyzeNFT]);

  const clearResults = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    result,
    analyzeNFT,
    analyzeNFTImage,
    clearResults,
  };
};