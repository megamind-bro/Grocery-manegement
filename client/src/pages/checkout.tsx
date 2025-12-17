import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Lock, ShieldCheck, CreditCard, Smartphone, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const checkoutSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
  address: z.string().min(10, "Please enter your full delivery address"),
  paymentMethod: z.enum(["mpesa", "cod"]),
  useLoyaltyPoints: z.boolean().optional(),
  loyaltyPointsAmount: z.number().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const { state, clearCart } = useCart();
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [me, setMe] = useState<any>(null);
  const [pointsFromCart, setPointsFromCart] = useState(0);

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      address: "",
      paymentMethod: "mpesa",
      useLoyaltyPoints: false,
      loyaltyPointsAmount: 0,
    },
  });

  useEffect(() => {
    // Extract points from URL query parameter
    const params = new URLSearchParams(location.split('?')[1]);
    const pointsParam = parseInt(params.get('points') || '0', 10);
    setPointsFromCart(pointsParam);
  }, [location]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const data = await res.json();
        setMe(data);
        
        // Redirect admins to dashboard
        if (data?.isAdmin) {
          navigate("/dashboard");
          return;
        }
        
        // Pre-fill form with user data if available
        if (data) {
          const nameParts = (data.name || "").split(" ");
          form.reset({
            firstName: nameParts[0] || "",
            lastName: nameParts.slice(1).join(" ") || "",
            phone: "",
            email: data.email || "",
            address: "",
            paymentMethod: "mpesa",
            useLoyaltyPoints: pointsFromCart > 0,
            loyaltyPointsAmount: pointsFromCart,
          });
        }
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, pointsFromCart]);

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
    },
    onSuccess: (order) => {
      toast({
        title: "Order placed successfully!",
        description: `Your order #${order.id} has been placed. ${
          order.paymentMethod === 'mpesa' 
            ? 'Please check your phone for the M-Pesa prompt.' 
            : 'You will receive a confirmation email shortly.'
        }`,
      });
      clearCart();
      // Redirect to account page to view order
      setTimeout(() => {
        navigate("/account");
      }, 2000);
    },
    onError: (error) => {
      toast({
        title: "Order failed",
        description: "There was an error placing your order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: CheckoutForm) => {
    if (me?.isAdmin) {
      toast({
        title: "Admins cannot place orders",
        description: "Please log out or use a customer account.",
        variant: "destructive",
      });
      return;
    }
    if (state.items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checkout.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const orderData = {
        customerName: `${data.firstName} ${data.lastName}`.trim(),
        customerPhone: data.phone,
        customerEmail: data.email || me?.email || null,
        deliveryAddress: data.address,
        items: state.items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          discount: item.discount || 0,
          deliveryPrice: item.deliveryPrice || 0,
          total: item.price * item.quantity
        })),
        subtotal: state.subtotal.toString(),
        deliveryFee: state.deliveryFee.toString(),
        discount: state.discount.toString(),
        total: (state.total - (data.loyaltyPointsAmount || 0)).toString(),
        paymentMethod: data.paymentMethod,
        useLoyaltyPoints: data.useLoyaltyPoints || false,
        loyaltyPointsAmount: data.loyaltyPointsAmount || 0,
      };

      await createOrderMutation.mutateAsync(orderData);
    } catch (error) {
      console.error("Order creation failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Check if user is logged in
  useEffect(() => {
    if (me === null) {
      // Still loading
      return;
    }
    if (!me) {
      // Not logged in, redirect to login
      navigate("/login");
    }
  }, [me, navigate]);

  if (!me) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <div className="text-gray-500">Redirecting to login...</div>
        </div>
      </div>
    );
  }

  if (state.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold mb-4">No items in cart</h2>
          <p className="text-gray-600 mb-8">Add some items to your cart before checkout.</p>
          <Link href="/">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Checkout</h1>
        <Link href="/cart">
          <Button variant="outline" data-testid="button-back-to-cart">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cart
          </Button>
        </Link>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Checkout Form */}
            <div className="space-y-6">
              {/* Delivery Information */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Delivery Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} data-testid="input-first-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} data-testid="input-last-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="254 712 345 678" {...field} data-testid="input-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="john@example.com" {...field} data-testid="input-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Delivery Address</FormLabel>
                            <FormControl>
                              <Textarea 
                                rows={3}
                                placeholder="Enter your full delivery address"
                                {...field}
                                data-testid="textarea-address"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Payment Method</h3>
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="space-y-3"
                          >
                            <div className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                              <RadioGroupItem value="mpesa" id="mpesa" />
                              <label htmlFor="mpesa" className="flex items-center space-x-3 cursor-pointer flex-1">
                                <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                                  <Smartphone className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                  <div className="font-medium">M-Pesa</div>
                                  <div className="text-sm text-gray-600">Pay with your M-Pesa account</div>
                                </div>
                              </label>
                            </div>

                            <div className="flex items-center space-x-3 p-3 border border-border rounded-lg opacity-50 cursor-not-allowed">
                              <RadioGroupItem value="card" id="card" disabled />
                              <label htmlFor="card" className="flex items-center space-x-3 flex-1">
                                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                                  <CreditCard className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <div className="font-medium">Credit/Debit Card</div>
                                  <div className="text-sm text-gray-600">Coming soon</div>
                                </div>
                              </label>
                            </div>

                            <div className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                              <RadioGroupItem value="cod" id="cod" />
                              <label htmlFor="cod" className="flex items-center space-x-3 cursor-pointer flex-1">
                                <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center">
                                  <DollarSign className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                  <div className="font-medium">Cash on Delivery</div>
                                  <div className="text-sm text-gray-600">Pay when you receive your order</div>
                                </div>
                              </label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Loyalty Points */}
              {me?.loyaltyPoints > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Loyalty Points</h3>
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="text-sm text-gray-600">Available Points</div>
                        <div className="text-2xl font-bold text-blue-600">{me.loyaltyPoints}</div>
                      </div>
                      <FormField
                        control={form.control}
                        name="useLoyaltyPoints"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="w-4 h-4 rounded"
                              />
                            </FormControl>
                            <label className="text-sm font-medium cursor-pointer">
                              Use loyalty points for this order
                            </label>
                          </FormItem>
                        )}
                      />
                      {form.watch("useLoyaltyPoints") && (
                        <FormField
                          control={form.control}
                          name="loyaltyPointsAmount"
                          render={({ field }) => (
                            <FormItem>
                              <label className="text-sm font-medium">Points to use (100 points = KSh 10)</label>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  max={Math.min(me.loyaltyPoints, Math.floor(state.total * 10))}
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              {/* Order Items */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
                  <div className="space-y-4">
                    {state.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded"
                          data-testid={`img-order-item-${item.id}`}
                        />
                        <div className="flex-1">
                          <div className="font-medium" data-testid={`text-order-item-name-${item.id}`}>
                            {item.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            Qty: <span data-testid={`text-order-item-quantity-${item.id}`}>{item.quantity}</span>
                          </div>
                        </div>
                        <div className="text-primary font-semibold" data-testid={`text-order-item-total-${item.id}`}>
                          KSh {(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <hr className="my-4 border-border" />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span data-testid="text-order-subtotal">KSh {state.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span data-testid="text-order-delivery-fee">KSh {state.deliveryFee.toFixed(2)}</span>
                    </div>
                    {state.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Product Discount</span>
                        <span data-testid="text-order-discount">-KSh {state.discount.toFixed(2)}</span>
                      </div>
                    )}
                    {form.watch("useLoyaltyPoints") && (form.watch("loyaltyPointsAmount") || 0)> 0 && (
                      <div className="flex justify-between text-blue-600">
                        <span>Loyalty Points</span>
                        <span>-KSh {((form.watch("loyaltyPointsAmount") || 0) * 0.1).toFixed(2)}</span>
                      </div>
                    )}
                    <hr className="border-border" />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span data-testid="text-order-total">
                        KSh {(state.total - ((form.watch("loyaltyPointsAmount") || 0) * 0.1)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Place Order */}
              <Button
                type="submit"
                className="w-full py-4 text-lg font-semibold"
                disabled={isProcessing || createOrderMutation.isPending}
                data-testid="button-place-order"
              >
                {isProcessing || createOrderMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Place Order - KSh {(state.total - ((form.watch("loyaltyPointsAmount") || 0) * 0.1)).toFixed(2)}
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-gray-600">
                <ShieldCheck className="inline h-4 w-4 text-success mr-1" />
                Your payment information is secure and encrypted
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
