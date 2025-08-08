import { Home, QrCode, History, ArrowLeftRight, User } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/components/providers/language-provider";

export function BottomNavigation() {
  const [location, setLocation] = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/history", icon: History, label: "History" },
    { path: "/exchange", icon: ArrowLeftRight, label: "Exchange" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location === path;
          return (
            <button 
              key={path}
              onClick={() => setLocation(path)}
              className={`flex flex-col items-center py-2 px-3 ${
                isActive ? "text-blue-700" : "text-gray-500"
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{t(label)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}