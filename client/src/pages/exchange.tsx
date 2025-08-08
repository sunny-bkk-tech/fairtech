import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { MobileHeader } from "@/components/layout/mobile-header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRightLeft } from "lucide-react";
import { formatCurrency, calculateExchangeAmount, CURRENCIES } from "@/lib/currency";
import { apiRequest } from "@/lib/queryClient";

export default function ExchangePage() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("LAK");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/auth");
    }
  }, [user, authLoading, setLocation]);

  const { data: wallets = [] } = useQuery({
    queryKey: ["/api/wallets"],
    enabled: !!user,
  });

  const { data: exchangeRates = [] } = useQuery({
    queryKey: ["/api/exchange-rates"],
    enabled: !!user,
  });

  const exchangeMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/exchange", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Exchange Successful",
        description: "Currency exchange completed successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/wallets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      setAmount("");
    },
    onError: (error: any) => {
      toast({
        title: "Exchange Failed",
        description: error.message || "Failed to exchange currency",
        variant: "destructive",
      });
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const currentRate = Array.isArray(exchangeRates) ? exchangeRates.find(
    (rate: any) => rate.fromCurrency === fromCurrency && rate.toCurrency === toCurrency
  ) : null;

  const fromWallet = Array.isArray(wallets) ? wallets.find((w: any) => w.currency === fromCurrency) : null;
  const toWallet = Array.isArray(wallets) ? wallets.find((w: any) => w.currency === toCurrency) : null;

  const exchangeCalculation = amount && currentRate ? 
    calculateExchangeAmount(parseFloat(amount), parseFloat(currentRate.rate)) : 
    { convertedAmount: 0, feeAmount: 0, total: 0 };

  const handleExchange = () => {
    if (!amount || !currentRate || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (!fromWallet || parseFloat(fromWallet.balance) < exchangeCalculation.total) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this exchange",
        variant: "destructive",
      });
      return;
    }

    exchangeMutation.mutate({
      fromCurrency,
      toCurrency,
      amount: parseFloat(amount),
    });
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader title="Currency Exchange" />
      
      <div className="pt-16 pb-20 p-4">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5" />
              Exchange Currency
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* From Currency */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">From</Label>
              <div className="space-y-2">
                <Select value={fromCurrency} onValueChange={setFromCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CURRENCIES).map(([code, { name }]) => (
                      <SelectItem key={code} value={code}>
                        {code} - {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    {CURRENCIES[fromCurrency as keyof typeof CURRENCIES]?.symbol}
                  </span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-8"
                  />
                </div>
                
                {fromWallet && (
                  <div className="text-xs text-gray-500">
                    Available: {formatCurrency(fromWallet.balance, fromCurrency)}
                  </div>
                )}
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="icon"
                onClick={swapCurrencies}
                className="rounded-full"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </Button>
            </div>

            {/* To Currency */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">To</Label>
              <div className="space-y-2">
                <Select value={toCurrency} onValueChange={setToCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CURRENCIES).map(([code, { name }]) => (
                      <SelectItem key={code} value={code}>
                        {code} - {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    {CURRENCIES[toCurrency as keyof typeof CURRENCIES]?.symbol}
                  </span>
                  <Input
                    type="text"
                    value={exchangeCalculation.convertedAmount > 0 ? 
                      exchangeCalculation.convertedAmount.toFixed(2) : "0.00"}
                    readOnly
                    className="pl-8 bg-gray-50"
                  />
                </div>
                
                {toWallet && (
                  <div className="text-xs text-gray-500">
                    Balance: {formatCurrency(toWallet.balance, toCurrency)}
                  </div>
                )}
              </div>
            </div>

            {/* Exchange Rate Info */}
            {currentRate && (
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Exchange Rate</span>
                      <span>1 {fromCurrency} = {parseFloat(currentRate.rate).toLocaleString()} {toCurrency}</span>
                    </div>
                    
                    {amount && parseFloat(amount) > 0 && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Amount</span>
                          <span>{formatCurrency(amount, fromCurrency)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Exchange Fee (0.5%)</span>
                          <span>{formatCurrency(exchangeCalculation.feeAmount, fromCurrency)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total Deducted</span>
                          <span>{formatCurrency(exchangeCalculation.total, fromCurrency)}</span>
                        </div>
                        <hr className="my-2" />
                        <div className="flex justify-between font-semibold">
                          <span>You'll Receive</span>
                          <span className="text-green-600">
                            {formatCurrency(exchangeCalculation.convertedAmount, toCurrency)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <Button 
              className="w-full bg-blue-700 hover:bg-blue-900"
              onClick={handleExchange}
              disabled={!amount || !currentRate || parseFloat(amount) <= 0 || exchangeMutation.isPending}
            >
              {exchangeMutation.isPending ? "Processing..." : "Exchange Currency"}
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <BottomNavigation />
    </div>
  );
}
