import React, { useState, useEffect } from 'react';
import { RefreshCw, Settings } from 'lucide-react';
import { Stock } from './types';
import SettingsModal from './components/SettingsModal';
import { fetchMockStocks } from './mockData';

function App() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState({
    refreshInterval: 5,
    maxStocks: 10
  });

  const isExtension = 'chrome' in window && 'runtime' in chrome;

  useEffect(() => {
    fetchStocks();
    const interval = setInterval(fetchStocks, settings.refreshInterval * 60000);
    return () => clearInterval(interval);
  }, [settings.refreshInterval]);

  const fetchStocks = async () => {
    setLoading(true);
    setError(null);
    try {
      let fetchedStocks: Stock[];
      if (isExtension) {
        const response = await chrome.runtime.sendMessage({ action: 'getStocks', maxStocks: settings.maxStocks });
        if (response.error) {
          throw new Error(response.error);
        }
        fetchedStocks = response.stocks;
      } else {
        fetchedStocks = await fetchMockStocks(settings.maxStocks);
      }
      setStocks(fetchedStocks);
    } catch (error) {
      console.error('Error fetching stocks:', error);
      setError('无法获取股票数据，请稍后再试。');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsChange = (newSettings: typeof settings) => {
    setSettings(newSettings);
    if (isExtension) {
      chrome.storage.sync.set({ settings: newSettings });
    }
  };

  return (
    <div className="w-96 p-4 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">A 股分析器</h1>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
      <button
        onClick={fetchStocks}
        className="mb-4 flex items-center justify-center w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        刷新第一类股票
      </button>
      {loading && <p className="text-center">加载中...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
      {!loading && !error && (
        <ul className="space-y-4">
          {stocks.map((stock) => (
            <li key={stock.code} className="border p-3 rounded shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-lg">{stock.name}</span>
                <span className="text-gray-600">{stock.code}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>当前价格: ¥{stock.price.toFixed(2)}</div>
                <div className={stock.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                  涨跌幅: {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                </div>
                <div>换手率: {stock.turnoverRate.toFixed(2)}%</div>
                <div>开盘价: ¥{stock.openPrice.toFixed(2)}</div>
                <div>最高价: ¥{stock.highPrice.toFixed(2)}</div>
                <div>最低价: ¥{stock.lowPrice.toFixed(2)}</div>
                <div>振幅: {stock.amplitude.toFixed(2)}%</div>
                <div>成交额: {(stock.turnover / 100000000).toFixed(2)}亿</div>
                <div>流动市值: {(stock.marketCap / 100000000).toFixed(2)}亿</div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />
    </div>
  );
}

export default App;