import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { MobileHeader } from "@/components/layout/mobile-header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, CreditCard, Building2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useTranslation } from "@/components/providers/language-provider";
import { formatCurrency } from "@/lib/currency";

// Stripe initialization
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Payment form component with enhanced error handling
function CheckoutForm({ amount, currency, onSuccess }: { 
  amount: number; 
  currency: string; 
  onSuccess: () => void 
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
const { user } = useAuth();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError(null);

  
    if (!stripe || !elements) {
      toast({
        title: t('paymentError'),
        description: t('paymentSystemNotReady'),
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

       try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin,
          receipt_email: user?.email || localStorage.getItem('email') || undefined,
          payment_method_data: {
            billing_details: {
              address: {
                country: user?.nationality || 'TH' // Default to Laos if not specified
              }
            }
          }
        },
        redirect: "if_required",
      });
       if (error) {
        throw new Error(error.message || t('paymentFailedGeneric'));
      }

       if (paymentIntent?.status === 'succeeded') {
        await apiRequest("POST", "/api/confirm-payment", {
          paymentIntentId: paymentIntent.id,
          amount: amount,
          currency: currency
        });

        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["/api/wallets"] }),
          queryClient.invalidateQueries({ queryKey: ["/api/transactions"] })
        ]);

        toast({
          title: t('paymentSuccess'),
          description: t('walletToppedUp'),
        });
        
        onSuccess();
      } else {
        throw new Error(t('paymentNotCompleted'));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('unexpectedPaymentError');
      setPaymentError(errorMessage);
      toast({
        title: t('paymentError'),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

 if (!stripe || !elements) {
    return (
      <div className="space-y-6">
        <div className="h-12 bg-gray-200 animate-pulse rounded"></div>
        <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
    <form onSubmit={handleSubmit} className="space-y-4">
        <PaymentElement 
          options={{
            layout: "tabs",
            // fields: {
            //   billingDetails: {
            //     address: {
            //       country: "never"
            //     }
            //   }
            // }
          }}
        />
      {paymentError && (
          <div className="text-red-600 text-sm mt-2">{paymentError}</div>
        )}

        <Button 
          type="submit" 
          className="w-full bg-blue-700 hover:bg-blue-900"
          disabled={isProcessing}
        >
          {isProcessing ? t('processing') : `${t('pay')} ${formatCurrency(amount, currency)}`}
        </Button>
      </form>
    </div>
  );
}

// Main TopUpPage component
export default function TopUpPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [clientSecret, setClientSecret] = useState("");
  const [showPayment, setShowPayment] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/auth");
    }
  }, [user, authLoading, setLocation]);

  // Calculate fees
  const calculateFees = (amount: number) => {
    const fixedFee = 0.30; // $0.30 fixed fee
    const percentageFee = 0.029; // 2.9%
    return amount * percentageFee + fixedFee;
  };

  const processingFee = calculateFees(parseFloat(amount || "0"));
  const totalWithFees = parseFloat(amount || "0") + processingFee;

  // Handle payment intent creation
  const handleCreatePaymentIntent = async () => {
    const paymentAmount = parseFloat(amount);
    
    // Validate amount
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      toast({
        title: t('invalidAmount'),
        description: t('enterValidAmount'),
        variant: "destructive",
      });
      return;
    }

    // Minimum amount check
    if (paymentAmount < 1) {
      toast({
        title: t('amountTooSmall'),
       description: `${t('minimumAmount')}: ${formatCurrency(1, selectedCurrency)}`,
        variant: "destructive",
      });
      return;
    }

    try {
      const { clientSecret } = await apiRequest<{ clientSecret: string }>(
        "POST",
        "/api/create-payment-intent",
        {
          amount: paymentAmount,
          currency: selectedCurrency,
        }
      );

      if (!clientSecret) {
        throw new Error(t('noClientSecret'));
      }

      setClientSecret(clientSecret);
      setShowPayment(true);

      toast({
        title: t('paymentReady'),
        description: t('completePaymentDetails'),
      });

    } catch (error: unknown) {
      let errorMessage = t('paymentIntentFailed');
      
      if (error instanceof Error) {
        if (error.message.includes("Stripe")) {
          errorMessage = t('paymentServiceError');
        } else if (error.message.includes("network")) {
          errorMessage = t('networkError');
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: t('paymentError'),
        description: errorMessage,
        variant: "destructive",
      });

      console.error("Payment intent creation failed:", error);
    }
  };

  // Handle payment success
  const onPaymentSuccess = () => {
    setShowPayment(false);
    setAmount("");
    setClientSecret("");
    setTimeout(() => setLocation("/"), 500);
  };

  // Loading state
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

  // Payment form view
  if (showPayment && clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MobileHeader title={t('completePayment')} />
        
        <div className="pt-16 pb-20 p-4">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPayment(false)}
                className="w-fit p-0 mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('back')}
              </Button>
              <CardTitle>{t('paymentDetails')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Elements 
                stripe={stripePromise} 
                options={{ 
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      colorPrimary: '#2563eb',
                      colorBackground: '#ffffff',
                    }
                  },
                }}
                key={clientSecret}
              >
                <CheckoutForm 
                  amount={totalWithFees} 
                  currency={selectedCurrency}
                  onSuccess={onPaymentSuccess}
                />
              </Elements>
            </CardContent>
          </Card>
        </div>
        
        <BottomNavigation />
      </div>
    );
  }

  // Main top-up form view
  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader title={t('topUpWallet')} />
      
      <div className="pt-16 pb-20 p-4">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              className="w-fit p-0 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('back')}
            </Button>
            <CardTitle>{t('topUpWallet')}</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Currency Selection */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                {t('selectCurrency')}
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {["USD", "THB", "EUR"].map((currency) => (
                  <Button
                    key={currency}
                    variant={selectedCurrency === currency ? "default" : "outline"}
                    className={`p-3 ${
                      selectedCurrency === currency 
                        ? "bg-blue-700 text-white" 
                        : "border-gray-200 text-gray-700 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedCurrency(currency)}
                  >
                    {currency}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Amount Input */}
            <div>
              <Label htmlFor="amount" className="text-sm font-medium text-gray-700 mb-2 block">
                {t('amount')}
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {selectedCurrency === "USD" ? "$" : selectedCurrency === "EUR" ? "€" : "฿"}
                </span>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8"
                  min="1"
                  step="0.01"
                />
              </div>
              <div className="flex space-x-2 mt-3">
                {["50", "100", "250"].map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(quickAmount)}
                  >
                    {selectedCurrency === "USD" ? "$" : selectedCurrency === "EUR" ? "€" : "฿"}{quickAmount}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Payment Method */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                {t('paymentMethod')}
              </Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-xl">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{t('creditDebitCard')}</div>
                    <div className="text-xs text-gray-500">Visa, Mastercard, Amex</div>
                  </div>
                  <RadioGroupItem value="stripe" id="stripe" />
                </div>
                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-xl opacity-50">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{t('bankTransfer')}</div>
                    <div className="text-xs text-gray-500">{t('comingSoon')}</div>
                  </div>
                  <RadioGroupItem value="promptpay" id="promptpay" disabled />
                </div>
              </RadioGroup>
            </div>
            
            {/* Fee Information */}
            {amount && parseFloat(amount) > 0 && (
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">{t('amount')}</span>
                    <span className="font-medium">
                      {formatCurrency(parseFloat(amount), selectedCurrency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">{t('processingFee')}</span>
                    <span>${processingFee.toFixed(2)}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between font-semibold">
                    <span>{t('total')}</span>
                    <span>${totalWithFees.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Button 
              className="w-full bg-blue-700 hover:bg-blue-900"
              onClick={handleCreatePaymentIntent}
              disabled={!amount || parseFloat(amount) <= 0}
            >
              {t('continueToPayment')}
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <BottomNavigation />
    </div>
  );
}