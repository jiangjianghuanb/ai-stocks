export interface Stock {
  code: string;
  name: string;
  price: number;
  change: number;
  previousClose: number;
  openPrice: number;
  previousDayChange: number;
  twoDaysAgoChange: number;
  consecutiveLimitUps: number;
  turnoverRate: number;
  highPrice: number;
  lowPrice: number;
  amplitude: number;
  turnover: number;
  marketCap: number;
}