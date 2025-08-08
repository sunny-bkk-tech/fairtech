import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Share2, QrCode, CheckCircle, Clock, DollarSign } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { generateQRPaymentData } from "@/lib/qr";
import { formatCurrency } from "@/lib/currency";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface QRGeneratorProps {
  vendorId: string;
}

export function QRGenerator({ vendorId }: QRGeneratorProps) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [qrData, setQrData] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<'waiting' | 'received' | null>(null);
  const [paymentId, setPaymentId] = useState<string>("");

  // Poll for payment status when QR is active
  const { data: recentTransactions } = useQuery({
    queryKey: ["/api/transactions"],
    refetchInterval: paymentStatus === 'waiting' ? 2000 : false, // Poll every 2 seconds when waiting
    enabled: paymentStatus === 'waiting',
  });

  useEffect(() => {
    if (paymentStatus === 'waiting' && recentTransactions && amount) {
      // Check if a recent payment matches our expected amount
      const expectedAmount = parseFloat(amount);
      const recentPayment = recentTransactions.find((transaction: any) => 
        transaction.vendorId === vendorId && 
        parseFloat(transaction.amount) === expectedAmount &&
        transaction.status === 'completed' &&
        new Date(transaction.createdAt).getTime() > Date.now() - 30000 // Within last 30 seconds
      );

      if (recentPayment) {
        setPaymentStatus('received');
        setPaymentId(recentPayment.id);
        // Auto-reset after 5 seconds
        setTimeout(() => {
          setPaymentStatus(null);
          setQrData("");
          setAmount("");
          setDescription("");
          setPaymentId("");
        }, 5000);
      }
    }
  }, [recentTransactions, amount, vendorId, paymentStatus]);

  const generateQR = () => {
    if (!amount || parseFloat(amount) <= 0) return;

    const qrPaymentData = {
      vendorId: vendorId || "demo-vendor", // Use actual vendor ID or fallback
      amount,
      currency: 'LAK',
      description
    };

    const qrString = generateQRPaymentData(qrPaymentData);
    setQrData(qrString);
    setPaymentStatus('waiting');
  };

  const shareQR = async () => {
    if (navigator.share && qrData) {
      try {
        await navigator.share({
          title: 'Payment QR Code',
          text: `Pay ${formatCurrency(amount, 'LAK')} - ${description || 'Payment'}`,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }
  };

  return (
    <Card className="rounded-2xl shadow-lg p-6 mb-6 border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-green-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-xl text-green-800 mb-1">Generate Payment QR</h3>
          <p className="text-sm text-green-600">Create QR code for customers to pay you</p>
        </div>
        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
          <QrCode className="w-6 h-6 text-white" />
        </div>
      </div>

      <div className="space-y-5 mb-6">
        <div className="bg-white rounded-xl p-4 border-2 border-green-200">
          <Label htmlFor="amount" className="text-sm font-semibold text-green-800 mb-3 block flex items-center">
            <DollarSign className="w-4 h-4 mr-2" />
            Amount to Receive (LAK)
          </Label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-600 font-bold text-lg">₭</span>
            <Input
              id="amount"
              type="number"
              placeholder="95,000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-10 h-12 text-lg font-semibold border-green-300 focus:border-green-500 bg-green-50 focus:bg-white"
              disabled={paymentStatus === 'waiting'}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border-2 border-green-200">
          <Label htmlFor="description" className="text-sm font-semibold text-green-800 mb-3 block">
            Payment Description (Optional)
          </Label>
          <Input
            id="description"
            type="text"
            placeholder="Coffee and pastry"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-12 border-green-300 focus:border-green-500 bg-green-50 focus:bg-white"
            disabled={paymentStatus === 'waiting'}
          />
        </div>
      </div>

      {/* Generated QR Code with Status */}
      <div className={`rounded-2xl p-8 text-center mb-6 transition-all duration-300 border-2 ${
        paymentStatus === 'received' 
          ? 'bg-green-100 border-green-300 shadow-lg' 
          : paymentStatus === 'waiting'
          ? 'bg-blue-100 border-blue-300 animate-pulse shadow-lg'
          : 'bg-white border-gray-200 shadow-sm'
      }`}>
        {paymentStatus === 'received' ? (
          <div className="w-48 h-48 bg-green-100 rounded-xl shadow-sm mx-auto mb-4 flex items-center justify-center">
            <div className="text-center text-green-600">
              <CheckCircle className="w-16 h-16 mx-auto mb-2" />
              <p className="text-lg font-semibold">Payment Received!</p>
              <p className="text-sm">{formatCurrency(amount, 'LAK')}</p>
            </div>
          </div>
        ) : qrData ? (
          <div className="relative">
            <div className="w-48 h-48 bg-white rounded-xl shadow-sm mx-auto mb-4 flex items-center justify-center p-4">
              <QRCodeSVG value={qrData} size={192} />
            </div>
            {paymentStatus === 'waiting' && (
              <div className="absolute top-0 right-0 bg-blue-500 text-white rounded-full p-2">
                <Clock className="w-4 h-4 animate-spin" />
              </div>
            )}
          </div>
        ) : (
          <div className="w-48 h-48 bg-white rounded-xl shadow-sm mx-auto mb-4 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <QrCode className="w-16 h-16 mx-auto mb-2" />
              <p className="text-sm">Enter amount to generate payment QR</p>
            </div>
          </div>
        )}

        {paymentStatus === 'waiting' ? (
          <div className="text-center">
            <p className="text-sm text-blue-600 font-medium mb-1">Waiting for Payment</p>
            <p className="text-xs text-blue-500">Customer should scan this code</p>
            <div className="mt-2">
              <Badge variant="outline" className="text-blue-600 border-blue-300">
                {formatCurrency(amount, 'LAK')}
              </Badge>
            </div>
          </div>
        ) : paymentStatus === 'received' ? (
          <div className="text-center">
            <p className="text-sm text-green-600 font-medium">Settlement in progress...</p>
            <p className="text-xs text-green-500">Payment ID: {paymentId.slice(0, 8)}...</p>
          </div>
        ) : (
          <p className="text-sm text-gray-600">Show this QR code to customer for payment</p>
        )}
      </div>

      <div className="flex flex-col space-y-3">
        {paymentStatus === 'received' ? (
          <Button 
            className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold text-lg shadow-lg"
            onClick={() => {
              setPaymentStatus(null);
              setQrData("");
              setAmount("");
              setDescription("");
              setPaymentId("");
            }}
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Create New Payment QR
          </Button>
        ) : paymentStatus === 'waiting' ? (
          <div className="flex space-x-3">
            <Button 
              variant="outline"
              className="flex-1 h-12 border-red-300 text-red-600 hover:bg-red-50 font-semibold"
              onClick={() => {
                setPaymentStatus(null);
                setQrData("");
              }}
            >
              Cancel Payment
            </Button>
            <Button 
              variant="outline"
              className="px-6 h-12 border-blue-300 text-blue-600 hover:bg-blue-50"
              onClick={shareQR}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Button 
              className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold text-lg shadow-lg disabled:opacity-50"
              onClick={generateQR}
              disabled={!amount || parseFloat(amount) <= 0}
            >
              <QrCode className="w-5 h-5 mr-2" />
              Generate Payment QR Code
            </Button>
            {qrData && (
              <Button 
                variant="outline"
                className="w-full h-10 border-green-300 text-green-600 hover:bg-green-50"
                onClick={shareQR}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share QR Code
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}