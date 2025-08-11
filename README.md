# Avaline - AI-Powered Ticket Price Tracker

Avaline is a Next.js application that provides real-time ticket price tracking with an AI-powered chat interface. Built with a focus on user experience and data accuracy, Avaline helps users make informed decisions about ticket purchases.

## Features

- **Real-time Price Tracking**: Live updates from Google Sheets
- **AI Chat Interface**: Personalized responses from Avaline using OpenAI GPT-5
- **Interactive Charts**: Beautiful price visualization over time
- **Email Subscriptions**: Collect subscriber emails for price alerts
- **Responsive Design**: Modern, mobile-friendly interface
- **British Personality**: Charming Northern England character with 1990s vibe

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **AI**: OpenAI GPT-5 API
- **Data**: Google Sheets API
- **Deployment**: Vercel-ready

## Prerequisites

- Node.js 18+ 
- Google Cloud Project with Sheets API enabled
- OpenAI API key
- Google Service Account credentials

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd avaline
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Google Sheets Configuration
   GOOGLE_CLIENT_EMAIL=your_service_account_email
   GOOGLE_PRIVATE_KEY=your_service_account_private_key
   SHEET_ID=your_google_sheet_id
   SHEET_RANGE=OasisData!A:D
   SUBSCRIBER_SHEET_RANGE=Emails!A:B
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Configuration

### Google Sheets Setup

1. **Create a Google Cloud Project**
2. **Enable Google Sheets API**
3. **Create a Service Account**
4. **Download JSON credentials**
5. **Share your Google Sheet with the service account email**

### OpenAI Setup

1. **Get an OpenAI API key** from [platform.openai.com](https://platform.openai.com)
2. **Add it to your `.env.local` file**

## Data Structure

### Price Data Sheet (`OasisData`)
- **Column A**: Quantity
- **Column B**: Vendor
- **Column C**: Price
- **Column D**: Timestamp

### Subscribers Sheet (`Emails`)
- **Column A**: Email Address
- **Column B**: Subscription Date

## Usage

### Chat with Avaline
- Type questions in the chat input
- Get personalized responses based on current market data
- Avaline provides price insights and purchasing advice

### View Price Metrics
- **Current Lowest Price**: Real-time floor price
- **24h Change**: Price movement since yesterday
- **7-day Low**: Weekly minimum price
- **Cheapest Quantity**: Average quantity available

### Subscribe to Updates
- Click "Subscribe to receive email updates from Avaline"
- Enter your email address
- Get notified when prices drop

## Project Structure

```
avaline/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   │   ├── avaline/       # AI chat endpoint
│   │   │   ├── prices/        # Price data endpoint
│   │   │   └── subscribe/     # Email subscription endpoint
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Main page component
│   ├── lib/                   # Utility libraries
│   │   ├── avaline.ts         # AI response generation
│   │   └── sheets.ts          # Google Sheets integration
│   └── types.ts               # TypeScript type definitions
├── public/                    # Static assets
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

## Deployment

### Vercel (Recommended)
1. **Push to GitHub**
2. **Connect to Vercel**
3. **Add environment variables**
4. **Deploy**

### Other Platforms
- **Netlify**: Compatible with Next.js
- **Railway**: Good for full-stack apps
- **Self-hosted**: Docker support available

## Security

- **Environment Variables**: Never commit `.env.local`
- **API Keys**: Rotate regularly
- **CORS**: Configured for production domains
- **Rate Limiting**: Implemented on API endpoints

## Contributing

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Add tests if applicable**
5. **Submit a pull request**

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Oasis**: Musical inspiration for the project theme
- **OpenAI**: GPT-5 API for intelligent responses
- **Google**: Sheets API for data management
- **Next.js Team**: Amazing React framework

## Support

For questions or support:
- **GitHub Issues**: Report bugs or request features
- **Discussions**: Join community conversations
- **Email**: [jamesswine@gmail.com]

---

**Inspired by Bonehead's Bank Holiday, by Oasis**  
**Created with Love by James Swinehart**
