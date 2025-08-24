// API Configuration
export const API_CONFIG = {
  openSea: {
    baseURL: 'https://api.opensea.io/api/v1',
    apiKey: import.meta.env.REACT_APP_OPENSEA_API_KEY || 'af1a4afc14054b69b91987ea7ffa71c4',
  },
  gemini: {
    baseURL: 'https://generativelanguage.googleapis.com/v1beta',
    apiKey: import.meta.env.REACT_APP_GEMINI_API_KEY || 'AIzaSyCmT86_t6I613vW-aY-ws_Y95hnJQIfKik',
  },

};

// Environment variables validation
export const validateAPIKeys = () => {
  const missing = [];
  
  if (!API_CONFIG.openSea.apiKey) {
    missing.push('REACT_APP_OPENSEA_API_KEY');
  }
  
  if (!API_CONFIG.gemini.apiKey) {
    missing.push('REACT_APP_GEMINI_API_KEY');
  }
  
  if (missing.length > 0) {
    console.warn('Missing API keys:', missing.join(', '));
  }
  
  return missing.length === 0;
};

// Popular NFT collections for testing
export const POPULAR_COLLECTIONS = [
  {
    name: 'Bored Ape Yacht Club',
    slug: 'boredapeyachtclub',
    contractAddress: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
  },
  {
    name: 'CryptoPunks',
    slug: 'cryptopunks',
    contractAddress: '0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb',
  },
  {
    name: 'Mutant Ape Yacht Club',
    slug: 'mutant-ape-yacht-club',
    contractAddress: '0x60e4d786628fea6478f785a6d7e704777c86a7c6',
  },
  {
    name: 'Azuki',
    slug: 'azuki',
    contractAddress: '0xed5af388653567af2f388e6224dc7c4b3241c544',
  },
];

// Rate limiting configuration
export const RATE_LIMITS = {
  openSea: {
    requestsPerSecond: 4,
    requestsPerMinute: 240,
  },
  gemini: {
    requestsPerSecond: 2,
    requestsPerMinute: 60,
  },

};