import YahooFinance from 'yahoo-finance2';
const YF = new YahooFinance();
YF.chart('AAPL', { period1: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), interval: '5m' }).then(r => console.log(Object.keys(r), Object.keys(r.quotes[0]))).catch(console.error);
