type Currency = any;
type ExchangeRate = any;

export class CurrencyManager {
  private static instance: CurrencyManager;
  private currencies: Map<string, Currency> = new Map();
  private rates: Map<string, ExchangeRate> = new Map();
  private defaultCurrency: string = 'CNY';

  static getInstance() {
    if (!CurrencyManager.instance) {
      CurrencyManager.instance = new CurrencyManager();
      CurrencyManager.instance.initDefaultCurrencies();
    }
    return CurrencyManager.instance;
  }

  private initDefaultCurrencies() {
    this.addCurrency({
      code: 'CNY',
      name: '人民币',
      symbol: '¥',
      decimals: 2
    });
    this.addCurrency({
      code: 'USD',
      name: '美元',
      symbol: '$',
      decimals: 2
    });
    // 添加更多默认货币...
  }

  addCurrency(currency: Currency) {
    this.currencies.set(currency.code, currency);
  }

  getCurrency(code: string): Currency | undefined {
    return this.currencies.get(code);
  }

  async updateExchangeRate(from: string, to: string, rate: number) {
    const key = `${from}-${to}`;
    this.rates.set(key, {
      from,
      to,
      rate,
      timestamp: Date.now()
    });
  }

  async convert(amount: number, from: string, to: string): Promise<number> {
    if (from === to) return amount;

    const key = `${from}-${to}`;
    const rate = this.rates.get(key);
    
    if (!rate || this.isRateExpired(rate)) {
      await this.fetchExchangeRate(from, to);
      return this.convert(amount, from, to);
    }

    return amount * rate.rate;
  }

  private isRateExpired(rate: ExchangeRate): boolean {
    const ONE_HOUR = 60 * 60 * 1000;
    return Date.now() - rate.timestamp > ONE_HOUR;
  }

  private async fetchExchangeRate(from: string, to: string) {
    try {
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/${from}`
      );
      const data = await response.json();
      await this.updateExchangeRate(from, to, data.rates[to]);
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error);
      throw error;
    }
  }

  formatAmount(amount: number, currency: string): string {
    const curr = this.currencies.get(currency);
    if (!curr) return amount.toString();

    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: curr.code
    }).format(amount);
  }
}

export const currencyManager = CurrencyManager.getInstance(); 