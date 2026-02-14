// Stock API service using Finnhub (free tier)
const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY || 'demo';
const BASE_URL = 'https://finnhub.io/api/v1';

// Fallback to Alpha Vantage if Finnhub fails
const ALPHA_VANTAGE_KEY = import.meta.env.VITE_ALPHA_VANTAGE_KEY;

/**
 * Fetch real-time stock price for a ticker
 * @param {string} ticker - Stock ticker symbol
 * @returns {Promise<object>} - Price data with current price and change
 */
export async function fetchStockPrice(ticker) {
  if (!ticker) return null;

  try {
    // Try Finnhub first
    const response = await fetch(
      `${BASE_URL}/quote?symbol=${ticker.toUpperCase()}&token=${FINNHUB_API_KEY}`
    );
    
    if (!response.ok) throw new Error('Finnhub API error');
    
    const data = await response.json();
    
    // Check if we got valid data
    if (data.c === 0 && data.pc === 0) {
      // Try Alpha Vantage as fallback if available
      if (ALPHA_VANTAGE_KEY) {
        return await fetchAlphaVantagePrice(ticker);
      }
      return null;
    }
    
    return {
      currentPrice: data.c,
      previousClose: data.pc,
      change: data.d,
      changePercent: data.dp,
      high: data.h,
      low: data.l,
      open: data.o,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error(`Error fetching price for ${ticker}:`, error);
    
    // Try Alpha Vantage as fallback
    if (ALPHA_VANTAGE_KEY) {
      return await fetchAlphaVantagePrice(ticker);
    }
    
    return null;
  }
}

/**
 * Fallback to Alpha Vantage API
 */
async function fetchAlphaVantagePrice(ticker) {
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${ALPHA_VANTAGE_KEY}`
    );
    
    const data = await response.json();
    const quote = data['Global Quote'];
    
    if (!quote || !quote['05. price']) return null;
    
    return {
      currentPrice: parseFloat(quote['05. price']),
      previousClose: parseFloat(quote['08. previous close']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      high: parseFloat(quote['03. high']),
      low: parseFloat(quote['04. low']),
      open: parseFloat(quote['02. open']),
      timestamp: Date.now()
    };
  } catch (error) {
    console.error(`Alpha Vantage error for ${ticker}:`, error);
    return null;
  }
}

/**
 * Fetch prices for multiple tickers efficiently
 * @param {Array<string>} tickers - Array of ticker symbols
 * @returns {Promise<Map>} - Map of ticker to price data
 */
export async function fetchMultiplePrices(tickers) {
  const priceMap = new Map();
  
  // Batch requests with a small delay to avoid rate limits
  const results = await Promise.all(
    tickers.map(async (ticker, index) => {
      // Add small delay to avoid rate limiting (free tier limit)
      await new Promise(resolve => setTimeout(resolve, index * 100));
      const priceData = await fetchStockPrice(ticker);
      return { ticker, priceData };
    })
  );
  
  results.forEach(({ ticker, priceData }) => {
    if (priceData) {
      priceMap.set(ticker, priceData);
    }
  });
  
  return priceMap;
}
