import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";

export function ExchangeRates() {
  const { data: rates = [], isLoading } = useQuery({
    queryKey: ["/api/exchange-rates"],
  });

  if (isLoading) {
    return (
      <div className="px-4 mb-6">
        <Card className="rounded-2xl shadow-md p-4 animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded mb-1 w-20"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-gray-200 rounded mb-1 w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (!Array.isArray(rates) || rates.length === 0) {
    return (
      <div className="px-4 mb-6">
        <Card className="rounded-2xl shadow-md p-4">
          <div className="text-center text-gray-500">
            No exchange rates available
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4 mb-6">
      <Card className="rounded-2xl shadow-md p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Exchange Rates</h3>
          <div className="text-xs text-gray-500">Live • 0.5% fee</div>
        </div>
        
        <div className="space-y-2">
          {rates.slice(0, 3).map((rate: any) => (
            <div key={`${rate.fromCurrency}-${rate.toCurrency}`} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-700 font-semibold text-xs">{rate.fromCurrency}</span>
                </div>
                <div>
                  <div className="font-medium text-sm">{rate.fromCurrency} → {rate.toCurrency}</div>
                  <div className="text-xs text-gray-500">Exchange rate</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-sm">{parseFloat(rate.rate).toLocaleString()}</div>
                <div className="text-xs text-green-600">Live</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
