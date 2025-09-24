import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, MapPin, CreditCard, Bell, HelpCircle, LogOut } from "lucide-react";

export default function Account() {
  const [profile, setProfile] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+254 712 345 678",
  });

  const orderHistory = [
    {
      id: "FM-2024-001",
      date: "March 15, 2024",
      total: "KSh 450",
      status: "Delivered",
      items: "Fresh Bananas, Fresh Milk, Fresh Tomatoes",
    },
    {
      id: "FM-2024-002",
      date: "March 10, 2024",
      total: "KSh 320",
      status: "Delivered",
      items: "Chicken Breast, Rice, Orange Juice",
    },
    {
      id: "FM-2024-003",
      date: "March 5, 2024",
      total: "KSh 780",
      status: "Delivered",
      items: "Weekly Grocery Shopping",
    },
  ];

  const handleUpdateProfile = () => {
    // TODO: Implement profile update
    console.log("Profile update:", profile);
  };

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
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">Profile Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profile.firstName}
                    onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                    data-testid="input-first-name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profile.lastName}
                    onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                    data-testid="input-last-name"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    data-testid="input-email"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    data-testid="input-phone"
                  />
                </div>
              </div>
              <Button
                className="mt-4"
                onClick={handleUpdateProfile}
                data-testid="button-update-profile"
              >
                Update Profile
              </Button>
            </CardContent>
          </Card>

          {/* Order History */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">Order History</h3>
              <div className="space-y-4">
                {orderHistory.map((order) => (
                  <div key={order.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold" data-testid={`text-order-id-${order.id}`}>
                          #{order.id}
                        </h4>
                        <p className="text-sm text-gray-600" data-testid={`text-order-date-${order.id}`}>
                          {order.date}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold" data-testid={`text-order-total-${order.id}`}>
                          {order.total}
                        </p>
                        <span 
                          className="px-2 py-1 bg-success/10 text-success rounded-full text-xs font-medium"
                          data-testid={`text-order-status-${order.id}`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600" data-testid={`text-order-items-${order.id}`}>
                      {order.items}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      data-testid={`button-reorder-${order.id}`}
                    >
                      Reorder Items
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Menu */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">Account Menu</h3>
              <div className="space-y-3">
                <button 
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-3"
                  data-testid="button-delivery-addresses"
                >
                  <MapPin className="h-5 w-5 text-gray-600" />
                  <span>Delivery Addresses</span>
                </button>
                <button 
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-3"
                  data-testid="button-payment-methods"
                >
                  <CreditCard className="h-5 w-5 text-gray-600" />
                  <span>Payment Methods</span>
                </button>
                <button 
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-3"
                  data-testid="button-notifications"
                >
                  <Bell className="h-5 w-5 text-gray-600" />
                  <span>Notifications</span>
                </button>
                <button 
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-3"
                  data-testid="button-help-support"
                >
                  <HelpCircle className="h-5 w-5 text-gray-600" />
                  <span>Help & Support</span>
                </button>
                <button 
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-3 text-red-600"
                  data-testid="button-sign-out"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
