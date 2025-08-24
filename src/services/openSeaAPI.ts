interface OpenSeaAsset {
  identifier: string;
  collection: string;
  contract: string;
  token_standard: string;
  name: string;
  description: string;
  image_url: string;
  display_image_url: string;
  display_animation_url: string;
  metadata_url: string;
  opensea_url: string;
  updated_at: string;
  is_disabled: boolean;
  is_nsfw: boolean;
}

interface OpenSeaCollection {
  collection: string;
  name: string;
  description: string;
  image_url: string;
  banner_image_url: string;
  owner: string;
  safelist_status: string;
  category: string;
  is_disabled: boolean;
  is_nsfw: boolean;
  trait_offers_enabled: boolean;
  collection_offers_enabled: boolean;
  opensea_url: string;
  project_url: string;
  wiki_url: string;
  discord_url: string;
  telegram_url: string;
  twitter_username: string;
  instagram_username: string;
}

interface OpenSeaNFT {
  nft: OpenSeaAsset;
  collection: OpenSeaCollection;
}

interface OpenSeaV1Asset {
  id: number;
  token_id: string;
  name: string;
  description: string;
  image_url: string;
  image_preview_url: string;
  image_thumbnail_url: string;
  image_original_url: string;
  animation_url: string;
  animation_original_url: string;
  external_link: string;
  asset_contract: {
    address: string;
    name: string;
    symbol: string;
    schema_name: string;
  };
  collection: {
    name: string;
    slug: string;
    description: string;
    image_url: string;
    banner_image_url: string;
    featured_image_url: string;
    large_image_url: string;
    stats: {
      floor_price: number;
      market_cap: number;
      num_owners: number;
      total_supply: number;
      total_sales: number;
      total_volume: number;
    };
  };
  traits: Array<{
    trait_type: string;
    value: string;
    display_type?: string;
    max_value?: number;
    trait_count: number;
    order?: number;
  }>;
  permalink: string;
}

