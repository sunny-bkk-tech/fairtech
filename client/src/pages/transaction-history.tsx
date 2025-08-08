import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { MobileHeader } from "@/components/layout/mobile-header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Plus, ArrowRightLeft } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

export default function TransactionHistoryPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/auth");
    }
  }, [user, authLoading, setLocation]);

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["/api/transactions"],
    enabled: !!user,
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

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <Store className="w-5 h-5 text-green-700" />;
      case 'topup':
        return <Plus className="w-5 h-5 text-blue-700" />;
      case 'exchange':
        return <ArrowRightLeft className="w-5 h-5 text-purple-700" />;
      default:
        return <Store className="w-5 h-5 text-gray-700" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'payment':
        return 'bg-green-100';
      case 'topup':
        return 'bg-blue-100';
      case 'exchange':
        return 'bg-purple-100';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader title="Transaction History" />
      
      <div className="pt-16 pb-20 p-4">
        <Card className="rounded-2xl shadow-md">
          <CardHeader>
            <CardTitle>All Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 border-b border-gray-100 animate-pulse">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div>
                        <div className="h-4 bg-gray-200 rounded mb-1 w-32"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="h-4 bg-gray-200 rounded mb-1 w-20"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : !Array.isArray(transactions) || transactions.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <Store className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No transactions yet</h3>
                <p className="text-sm">Your transaction history will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {transactions.map((transaction: any) => (
                  <div key={transaction.id} className="py-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 ${getTransactionColor(transaction.type)} rounded-full flex items-center justify-center`}>
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <div className="font-medium text-sm">
                            {transaction.description || transaction.type}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(transaction.createdAt).toLocaleDateString()} at{' '}
                            {new Date(transaction.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold text-sm ${
                          transaction.type === 'topup' ? 'text-green-600' : 
                          transaction.type === 'payment' ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          {transaction.type === 'topup' ? '+' : transaction.type === 'payment' ? '-' : ''}
                          {formatCurrency(transaction.amount, transaction.fromCurrency || 'USD')}
                        </div>
                        {transaction.convertedAmount && (
                          <div className="text-xs text-gray-500">
                            → {formatCurrency(transaction.convertedAmount, transaction.toCurrency || 'LAK')}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 capitalize">
                        {transaction.type}
                        {transaction.fee && parseFloat(transaction.fee) > 0 && (
                          <span className="ml-2">• Fee: {formatCurrency(transaction.fee, transaction.fromCurrency || 'USD')}</span>
                        )}
                      </span>
                      <span className={`px-2 py-1 rounded-full ${
                        transaction.status === 'completed' ? 'bg-green-100 text-green-700' :
                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <BottomNavigation />
    </div>
  );
}
