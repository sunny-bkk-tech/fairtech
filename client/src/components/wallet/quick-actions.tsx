import { Plus, QrCode } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export function QuickActions() {
  const [, setLocation] = useLocation();

  return (
    <div className="px-4 mb-6">
      <div className="grid grid-cols-2 gap-4">
        <Button 
          className="bg-blue-700 hover:bg-blue-900 text-white rounded-2xl p-4 h-auto shadow-md transition-colors"
          onClick={() => setLocation("/top-up")}
        >
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center mb-2">
              <Plus className="w-6 h-6" />
            </div>
            <div className="font-semibold">Top Up</div>
            <div className="text-xs opacity-80">Add funds</div>
          </div>
        </Button>
        
        <Button 
          className="bg-teal-700 hover:bg-teal-900 text-white rounded-2xl p-4 h-auto shadow-md transition-colors"
          onClick={() => setLocation("/qr-scanner")}
        >
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center mb-2">
              <QrCode className="w-6 h-6" />
            </div>
            <div className="font-semibold">Pay QR</div>
            <div className="text-xs opacity-80">Scan & pay</div>
          </div>
        </Button>
      </div>
    </div>
  );
}
