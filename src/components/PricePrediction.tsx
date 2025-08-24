import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Calendar, Target, DollarSign, Activity, Zap, Shield, BarChart3 } from 'lucide-react';

interface PredictionData {
  date: string;
  price: number;
  confidence: number;
}

interface NFTData {
  name: string;
  collection: string;
  currentPrice: number;
  image: string;
  predictions: PredictionData[];
}

interface PricePredictionProps {
  nftData: NFTData;
}

const PricePrediction: React.FC<PricePredictionProps> = ({ nftData }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('3m');
  
  const timeframes = [
    { value: '1m', label: '1M' },
    { value: '3m', label: '3M' },
    { value: '6m', label: '6M' },
    { value: '1y', label: '1Y' }
  ];

  const getFilteredPredictions = () => {
    const months = selectedTimeframe === '1m' ? 1 : selectedTimeframe === '3m' ? 3 : selectedTimeframe === '6m' ? 6 : 12;
    return nftData.predictions.slice(0, months);
  };

  const predictions = getFilteredPredictions();
  const latestPrediction = predictions[predictions.length - 1];
  const priceChange = latestPrediction.price - nftData.currentPrice;
  const percentageChange = (priceChange / nftData.currentPrice) * 100;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* NFT Info Card */}
      <div className="bg-white rounded-3xl neu-shadow overflow-hidden">
        <div className="bg-gradient-to-r from-nft-primary via-nft-secondary to-nft-accent p-8 text-white">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            <img 
              src={nftData.image} 
              alt={nftData.name}
              className="h-32 w-32 object-cover rounded-2xl shadow-2xl border-4 border-white/20"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-3xl font-bold">{nftData.name}</h3>
                <div className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">
                  Verified
                </div>
              </div>
              <p className="text-white/80 mb-4 text-lg">{nftData.collection}</p>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-6 w-6" />
                  <span className="text-2xl font-bold">{nftData.currentPrice.toFixed(2)} ETH</span>
                </div>
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-bold ${
                  priceChange >= 0 ? 'bg-nft-success/20 text-green-100' : 'bg-nft-error/20 text-red-100'
                }`}>
                  {priceChange >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                  <span>{priceChange >= 0 ? '+' : ''}{percentageChange.toFixed(1)}%</span>
                </div>
                <div className="flex items-center space-x-2 px-4 py-2 bg-white/20 rounded-full text-sm font-bold">
                  <Zap className="h-4 w-4" />
                  <span>AI Analyzed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeframe Selection */}
        <div className="p-6 border-b border-opensea-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <Calendar className="h-6 w-6 text-opensea-500" />
              <span className="font-bold text-opensea-800 text-lg">Prediction Timeframe</span>
            </div>
            <div className="flex space-x-2">
              {timeframes.map((timeframe) => (
                <button
                  key={timeframe.value}
                  onClick={() => setSelectedTimeframe(timeframe.value)}
                  className={`px-6 py-3 rounded-xl transition-all duration-200 font-bold ${
                    selectedTimeframe === timeframe.value
                      ? 'bg-gradient-to-r from-nft-primary to-nft-secondary text-white shadow-glow'
                      : 'bg-opensea-100 text-opensea-600 hover:bg-opensea-200'
                  }`}
                >
                  {timeframe.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Predictions Grid */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {predictions.map((prediction, index) => (
              <div key={index} className="bg-gradient-to-br from-opensea-50 to-opensea-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 border border-opensea-200 hover:border-nft-primary group">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-nft-primary rounded-xl group-hover:bg-nft-secondary transition-colors">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold text-opensea-800">
                      {new Date(prediction.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    prediction.confidence >= 0.8 ? 'bg-nft-success text-white' :
                    prediction.confidence >= 0.7 ? 'bg-nft-warning text-white' :
                    'bg-nft-error text-white'
                  }`}>
                    {(prediction.confidence * 100).toFixed(0)}%
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-5 w-5 text-opensea-500" />
                    <span className="text-3xl font-bold text-opensea-900">{prediction.price.toFixed(2)} ETH</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Activity className="h-5 w-5 text-opensea-500" />
                    <span className={`text-lg font-bold ${
                      prediction.price > nftData.currentPrice ? 'text-nft-success' : 'text-nft-error'
                    }`}>
                      {prediction.price > nftData.currentPrice ? '+' : ''}
                      {((prediction.price - nftData.currentPrice) / nftData.currentPrice * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Market Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl neu-shadow p-8">
          <div className="flex items-center space-x-4 mb-8">
            <div className="p-3 bg-gradient-to-br from-nft-accent to-purple-600 rounded-2xl">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-opensea-900">AI Market Insights</h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-opensea-800 mb-4 text-lg">Price Influencing Factors</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-xl border border-green-200">
                  <div className="w-3 h-3 bg-nft-success rounded-full"></div>
                  <span className="text-opensea-700 font-medium">Collection floor price trending upward</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                  <div className="w-3 h-3 bg-nft-warning rounded-full"></div>
                  <span className="text-opensea-700 font-medium">Moderate trading volume in past 30 days</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="w-3 h-3 bg-nft-primary rounded-full"></div>
                  <span className="text-opensea-700 font-medium">Similar traits showing price appreciation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-3xl neu-shadow p-8">
          <div className="flex items-center space-x-4 mb-8">
            <div className="p-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-opensea-900">Risk Assessment</h3>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-opensea-700 font-semibold">Market Volatility</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 h-3 bg-opensea-200 rounded-full overflow-hidden">
                    <div className="w-3/5 h-full bg-gradient-to-r from-nft-warning to-orange-500 rounded-full"></div>
                  </div>
                  <span className="text-sm font-bold text-opensea-800">Medium</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-opensea-700 font-semibold">Liquidity Risk</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 h-3 bg-opensea-200 rounded-full overflow-hidden">
                    <div className="w-2/5 h-full bg-gradient-to-r from-nft-success to-green-500 rounded-full"></div>
                  </div>
                  <span className="text-sm font-bold text-opensea-800">Low</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-opensea-700 font-semibold">Collection Stability</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 h-3 bg-opensea-200 rounded-full overflow-hidden">
                    <div className="w-4/5 h-full bg-gradient-to-r from-nft-success to-green-600 rounded-full"></div>
                  </div>
                  <span className="text-sm font-bold text-opensea-800">High</span>
                </div>
              </div>
            </div>
            
            <div className="bg-opensea-50 rounded-2xl p-4 border border-opensea-200">
              <p className="text-sm text-opensea-600 leading-relaxed">
                <strong className="text-opensea-800">Disclaimer:</strong> These predictions are generated by AI and should not be considered as financial advice. NFT markets are highly volatile and unpredictable.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricePrediction;