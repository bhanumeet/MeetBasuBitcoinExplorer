import React, { useState, useEffect } from 'react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Info, MessageSquare, X, Loader2 } from 'lucide-react';

const BitcoinExplorer = () => {
  const [blockInfo, setBlockInfo] = useState(null);
  const [priceData, setPriceData] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [error, setError] = useState(null);

  // Fetch latest block info using CoinGecko's API
  useEffect(() => {
    const fetchBlockInfo = async () => {
      try {
        setError(null);
        
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        setBlockInfo({
          price: { 
            value: `$${data.bitcoin.usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            description: "Current Bitcoin price in USD"
          },
          '24h_change': { 
            value: `${data.bitcoin.usd_24h_change.toFixed(2)}%`,
            description: "Price change in the last 24 hours",
            isPositive: data.bitcoin.usd_24h_change > 0
          },
          volume: { 
            value: `$${(data.bitcoin.usd_24h_vol || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
            description: "Trading volume in the last 24 hours"
          },
          last_updated: { 
            value: new Date(data.bitcoin.last_updated_at * 1000).toLocaleString(),
            description: "Last time the data was updated"
          }
        });
      } catch (error) {
        console.error('Error fetching blockchain data:', error);
        setError('Failed to load blockchain information. Please try again later.');
      }
    };

    fetchBlockInfo();
    const interval = setInterval(fetchBlockInfo, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Fetch price history data
  useEffect(() => {
    const fetchPriceData = async () => {
      try {
        setError(null);
        const response = await fetch(
          'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30&interval=daily',
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            }
          }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        const formattedData = data.prices.map(([timestamp, price]) => ({
          date: new Date(timestamp).toLocaleDateString(),
          price: parseFloat(price.toFixed(2)),
          displayPrice: `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        }));
        
        setPriceData(formattedData);
      } catch (error) {
        console.error('Error fetching price data:', error);
        setError('Failed to load price history. Please try again later.');
      }
    };

    fetchPriceData();
    const interval = setInterval(fetchPriceData, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  // Chat bot response logic
  const getBotResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('price')) {
      return `The current Bitcoin price is ${blockInfo?.price?.value || 'unavailable'}`;
    }
    if (lowerMessage.includes('change') || lowerMessage.includes('movement')) {
      const change = blockInfo?.['24h_change']?.value;
      const direction = blockInfo?.['24h_change']?.isPositive ? 'up' : 'down';
      return `Bitcoin's price has gone ${direction} by ${change || 'an unavailable amount'} in the last 24 hours`;
    }
    if (lowerMessage.includes('volume')) {
      return `The 24-hour trading volume is ${blockInfo?.volume?.value || 'unavailable'}`;
    }
    if (lowerMessage.includes('update') || lowerMessage.includes('latest')) {
      return `The data was last updated at ${blockInfo?.last_updated?.value || 'unavailable'}`;
    }
    if (lowerMessage.includes('help') || lowerMessage.includes('what')) {
      return "I can help you with Bitcoin's current price, 24-hour price change, trading volume, and latest updates. Just ask!";
    }
    
    return "I'm not sure about that. You can ask me about Bitcoin's price, 24-hour change, trading volume, or latest updates.";
  };

  // Send message function
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage = input.trim();
    setInput('');
    
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);

    try {
      const response = getBotResponse(userMessage);
      await new Promise(resolve => setTimeout(resolve, 800)); // Small delay for natural feel
      setMessages(prev => [...prev, { sender: 'bot', text: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: 'Sorry, I encountered an error processing your message.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!blockInfo && !error) {
    return (
      <div className="p-6 max-w-4xl mx-auto bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-lg">
        <div className="flex items-center justify-center space-x-2 text-purple-700">
          <Loader2 className="animate-spin" size={20} />
          <span>Loading Bitcoin data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-lg">
        <div className="text-center text-red-600 flex items-center justify-center space-x-2">
          <X size={20} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-lg space-y-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-purple-800">Bitcoin Market Data</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-purple-700 mb-3">Current Market Information</h2>
          <TooltipProvider>
            {Object.entries(blockInfo).map(([key, { value, description, isPositive }]) => (
              <div 
                key={key} 
                className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <span className="font-semibold capitalize text-purple-700">
                  {key.replace(/_/g, ' ')}:
                </span>
                <div className="flex items-center">
                  <span className={`text-gray-600 max-w-[200px] truncate mr-2 ${
                    key === '24h_change' ? (isPositive ? 'text-green-600' : 'text-red-600') : ''
                  }`}>
                    {value}
                  </span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info size={16} className="text-purple-500 hover:text-purple-700 transition-colors duration-200" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">{description}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            ))}
          </TooltipProvider>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-purple-700 mb-3">Price History (30 Days)</h2>
          <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#6b7280' }}
                  tickLine={{ stroke: '#6b7280' }}
                />
                <YAxis 
                  domain={['auto', 'auto']}
                  tick={{ fill: '#6b7280' }}
                  tickLine={{ stroke: '#6b7280' }}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <RechartsTooltip 
                  formatter={(value, name) => [`$${value.toLocaleString()}`, 'Price']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, fill: '#8b5cf6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="fixed bottom-4 right-4 z-50">
        {!isChatOpen ? (
          <button
            onClick={() => setIsChatOpen(true)}
            className="p-4 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            <MessageSquare size={24} />
          </button>
        ) : (
          <div className="w-80 h-96 bg-white rounded-lg shadow-xl flex flex-col">
            <div className="flex justify-between items-center p-4 border-b bg-purple-600 text-white rounded-t-lg">
              <h3 className="font-semibold text-lg">Bitcoin Chat</h3>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="text-white hover:text-purple-200 transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.sender === 'user' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] p-3 rounded-lg bg-gray-100 text-gray-800">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="animate-spin" size={16} />
                      <span>Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isLoading && sendMessage()}
                  placeholder="Ask about Bitcoin..."
                  className="flex-grow p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50 hover:bg-purple-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BitcoinExplorer;