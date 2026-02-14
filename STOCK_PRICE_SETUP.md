# Stock Price Integration Setup Guide

## Overview
Your Breakout Tracker now displays live stock prices with real-time updates! The app fetches current prices, daily changes, and highlights when stocks reach their breakout levels.

## Features Added
- ✅ Real-time stock prices
- ✅ Daily price change ($ and %)
- ✅ Visual indicators (green ▲ for gains, red ▼ for losses)
- ✅ Automatic breakout alerts (highlighted when price > breakout level)
- ✅ Manual refresh button
- ✅ Fallback API support

## API Setup Instructions

### Option 1: Finnhub (Recommended - Free)
1. Go to [https://finnhub.io/register](https://finnhub.io/register)
2. Sign up for a free account
3. Copy your API key from the dashboard
4. Add it to your `.env` file:
   ```
   VITE_FINNHUB_API_KEY=your_api_key_here
   ```

**Free Tier Limits:**
- 60 API calls/minute
- Perfect for tracking up to 50+ stocks

### Option 2: Alpha Vantage (Backup)
1. Go to [https://www.alphavantage.co/support/#api-key](https://www.alphavantage.co/support/#api-key)
2. Enter your email and get a free API key
3. Add it to your `.env` file:
   ```
   VITE_ALPHA_VANTAGE_KEY=your_api_key_here
   ```

**Free Tier Limits:**
- 25 API calls/day
- Best used as a fallback option

## Setup Steps

1. **Copy the environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Add your API keys** to the `.env` file

3. **Restart your development server:**
   ```bash
   npm run dev
   ```

4. **Test it out:**
   - Add a stock ticker (e.g., AAPL, MSFT, TSLA)
   - Wait a few seconds for prices to load
   - Click "Refresh Prices" to update

## Using the Price Features

### Current Price Column
- Shows the latest stock price
- Updates when you refresh
- Displays daily change and percentage

### Breakout Alerts
- When a stock price reaches or exceeds your breakout level
- The breakout cell turns green with a checkmark ✓
- Easy to spot winning trades!

### Manual Refresh
- Click "Refresh Prices" button to update all prices
- Useful during market hours for latest data
- Small delay between requests to respect API limits

## Troubleshooting

### Prices showing "N/A"
- Check that your API key is correctly set in `.env`
- Verify the ticker symbol is correct (use uppercase)
- Some tickers may not be available on all APIs
- Try clicking "Refresh Prices"

### "Loading..." stuck
- Check browser console for error messages
- Verify you have internet connection
- You may have hit API rate limits (wait a minute and try again)

### Demo mode
- Without an API key, the app uses "demo" mode
- This has very limited access and may not work for all tickers
- Sign up for a free key to get full access

## Tips
- Prices update when:
  - Page loads
  - You click "Refresh Prices"
  - You add a new ticker
  
- Best practices:
  - Don't refresh too frequently (respects API limits)
  - Use proper ticker symbols (e.g., "AAPL" not "Apple")
  - Markets are only open weekdays ~9:30 AM - 4:00 PM ET
  
## Need Help?
- Check the browser console (F12) for detailed error messages
- Verify your `.env` file is in the root directory
- Make sure to restart your dev server after adding API keys
