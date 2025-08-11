# Avaline Project Summary

## Project Overview

Avaline is a Next.js application that provides real-time ticket price tracking with an AI-powered chat interface. The application features a charming British personality named Avaline who helps users understand market trends and make informed purchasing decisions.

## Architecture Overview

### Frontend Architecture
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (useState, useEffect)
- **Charts**: Recharts for data visualization

### Backend Architecture
- **API Routes**: Next.js API routes for server-side logic
- **External APIs**: Google Sheets API v4, OpenAI GPT-5 API
- **Authentication**: Google Service Account for Sheets access

### Data Flow
1. **Data Source**: Google Sheets containing price data
2. **API Layer**: Next.js API routes for data processing
3. **AI Integration**: OpenAI GPT-5 for personalized responses
4. **Frontend**: React components for user interaction

## 📁 File Structure

```
avaline/
├── .github/                    # GitHub configuration
│   ├── workflows/             # CI/CD workflows
│   ├── ISSUE_TEMPLATE/        # Issue templates
│   └── pull_request_template.md
├── public/                    # Static assets
│   ├── avalineLogo.png       # Main logo
│   ├── avalineFaceLarge.png  # Avatar image
│   └── *.svg                 # Icon assets
├── src/
│   ├── app/                  # Next.js app directory
│   │   ├── api/             # API endpoints
│   │   │   ├── avaline/     # AI chat endpoint
│   │   │   ├── prices/      # Price data endpoint
│   │   │   └── subscribe/   # Email subscription endpoint
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Main page component
│   ├── lib/                 # Utility libraries
│   │   ├── avaline.ts       # AI response generation
│   │   └── sheets.ts        # Google Sheets integration
│   └── types.ts             # TypeScript definitions
├── .env.example             # Environment variables template
├── .gitignore               # Git ignore rules
├── CONTRIBUTING.md          # Contribution guidelines
├── CHANGELOG.md             # Version history
├── LICENSE                  # MIT License
├── package.json             # Dependencies and scripts
├── README.md                # Project documentation
└── PROJECT_SUMMARY.md       # This file
```

## 🔧 Core Components

### 1. Main Page (`src/app/page.tsx`)
- **Purpose**: Main application interface
- **Features**: 
  - Price metrics dashboard
  - Interactive price charts
  - AI chat interface
  - Email subscription overlay
- **State Management**: Multiple useState hooks for UI state
- **Key Functions**: `fetchPrices()`, `askAvaline()`, `handleSubscribe()`

### 2. AI Chat System (`src/app/api/avaline/route.ts`)
- **Purpose**: Handle AI chat requests
- **Features**:
  - OpenAI GPT-5 integration
  - Market context analysis
  - Personalized responses
  - Price-based purchasing advice
- **Fallback**: Template responses when AI is unavailable

### 3. Google Sheets Integration (`src/lib/sheets.ts`)
- **Purpose**: Read and write data to Google Sheets
- **Features**:
  - Price data fetching
  - Subscriber email management
  - Service account authentication
  - Error handling and logging

### 4. AI Response Generation (`src/lib/avaline.ts`)
- **Purpose**: Generate AI-powered responses
- **Features**:
  - OpenAI API integration
  - Template fallback system
  - British personality implementation
  - Market analysis integration

## UI Components

### TypingMessage Component
- **Purpose**: Animated text display for AI responses
- **Features**: Character-by-character typing animation
- **State**: Manages typing progress and display

### Subscription Overlay
- **Purpose**: Email collection interface
- **Features**: Modal overlay, form validation, success states
- **Integration**: Google Sheets API for data storage

### Price Charts
- **Purpose**: Visualize price trends over time
- **Features**: Line charts, responsive design, tooltips
- **Library**: Recharts with custom styling

## API Endpoints

### GET `/api/prices`
- **Purpose**: Fetch current price metrics
- **Response**: Price data with calculations
- **Data Source**: Google Sheets

### POST `/api/avaline`
- **Purpose**: Process AI chat requests
- **Input**: User question and market context
- **Response**: AI-generated response
- **Integration**: OpenAI GPT-5 API

### POST `/api/subscribe`
- **Purpose**: Handle email subscriptions
- **Input**: Email address
- **Storage**: Google Sheets
- **Response**: Success/error status

## Security & Configuration

### Environment Variables
- `OPENAI_API_KEY`: OpenAI API authentication
- `GOOGLE_CLIENT_EMAIL`: Service account email
- `GOOGLE_PRIVATE_KEY`: Service account private key
- `SHEET_ID`: Google Sheets document ID
- `SHEET_RANGE`: Price data range
- `SUBSCRIBER_SHEET_RANGE`: Email storage range

### Authentication
- **Google Sheets**: Service account with minimal required permissions
- **OpenAI**: API key-based authentication
- **No user authentication**: Public-facing application

## Deployment

### Build Process
- **Development**: `npm run dev`
- **Production Build**: `npm run build`
- **Production Start**: `npm run start`

### Deployment Options
- **Vercel**: Recommended (Next.js optimized)
- **Netlify**: Compatible with Next.js
- **Self-hosted**: Docker support available

### CI/CD
- **GitHub Actions**: Automated testing and building
- **Node.js Versions**: 18.x and 20.x support
- **Quality Checks**: TypeScript, linting, security audits

## Data Models

### PriceRow
```typescript
interface PriceRow {
  vendor: string;
  quantity: number;
  price: number;
  timestamp: string;
}
```

### PriceMetrics
```typescript
interface PriceMetrics {
  points: PriceRow[];
  current: number | null;
  delta24h: number | null;
  low7d: number | null;
  avg_qty7d: number | null;
}
```

### AvalineResponse
```typescript
interface AvalineResponse {
  reply: string;
  current: number;
  delta24h: number;
  low7d: number;
  avg_qty7d: number;
}
```
Key Features

### 1. Real-time Price Tracking
- Live data from Google Sheets
- Automatic metric calculations
- Historical trend analysis

### 2. AI-Powered Chat
- Personalized responses
- Market context awareness
- British personality
- Purchasing advice

### 3. Email Subscriptions
- User email collection
- Google Sheets storage
- Automated data management

### 4. Interactive Visualizations
- Price trend charts
- Responsive design
- Custom styling

## Future Enhancements

### Potential Improvements
- User authentication system
- Push notifications
- Advanced analytics
- Mobile app version
- Multi-event support
- Social features

### Technical Debt
- Add comprehensive testing
- Implement error boundaries
- Add performance monitoring
- Enhance accessibility
- Add internationalization

## Documentation

### Code Documentation
- **TypeScript**: Comprehensive type definitions
- **JSDoc**: Function documentation
- **Comments**: Business logic explanations

### User Documentation
- **README.md**: Setup and usage instructions
- **CONTRIBUTING.md**: Development guidelines
- **CHANGELOG.md**: Version history

### API Documentation
- **Endpoint descriptions**: Clear API documentation
- **Request/response examples**: Usage examples
- **Error handling**: Error code explanations

## Contributing

### Development Setup
1. Clone repository
2. Install dependencies
3. Configure environment variables
4. Run development server

### Contribution Areas
- Bug fixes and improvements
- New features and enhancements
- Documentation updates
- Testing and quality assurance

### Code Standards
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Conventional commits

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Status**: Production Ready 