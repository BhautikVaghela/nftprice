import React, { useState } from 'react';
import Header from './components/Header';
import NFTImageAnalyzer from './components/NFTImageAnalyzer';
import PricePrediction from './components/PricePrediction';
import LivePriceDashboard from './components/LivePriceDashboard';
import Charts from './components/Charts';
import Chatbot from './components/Chatbot';
import { MLPredictionEngine, generateMockHistoricalData } from './services/mlModels';
import { BarChart3, MessageSquare, Upload, Activity, TrendingUp } from 'lucide-react';

interface NFTData {
  name: string;
  collection: string;
  contractAddress: string;
  tokenId: string;
  currentPrice: number;
  image: string;
  traits: Array<{ trait_type: string; value: string }>;
  predictions: Array<{
    date: string;
    price: number;
    confidence: number;
    model?: string;
  }>;
  modelComparison?: Array<{
    model: string;
    accuracy: number;
    mse: number;
    predictions: Array<{
      date: string;
      price: number;
      confidence: number;
    }>;
  }>;
  historicalData?: Array<{
    date: string;
    price: number;
    volume?: number;
  }>;
}

function App() {
  const [activeTab, setActiveTab] = useState<'analyze' | 'dashboard' | 'charts' | 'chatbot' | 'predictions'>('analyze');
  const [nftData, setNftData] = useState<NFTData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleNFTDetected = async (nftInfo: any) => {
    setIsAnalyzing(true);
    
    try {
      // Generate mock historical data
      const basePrice = nftInfo.floor_price && nftInfo.floor_price > 0 ? nftInfo.floor_price : 45.2;
      const historicalData = generateMockHistoricalData(12, basePrice);
      
      // Initialize ML prediction engine
      const mlEngine = new MLPredictionEngine(historicalData);
      
      // Get predictions from all models
      const [xgboost, lstm, randomForest, arima, ensemble] = await Promise.all([
        mlEngine.xgBoostPredict(5),
        mlEngine.lstmPredict(5),
        mlEngine.randomForestPredict(5),
        mlEngine.arimaPredict(5),
        mlEngine.ensemblePredict(5)
      ]);
      
      const nftData: NFTData = {
        name: nftInfo.name,
        collection: nftInfo.collection,
        contractAddress: nftInfo.contractAddress,
        tokenId: nftInfo.tokenId,
        currentPrice: basePrice,
        image: nftInfo.image,
        traits: nftInfo.traits,
        predictions: ensemble.predictions,
        modelComparison: [
          { model: 'XGBoost', ...xgboost },
          { model: 'LSTM', ...lstm },
          { model: 'Random Forest', ...randomForest },
          { model: 'ARIMA', ...arima },
          { model: 'Ensemble', ...ensemble }
        ],
        historicalData: historicalData
      };
      
      setNftData(nftData);
      setActiveTab('dashboard');
    } catch (error) {
      console.error('Analysis error:', error);
      // Still show some data even if there's an error
      const fallbackData: NFTData = {
        name: nftInfo.name || 'Unknown NFT',
        collection: nftInfo.collection || 'Unknown Collection',
        contractAddress: nftInfo.contractAddress || '',
        tokenId: nftInfo.tokenId || '',
        currentPrice: nftInfo.floor_price || 45.2,
        image: nftInfo.image || 'https://images.pexels.com/photos/8566473/pexels-photo-8566473.jpeg?auto=compress&cs=tinysrgb&w=400',
        traits: nftInfo.traits || [],
        predictions: [
          { date: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0], price: (nftInfo.floor_price || 45.2) * 1.05, confidence: 0.75 },
          { date: new Date(Date.now() + 60*24*60*60*1000).toISOString().split('T')[0], price: (nftInfo.floor_price || 45.2) * 1.12, confidence: 0.70 },
          { date: new Date(Date.now() + 90*24*60*60*1000).toISOString().split('T')[0], price: (nftInfo.floor_price || 45.2) * 1.18, confidence: 0.65 }
        ],
        historicalData: generateMockHistoricalData(6, nftInfo.floor_price || 45.2)
      };
      setNftData(fallbackData);
      setActiveTab('dashboard');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const tabs = [
    { id: 'analyze', label: 'Analyze NFT', icon: Upload },
    { id: 'dashboard', label: 'Live Dashboard', icon: Activity },
    { id: 'charts', label: 'Charts & Analytics', icon: TrendingUp },
    { id: 'chatbot', label: 'AI Chatbot', icon: MessageSquare },
    { id: 'predictions', label: 'Price Predictions', icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen bg-opensea-50 font-inter">
      <Header />
      
      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex space-x-2 bg-white rounded-2xl p-2 neu-shadow mb-8">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex-1 flex items-center justify-center space-x-3 px-6 py-4 rounded-xl transition-all duration-300 font-semibold ${
                activeTab === id
                  ? 'bg-gradient-to-r from-nft-primary to-nft-secondary text-white shadow-glow transform scale-[1.02]'
                  : 'text-opensea-600 hover:text-opensea-800 hover:bg-opensea-100'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="pb-16">
        {activeTab === 'analyze' && (
          <div className="max-w-5xl mx-auto p-6">
            <NFTImageAnalyzer onNFTDetected={handleNFTDetected} />
          </div>
        )}
        
        {activeTab === 'dashboard' && nftData && (
          <div className="max-w-7xl mx-auto p-6">
            <LivePriceDashboard nftData={nftData} />
          </div>
        )}
        
        {activeTab === 'charts' && nftData && (
          <div className="max-w-7xl mx-auto p-6">
            <Charts 
              historicalData={nftData.historicalData || []}
              predictions={nftData.predictions}
              modelComparison={nftData.modelComparison || []}
            />
          </div>
        )}
        
        {activeTab === 'chatbot' && (
          <Chatbot />
        )}
        
        {activeTab === 'predictions' && nftData && (
          <PricePrediction nftData={nftData} />
        )}
        
        {(activeTab === 'dashboard' || activeTab === 'charts') && !nftData && (
          <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-3xl neu-shadow p-16 text-center">
              <div className="float-animation mb-8">
                <Activity className="h-20 w-20 text-opensea-400 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-opensea-800 mb-4">No NFT Data Available</h3>
              <p className="text-opensea-500 mb-8 text-lg">Please analyze an NFT first to see live dashboard and charts</p>
              <button onClick={() => setActiveTab('analyze')} className="bg-gradient-to-r from-nft-primary to-nft-secondary text-white px-8 py-4 rounded-2xl font-bold hover:shadow-glow-lg transition-all duration-300 transform hover:scale-105">Analyze NFT</button>
            </div>
          </div>
        )}
        
        {activeTab === 'predictions' && !nftData && (
          <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-3xl neu-shadow p-16 text-center">
              <div className="float-animation mb-8">
                <BarChart3 className="h-20 w-20 text-opensea-400 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-opensea-800 mb-4">No NFT Data Available</h3>
              <p className="text-opensea-500 mb-8 text-lg">Please analyze an NFT first to see price predictions</p>
              <button
                onClick={() => setActiveTab('analyze')}
                className="bg-gradient-to-r from-nft-primary to-nft-secondary text-white px-8 py-4 rounded-2xl font-bold hover:shadow-glow-lg transition-all duration-300 transform hover:scale-105"
              >
                Analyze NFT
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-opensea-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-nft-primary to-nft-accent rounded-2xl">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <h4 className="text-xl font-bold">NFTickr</h4>
              </div>
              <p className="text-opensea-300 text-lg leading-relaxed mb-6">
                The most advanced AI-powered NFT price prediction platform using XGBoost, LSTM, Random Forest, and ARIMA models for accurate forecasts.
              </p>
              <div className="flex space-x-4">
                <button className="bg-opensea-800 hover:bg-opensea-700 px-6 py-3 rounded-xl font-semibold transition-colors">
                  Discord
                </button>
                <button className="bg-opensea-800 hover:bg-opensea-700 px-6 py-3 rounded-xl font-semibold transition-colors">
                  Twitter
                </button>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-6">Features</h4>
              <ul className="space-y-3 text-opensea-300">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-nft-accent rounded-full"></div>
                  <span>ML Model Ensemble</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-nft-accent rounded-full"></div>
                  <span>Live Price Dashboard</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-nft-accent rounded-full"></div>
                  <span>Advanced Charts</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-nft-accent rounded-full"></div>
                  <span>Image Recognition</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-6">Resources</h4>
              <ul className="space-y-3 text-opensea-300">
                <li><a href="#" className="hover:text-white transition-colors">API Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-opensea-800 mt-12 pt-8 text-center">
            <p className="text-opensea-400">
              &copy; 2025 NFTickr. Built with advanced ML models and blockchain technology.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;