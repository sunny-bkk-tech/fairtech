import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Camera, X, CameraOff, Info, QrCode, Flashlight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/currency";
import { useTranslation } from "@/components/providers/language-provider";
import { MobileHeader } from "@/components/layout/mobile-header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";

// Payment Instructions Component
const PaymentInstructions = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
    <Card className="max-w-md w-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">How to Pay</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
        </div>
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-600 mb-2">Step 1: Find a Merchant</h4>
            <p className="text-gray-600">Look for merchants with FairPay QR codes displayed at their store.</p>
          </div>
          <div>
            <h4 className="font-medium text-blue-600 mb-2">Step 2: Scan QR Code</h4>
            <p className="text-gray-600">Use this scanner to scan the merchant's payment QR code. Allow camera access when prompted.</p>
          </div>
          <div>
            <h4 className="font-medium text-blue-600 mb-2">Step 3: Confirm Payment</h4>
            <p className="text-gray-600">Review the amount and merchant details, then confirm the payment from your LAK wallet.</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-blue-800 text-xs">
              <strong>Note:</strong> Make sure you have sufficient LAK balance in your wallet before attempting to pay.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);


export default function QRScannerPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isScanning, setIsScanning] = useState(true);
  const [scannedData, setScannedData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/auth");
    }
  }, [user, authLoading, setLocation]);

  useEffect(() => {
    if (isScanning && user) {
      startCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isScanning, user]);

  const startCamera = async () => {
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported on this device');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        streamRef.current = stream;
        setHasCamera(true);
      }
    } catch (error) {
      console.error('Camera access error:', error);
      setHasCamera(false);
      toast({
        title: "Camera Access Required",
        description: "Please allow camera access to scan QR codes or use the demo scan feature",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

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

  // Simulate QR scanning for demo (in real app, would use QR detection library)
  const simulateQRScan = () => {
    const mockQRData = {
      vendorId: "vendor-123",
      amount: "95000",
      currency: "LAK",
      description: "Coffee and pastry"
    };

    setScannedData(mockQRData);
    setIsScanning(false);
    stopCamera();
  };

  const handlePayment = async () => {
    if (!scannedData) return;

    setIsProcessing(true);
    try {
      const response = await apiRequest("POST", "/api/qr-payment", scannedData);
      const result = await response.json();

      if (result.success) {
        toast({
          title: "Payment Successful",
          description: `Paid ${formatCurrency(scannedData.amount, scannedData.currency)}`,
        });
        setLocation("/");
      } else {
        throw new Error("Payment failed");
      }
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message || "Unable to process payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetScanner = () => {
    setScannedData(null);
    setIsScanning(true);
  };

  const toggleFlashlight = async () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      if (track && 'torch' in track.getCapabilities()) {
        try {
          const currentConstraints = track.getConstraints();
          await track.applyConstraints({
            ...currentConstraints,
            // @ts-ignore - torch is experimental API
            advanced: [{ torch: !currentConstraints.advanced?.[0]?.torch }]
          });
        } catch (error) {
          console.error('Flashlight not supported:', error);
        }
      }
    }
  };

  if (!isScanning && scannedData) {
    return (
      <div className="min-h-screen bg-blue-50">
        <MobileHeader title="Confirm Payment" />

        <div className="pt-16 pb-20 p-4">
          <Card className="max-w-md mx-auto border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={resetScanner}
                className="w-fit p-0 mb-6 text-blue-600 hover:bg-blue-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Scan Again
              </Button>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <QrCode className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-blue-900">Customer Payment</h3>
                <p className="text-blue-600 text-sm">Confirm amount to pay merchant</p>
              </div>

              <Card className="bg-blue-50 mb-6 border border-blue-200">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-700 font-medium">{t('amount')}</span>
                      <div className="text-right">
                        <span className="font-bold text-lg text-blue-900">
                          {formatCurrency(scannedData.amount, scannedData.currency)}
                        </span>
                        <div className="text-xs text-blue-600">You will pay</div>
                      </div>
                    </div>
                    {scannedData.description && (
                      <div className="flex justify-between">
                        <span className="text-blue-600">{t('description')}</span>
                        <span className="text-blue-900 font-medium">{scannedData.description}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-blue-600">{t('vendorId')}</span>
                      <span className="text-sm font-mono text-blue-700">{scannedData.vendorId}</span>
                    </div>
                    <div className="border-t border-blue-200 pt-2 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-blue-600 text-sm">Payment method</span>
                        <span className="text-blue-800 text-sm font-medium">LAK Wallet</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                  onClick={handlePayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      Pay {formatCurrency(scannedData.amount, scannedData.currency)}
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-blue-300 text-blue-600 hover:bg-blue-50"
                  onClick={() => setLocation("/")}
                >
                  Cancel Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <BottomNavigation />
      </div>
    );
  }

  const handleQRScan = () => {
    simulateQRScan();
  }

  return (
    <div className="min-h-screen bg-black relative">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 text-white z-10 relative">
          <h2 className="text-lg font-semibold">{t('scanQRCode')}</h2>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowInstructions(true)}
              className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 text-white"
            >
              <Info className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center relative">
          {/* Camera viewport */}
          {hasCamera ? (
            <div className="relative w-80 h-80">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover rounded-2xl"
              />

              {/* QR Scanner overlay */}
              <div className="absolute inset-0 border-2 border-white rounded-2xl">
                <div className="absolute inset-4 border border-dashed border-white opacity-50 rounded-xl"></div>
                <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-white"></div>
                <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-white"></div>
                <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-white"></div>
                <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-white"></div>
              </div>

              {/* Demo scan button overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  onClick={() => handleQRScan()}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl p-4"
                >
                  <QrCode className="w-8 h-8 text-white" />
                </Button>
              </div>
            </div>
          ) : (
            /* Fallback when camera is not available */
            <div className="relative w-80 h-80 border-2 border-white rounded-2xl flex items-center justify-center">
              <div className="text-center text-white">
                <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-sm mb-4">Camera not available</p>
                <Button
                  onClick={() => handleQRScan()}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl p-4"
                >
                  <QrCode className="w-8 h-8 text-white mr-2" />
                  Demo Scan
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 text-center z-10 relative">
          <p className="text-white text-sm mb-2">Position QR code within the frame</p>
          <p className="text-white/80 text-xs mb-4">
            {!hasCamera ? "Camera not available - using demo mode" : "Allow camera access in browser settings"}
          </p>
          <div className="flex gap-3 justify-center">
            <Button 
              className="bg-white text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-xl font-medium text-sm"
              onClick={toggleFlashlight}
            >
              <Flashlight className="w-4 h-4 mr-2" />
              Flash
            </Button>
            <Button 
              className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-xl font-medium text-sm"
              onClick={() => handleQRScan()}
            >
              Demo Scan
            </Button>
          </div>
        </div>
      </div>

      {showInstructions && (
        <PaymentInstructions onClose={() => setShowInstructions(false)} />
      )}
    </div>
  );
}