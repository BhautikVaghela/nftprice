import React from 'react';
import { TrendingUp } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-opensea-200 sticky top-0 z-50 backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-nft-primary to-nft-accent rounded-2xl neu-shadow">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-opensea-900 font-inter bg-gradient-to-r from-nft-primary to-nft-accent bg-clip-text text-transparent">
                NFTickr
              </h1>
              <p className="text-opensea-500 text-sm font-medium">AI-Powered Price Predictions</p>
            </div>
          </div>
          

        </div>
      </div>
    </header>
  );
};

export default Header;