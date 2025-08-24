import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, DollarSign, Eye, Clock, Zap } from 'lucide-react';

interface LivePriceData {
  currentPrice: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  marketCap: number;
  lastUpdated: string;
}

interface LivePriceDashboardProps {
  nftData: {
    name: string;
    collection: string;
    image: string;
  };
}

const LivePriceDashboard: React.FC<LivePriceDashboardProps> = ({ nftData }) => {
  const [liveData, setLiveData] = useState<LivePriceData>({
    currentPrice: 45.2,
    change24h: 2.3,
    changePercent24h: 5.4,
    volume24h: 1250,
    marketCap: 2500000,
    lastUpdated: new Date().toISOString()
  });

  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isLive) {
        setLiveData(prev => {
          const volatility = (Math.random() - 0.5) * 0.02; // ±1% volatility
          const newPrice = prev.currentPrice * (1 + volatility);
          const change = newPrice - prev.currentPrice;
          const changePercent = (change / prev.currentPrice) * 100;
          
          return {
            currentPrice: newPrice,
            change24h: change,
            changePercent24h: changePercent,
            volume24h: prev.volume24h + (Math.random() - 0.5) * 100,
            marketCap: newPrice * 55000, // Assuming 55k supply
            lastUpdated: new Date().toISOString()
          };
        });
      }
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [isLive]);

  const formatPrice = (price: number) => price.toFixed(3);
  const formatChange = (change: number) => (change >= 0 ? '+' : '') + change.toFixed(3);
  const formatPercent = (percent: number) => (percent >= 0 ? '+' : '') + percent.toFixed(2) + '%';
  const formatVolume = (volume: number) => {
    if (volume >= 1000000) return (volume / 1000000).toFixed(1) + 'M';
    if (volume >= 1000) return (volume / 1000).toFixed(1) + 'K';
    return volume.toFixed(0);
  };

  const isPositive = liveData.changePercent24h >= 0;

  return (
    <div className="bg-white rounded-3xl neu-shadow overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-opensea-900 to-opensea-800 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src={nftData.image} 
              alt={nftData.name}
              className="h-16 w-16 object-cover rounded-2xl border-2 border-white/20"
            />
            <div>
              <h3 className="text-2xl font-bold">{nftData.name}</h3>
              <p className="text-opensea-300">{nftData.collection}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsLive(!isLive)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                isLive 
                  ? 'bg-green-500/20 text-green-300 border border-green-400/30' 
                  : 'bg-gray-500/20 text-gray-300 border border-gray-400/30'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="font-semibold">{isLive ? 'LIVE' : 'PAUSED'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Price Metrics */}
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Current Price */}
          <div className="bg-gradient-to-br from-opensea-50 to-opensea-100 rounded-2xl p-6 border border-opensea-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-nft-primary rounded-xl">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {formatPercent(liveData.changePercent24h)}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-opensea-600">Current Price</p>
              <p className="text-3xl font-bold text-opensea-900">{formatPrice(liveData.currentPrice)} ETH</p>
              <div className="flex items-center space-x-2">
                {isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span className={`text-sm font-semibold ${
                  isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatChange(liveData.change24h)} ETH
                </span>
              </div>
            </div>
          </div>

          {/* 24h Volume */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-500 rounded-xl">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
                24H
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-blue-600">Volume</p>
              <p className="text-2xl font-bold text-blue-900">{formatVolume(liveData.volume24h)} ETH</p>
              <p className="text-sm text-blue-600">Trading Activity</p>
            </div>
          </div>

          {/* Market Cap */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-500 rounded-xl">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <div className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-bold">
                CAP
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-purple-600">Market Cap</p>
              <p className="text-2xl font-bold text-purple-900">{formatVolume(liveData.marketCap)} ETH</p>
              <p className="text-sm text-purple-600">Total Value</p>
            </div>
          </div>

          {/* Last Updated */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6 border border-yellow-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-yellow-500 rounded-xl">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-bold">
                LIVE
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-yellow-600">Last Updated</p>
              <p className="text-lg font-bold text-yellow-900">
                {new Date(liveData.lastUpdated).toLocaleTimeString()}
              </p>
              <p className="text-sm text-yellow-600">Real-time Data</p>
            </div>
          </div>
        </div>

        {/* Price Movement Indicator */}
        <div className="bg-gradient-to-r from-opensea-50 to-opensea-100 rounded-2xl p-6 border border-opensea-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-opensea-900">Price Movement</h4>
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-nft-primary" />
              <span className="text-sm font-semibold text-opensea-600">Real-time Analysis</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm font-semibold text-opensea-600 mb-2">Trend</p>
              <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl ${
                isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {isPositive ? (
                  <TrendingUp className="h-5 w-5" />
                ) : (
                  <TrendingDown className="h-5 w-5" />
                )}
                <span className="font-bold">{isPositive ? 'Bullish' : 'Bearish'}</span>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-sm font-semibold text-opensea-600 mb-2">Volatility</p>
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-yellow-100 text-yellow-800">
                <Activity className="h-5 w-5" />
                <span className="font-bold">
                  {Math.abs(liveData.changePercent24h) > 5 ? 'High' : 
                   Math.abs(liveData.changePercent24h) > 2 ? 'Medium' : 'Low'}
                </span>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-sm font-semibold text-opensea-600 mb-2">Signal</p>
              <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl ${
                liveData.changePercent24h > 3 ? 'bg-green-100 text-green-800' :
                liveData.changePercent24h < -3 ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                <Zap className="h-5 w-5" />
                <span className="font-bold">
                  {liveData.changePercent24h > 3 ? 'Buy' :
                   liveData.changePercent24h < -3 ? 'Sell' : 'Hold'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivePriceDashboard;