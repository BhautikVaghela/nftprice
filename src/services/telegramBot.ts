interface TelegramMessage {
  message_id: number;
  from: {
    id: number;
    first_name: string;
    username?: string;
  };
  chat: {
    id: number;
    type: string;
  };
  date: number;
  text?: string;
  photo?: Array<{
    file_id: string;
    file_unique_id: string;
    file_size: number;
    width: number;
    height: number;
  }>;
}

interface TelegramUpdate {
  update_id: number;
  message: TelegramMessage;
}

class TelegramBot {
  private botToken: string;
  private baseURL: string;
  private webhookURL: string;

  constructor(botToken: string, webhookURL: string) {
    this.botToken = botToken;
    this.baseURL = `https://api.telegram.org/bot${botToken}`;
    this.webhookURL = webhookURL;
  }

  async setWebhook(): Promise<void> {
    const response = await fetch(`${this.baseURL}/setWebhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: this.webhookURL,
        allowed_updates: ['message'],
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to set webhook: ${response.status}`);
    }
  }

  async sendMessage(chatId: number, text: string, replyToMessageId?: number): Promise<void> {
    const response = await fetch(`${this.baseURL}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        reply_to_message_id: replyToMessageId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.status}`);
    }
  }

  async sendPhoto(chatId: number, photoUrl: string, caption?: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/sendPhoto`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        photo: photoUrl,
        caption,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send photo: ${response.status}`);
    }
  }

  async getFile(fileId: string): Promise<string> {
    const response = await fetch(`${this.baseURL}/getFile?file_id=${fileId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get file: ${response.status}`);
    }

    const data = await response.json();
    return `https://api.telegram.org/file/bot${this.botToken}/${data.result.file_path}`;
  }

  async downloadFile(fileUrl: string): Promise<ArrayBuffer> {
    const response = await fetch(fileUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.status}`);
    }

    return response.arrayBuffer();
  }

  async processUpdate(update: TelegramUpdate): Promise<void> {
    const message = update.message;
    
    if (!message) return;

    try {
      // Handle text messages
      if (message.text) {
        await this.handleTextMessage(message);
      }
      
      // Handle photo messages
      if (message.photo && message.photo.length > 0) {
        await this.handlePhotoMessage(message);
      }
    } catch (error) {
      console.error('Error processing update:', error);
      await this.sendMessage(
        message.chat.id,
        'Sorry, I encountered an error processing your request. Please try again.',
        message.message_id
      );
    }
  }

  private async handleTextMessage(message: TelegramMessage): Promise<void> {
    const text = message.text!.toLowerCase();
    const chatId = message.chat.id;

    if (text.startsWith('/start')) {
      await this.sendMessage(
        chatId,
        `🤖 <b>Welcome to NFT Price Oracle!</b>\n\n` +
        `I can help you analyze NFT prices and predict future values.\n\n` +
        `<b>Commands:</b>\n` +
        `• Send an NFT image for analysis\n` +
        `• Type an NFT name or collection\n` +
        `• /help - Show this help message\n\n` +
        `Try sending me an NFT image or name!`
      );
    } else if (text.startsWith('/help')) {
      await this.sendMessage(
        chatId,
        `<b>NFT Price Oracle Commands:</b>\n\n` +
        `📸 <b>Image Analysis:</b> Send any NFT image\n` +
        `🔍 <b>Name Search:</b> Type "Bored Ape #1234"\n` +
        `📊 <b>Collection Analysis:</b> Type collection name\n` +
        `💰 <b>Price Predictions:</b> Get future price estimates\n\n` +
        `<b>Examples:</b>\n` +
        `• "CryptoPunks #7804"\n` +
        `• "Bored Ape Yacht Club"\n` +
        `• Send an image directly`
      );
    } else {
      // Handle NFT search by name
      await this.handleNFTSearch(chatId, text, message.message_id);
    }
  }

  private async handlePhotoMessage(message: TelegramMessage): Promise<void> {
    const chatId = message.chat.id;
    const photo = message.photo![message.photo!.length - 1]; // Get highest resolution

    await this.sendMessage(
      chatId,
      '🔍 Analyzing your NFT image... This may take a moment.',
      message.message_id
    );

    try {
      // Get file URL and download
      const fileUrl = await this.getFile(photo.file_id);
      const imageBuffer = await this.downloadFile(fileUrl);
      
      // Convert to base64 for Gemini API
      const base64Image = Buffer.from(imageBuffer).toString('base64');
      
      // Here you would integrate with your image analysis service
      // For now, we'll send a mock response
      await this.sendAnalysisResult(chatId, {
        name: 'Detected NFT',
        currentPrice: 45.2,
        predictions: [
          { date: '2024-01-15', price: 48.5, confidence: 0.85 },
          { date: '2024-02-15', price: 52.3, confidence: 0.78 }
        ]
      });
    } catch (error) {
      console.error('Error processing image:', error);
      await this.sendMessage(
        chatId,
        '❌ Sorry, I couldn\'t analyze this image. Please try again with a clear NFT image.',
        message.message_id
      );
    }
  }

  private async handleNFTSearch(chatId: number, query: string, replyToMessageId: number): Promise<void> {
    await this.sendMessage(
      chatId,
      `🔍 Searching for "${query}"... Please wait.`,
      replyToMessageId
    );

    // Mock search result
    setTimeout(async () => {
      await this.sendAnalysisResult(chatId, {
        name: query,
        currentPrice: 45.2,
        predictions: [
          { date: '2024-01-15', price: 48.5, confidence: 0.85 },
          { date: '2024-02-15', price: 52.3, confidence: 0.78 }
        ]
      });
    }, 2000);
  }

  private async sendAnalysisResult(chatId: number, result: any): Promise<void> {
    const prediction = result.predictions[0];
    const change = ((prediction.price - result.currentPrice) / result.currentPrice * 100).toFixed(1);
    
    const message = `
💎 <b>${result.name}</b>

💰 <b>Current Price:</b> ${result.currentPrice} ETH

📈 <b>30-Day Prediction:</b>
• Price: ${prediction.price} ETH
• Change: ${change > 0 ? '+' : ''}${change}%
• Confidence: ${(prediction.confidence * 100).toFixed(0)}%

🎯 <b>Factors:</b>
• Collection trending upward
• High trading volume
• Rare trait combination

📊 Want detailed analysis? Visit our web app for complete insights!
    `;

    await this.sendMessage(chatId, message.trim());
  }
}

export default TelegramBot;