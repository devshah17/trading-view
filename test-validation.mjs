import YahooFinance from 'yahoo-finance2';
const YF = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
YF.quote(['AAPL', 'RELIANCE'], {}, { validateResult: false }).then(r => console.log('Quotes:', r.length)).catch(e => console.log('Error', Object.keys(e)));
