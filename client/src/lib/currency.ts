export const CURRENCIES = {
  USD: { symbol: '$', name: 'US Dollar' },
  THB: { symbol: '฿', name: 'Thai Baht' },
  EUR: { symbol: '€', name: 'Euro' },
  LAK: { symbol: '₭', name: 'Lao Kip' },
};

export function formatCurrency(amount: string | number, currency: string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  const { symbol } = CURRENCIES[currency as keyof typeof CURRENCIES] || { symbol: '' };
  
  // Format with appropriate decimal places
  if (currency === 'LAK') {
    return `${symbol}${numAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  }
  
  return `${symbol}${numAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function calculateExchangeAmount(amount: number, rate: number, fee: number = 0.005): { convertedAmount: number; feeAmount: number; total: number } {
  const feeAmount = amount * fee;
  const convertedAmount = amount * rate;
  const total = amount + feeAmount;
  
  return {
    convertedAmount,
    feeAmount,
    total,
  };
}
