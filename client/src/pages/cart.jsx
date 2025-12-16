import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Minus, Plus, Trash2, ShieldCheck, Gift } from "lucide-react";

export default function Cart() {
  const { state, updateQuantity, removeFromCart } = useCart();
  const [, navigate] = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [usePoints, setUsePoints] = useState(false);
  const [pointsToUse, setPointsToUse] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setIsLoggedIn(!!data);
          setIsAdmin(data?.isAdmin || false);
          setUserData(data);
          
          // Redirect admins to dashboard
          if (data?.isAdmin) {
            navigate("/dashboard");
            return;
          }
          
          if (!data) {
            navigate("/login");
          }
        } else {
          setIsLoggedIn(false);
          navigate("/login");
        }
      } catch {
        setIsLoggedIn(false);
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [navigate]);

  // Calculate points value in KSh (100 points = 10 KSh)
  const pointsValueInKsh = (userData?.loyaltyPoints || 0) * 0.1;
  
  // Calculate maximum points that can be used (cannot exceed cart total)
  const maxPointsToUse = Math.min(userData?.loyaltyPoints || 0, Math.floor(state.total * 10));
  const maxPointsValueInKsh = maxPointsToUse * 0.1;

  // Handle points usage toggle
  const handleUsePoints = (checked) => {
    setUsePoints(checked);
    if (checked) {
      setPointsToUse(maxPointsToUse);
    } else {
      setPointsToUse(0);
    }
  };

  // Handle manual points adjustment
  const handlePointsChange = (value) => {
    const numValue = Math.min(parseInt(value) || 0, maxPointsToUse);
    setPointsToUse(Math.max(0, numValue));
  };

  // Calculate final total after points deduction
  const pointsDeduction = pointsToUse * 0.1;
  const finalTotal = Math.max(0, state.total - pointsDeduction);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null; // Will redirect to login
  }

  if (state.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <div className="mb-4">
            <i className="fas fa-shopping-cart text-6xl text-gray-300"></i>
          </div>
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Add some fresh groceries to get started!</p>
          <Link href="/">
            <Button data-testid="button-continue-shopping">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
        </div>
        <div className="text-sm text-gray-600">
          {state.itemCount} {state.itemCount === 1 ? 'item' : 'items'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {state.items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-gray-600 text-sm">{item.size}</p>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-green-600">
                          KSh {item.price.toFixed(2)}
                        </p>
                        {item.discount > 0 && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                            -KSh {item.discount.toFixed(2)} off
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-lg">
                        KSh {(item.price * item.quantity).toFixed(2)}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal ({state.itemCount} items)</span>
                  <span>KSh {state.subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>KSh {state.deliveryFee.toFixed(2)}</span>
                </div>
                
                {state.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-KSh {state.discount.toFixed(2)}</span>
                  </div>
                )}
                
                <hr className="my-3" />
                
                <div className="flex justify-between font-semibold text-lg">
                  <span>Subtotal</span>
                  <span>KSh {state.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Loyalty Points Section */}
              {userData && (userData.loyaltyPoints || 0) > 0 && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Gift className="h-4 w-4 text-blue-600" />
                      <span className="font-semibold text-blue-900">Loyalty Points</span>
                    </div>
                    <span className="text-sm font-medium text-blue-600">
                      {userData.loyaltyPoints} points
                    </span>
                  </div>
                  
                  <div className="text-xs text-blue-700 mb-3">
                    <div>Available: {userData.loyaltyPoints} points = KSh {pointsValueInKsh.toFixed(2)}</div>
                    <div className="mt-1">Max usable: {maxPointsToUse} points = KSh {maxPointsValueInKsh.toFixed(2)}</div>
                  </div>

                  {maxPointsToUse > 0 && (
                    <>
                      <label className="flex items-center space-x-2 cursor-pointer mb-3">
                        <input
                          type="checkbox"
                          checked={usePoints}
                          onChange={(e) => handleUsePoints(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                        <span className="text-sm font-medium text-blue-900">Use points for this order</span>
                      </label>

                      {usePoints && (
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-blue-900">
                            Points to use:
                          </label>
                          <input
                            type="number"
                            min="0"
                            max={maxPointsToUse}
                            value={pointsToUse}
                            onChange={(e) => handlePointsChange(e.target.value)}
                            className="w-full px-2 py-2 border border-blue-300 rounded text-sm"
                          />
                          <div className="text-xs text-blue-700">
                            Deduction: KSh {pointsDeduction.toFixed(2)}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Final Total */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Final Total</span>
                  <span className="text-green-600">KSh {finalTotal.toFixed(2)}</span>
                </div>
                {pointsDeduction > 0 && (
                  <div className="text-xs text-green-600 mt-1">
                    Saved: KSh {pointsDeduction.toFixed(2)} with points
                  </div>
                )}
              </div>
              
              <div className="mt-6">
                <Link href={`/checkout?points=${pointsToUse}`}>
                  <Button className="w-full" size="lg">
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Proceed to Checkout
                  </Button>
                </Link>
              </div>
              
              <div className="mt-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-shield-alt text-green-600"></i>
                  <span>Secure checkout</span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <i className="fas fa-truck text-green-600"></i>
                  <span>Delivery fee: KSh 50</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
