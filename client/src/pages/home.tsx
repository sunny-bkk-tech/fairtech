import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import React, { useEffect } from "react";
import { MobileHeader } from "@/components/layout/mobile-header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { WalletOverview } from "@/components/wallet/wallet-overview";
import { QuickActions } from "@/components/wallet/quick-actions";
import { ExchangeRates } from "@/components/exchange/exchange-rates";
import { TransactionList } from "@/components/transactions/transaction-list";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store } from "lucide-react";
import { useTranslation } from "@/components/providers/language-provider";
import { useQuery } from "@tanstack/react-query";

type UserRole = "admin" | "vendor" | "user" | string;
type VendorData = {
  isVerified: boolean;
  [key: string]: any; // This allows for additional unknown properties
};
type RoleStyles = {
  gradient: string;
  textColor: string;
  indicatorColor: string;
};

const ROLE_STYLES: Record<string, RoleStyles> = {
  admin: {
    gradient: "bg-gradient-to-r from-red-600 to-red-700",
    textColor: "text-red-200",
    indicatorColor: "bg-red-400",
  },
  vendor: {
    gradient: "bg-gradient-to-r from-green-600 to-green-700",
    textColor: "text-green-200",
    indicatorColor: "bg-green-400",
  },
  user: {
    gradient: "bg-gradient-to-r from-blue-600 to-blue-700",
    textColor: "text-blue-200",
    indicatorColor: "bg-blue-400",
  },
};

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  // Always call hooks unconditionally at the top
  const { data: wallets = [] } = useQuery({
    queryKey: ["/api/wallets"],
    enabled: !!user,
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["/api/transactions"],
    enabled: !!user,
  });

  const { data: vendor } = useQuery<VendorData>({
    queryKey: ["/api/vendors/me"],
    enabled: !!user && (user.role === "admin" || user.role === "vendor"),
  });

  // Redirect unauthenticated users to /auth after loading completes
  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/auth");
    }
  }, [user, isLoading, setLocation]);

  // Show loading spinner while auth is loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Return null if user is not logged in (should redirect anyway)
  if (!user) {
    return null;
  }

  // Destructure user properties once
  const {
    role = "user",
    username,
    email,
    isVerified,
  } = user as {
    role?: UserRole;
    username: string;
    email: string;
    isVerified: boolean;
  };

  // Get role styles
  const currentRoleStyles = ROLE_STYLES[role] || ROLE_STYLES.user;
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
  console.log("role:", role);
  console.log("user.isVerified:", isVerified);
  console.log("vendor:", vendor);
const normalizedVendor = Object.keys(vendor || {}).length === 0 ? null : vendor;

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader />

      <div className="pt-16 pb-20">
        {/* Welcome Section */}
        <div className="px-4 mb-6">
          <Card
            className={`rounded-2xl p-6 ${currentRoleStyles.gradient} text-white shadow-lg`}
          >
            <div className="mb-4">
              <h2 className="text-xl font-bold">{t("welcomeBack")}!</h2>
              <p className="text-white/90 text-sm">
                {t("hello")} {username} • {email}
              </p>
              <p
                className={`${currentRoleStyles.textColor} text-sm font-medium`}
              >
                Role: {roleLabel}
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-sm text-white/90 mb-1">{t("accountStatus")}</p>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isVerified ? "bg-green-400" : "bg-yellow-400"
                  }`}
                />
                <span className="text-white font-medium text-sm">
                  {isVerified ? t("verifiedAccount") : t("pendingVerification")}
                </span>
              </div>
            </div>
          </Card>
        </div>

        <WalletOverview />
        <QuickActions />
        <ExchangeRates />
        <TransactionList />

        {/* Vendor Section - Only for admins and verified merchants */}
       {(role === "admin" || (role === "vendor" && (normalizedVendor?.isVerified || isVerified))) && (

          <div className="px-4 mb-6">
            <Card className="rounded-2xl p-6 accent-gradient text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{t("vendorTools")}</h3>
                  <p className="text-sm opacity-90">{t("acceptPayments")}</p>
                </div>
                <Store className="w-8 h-8 opacity-80" />
              </div>
              <Button
                className="bg-white text-orange-700 hover:bg-gray-100 font-semibold"
                onClick={() => setLocation("/vendor")}
              >
                {t("generateQrCode")}
              </Button>
            </Card>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
