import React, { useState, useEffect } from 'react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Info, MessageSquare, X } from 'lucide-react';

const BitcoinExplorer = () => {
  const [blockInfo, setBlockInfo] = useState(null);
  const [priceData, setPriceData] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [error, setError] = useState(null);

  // Fetch latest block info using blockchain.com's public API
  useEffect(() => {
    const fetchBlockInfo = async () => {
      try {
        setError(null);
        // Using blockchain.com's public API
        const response = await fetch('https://api.blockchain.com/v3/exchange/tickers/BTC-USD', {
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch blockchain data');
        const tickerData = await response.json();
        
        // Fetch additional data from CoinGecko
        const cgResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true');
        if (!cgResponse.ok) throw new Error('Failed to fetch CoinGecko data');
        const cgData = await cgResponse.json();
        
        setBlockInfo({
          price: { 
            value: `$${tickerData.last_trade_price.toFixed(2)}`,
            description: "Current Bitcoin price in USD"
          },
          '24h_change': { 
            value: `${cgData.bitcoin.usd_24h_change.toFixed(2)}%`,
            description: "Price change in the last 24 hours"
          },
          volume: { 
            value: `$${(tickerData.volume_24h).toFixed(2)}`,
            description: "Trading volume in the last 24 hours"
          },
          last_updated: { 
            value: new Date(cgData.bitcoin.last_updated_at * 1000).toLocaleString(),
            description: "Last time the data was updated"
          }
        });
      } catch (error) {
        console.error('Error fetching blockchain data:', error);
        setError('Failed to load blockchain information');
      }
    };

    fetchBlockInfo();
    const interval = setInterval(fetchBlockInfo, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Fetch price history data from CoinGecko
  useEffect(() => {
    const fetchPriceData = async () => {
      try {
        setError(null);
        const response = await fetch(
          'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30&interval=daily'
        );
        
        if (!response.ok) throw new Error('Failed to fetch price data');
        const data = await response.json();
        
        const formattedData = data.prices.map(([timestamp, price]) => ({
          date: new Date(timestamp).toLocaleDateString(),
          price: price.toFixed(2)
        }));
        
        setPriceData(formattedData);
      } catch (error) {
        console.error('Error fetching price data:', error);
        setError('Failed to load price history');
      }
    };

    fetchPriceData();
    const interval = setInterval(fetchPriceData, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  // Loading state
  if (!blockInfo && !error) {
    return (
      <div className="p-6 max-w-4xl mx-auto bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-lg">
        <div className="text-center text-purple-700">Loading Bitcoin data...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-lg">
        <div className="text-center text-red-600">Error: {error}</div>
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
            {Object.entries(blockInfo).map(([key, { value, description }]) => (
              <div 
                key={key} 
                className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm"
              >
                <span className="font-semibold capitalize text-purple-700">
                  {key.replace(/_/g, ' ')}:
                </span>
                <div className="flex items-center">
                  <span className="text-gray-600 max-w-[200px] truncate mr-2">
                    {value}
                  </span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info size={16} className="text-purple-500" />
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
          <div className="bg-white p-4 rounded-lg shadow-sm h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={['auto', 'auto']} />
                <RechartsTooltip />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#8884d8"
                  dot={false}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="fixed bottom-4 right-4">
        {!isChatOpen ? (
          <button
            onClick={() => setIsChatOpen(true)}
            className="p-4 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors duration-200"
          >
            <MessageSquare size={24} />
          </button>
        ) : (
          <div className="w-80 h-96 bg-white rounded-lg shadow-xl flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold text-lg">Bitcoin Chat</h3>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="text-gray-500 hover:text-gray-700"
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
                    className={`max-w-[80%] p-2 rounded-lg ${
                      message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] p-2 rounded-lg bg-gray-200">
                    Thinking...
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
                  className="flex-grow p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 hover:bg-blue-600 transition-colors duration-200"
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