class OpenSeaAPI {
  private apiKey: string;
  private baseURL: string = 'https://api.opensea.io/api/v1';
  private v2BaseURL: string = 'https://api.opensea.io/api/v2';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async makeRequest(endpoint: string, useV2: boolean = false): Promise<any> {
    const baseURL = useV2 ? this.v2BaseURL : this.baseURL;
    
    try {
      const response = await fetch(`${baseURL}${endpoint}`, {
        headers: {
          'X-API-KEY': this.apiKey,
          'Accept': 'application/json',
          'User-Agent': 'NFTickr/1.0',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('NFT not found. Please check the contract address and token ID.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again in a moment.');
        } else if (response.status === 401) {
          throw new Error('Invalid API key. Please check your OpenSea API configuration.');
        } else {
          const errorText = await response.text();
          throw new Error(`OpenSea API error: ${response.status} - ${errorText}`);
        }
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your internet connection.');
    }
  }

  async getNFTByContractAndToken(contractAddress: string, tokenId: string): Promise<OpenSeaV1Asset> {
    // Validate contract address format
    if (!contractAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      throw new Error('Invalid contract address format. Please provide a valid Ethereum contract address.');
    }

    // Validate token ID
    if (!tokenId || tokenId.trim() === '') {
      throw new Error('Token ID is required.');
    }

    // Use V1 API for asset details as it provides more comprehensive data
    const endpoint = `/asset/${contractAddress.toLowerCase()}/${tokenId}/`;
    
    try {
      const response = await this.makeRequest(endpoint, false);
      
      if (!response) {
        throw new Error('NFT data not found in response.');
      }

      return response;
    } catch (error) {
      console.error('Error fetching NFT:', error);
      throw error;
    }
  }

  async parseOpenSeaURL(url: string): Promise<{ contractAddress: string; tokenId: string }> {
    try {
      // Clean the URL
      const cleanUrl = url.trim();
      
      // OpenSea URL patterns:
      // https://opensea.io/assets/ethereum/0x{contract}/{tokenId}
      // https://opensea.io/assets/0x{contract}/{tokenId}
      const patterns = [
        /opensea\.io\/assets\/ethereum\/0x([a-fA-F0-9]{40})\/(\d+)/,
        /opensea\.io\/assets\/0x([a-fA-F0-9]{40})\/(\d+)/,
        /opensea\.io\/assets\/([^\/]+)\/0x([a-fA-F0-9]{40})\/(\d+)/
      ];

      for (const pattern of patterns) {
        const match = cleanUrl.match(pattern);
        if (match) {
          if (match.length === 3) {
            // Pattern 1 & 2: [full_match, contract, tokenId]
            return {
              contractAddress: `0x${match[1]}`,
              tokenId: match[2]
            };
          } else if (match.length === 4) {
            // Pattern 3: [full_match, chain, contract, tokenId]
            return {
              contractAddress: `0x${match[2]}`,
              tokenId: match[3]
            };
          }
        }
      }

      throw new Error('Invalid OpenSea URL format. Please provide a valid OpenSea NFT URL.');
    } catch (error) {
      throw new Error('Unable to parse OpenSea URL. Please check the URL format.');
    }
  }

  async searchCollections(query: string): Promise<any[]> {
    try {
      const endpoint = `/collections?q=${encodeURIComponent(query)}&limit=10`;
      const response = await this.makeRequest(endpoint, false);
      return response.collections || [];
    } catch (error) {
      console.error('Error searching collections:', error);
      return [];
    }
  }

  async getCollectionNFTs(collectionSlug: string, limit: number = 10): Promise<any[]> {
    try {
      const endpoint = `/assets?collection=${collectionSlug}&limit=${limit}`;
      const response = await this.makeRequest(endpoint, false);
      return response.assets || [];
    } catch (error) {
      console.error('Error fetching collection NFTs:', error);
      return [];
    }
  }

  async getCollectionStats(collectionSlug: string): Promise<any> {
    try {
      const endpoint = `/collection/${collectionSlug}/stats`;
      const response = await this.makeRequest(endpoint, false);
      return response.stats || {};
    } catch (error) {
      console.error('Error fetching collection stats:', error);
      return {};
    }
  }

  // Helper method to get floor price from collection stats
  async getFloorPrice(collectionSlug: string): Promise<number> {
    try {
      const stats = await this.getCollectionStats(collectionSlug);
      return stats.floor_price || 0;
    } catch (error) {
      console.error('Error getting floor price:', error);
      return 0;
    }
  }

  // Format NFT data for the application
  formatNFTData(nftResponse: OpenSeaV1Asset): any {
    return {
      name: nftResponse.name || `${nftResponse.collection.name} #${nftResponse.token_id}`,
      collection: nftResponse.collection.name,
      contractAddress: nftResponse.asset_contract.address,
      tokenId: nftResponse.token_id,
      image: nftResponse.image_url || nftResponse.image_original_url || nftResponse.image_preview_url,
      opensea_url: nftResponse.permalink,
      description: nftResponse.description,
      traits: nftResponse.traits || [],
      collection_slug: nftResponse.collection.slug,
      floor_price: nftResponse.collection.stats?.floor_price || 0,
      total_supply: nftResponse.collection.stats?.total_supply || 0,
      num_owners: nftResponse.collection.stats?.num_owners || 0,
      total_volume: nftResponse.collection.stats?.total_volume || 0
    };
  }

  // Search for NFTs by name or collection
  async searchAssets(query: string, limit: number = 20): Promise<OpenSeaV1Asset[]> {
    try {
      const endpoint = `/assets?search=${encodeURIComponent(query)}&limit=${limit}`;
      const response = await this.makeRequest(endpoint, false);
      return response.assets || [];
    } catch (error) {
      console.error('Error searching assets:', error);
      return [];
    }
  }

  // Get asset by collection and token ID
  async getAssetByCollectionAndToken(collectionSlug: string, tokenId: string): Promise<OpenSeaV1Asset | null> {
    try {
      const endpoint = `/assets?collection=${collectionSlug}&token_ids=${tokenId}&limit=1`;
      const response = await this.makeRequest(endpoint, false);
      return response.assets?.[0] || null;
    } catch (error) {
      console.error('Error fetching asset by collection and token:', error);
      return null;
    }
  }
}

export default OpenSeaAPI;