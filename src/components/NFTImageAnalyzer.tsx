import React, { useState } from 'react';
import { Upload, Link, Search, Image, Loader2, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import OpenSeaAPI from '../services/openSeaAPI';
import { API_CONFIG } from '../config/api';

interface NFTImageAnalyzerProps {
  onNFTDetected: (nftInfo: {
    name: string;
    collection: string;
    contractAddress: string;
    tokenId: string;
    image: string;
    traits: Array<{ trait_type: string; value: string }>;
    opensea_url?: string;
    floor_price?: number;
  }) => void;
}

const NFTImageAnalyzer: React.FC<NFTImageAnalyzerProps> = ({ onNFTDetected }) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [nftUrl, setNftUrl] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'address'>('upload');

  const openSeaAPI = new OpenSeaAPI(API_CONFIG.openSea.apiKey);

  const handleImageUpload = (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setError(null);
        // Simulate image analysis by showing a demo NFT
        setTimeout(() => {
          const demoNFT = {
            name: "Bored Ape Yacht Club #1234",
            collection: "Bored Ape Yacht Club",
            contractAddress: "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
            tokenId: "1234",
            image: "https://images.pexels.com/photos/8566473/pexels-photo-8566473.jpeg?auto=compress&cs=tinysrgb&w=400",
            opensea_url: "https://opensea.io/assets/ethereum/0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d/1234",
            description: "Demo NFT for image analysis",
            traits: [
              { trait_type: "Background", value: "Blue" },
              { trait_type: "Fur", value: "Brown" },
              { trait_type: "Eyes", value: "Bored" },
              { trait_type: "Mouth", value: "Grin" }
            ],
            collection_slug: "boredapeyachtclub",
            floor_price: 45.2
          };
          setAnalysisResult(demoNFT);
          onNFTDetected(demoNFT);
        }, 2000);
      };
      reader.readAsDataURL(file);
    } else {
      setError('Please upload a valid image file.');
    }
  };

  const analyzeFromUrl = async () => {
    if (!nftUrl.trim()) {
      setError('Please enter a valid OpenSea URL.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      // Parse OpenSea URL to extract contract and token ID
      const { contractAddress, tokenId } = await openSeaAPI.parseOpenSeaURL(nftUrl);
      
      // Fetch NFT data from OpenSea
      const nftData = await openSeaAPI.getNFTByContractAndToken(contractAddress, tokenId);
      const formattedData = openSeaAPI.formatNFTData(nftData);
      

      const result = {
        ...formattedData,
        traits: formattedData.traits || []
      };

      setAnalysisResult(result);
      onNFTDetected(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze NFT from URL';
      setError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeFromAddress = async () => {
    if (!contractAddress.trim() || !tokenId.trim()) {
      setError('Please enter both contract address and token ID.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      // Fetch NFT data from OpenSea
      const nftData = await openSeaAPI.getNFTByContractAndToken(contractAddress, tokenId);
      const formattedData = openSeaAPI.formatNFTData(nftData);
      

      const result = {
        ...formattedData,
        traits: formattedData.traits || []
      };

      setAnalysisResult(result);
      onNFTDetected(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch NFT data';
      setError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const tabs = [
    { id: 'upload', label: 'Upload Image', icon: Upload },
    { id: 'url', label: 'NFT URL', icon: Link },
    { id: 'address', label: 'Contract Address', icon: Search }
  ];

  return (
    <div className="bg-white rounded-3xl neu-shadow overflow-hidden">
      {/* Tab Navigation */}
      <div className="border-b border-opensea-200">
        <div className="flex">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setActiveTab(id as any);
                setError(null);
                setAnalysisResult(null);
              }}
              className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 transition-all duration-200 ${
                activeTab === id
                  ? 'bg-nft-primary text-white border-b-2 border-nft-primary'
                  : 'text-opensea-600 hover:text-opensea-800 hover:bg-opensea-50'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-semibold">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-800 font-medium">{error}</p>
              </div>
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Upload Image Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            <div
              className="border-2 border-dashed border-opensea-300 rounded-2xl p-12 text-center hover:border-nft-primary transition-colors cursor-pointer"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                className="hidden"
              />
              
              {uploadedImage ? (
                <div className="space-y-4">
                  <img 
                    src={uploadedImage} 
                    alt="Uploaded NFT"
                    className="mx-auto h-40 w-40 object-cover rounded-2xl neu-shadow"
                  />
                  <p className="text-lg font-semibold text-opensea-800">NFT Image Uploaded</p>
                  <p className="text-sm text-opensea-600">Image analysis feature coming soon!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mx-auto h-16 w-16 bg-gradient-to-br from-nft-primary to-nft-accent rounded-2xl flex items-center justify-center">
                    <Image className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-opensea-800 mb-2">Upload NFT Image</h3>
                    <p className="text-opensea-600">Click to browse or drag and drop your NFT image</p>
                    <p className="text-sm text-opensea-500 mt-2">AI will analyze your NFT image and provide predictions</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* NFT URL Tab */}
        {activeTab === 'url' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-opensea-800 mb-2">
                OpenSea NFT URL
              </label>
              <input
                type="url"
                value={nftUrl}
                onChange={(e) => setNftUrl(e.target.value)}
                placeholder="https://opensea.io/assets/ethereum/0x.../1234"
                className="w-full px-4 py-3 border-2 border-opensea-200 rounded-xl focus:ring-2 focus:ring-nft-primary focus:border-nft-primary transition-all"
              />
              <p className="text-xs text-opensea-500 mt-2">
                Example: https://opensea.io/assets/ethereum/0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d/1234
              </p>
            </div>
            <button
              onClick={analyzeFromUrl}
              disabled={isAnalyzing || !nftUrl.trim()}
              className="w-full bg-gradient-to-r from-nft-primary to-nft-secondary text-white py-3 px-6 rounded-xl font-semibold hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Fetching NFT Data...</span>
                </div>
              ) : (
                'Analyze from URL'
              )}
            </button>
          </div>
        )}

        {/* Contract Address Tab */}
        {activeTab === 'address' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-opensea-800 mb-2">
                  Contract Address
                </label>
                <input
                  type="text"
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                  placeholder="0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d"
                  className="w-full px-4 py-3 border-2 border-opensea-200 rounded-xl focus:ring-2 focus:ring-nft-primary focus:border-nft-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-opensea-800 mb-2">
                  Token ID
                </label>
                <input
                  type="text"
                  value={tokenId}
                  onChange={(e) => setTokenId(e.target.value)}
                  placeholder="1234"
                  className="w-full px-4 py-3 border-2 border-opensea-200 rounded-xl focus:ring-2 focus:ring-nft-primary focus:border-nft-primary transition-all"
                />
              </div>
            </div>
            <button
              onClick={analyzeFromAddress}
              disabled={isAnalyzing || !contractAddress.trim() || !tokenId.trim()}
              className="w-full bg-gradient-to-r from-nft-primary to-nft-secondary text-white py-3 px-6 rounded-xl font-semibold hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Fetching NFT Data...</span>
                </div>
              ) : (
                'Fetch NFT Data'
              )}
            </button>
          </div>
        )}

        {/* Analysis Result */}
        {analysisResult && (
          <div className="mt-8 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <h4 className="text-lg font-bold text-green-800">NFT Found Successfully!</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                {analysisResult.image ? (
                  <img 
                    src={analysisResult.image} 
                    alt={analysisResult.name}
                    className="w-full h-48 object-cover rounded-xl"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/400x400?text=NFT+Image+Not+Available';
                    }}
                  />
                ) : (
                  <div className="w-full h-48 bg-opensea-200 rounded-xl flex items-center justify-center">
                    <Image className="h-12 w-12 text-opensea-400" />
                  </div>
                )}
              </div>
              
              {analysisResult.traits && analysisResult.traits.length > 0 && (
                <div>
                  <p className="font-semibold text-opensea-700 mb-2">Traits</p>
                  <div className="grid grid-cols-2 gap-2">
                    {analysisResult.traits.slice(0, 4).map((trait: any, index: number) => (
                      <div key={index} className="bg-opensea-100 rounded-lg p-2">
                        <p className="text-xs font-semibold text-opensea-600">{trait.trait_type}</p>
                        <p className="text-sm font-bold text-opensea-800">{trait.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <h5 className="font-bold text-opensea-800 text-lg">{analysisResult.name}</h5>
                  <p className="text-opensea-600">{analysisResult.collection}</p>
                  {analysisResult.opensea_url && (
                    <a 
                      href={analysisResult.opensea_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-nft-primary hover:text-nft-secondary transition-colors text-sm mt-1"
                    >
                      <span>View on OpenSea</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold text-opensea-700">Token ID</p>
                    <p className="text-opensea-800 font-bold">#{analysisResult.tokenId}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-opensea-700">Floor Price</p>
                    <p className="text-nft-primary font-bold">
                      {analysisResult.floor_price ? `${analysisResult.floor_price.toFixed(3)} ETH` : 'N/A'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="font-semibold text-opensea-700">Contract</p>
                    <p className="text-opensea-600 text-xs font-mono break-all">{analysisResult.contractAddress}</p>
                  </div>
                </div>
                
                {analysisResult.description && (
                  <div>
                    <p className="font-semibold text-opensea-700 mb-2">Description</p>
                    <p className="text-opensea-600 text-sm line-clamp-3">{analysisResult.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isAnalyzing && (
          <div className="mt-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border border-blue-200 text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              <h4 className="text-lg font-bold text-blue-800">
                {activeTab === 'upload' ? 'Analyzing NFT Image...' : 'Fetching NFT Data...'}
              </h4>
            </div>
            <p className="text-blue-600">
              {activeTab === 'upload' 
                ? 'Using AI to identify and analyze your NFT' 
                : 'Connecting to OpenSea API to get the latest information'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NFTImageAnalyzer;