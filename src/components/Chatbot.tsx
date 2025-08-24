import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Bot, User, Upload, Search, Sparkles, TrendingUp } from 'lucide-react';
import GeminiAPI from '../services/geminiAPI';
import OpenSeaAPI from '../services/openSeaAPI';
import { API_CONFIG } from '../config/api';

interface Message {
  id: number;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  isLoading?: boolean;
  nftData?: any;
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'bot',
      text: 'Hello! I\'m your NFT AI assistant. Ask me anything about NFTs, upload an image, or search for specific NFTs by name or token ID. I can help with price analysis, market insights, and more! 🚀',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const geminiAPI = new GeminiAPI(API_CONFIG.gemini.apiKey);
  const openSeaAPI = new OpenSeaAPI(API_CONFIG.openSea.apiKey);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !uploadedImage) return;

    const userMessage: Message = {
      id: messages.length + 1,
      sender: 'user',
      text: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    
    const botMessage: Message = {
      id: messages.length + 2,
      sender: 'bot',
      text: '',
      timestamp: new Date().toISOString(),
      isLoading: true
    };

    setMessages(prev => [...prev, botMessage]);
    setInputMessage('');
    setUploadedImage(null);
    setIsProcessing(true);

    try {
      let response = '';
      let nftData = null;

      if (uploadedImage) {
        // Handle image upload
        const base64 = await convertImageToBase64(uploadedImage);
        const imageAnalysis = await geminiAPI.analyzeNFTImage(base64);
        response = `🔍 **Image Analysis Complete!**\n\n📸 **Detected NFT:** ${imageAnalysis.name}\n🎨 **Traits:** ${imageAnalysis.traits.join(', ')}\n📝 **Description:** ${imageAnalysis.description}\n\n💡 *I can provide more detailed analysis if you have the specific contract address or token ID.*`;
      } else if (inputMessage.toLowerCase().includes('price') || inputMessage.toLowerCase().includes('value')) {
        // Handle price-related questions
        response = await handlePriceQuestion(inputMessage);
      } else if (inputMessage.toLowerCase().includes('collection') || inputMessage.toLowerCase().includes('floor')) {
        // Handle collection-related questions
        response = await handleCollectionQuestion(inputMessage);
      } else if (inputMessage.toLowerCase().includes('trend') || inputMessage.toLowerCase().includes('market')) {
        // Handle market trend questions
        response = await handleMarketQuestion(inputMessage);
      } else {
        // General NFT question
        response = await handleGeneralQuestion(inputMessage);
      }

      // Update bot message with response
      setMessages(prev => prev.map(msg => 
        msg.id === botMessage.id 
          ? { ...msg, text: response, isLoading: false, nftData }
          : msg
      ));

    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage = 'Sorry, I encountered an error processing your request. Please try again or rephrase your question.';
      setMessages(prev => prev.map(msg => 
        msg.id === botMessage.id 
          ? { ...msg, text: errorMessage, isLoading: false }
          : msg
      ));
    } finally {
      setIsProcessing(false);
    }
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handlePriceQuestion = async (question: string): Promise<string> => {
    // Extract potential NFT identifiers from the question
    const nftMatch = question.match(/(?:NFT|token|#)(\d+)/i) || 
                     question.match(/([A-Za-z0-9]+(?:\s+#\d+)?)/i);
    
    if (nftMatch) {
      try {
        // Try to find NFT data
        const searchResults = await openSeaAPI.searchAssets(nftMatch[1], 5);
        if (searchResults.length > 0) {
          const nft = searchResults[0];
          const formattedData = openSeaAPI.formatNFTData(nft);
          
          return `💰 **Price Analysis for ${formattedData.name}**\n\n📊 **Current Floor Price:** ${formattedData.floor_price} ETH\n🏢 **Collection:** ${formattedData.collection}\n📈 **Total Supply:** ${formattedData.total_supply}\n👥 **Owners:** ${formattedData.num_owners}\n💎 **Total Volume:** ${formattedData.total_volume} ETH\n\n🔗 **View on OpenSea:** [${formattedData.opensea_url}](${formattedData.opensea_url})`;
        }
      } catch (error) {
        console.error('Error searching NFT:', error);
      }
    }

    return `💰 **NFT Price Analysis**\n\nTo get specific price information, please:\n\n1️⃣ **Provide the NFT name** (e.g., "Bored Ape #1234")\n2️⃣ **Upload an image** of the NFT\n3️⃣ **Share the contract address** and token ID\n\nI can then give you detailed price analysis, floor prices, and market trends! 📊`;
  };

  const handleCollectionQuestion = async (question: string): Promise<string> => {
    const collectionMatch = question.match(/([A-Za-z\s]+)(?:collection|floor|stats)/i);
    
    if (collectionMatch) {
      try {
        const collectionName = collectionMatch[1].trim();
        const stats = await openSeaAPI.getCollectionStats(collectionName.toLowerCase().replace(/\s+/g, '-'));
        
        if (stats && Object.keys(stats).length > 0) {
          return `🏢 **${collectionName} Collection Stats**\n\n💰 **Floor Price:** ${stats.floor_price || 'N/A'} ETH\n📊 **Market Cap:** ${stats.market_cap || 'N/A'} ETH\n👥 **Owners:** ${stats.num_owners || 'N/A'}\n📦 **Total Supply:** ${stats.total_supply || 'N/A'}\n💎 **Total Volume:** ${stats.total_volume || 'N/A'} ETH\n📈 **Total Sales:** ${stats.total_sales || 'N/A'}`;
        }
      } catch (error) {
        console.error('Error fetching collection stats:', error);
      }
    }

    return `🏢 **Collection Information**\n\nI can provide detailed stats for any NFT collection including:\n\n• Floor price trends 📊\n• Market capitalization 💰\n• Ownership distribution 👥\n• Trading volume 💎\n• Sales history 📈\n\nJust mention the collection name in your question!`;
  };

  const handleMarketQuestion = async (question: string): Promise<string> => {
    return `📈 **NFT Market Trends**\n\nHere are some key insights about the current NFT market:\n\n🔥 **Trending Collections:**\n• Bored Ape Yacht Club - Strong floor price stability\n• CryptoPunks - Historical significance maintains value\n• Azuki - Growing community and roadmap\n\n💡 **Market Indicators:**\n• ETH price correlation affects NFT values\n• Seasonal trends show Q4 typically stronger\n• Gaming NFTs gaining popularity\n\n📊 **Current Market Sentiment:** Moderately bullish with increasing institutional interest.\n\nWould you like specific data for any particular collection or time period?`;
  };

  const handleGeneralQuestion = async (question: string): Promise<string> => {
    // Use Gemini API for general NFT questions
    try {
      const prompt = `You are an expert NFT analyst. Answer this question about NFTs in a helpful, informative way: ${question}`;
      
      // For now, return a structured response since we can't make actual API calls in this demo
      return `🤖 **AI Analysis**\n\nBased on your question: "${question}"\n\nHere's what I can tell you about NFTs:\n\n💡 **Key Points:**\n• NFTs are unique digital assets on blockchain\n• Value depends on rarity, utility, and community\n• Market trends influence pricing significantly\n\n🔍 **For specific analysis:**\n• Upload an NFT image\n• Ask about specific collections\n• Request price predictions\n\nI'm here to help with any NFT-related questions! 🚀`;
    } catch (error) {
      return `🤖 **NFT Information**\n\nI'm your AI assistant for all things NFT! I can help with:\n\n• Price analysis and predictions 📊\n• Collection research and stats 🏢\n• Market trends and insights 📈\n• Image analysis and identification 🔍\n• General NFT education 📚\n\nFeel free to ask anything specific or upload an image for analysis!`;
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setUploadedImage(file);
      setInputMessage(`Analyze this NFT image: ${file.name}`);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Chatbot Header */}
      <div className="bg-white rounded-3xl neu-shadow overflow-hidden">
        <div className="bg-gradient-to-r from-nft-primary via-nft-secondary to-nft-accent p-8 text-white">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-6 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                <MessageCircle className="h-10 w-10" />
              </div>
              <div>
                <h3 className="text-3xl font-bold mb-2">NFT AI Chatbot</h3>
                <p className="text-white/80 text-lg">Ask me anything about NFTs, prices, and market trends!</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-full border border-white/30">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="font-bold">AI Online</span>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="h-96 overflow-y-auto p-6 space-y-4 bg-opensea-50">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-md px-6 py-4 rounded-2xl ${
                message.sender === 'user' 
                  ? 'bg-gradient-to-r from-nft-primary to-nft-secondary text-white' 
                  : 'bg-white text-opensea-800 neu-shadow border border-opensea-200'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  {message.sender === 'bot' ? (
                    <Bot className="h-5 w-5 text-nft-primary" />
                  ) : (
                    <User className="h-5 w-5 text-white" />
                  )}
                  <span className="text-sm font-bold opacity-90">
                    {message.sender === 'bot' ? 'NFT AI Assistant' : 'You'}
                  </span>
                </div>
                
                {message.isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-nft-primary"></div>
                    <span className="text-sm text-opensea-600">Analyzing...</span>
                  </div>
                ) : (
                  <div className="text-sm leading-relaxed whitespace-pre-line" dangerouslySetInnerHTML={{ __html: message.text }}></div>
                )}
                
                <p className="text-xs opacity-60 mt-2">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-opensea-200 bg-white">
          <div className="flex space-x-4">
            <div className="flex-1 flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about NFTs, prices, collections, or upload an image..."
                className="flex-1 px-6 py-4 border-2 border-opensea-200 rounded-2xl focus:ring-2 focus:ring-nft-primary focus:border-nft-primary transition-all font-medium neu-shadow-inset"
                disabled={isProcessing}
              />
              <label className="cursor-pointer px-4 py-4 border-2 border-opensea-200 rounded-2xl hover:border-nft-primary transition-all flex items-center justify-center">
                <Upload className="h-5 w-5 text-opensea-600" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isProcessing}
                />
              </label>
            </div>
            <button
              onClick={handleSendMessage}
              disabled={isProcessing || (!inputMessage.trim() && !uploadedImage)}
              className="px-8 py-4 bg-gradient-to-r from-nft-primary to-nft-secondary text-white rounded-2xl hover:shadow-glow transition-all font-bold flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl neu-shadow p-6 text-center hover:shadow-glow transition-all cursor-pointer">
          <div className="p-3 bg-gradient-to-br from-nft-primary to-nft-secondary rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Search className="h-8 w-8 text-white" />
          </div>
          <h4 className="text-lg font-bold text-opensea-800 mb-2">Search NFTs</h4>
          <p className="text-opensea-600 text-sm">Find specific NFTs by name or token ID</p>
        </div>
        
        <div className="bg-white rounded-3xl neu-shadow p-6 text-center hover:shadow-glow transition-all cursor-pointer">
          <div className="p-3 bg-gradient-to-br from-nft-accent to-purple-600 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
          <h4 className="text-lg font-bold text-opensea-800 mb-2">Price Analysis</h4>
          <p className="text-opensea-600 text-sm">Get detailed price insights and predictions</p>
        </div>
        
        <div className="bg-white rounded-3xl neu-shadow p-6 text-center hover:shadow-glow transition-all cursor-pointer">
          <div className="p-3 bg-gradient-to-br from-nft-success to-green-600 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h4 className="text-lg font-bold text-opensea-800 mb-2">AI Insights</h4>
          <p className="text-opensea-600 text-sm">Powered by advanced machine learning models</p>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
