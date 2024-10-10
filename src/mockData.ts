import { Stock } from './types';

const generateMockStock = (index: number): Stock => {
  const basePrice = 100 + Math.random() * 900;
  const change = (Math.random() * 10) - 5; // -5% to +5%
  
  return {
    code: `SH${600000 + index}`,
    name: `股票${index + 1}`,
    price: basePrice,
    change: change,
    previousClose: basePrice / (1 + change / 100),
    openPrice: basePrice * (1 + (Math.random() * 0.02 - 0.01)),
    previousDayChange: (Math.random() * 4) - 2,
    twoDaysAgoChange: (Math.random() * 4) - 2,
    consecutiveLimitUps: Math.floor(Math.random() * 3),
    turnoverRate: Math.random() * 5,
    highPrice: basePrice * (1 + Math.random() * 0.05),
    lowPrice: basePrice * (1 - Math.random() * 0.05),
    amplitude: Math.random() * 5,
    turnover: Math.random() * 1000000000,
    marketCap: Math.random() * 100000000000,
  };
};

export const fetchMockStocks = async (count: number): Promise<Stock[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const stocks = Array.from({ length: count }, (_, index) => generateMockStock(index));
      resolve(stocks);
    }, 500); // Simulate network delay
  });
};