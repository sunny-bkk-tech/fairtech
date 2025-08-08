import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { MobileHeader } from "@/components/layout/mobile-header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  CreditCard,
  Shield,
  Settings,
  LogOut,
  Globe,
  Phone,
  IdCard,
  Users,
  Store,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useTranslation } from "@/components/providers/language-provider";
import { LanguageSelector } from "@/components/ui/language-selector";
import { Vendor } from "@shared/schema";
export default function ProfilePage() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/auth");
    }
  }, [user, authLoading, setLocation]);

  const { data: wallets = [] } = useQuery({
    queryKey: ["/api/wallets"],
    enabled: !!user,
  });

  const { data: vendor } = useQuery<Vendor>({
    queryKey: ["/api/vendors/me"],
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

  const handleLogout = () => {
    logout();
    setLocation("/auth");
  };

  // Calculate total balance in USD
  const usdWallet = Array.isArray(wallets)
    ? wallets.find((w: any) => w.currency === "USD")
    : null;
  const totalUSD = usdWallet ? parseFloat(usdWallet.balance || "0") : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader title="Profile" />

      <div className="pt-16 pb-20 p-4">
        <LanguageSelector />
        {/* User Info Card */}
        <Card
          className={`rounded-2xl shadow-md mb-6 ${
            (user as any).role === "admin"
              ? "border-l-4 border-l-red-500"
              : vendor && vendor.isVerified
              ? "border-l-4 border-l-green-500"
              : "border-l-4 border-l-blue-500"
          }`}
        >
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  (user as any).role === "admin"
                    ? "bg-red-100"
                    : vendor && vendor.isVerified
                    ? "bg-green-100"
                    : "bg-blue-100"
                }`}
              >
                <User
                  className={`w-8 h-8 ${
                    (user as any).role === "admin"
                      ? "text-red-600"
                      : vendor && vendor.isVerified
                      ? "text-green-600"
                      : "text-blue-600"
                  }`}
                />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{user.username}</h3>
                <p className="text-gray-500 text-sm">{user.email}</p>
                <div className="flex items-center mt-1 space-x-2">
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-700"
                  >
                    {user.isVerified ? "Verified" : "Unverified"}
                  </Badge>
                  {(user as any).role && (
                    <Badge
                      variant={
                        (user as any).role === "admin"
                          ? "destructive"
                          : vendor && vendor.isVerified
                          ? "default"
                          : "secondary"
                      }
                      className={
                        (user as any).role === "admin"
                          ? "bg-red-100 text-red-700"
                          : vendor && vendor.isVerified
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }
                    >
                      {(user as any).role === "admin"
                        ? "Admin"
                        : vendor && vendor.isVerified
                        ? "Vendor"
                        : "User"}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {formatCurrency(totalUSD, "USD")}
                </div>
                <div className="text-xs text-gray-500">
                  {t("totalBalance")}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {Array.isArray(wallets) ? wallets.length : 0}
                </div>
                <div className="text-xs text-gray-500">
                  {t("activeWallets")}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card className="rounded-2xl shadow-md mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IdCard className="w-5 h-5" />
              {t("accountDetails")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="font-medium text-sm">{t("nationality")}</div>
                  <div className="text-xs text-gray-500">
                    {t("countryOfOrigin")}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-sm">{user.nationality}</div>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="font-medium text-sm">{t("phoneNumber")}</div>
                  <div className="text-xs text-gray-500">
                    {t("contactInformation")}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-sm">{user.phoneNumber}</div>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <IdCard className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="font-medium text-sm">
                    {t("passportNumber")}
                  </div>
                  <div className="text-xs text-gray-500">
                    {t("identityDocument")}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-sm font-mono">
                  {user.passportNumber.slice(0, 3)}***
                  {user.passportNumber.slice(-3)}
                </div>
              </div>
            </div>

            {(user as any).role && (
              <>
                <Separator />
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-gray-500" />
                    <div>
                      <div className="font-medium text-sm">
                        {t("accountType")}
                      </div>
                      <div className="text-xs text-gray-500">
                        {t("userRoleAndPermissions")}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="capitalize">
                      {(user as any).role}
                    </Badge>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Vendor Status */}
        {vendor && (
          <Card className="rounded-2xl shadow-md mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                {t("vendorStatus")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">
                    {vendor?.businessName || "Business Name"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {vendor?.businessType || "Business Type"}
                  </div>
                </div>
                <Badge variant={vendor?.isVerified ? "default" : "secondary"}>
                  {vendor?.isVerified ? "Verified" : "Pending"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Wallet Information */}
        <Card className="rounded-2xl shadow-md mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              {t("walletBalances")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Array.isArray(wallets) ? (
              <div className="space-y-3">
                {wallets.map((wallet: any) => (
                  <div
                    key={wallet.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-700 font-semibold text-xs">
                          {wallet.currency}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          {wallet.currency} Wallet
                        </div>
                        <div className="text-xs text-gray-500">
                          {t("availableBalance")}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm">
                        {formatCurrency(wallet.balance, wallet.currency)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                {t("loadingWalletInformation")}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Settings & Actions */}
        <Card className="rounded-2xl shadow-md mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              {t("settings")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {/* Merchant Portal - Only show for vendors/merchants who have been approved */}
            {vendor && vendor.isVerified && (
              <Button
                variant="ghost"
                className="w-full justify-start text-left p-3 hover:bg-green-50 border border-green-200"
                onClick={() => setLocation("/vendor")}
              >
                <Store className="w-5 h-5 mr-3 text-green-600" />
                <div>
                  <div className="font-medium text-sm text-green-700">
                    {t("merchantPortal")}
                  </div>
                  <div className="text-xs text-green-500">
                    {t("manageYourBusiness")}
                  </div>
                </div>
              </Button>
            )}

            {/* Admin Dashboard - Only show for admins */}
            {(user as any).role === "admin" && (
              <Button
                variant="ghost"
                className="w-full justify-start text-left p-3 hover:bg-red-50 border border-red-200"
                onClick={() => setLocation("/admin")}
              >
                <Users className="w-5 h-5 mr-3 text-red-600" />
                <div>
                  <div className="font-medium text-sm text-red-700">
                    {t("adminDashboard")}
                  </div>
                  <div className="text-xs text-red-500">
                    {t("manageVendorsAndSystem")}
                  </div>
                </div>
              </Button>
            )}

            <Button
              variant="ghost"
              className="w-full justify-start text-left p-3 hover:bg-blue-50 border border-blue-200"
              onClick={() => setLocation("/history")}
            >
              <CreditCard className="w-5 h-5 mr-3 text-blue-600" />
              <div>
                <div className="font-medium text-sm text-blue-700">
                  {t("transactionHistory")}
                </div>
                <div className="text-xs text-blue-500">
                  {t("viewAllTransactions")}
                </div>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Logout */}
        <Card className="rounded-2xl shadow-md">
          <CardContent className="p-4">
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t("signOut")}
            </Button>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
}
