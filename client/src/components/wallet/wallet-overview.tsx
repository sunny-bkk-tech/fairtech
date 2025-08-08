import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Loader2 } from "lucide-react";
import { formatCurrency, CURRENCIES } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";
import { useTranslation } from "@/components/providers/language-provider";
// Type definitions for better type safety
type Wallet = {
  id: string;
  currency: keyof typeof CURRENCIES;
  balance: string;
  name?: string;
};

type ExchangeRates = {
  [key in keyof typeof CURRENCIES]?: number;
};

// Mock exchange rates - in a real app, you'd fetch these from an API
const DEFAULT_EXCHANGE_RATES: ExchangeRates = {
  USD: 1,
  EUR: 1.1,
  THB: 0.029,
  LAK: 0.00005,
};

export function WalletOverview() {
  const { t } = useTranslation();
  const {
    data: wallets = [],
    isLoading,
    isError,
  } = useQuery<Wallet[]>({
    queryKey: ["/api/wallets"],
  });

  // Calculate total balance and breakdown
  const { totalUSD, currencyBreakdown } = useMemo(() => {
    let total = 0;
    const breakdown: { [key: string]: { amount: number; usdValue: number } } =
      {};

    wallets.forEach((wallet) => {
      const balance = parseFloat(wallet.balance || "0");
      const rate = DEFAULT_EXCHANGE_RATES[wallet.currency] || 1;
      const usdValue = balance * rate;

      total += usdValue;

      if (breakdown[wallet.currency]) {
        breakdown[wallet.currency].amount += balance;
        breakdown[wallet.currency].usdValue += usdValue;
      } else {
        breakdown[wallet.currency] = { amount: balance, usdValue };
      }
    });

    return { totalUSD: total, currencyBreakdown: breakdown };
  }, [wallets]);

  // Loading state with better skeleton loader
  if (isLoading) {
    return (
      <div className="px-4 py-6">
        <Card className="rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-20" />
          </div>

          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-40" />

          <div className="grid grid-cols-3 gap-3 mt-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-8 mx-auto" />
                <Skeleton className="h-5 w-16 mx-auto" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="px-4 py-6">
        <Card className="rounded-2xl shadow-md p-6 text-center">
          <div className="text-red-500 mb-2">{t("noWalletsFound")}</div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  // Empty state
  if (!Array.isArray(wallets) || wallets.length === 0) {
    return (
      <div className="px-4 py-6">
        <Card className="rounded-2xl shadow-md p-6">
          <div className="text-center space-y-4">
            <div className="text-gray-500">No wallets found</div>
            <Button size="sm" variant="ghost" className="text-blue-700">
              Create a wallet
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <Card className="rounded-2xl shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {t("totalBalance")}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-700 text-sm font-medium"
          >
            USD
            <ChevronDown className="ml-1 w-4 h-4" />
          </Button>
        </div>

        <div className="text-3xl font-bold text-gray-900 mb-2">
          {formatCurrency(totalUSD, "USD")}
        </div>
        <div className="text-sm text-gray-500">
          {" "}
          {t("availableForSpending")}
        </div>

        {/* Currency Breakdown */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          {Object.entries(currencyBreakdown)
            .slice(0, 3)
            .map(([currency, { amount }]) => (
              <div
                key={currency}
                className="bg-gray-50 rounded-xl p-3 text-center"
              >
                <div className="text-xs text-gray-500 mb-1">{currency}</div>
                <div className="font-semibold text-sm">
                  {formatCurrency(amount, currency as keyof typeof CURRENCIES)}
                </div>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
}
