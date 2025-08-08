import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wallet } from "lucide-react";

export default function AuthPage() {
  const { login, register, user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    passportNumber: "",
    phoneNumber: "",
    nationality: "",
    role: "user",
    password: "",
    confirmPassword: "",
  });

  // Redirect if already logged in
  if (user) {
    setLocation("/");
    return null;
  }

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  const result = await login(loginData.email, loginData.password);

  if (result.success) {
    toast({
      title: "Welcome back!",
      description: "You have been successfully logged in.",
    });
    setLocation("/");
  } else {
    toast({
      title: "Login Failed",
      description: result.error || "Invalid credentials. Please try again.",
      variant: "destructive",
    });
  }

  setIsLoading(false);
};

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Validate nationality for vendor accounts
    if (registerData.role === "vendor" && registerData.nationality !== "LA") {
      toast({
        title: "Invalid Account Type",
        description: "Merchant accounts are only available for Laos nationals",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...userData } = registerData;
      await register(userData);
      toast({
        title: "Welcome to FairPay!",
        description: "Your account has been created successfully.",
      });
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">FairPay Laos</CardTitle>
          <p className="text-gray-500">Cross-border payment solution</p>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-blue-700 hover:bg-blue-900"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    required
                    value={registerData.username}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, username: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="reg-email">Email</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    required
                    value={registerData.email}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="passport">Passport Number</Label>
                  <Input
                    id="passport"
                    required
                    value={registerData.passportNumber}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, passportNumber: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    required
                    value={registerData.phoneNumber}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="nationality">Nationality</Label>
                  <Select 
                    value={registerData.nationality} 
                    onValueChange={(value) => setRegisterData(prev => ({ ...prev, nationality: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select nationality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LA">Laos</SelectItem>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="TH">Thailand</SelectItem>
                      <SelectItem value="VN">Vietnam</SelectItem>
                      <SelectItem value="CN">China</SelectItem>
                      <SelectItem value="KR">South Korea</SelectItem>
                      <SelectItem value="JP">Japan</SelectItem>
                      <SelectItem value="SG">Singapore</SelectItem>
                      <SelectItem value="MY">Malaysia</SelectItem>
                      <SelectItem value="PH">Philippines</SelectItem>
                      <SelectItem value="ID">Indonesia</SelectItem>
                      <SelectItem value="MM">Myanmar</SelectItem>
                      <SelectItem value="KH">Cambodia</SelectItem>
                      <SelectItem value="BN">Brunei</SelectItem>
                      <SelectItem value="AU">Australia</SelectItem>
                      <SelectItem value="NZ">New Zealand</SelectItem>
                      <SelectItem value="IN">India</SelectItem>
                      <SelectItem value="BD">Bangladesh</SelectItem>
                      <SelectItem value="LK">Sri Lanka</SelectItem>
                      <SelectItem value="NP">Nepal</SelectItem>
                      <SelectItem value="GB">United Kingdom</SelectItem>
                      <SelectItem value="FR">France</SelectItem>
                      <SelectItem value="DE">Germany</SelectItem>
                      <SelectItem value="IT">Italy</SelectItem>
                      <SelectItem value="ES">Spain</SelectItem>
                      <SelectItem value="NL">Netherlands</SelectItem>
                      <SelectItem value="BE">Belgium</SelectItem>
                      <SelectItem value="CH">Switzerland</SelectItem>
                      <SelectItem value="AT">Austria</SelectItem>
                      <SelectItem value="SE">Sweden</SelectItem>
                      <SelectItem value="NO">Norway</SelectItem>
                      <SelectItem value="DK">Denmark</SelectItem>
                      <SelectItem value="FI">Finland</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="MX">Mexico</SelectItem>
                      <SelectItem value="BR">Brazil</SelectItem>
                      <SelectItem value="AR">Argentina</SelectItem>
                      <SelectItem value="CL">Chile</SelectItem>
                      <SelectItem value="CO">Colombia</SelectItem>
                      <SelectItem value="PE">Peru</SelectItem>
                      <SelectItem value="ZA">South Africa</SelectItem>
                      <SelectItem value="EG">Egypt</SelectItem>
                      <SelectItem value="NG">Nigeria</SelectItem>
                      <SelectItem value="KE">Kenya</SelectItem>
                      <SelectItem value="RU">Russia</SelectItem>
                      <SelectItem value="TR">Turkey</SelectItem>
                      <SelectItem value="IL">Israel</SelectItem>
                      <SelectItem value="AE">United Arab Emirates</SelectItem>
                      <SelectItem value="SA">Saudi Arabia</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="role">Account Type</Label>
                  <Select 
                    value={registerData.role} 
                    onValueChange={(value) => setRegisterData(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Individual User</SelectItem>
                      {registerData.nationality === "LA" && (
                        <SelectItem value="vendor">Merchant/Vendor (Laos only)</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {registerData.nationality && registerData.nationality !== "LA" && (
                    <p className="text-sm text-gray-500 mt-1">
                      Merchant accounts are only available for Laos nationals
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="reg-password">Password</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    required
                    value={registerData.password}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    required
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-blue-700 hover:bg-blue-900"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
