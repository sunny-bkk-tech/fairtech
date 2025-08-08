import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { MobileHeader } from "@/components/layout/mobile-header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Users, Store, CreditCard, TrendingUp, Check, X, LogOut } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function AdminDashboardPage() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      setLocation("/auth");
    }
  }, [user, authLoading, setLocation]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: !!user && user.role === 'admin',
  });

  const { data: vendors = [], isLoading: vendorsLoading } = useQuery({
    queryKey: ["/api/admin/vendors"],
    enabled: !!user && user.role === 'admin',
  });

  const approveMutation = useMutation({
    mutationFn: async (vendorId: string) => {
      const response = await apiRequest("POST", `/api/admin/vendors/${vendorId}/approve`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Vendor Approved",
        description: "The vendor has been successfully approved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/vendors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Approval Failed",
        description: error.message || "Failed to approve vendor",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ vendorId, reason }: { vendorId: string; reason: string }) => {
      const response = await apiRequest("POST", `/api/admin/vendors/${vendorId}/reject`, { reason });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Vendor Rejected",
        description: "The vendor application has been rejected.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/vendors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setRejectionReason("");
      setSelectedVendor(null);
    },
    onError: (error: any) => {
      toast({
        title: "Rejection Failed",
        description: error.message || "Failed to reject vendor",
        variant: "destructive",
      });
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  const handleApprove = (vendorId: string) => {
    approveMutation.mutate(vendorId);
  };

  const handleReject = (vendor: any) => {
    setSelectedVendor(vendor);
  };

  const confirmReject = () => {
    if (selectedVendor && rejectionReason.trim()) {
      rejectMutation.mutate({
        vendorId: selectedVendor.id,
        reason: rejectionReason.trim(),
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-700">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader title="Admin Dashboard" showLogout={true} />
      
      <div className="pt-16 pb-20 p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation("/")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="rounded-2xl shadow-md">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {statsLoading ? "..." : stats?.totalUsers || 0}
              </div>
              <div className="text-xs text-gray-500">Total Users</div>
            </CardContent>
          </Card>
          
          <Card className="rounded-2xl shadow-md">
            <CardContent className="p-4 text-center">
              <Store className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {statsLoading ? "..." : stats?.totalVendors || 0}
              </div>
              <div className="text-xs text-gray-500">Total Vendors</div>
            </CardContent>
          </Card>
          
          <Card className="rounded-2xl shadow-md">
            <CardContent className="p-4 text-center">
              <CreditCard className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {statsLoading ? "..." : stats?.totalTransactions || 0}
              </div>
              <div className="text-xs text-gray-500">Transactions</div>
            </CardContent>
          </Card>
          
          <Card className="rounded-2xl shadow-md">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {statsLoading ? "..." : stats?.pendingVendors || 0}
              </div>
              <div className="text-xs text-gray-500">Pending Reviews</div>
            </CardContent>
          </Card>
        </div>

        {/* Vendor Applications */}
        <Card className="rounded-2xl shadow-md">
          <CardHeader>
            <CardTitle>Vendor Applications</CardTitle>
          </CardHeader>
          <CardContent>
            {vendorsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 border border-gray-200 rounded-xl animate-pulse">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                      <div className="h-8 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : vendors.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No vendor applications found
              </div>
            ) : (
              <div className="space-y-4">
                {vendors.map((vendor: any) => (
                  <div key={vendor.id} className="p-4 border border-gray-200 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{vendor.businessName}</h4>
                        <p className="text-sm text-gray-600">{vendor.businessType}</p>
                        <p className="text-xs text-gray-500">{vendor.businessAddress}</p>
                      </div>
                      {getStatusBadge(vendor.status)}
                    </div>
                    
                    {vendor.businessLicense && (
                      <p className="text-xs text-gray-600 mb-2">
                        <span className="font-medium">License:</span> {vendor.businessLicense}
                      </p>
                    )}
                    
                    {vendor.rejectionReason && (
                      <p className="text-xs text-red-600 mb-2">
                        <span className="font-medium">Rejection reason:</span> {vendor.rejectionReason}
                      </p>
                    )}
                    
                    <div className="text-xs text-gray-500 mb-3">
                      Applied: {new Date(vendor.createdAt).toLocaleDateString()}
                    </div>
                    
                    {vendor.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(vendor.id)}
                          disabled={approveMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(vendor)}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reject Vendor Application</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <p className="text-sm text-gray-600">
                                Please provide a reason for rejecting {vendor.businessName}:
                              </p>
                              <Textarea
                                placeholder="Enter rejection reason..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                              />
                              <div className="flex gap-2">
                                <Button
                                  onClick={confirmReject}
                                  disabled={!rejectionReason.trim() || rejectMutation.isPending}
                                  variant="destructive"
                                >
                                  Confirm Rejection
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <BottomNavigation />
    </div>
  );
}