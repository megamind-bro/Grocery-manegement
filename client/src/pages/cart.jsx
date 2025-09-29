import { Link } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Minus, Plus, Trash2, ShieldCheck } from "lucide-react";

export default function Cart() {
  const { state, updateQuantity, removeFromCart } = useCart();

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
                      <p className="font-semibold text-green-600">
                        KSh {item.price.toFixed(2)}
                      </p>
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
                  <span>Total</span>
                  <span>KSh {state.total.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="mt-6">
                <Link href="/checkout">
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
                  <span>Free delivery on orders over KSh 500</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
