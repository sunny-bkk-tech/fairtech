import { useQuery } from "@tanstack/react-query";
import { Store, Plus, ArrowRightLeft } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export function TransactionList() {
  const [, setLocation] = useLocation();
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["/api/transactions"],
  });

  if (isLoading) {
    return (
      <div className="px-4 mb-6">
        <Card className="rounded-2xl shadow-md animate-pulse">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="space-y-4 p-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded mb-1 w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
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
    <div className="px-4 mb-6">
      <Card className="rounded-2xl shadow-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Recent Transactions</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-blue-700 text-sm font-medium"
            onClick={() => setLocation("/history")}
          >
            View All
          </Button>
        </div>
        
        {!Array.isArray(transactions) || transactions.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No transactions yet
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {transactions.slice(0, 5).map((transaction: any) => (
              <div key={transaction.id} className="p-4">
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
                        {new Date(transaction.createdAt).toLocaleDateString()}
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
                    <div className="text-xs text-gray-500">
                      {new Date(transaction.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 capitalize">{transaction.type}</span>
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
      </Card>
    </div>
  );
}
