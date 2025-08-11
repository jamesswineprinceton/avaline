# Changelog

All notable changes to Avaline will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Email subscription system with Google Sheets integration
- AI-powered chat interface using OpenAI GPT-5
- Interactive price charts with Recharts
- Responsive design with Tailwind CSS
- TypeScript support throughout the application

### Changed
- Migrated from Google Apps Script to official Google Sheets API
- Improved error handling and user experience
- Enhanced Avaline's personality and responses

### Fixed
- CORS issues with external API calls
- Subscription form validation and error handling
- Chart rendering and data display issues

## [1.0.0] - 2024-12-19

### Added
- Initial release of Avaline
- Real-time price tracking from Google Sheets
- British-accented AI chat interface
- Price metrics dashboard
- Email subscription functionality
- Responsive web design
- Next.js 15 with App Router
- TypeScript implementation
- Tailwind CSS styling
- Google Sheets API integration
- OpenAI GPT-5 integration

### Features
- **Price Dashboard**: Current price, 24h change, 7-day low, average quantity
- **Interactive Charts**: Price trends over time visualization
- **AI Chat**: Personalized responses from Avaline
- **Email Subscriptions**: Collect subscriber emails for price alerts
- **Real-time Updates**: Live data from Google Sheets

### Technical
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Charts**: Recharts for data visualization
- **APIs**: Google Sheets API v4, OpenAI API
- **Authentication**: Google Service Account
- **Deployment**: Vercel-ready configuration

---

## Version History

- **1.0.0**: Initial release with core functionality
- **Unreleased**: Development version with latest features

## Migration Guide

### From Development to Production
1. Set up environment variables in production
2. Configure Google Cloud project and API keys
3. Set up OpenAI API access
4. Deploy to your preferred platform

### Breaking Changes
- None in current version

### Deprecations
- None in current version

---

For detailed information about each release, see the [GitHub releases page](https://github.com/yourusername/avaline/releases). 