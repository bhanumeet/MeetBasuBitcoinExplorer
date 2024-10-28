# Bitcoin Explorer
Project contributors - 
Meet Anil Bhanushali 
Basavaraj Patil

A real-time Bitcoin market data dashboard with an interactive chat interface built using React. The application provides current Bitcoin prices, market statistics, historical price charts, and a chatbot to answer common queries about Bitcoin's market performance.

## Features

- **Real-time Market Data**
  - Current Bitcoin price in USD
  - 24-hour price change percentage
  - 24-hour trading volume
  - Last update timestamp
  - Auto-refresh every 30 seconds

- **Price History Visualization**
  - 30-day price history chart
  - Interactive line graph with tooltips
  - Daily price points
  - Auto-refresh every 5 minutes

- **Interactive Chat Interface**
  - Floating chat window
  - Natural language queries about Bitcoin data
  - Quick responses to common questions
  - Loading states and error handling

## Tech Stack

- React
- Recharts for data visualization
- Lucide React for icons
- Shadcn/ui components (Tooltip, Card)
- CoinGecko API for Bitcoin data

## Prerequisites

- Node.js (version 14 or higher)
- npm or yarn
- A modern web browser

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd bitcoin-explorer
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

## Usage

The dashboard will automatically load with the latest Bitcoin market data. Users can:

- View current market statistics in the left panel
- Hover over info icons for detailed descriptions
- Interact with the price history chart
- Click the chat button in the bottom right to ask questions about Bitcoin data

### Chat Commands

The chatbot understands queries about:
- Current price
- 24-hour price changes
- Trading volume
- Latest updates
- General help

Example queries:
- "What's the current Bitcoin price?"
- "How much has Bitcoin changed in the last 24 hours?"
- "Show me the trading volume"

## API Integration

The application uses the CoinGecko API for all market data. Two main endpoints are utilized:

- `/simple/price` - For current market data
- `/coins/bitcoin/market_chart` - For historical price data

## Styling

The application uses:
- Tailwind CSS for utility-first styling
- Custom gradient backgrounds
- Responsive design for all screen sizes
- Dark and light theme considerations

## Error Handling

The application includes comprehensive error handling for:
- API failures
- Network issues
- Data loading states
- Invalid user inputs

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Data provided by CoinGecko API
- UI components from shadcn/ui
- Icons from Lucide React
