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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <Link href="/">
          <Button variant="outline" data-testid="button-continue-shopping">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continue Shopping
          </Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {state.items.map((item) => (
            <Card key={item.id} className="p-4" data-testid={`card-cart-item-${item.id}`}>
              <div className="flex items-center space-x-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg"
                  data-testid={`img-cart-item-${item.id}`}
                />
                <div className="flex-1">
                  <h3 className="font-semibold" data-testid={`text-cart-item-name-${item.id}`}>
                    {item.name}
                  </h3>
                  <p className="text-gray-600 text-sm" data-testid={`text-cart-item-size-${item.id}`}>
                    {item.size}
                  </p>
                  <p className="text-primary font-bold" data-testid={`text-cart-item-price-${item.id}`}>
                    KSh {item.price}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    data-testid={`button-decrease-quantity-${item.id}`}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center" data-testid={`text-cart-item-quantity-${item.id}`}>
                    {item.quantity}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    data-testid={`button-increase-quantity-${item.id}`}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 hover:text-red-700"
                  data-testid={`button-remove-item-${item.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <Card className="p-6 h-fit">
          <h3 className="text-xl font-bold mb-4">Order Summary</h3>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span data-testid="text-subtotal">KSh {state.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span data-testid="text-delivery-fee">KSh {state.deliveryFee.toFixed(2)}</span>
            </div>
            {state.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span data-testid="text-discount">-KSh {state.discount.toFixed(2)}</span>
              </div>
            )}
            <hr className="border-border" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span data-testid="text-total">KSh {state.total.toFixed(2)}</span>
            </div>
          </div>

          <Link href="/checkout">
            <Button className="w-full mb-4" data-testid="button-proceed-to-checkout">
              Proceed to Checkout
            </Button>
          </Link>

          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <ShieldCheck className="h-4 w-4 text-success" />
              <span>Secure checkout</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
