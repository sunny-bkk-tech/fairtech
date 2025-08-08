import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { MobileHeader } from "@/components/layout/mobile-header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { QRGenerator } from "@/components/vendor/qr-generator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Store, Check, TrendingUp, CheckCircle, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useTranslation } from "@/components/providers/language-provider";
import type { Transaction, Vendor } from "@shared/schema";


export default function VendorDashboardPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();

  // Fetch vendor data with proper typing
  const { data: vendor } = useQuery<Vendor>({
    queryKey: ["/api/vendors/me"],
    enabled: !!user,
  });

  // Fetch vendor payments with proper typing
  const { data: vendorPayments = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions/vendor"],
    enabled: !!user,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/auth");
      return;
    }

    if (user && !["admin", "vendor"].includes(user.role)) {
      setLocation("/");
      return;
    }

    if (user?.role === "vendor" && (!vendor || !vendor.isVerified)) {
      setLocation("/");
    }
  }, [user, authLoading, vendor, setLocation]);

  // Calculate today's earnings
  const todaysEarnings = vendorPayments
    .filter((tx) => {
      if (!tx.createdAt) return false; // Skip transactions with null createdAt
      const txDate = new Date(tx.createdAt);
      const today = new Date();
      return (
        txDate.getDate() === today.getDate() &&
        txDate.getMonth() === today.getMonth() &&
        txDate.getFullYear() === today.getFullYear()
      );
    })
    .reduce((sum, tx) => sum + parseFloat(tx.amount || "0"), 0);

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

  const getRoleStyles = () => {
    if (user.role === "admin") {
      return {
        bgColor: "bg-red-50",
        borderColor: "border-l-red-500",
        gradient: "from-red-500 to-red-600",
        textColor: "text-red-800",
        lightBg: "bg-red-50",
        lightBorder: "border-red-200",
      };
    } else {
      return {
        bgColor: "bg-green-50",
        borderColor: "border-l-green-500",
        gradient: "from-green-500 to-green-600",
        textColor: "text-green-800",
        lightBg: "bg-green-50",
        lightBorder: "border-green-200",
      };
    }
  };

  const roleStyles = getRoleStyles();
  const roleLabel =
    user.role === "admin" ? t("adminPortal") : t("merchantPortal");

  return (
    <div className={`min-h-screen ${roleStyles.bgColor}`}>
      <MobileHeader title={t("merchantDashboard")} />

      <div className="pt-16 pb-20 p-4 space-y-6">
        {/* Merchant Welcome Header */}
        <Card
          className={`rounded-2xl shadow-lg ${roleStyles.borderColor} bg-gradient-to-r ${roleStyles.gradient} text-white`}
        >
          <CardHeader className="text-center pb-4">
            <div
              className={`w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4`}
            >
              <Store className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              {roleLabel}
            </CardTitle>
            <p className="text-white/90 mt-2">{t("acceptPaymentsWithQR")}</p>
            <div className="mt-3 px-3 py-1 bg-white/20 rounded-full inline-block">
              <span className="text-sm font-medium">
                {t("welcome")}, {user.username}
              </span>
            </div>
          </CardHeader>
        </Card>

        {/* Earnings Summary */}
        <Card className={`rounded-2xl shadow-md ${roleStyles.borderColor}`}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle className={`text-lg ${roleStyles.textColor}`}>
                  {t("todaysPerformance")}
                </CardTitle>
                <p className={`text-sm ${roleStyles.textColor}`}>
                  {t("earningsSummary")}
                </p>
              </div>
              <div
                className={`w-12 h-12 ${roleStyles.lightBg} rounded-full flex items-center justify-center`}
              >
                <TrendingUp className={`w-6 h-6 ${roleStyles.textColor}`} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div
                className={`p-4 ${roleStyles.lightBg} rounded-xl border ${roleStyles.lightBorder}`}
              >
                <div className="text-center">
                  <div
                    className={`text-2xl font-bold ${roleStyles.textColor} mb-1`}
                  >
                    {formatCurrency(todaysEarnings.toString(), "LAK")}
                  </div>
                  <div className={`text-xs ${roleStyles.textColor}`}>
                    {t("todaysEarnings")}
                  </div>
                </div>
              </div>
              <div
                className={`p-4 ${roleStyles.lightBg} rounded-xl border ${roleStyles.lightBorder}`}
              >
                <div className="text-center">
                  <div
                    className={`text-2xl font-bold ${roleStyles.textColor} mb-1`}
                  >
                    {
                      vendorPayments.filter((tx) => {
                        const txDate = new Date(tx.createdAt);
                        const today = new Date();
                        return (
                          txDate.getDate() === today.getDate() &&
                          txDate.getMonth() === today.getMonth() &&
                          txDate.getFullYear() === today.getFullYear()
                        );
                      }).length
                    }
                  </div>
                  <div className={`text-xs ${roleStyles.textColor}`}>
                    {t("paymentsToday")}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* QR Generator - Only show if user is admin or verified merchant */}
        {(user.role === "admin" ||
          (user.role === "vendor" && vendor?.isVerified && vendor?.id)) && (
          <QRGenerator vendorId={vendor?.id || user.id} />
        )}

        {/* Recent Payments Received */}
        <Card className="rounded-2xl shadow-md border-l-4 border-l-blue-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-blue-900">
                {t("recentPayments")}
              </CardTitle>
              <Badge
                variant="outline"
                className="text-blue-600 border-blue-300"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                {t("settled")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {vendorPayments.length > 0 ? (
              <div className="space-y-3">
                {vendorPayments.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-900">
                          {transaction.description || t("paymentReceived")}
                        </p>
                        <p className="text-xs text-blue-600">
                          {transaction.createdAt
                            ? new Date(transaction.createdAt).toLocaleString()
                            : t("dateNotAvailable")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-blue-800">
                        +
                        {formatCurrency(
                          transaction.amount,
                          transaction.fromCurrency || "LAK"
                        )}
                      </p>
                      <div className="flex items-center text-xs text-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {t("settled")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm">{t("noPaymentsReceived")}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {t("generateQRForFirstPayment")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
}
