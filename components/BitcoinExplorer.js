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

  // Mock data for development
  const mockBlockInfo = {
    height: { 
      value: 824968,
      description: "Block height represents the number of blocks preceding this block on the blockchain."
    },
    hash: { 
      value: "00000000000000000001b2c5121e0a18a3826bf2177d9c873f6488497c11c4bb",
      description: "A unique identifier for this block, created by hashing the block's contents."
    },
    timestamp: { 
      value: new Date().toLocaleString(),
      description: "The time when this block was mined."
    },
    transactions: { 
      value: 2435,
      description: "The number of transactions included in this block."
    },
    size: { 
      value: "1.45 MB",
      description: "The total size of the block in megabytes."
    },
  };

  const mockPriceData = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
    price: (40000 + Math.random() * 5000).toFixed(2)
  }));

  // Initialize with mock data
  useEffect(() => {
    setBlockInfo(mockBlockInfo);
    setPriceData(mockPriceData);
  }, []);

  // Chat message handler
  const sendMessage = () => {
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    
    // Mock response
    setTimeout(() => {
      const botMessage = { 
        text: "I'm using mock data for development. In production, this would connect to a real AI service.", 
        sender: 'bot' 
      };
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 1000);
    
    setInput('');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-lg space-y-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-purple-800">Bitcoin Block Explorer</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-purple-700 mb-3">Latest Block Information</h2>
          <TooltipProvider>
            {Object.entries(blockInfo || {}).map(([key, { value, description }]) => (
              <div 
                key={key} 
                className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm"
              >
                <span className="font-semibold capitalize text-purple-700">{key}:</span>
                <div className="flex items-center">
                  <span className="text-gray-600 max-w-[200px] truncate mr-2">
                    {typeof value === 'string' && value.length > 30 
                      ? `${value.substring(0, 30)}...` 
                      : value}
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
          <h2 className="text-xl font-semibold text-purple-700 mb-3">Bitcoin Price (Last 30 Days)</h2>
          <div className="bg-white p-4 rounded-lg shadow-sm h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Line type="monotone" dataKey="price" stroke="#8884d8" />
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