import { Stock } from './types';

let cachedStocks: Stock[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

chrome.runtime.onInstalled.addListener(() => {
  console.log('A 股分析器扩展已安装');
  chrome.storage.sync.set({ settings: { refreshInterval: 5, maxStocks: 10 } });
});

async function fetchStockData(): Promise<Stock[]> {
  const stockCodes = ['sh000001', 'sz399001', 'sz399006']; // 示例股票代码，您可以根据需要添加更多
  const url = `https://hq.sinajs.cn/list=${stockCodes.join(',')}`;

  try {
    const response = await fetch(url);
    const text = await response.text();
    const stocksData = text.split('\n').filter(line => line.trim() !== '');

    return stocksData.map(stockData => {
      const [, stockInfo] = stockData.split('="');
      const [
        name, openPrice, previousClose, currentPrice, highPrice, lowPrice,
        , , , , , , , , , , turnover, , , ,
      ] = stockInfo.split(',');

      const code = stockData.match(/hq_str_(\w+)=/)[1];
      const price = parseFloat(currentPrice);
      const prevClose = parseFloat(previousClose);
      const change = ((price - prevClose) / prevClose) * 100;

      return {
        code,
        name,
        price,
        change,
        previousClose: prevClose,
        openPrice: parseFloat(openPrice),
        previousDayChange: ((prevClose - parseFloat(openPrice)) / parseFloat(openPrice)) * 100,
        twoDaysAgoChange: 0, // 需要额外的历史数据
        consecutiveLimitUps: 0, // 需要额外的历史数据
        turnoverRate: 0, // 需要额外的成交量数据
        highPrice: parseFloat(highPrice),
        lowPrice: parseFloat(lowPrice),
        amplitude: ((parseFloat(highPrice) - parseFloat(lowPrice)) / prevClose) * 100,
        turnover: parseFloat(turnover),
        marketCap: 0, // 需要额外的股本数据
      };
    });
  } catch (error) {
    console.error('Error fetching stock data:', error);
    throw new Error('无法获取股票数据');
  }
}

function filterStocks(stocks: Stock[]): Stock[] {
  const today = new Date();
  const isTradeDay = today.getDay() >= 1 && today.getDay() <= 5;
  const currentHour = today.getHours();
  const currentMinute = today.getMinutes();

  return stocks.filter((stock) => {
    const previousDayNotLimitUp = stock.previousDayChange < 9.9;
    const previousDayNegative = stock.previousDayChange < 0;
    const isOpeningTime = isTradeDay && ((currentHour === 9 && currentMinute >= 30) || currentHour === 10);
    const openPriceHigherThanPreviousClose = stock.openPrice > stock.previousClose;

    // 注意：由于我们没有历史数据，无法判断连续涨停的情况
    // 在实际应用中，您需要获取更多的历史数据来实现这个功能
    return previousDayNotLimitUp && previousDayNegative && 
           (!isOpeningTime || openPriceHigherThanPreviousClose);
  });
}

async function getStocksWithCache(maxStocks: number): Promise<Stock[]> {
  const now = Date.now();
  if (now - lastFetchTime > CACHE_DURATION || cachedStocks.length === 0) {
    try {
      const stocks = await fetchStockData();
      cachedStocks = filterStocks(stocks);
      lastFetchTime = now;
    } catch (error) {
      console.error('Error fetching stock data:', error);
      throw new Error('无法获取股票数据');
    }
  }
  return cachedStocks.slice(0, maxStocks);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getStocks') {
    getStocksWithCache(request.maxStocks)
      .then((stocks) => {
        sendResponse({ stocks });
      })
      .catch((error) => {
        sendResponse({ error: error.message });
      });
    return true; // 表示响应是异步的
  }
});