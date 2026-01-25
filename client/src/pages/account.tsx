import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, MapPin, CreditCard, Bell, HelpCircle, LogOut, Package, Settings } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Account() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [me, setMe] = useState(null);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [activeMenu, setActiveMenu] = useState("profile");

  // Fetch user data
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setMe(data);
          if (data) {
            setProfile({
              name: data.name || "",
              email: data.email || "",
            });
          }
        } else {
          navigate("/login");
        }
      } catch (error) {
        navigate("/login");
      }
    })();
  }, [navigate]);

  // Fetch user orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders"],
    enabled: !!me,
    queryFn: async () => {
      const res = await fetch("/api/orders", { credentials: "include" });
      if (!res.ok) {
        if (res.status === 401 || res.status === 404) {
          return [];
        }
        throw new Error("Failed to fetch orders");
      }
      return res.json();
    },
    refetchInterval: 5000,
  });

  // Fetch saved addresses
  const { data: addresses = [], isLoading: addressesLoading } = useQuery({
    queryKey: ["/api/profile/addresses"],
    enabled: !!me,
    queryFn: async () => {
      const res = await fetch("/api/profile/addresses", { credentials: "include" });
      if (!res.ok) {
        if (res.status === 401) {
          return [];
        }
        throw new Error("Failed to fetch addresses");
      }
      return res.json();
    },
  });

  // Fetch saved payment methods
  const { data: paymentMethods = [], isLoading: paymentMethodsLoading } = useQuery({
    queryKey: ["/api/profile/payment-methods"],
    enabled: !!me,
    queryFn: async () => {
      const res = await fetch("/api/profile/payment-methods", { credentials: "include" });
      if (!res.ok) {
        if (res.status === 401) {
          return [];
        }
        throw new Error("Failed to fetch payment methods");
      }
      return res.json();
    },
  });

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(profile),
      });
      if (!res.ok) {
        throw new Error("Failed to update profile");
      }
      const data = await res.json();
      setMe(data);
      setProfile({
        name: data.name || "",
        email: data.email || "",
      });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast({ title: "Order Cancelled", description: data.message });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleRetryPayment = async (orderId: number) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast({ title: "Payment Initiated", description: "M-Pesa STK Push sent to your phone." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  if (!me) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Account</h1>
        <Link href="/">
          <Button variant="outline" data-testid="button-back-to-home">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Account Menu */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">Account Menu</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveMenu("profile")}
                  className={`w-full text-left p-3 rounded-lg transition-colors flex items-center space-x-3 ${activeMenu === "profile" ? "bg-primary text-primary-foreground" : "hover:bg-gray-50"
                    }`}
                >
                  <Settings className="h-5 w-5" />
                  <span>Profile Information</span>
                </button>
                <button
                  onClick={() => setActiveMenu("orders")}
                  className={`w-full text-left p-3 rounded-lg transition-colors flex items-center space-x-3 ${activeMenu === "orders" ? "bg-primary text-primary-foreground" : "hover:bg-gray-50"
                    }`}
                >
                  <Package className="h-5 w-5" />
                  <span>Order History</span>
                </button>
                <button
                  onClick={() => setActiveMenu("addresses")}
                  className={`w-full text-left p-3 rounded-lg transition-colors flex items-center space-x-3 ${activeMenu === "addresses" ? "bg-primary text-primary-foreground" : "hover:bg-gray-50"
                    }`}
                >
                  <MapPin className="h-5 w-5" />
                  <span>Delivery Addresses</span>
                </button>
                <button
                  onClick={() => setActiveMenu("payment")}
                  className={`w-full text-left p-3 rounded-lg transition-colors flex items-center space-x-3 ${activeMenu === "payment" ? "bg-primary text-primary-foreground" : "hover:bg-gray-50"
                    }`}
                >
                  <CreditCard className="h-5 w-5" />
                  <span>Payment Methods</span>
                </button>
                <button
                  onClick={() => setActiveMenu("notifications")}
                  className={`w-full text-left p-3 rounded-lg transition-colors flex items-center space-x-3 ${activeMenu === "notifications" ? "bg-primary text-primary-foreground" : "hover:bg-gray-50"
                    }`}
                >
                  <Bell className="h-5 w-5" />
                  <span>Notifications</span>
                </button>
                <button
                  onClick={() => setActiveMenu("help")}
                  className={`w-full text-left p-3 rounded-lg transition-colors flex items-center space-x-3 ${activeMenu === "help" ? "bg-primary text-primary-foreground" : "hover:bg-gray-50"
                    }`}
                >
                  <HelpCircle className="h-5 w-5" />
                  <span>Help & Support</span>
                </button>
                <button
                  onClick={async () => {
                    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
                    navigate("/");
                  }}
                  className="w-full text-left p-3 rounded-lg hover:bg-red-50 transition-colors flex items-center space-x-3 text-red-600"
                  data-testid="button-sign-out"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Information */}
          {activeMenu === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" value={me.username || ""} disabled />
                  <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
                </div>
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    placeholder="Enter your email"
                  />
                </div>
                <Button onClick={handleUpdateProfile} disabled={loading} className="w-full">
                  {loading ? "Updating..." : "Update Profile"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Order History */}
          {activeMenu === "orders" && (
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="text-center py-8 text-gray-500">Loading orders...</div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No orders yet</p>
                    <p className="text-sm mt-2">Your order history will appear here</p>
                    <Link href="/">
                      <Button className="mt-4">Start Shopping</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order: any) => {
                      let items = [];
                      try {
                        items = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
                      } catch {
                        items = [];
                      }
                      return (
                        <div key={order.id} className="border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-semibold">Order #{order.id}</h4>
                              <p className="text-sm text-gray-600">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">KSh {parseFloat(order.total).toFixed(2)}</p>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${order.orderStatus === "delivered"
                                  ? "bg-green-100 text-green-800"
                                  : order.orderStatus === "processing"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-yellow-100 text-yellow-800"
                                  }`}
                              >
                                {order.orderStatus}
                              </span>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            {items.length > 0
                              ? items.map((item: any) => item.name).join(", ")
                              : "No items"}
                          </div>
                          <div className="text-xs text-gray-500">
                            Payment: {order.paymentStatus} | Method: {order.paymentMethod}
                          </div>

                          {order.paymentStatus === "pending" && order.orderStatus !== "cancelled" && (
                            <div className="flex space-x-2 mt-3 justify-end pt-2 border-t border-gray-100">
                              <Button variant="outline" size="sm" onClick={() => handleCancelOrder(order.id)} className="text-red-600 border-red-200 hover:bg-red-50">Cancel Order</Button>
                              <Button size="sm" onClick={() => handleRetryPayment(order.id)}>Retry Payment</Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Delivery Addresses */}
          {activeMenu === "addresses" && (
            <Card>
              <CardHeader>
                <CardTitle>Delivery Addresses</CardTitle>
              </CardHeader>
              <CardContent>
                {addressesLoading ? (
                  <div className="text-center py-8 text-gray-500">Loading addresses...</div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No saved addresses</p>
                    <p className="text-sm mt-2">Add delivery addresses during checkout</p>
                    <Link href="/">
                      <Button className="mt-4">Start Shopping</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {addresses.map((addr: any) => (
                      <div key={addr.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              {addr.isDefault && (
                                <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="font-medium">{addr.address}</p>
                            <p className="text-sm text-gray-600 mt-1">Phone: {addr.phone}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              Added: {new Date(addr.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Payment Methods */}
          {activeMenu === "payment" && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                {paymentMethodsLoading ? (
                  <div className="text-center py-8 text-gray-500">Loading payment methods...</div>
                ) : paymentMethods.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No saved payment methods</p>
                    <p className="text-sm mt-2">Payment methods are saved during checkout</p>
                    <Link href="/">
                      <Button className="mt-4">Start Shopping</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paymentMethods.map((pm: any) => {
                      let details = null;
                      try {
                        details = pm.details ? JSON.parse(pm.details) : null;
                      } catch { }
                      return (
                        <div key={pm.id} className="border border-border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <CreditCard className="h-4 w-4 text-gray-500" />
                                <span className="font-medium capitalize">{pm.method}</span>
                                {pm.isDefault && (
                                  <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                                    Default
                                  </span>
                                )}
                              </div>
                              {details && details.phone && (
                                <p className="text-sm text-gray-600 mt-1">Phone: {details.phone}</p>
                              )}
                              <p className="text-xs text-gray-500 mt-2">
                                Added: {new Date(pm.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Notifications */}
          {activeMenu === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-500">Receive updates about your orders</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">SMS Notifications</p>
                      <p className="text-sm text-gray-500">Receive order updates via SMS</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Promotional Emails</p>
                      <p className="text-sm text-gray-500">Receive offers and promotions</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Help & Support */}
          {activeMenu === "help" && (
            <Card>
              <CardHeader>
                <CardTitle>Help & Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Frequently Asked Questions</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Q: How do I track my order?</strong></p>
                    <p className="text-gray-600">A: You can track your order from the Order History section once your order is placed.</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Contact Us</h4>
                  <p className="text-sm text-gray-600">Email: support@grocerysync.com</p>
                  <p className="text-sm text-gray-600">Phone: +254 700 000 000</p>
                </div>
                <Button variant="outline" className="w-full">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
