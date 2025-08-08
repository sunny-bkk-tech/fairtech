import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./lib/auth";
import { LanguageProvider } from "./components/providers/language-provider";
import HomePage from "@/pages/home";
import AuthPage from "@/pages/auth";
import TopUpPage from "@/pages/top-up";
import QRScannerPage from "@/pages/qr-scanner";
import VendorDashboardPage from "@/pages/vendor-dashboard";
import TransactionHistoryPage from "@/pages/transaction-history";
import ExchangePage from "@/pages/exchange";
import ProfilePage from "@/pages/profile";
import AdminDashboardPage from "@/pages/admin-dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/top-up" component={TopUpPage} />
      <Route path="/qr-scanner" component={QRScannerPage} />
      <Route path="/vendor" component={VendorDashboardPage} />
      <Route path="/history" component={TransactionHistoryPage} />
      <Route path="/exchange" component={ExchangePage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/admin" component={AdminDashboardPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <AuthProvider>
            <Toaster />
            <Router />
          </AuthProvider>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
