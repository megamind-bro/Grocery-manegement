// @ts-nocheck
import { useEffect, useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, TrendingUp, ShoppingBag, Calculator, Users, Trash2, Edit, RefreshCw, Send } from "lucide-react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  activeCustomers: number;
  topProducts: Array<{
    id: string;
    name: string;
    image: string;
    sales: number;
    revenue: number;
  }>;
  recentOrders: Array<{
    id: string;
    customerName: string;
    total: string;
    paymentStatus: string;
    orderStatus: string;
    createdAt: string;
  }>;
}

type ProductFormState = {
  name: string;
  description: string;
  price: string;
  image: string;
  category: string;
  size: string;
  stockQuantity: string;
  deliveryPrice: string;
  discount: string;
};

type NotificationFormState = {
  title: string;
  message: string;
  type: string;
  userId: string;
};

export default function Dashboard() {
  const [, navigate] = useLocation();
  const [me, setMe] = useState(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedOrders, setExpandedOrders] = useState<Record<number, boolean>>({});
  const initialProductForm: ProductFormState = {
    name: "",
    description: "",
    price: "",
    image: "",
    category: "",
    size: "",
    stockQuantity: "0",
    deliveryPrice: "",
    discount: "",
  };
  const [productForm, setProductForm] = useState<ProductFormState>(initialProductForm);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [restockingProduct, setRestockingProduct] = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [notificationForm, setNotificationForm] = useState<NotificationFormState>({
    title: "",
    message: "",
    type: "info",
    userId: "",
  });
  const [productSubmitting, setProductSubmitting] = useState(false);
  const [notificationSubmitting, setNotificationSubmitting] = useState(false);
  const [loyaltyUpdating, setLoyaltyUpdating] = useState<number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const data = await res.json();
        setMe(data);
        if (!data || !data.isAdmin) {
          navigate("/");
        }
      } catch {
        navigate("/");
      }
    })();
  }, [navigate]);

  const fetchJson = async (url: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = {};
    if (options.body && !(options.body instanceof FormData)) {
      headers["Content-Type"] = headers["Content-Type"] || "application/json";
    }
    const res = await fetch(url, {
      credentials: "include",
      ...options,
      headers,
    });
    let data: any = {};
    try {
      data = await res.json();
    } catch {
      data = {};
    }
    if (!res.ok) {
      throw new Error(data?.message || "Request failed");
    }
    return data;
  };

  const productsQuery = useQuery<any[]>({
    queryKey: ["admin-products"],
    enabled: !!me?.isAdmin,
    queryFn: () => fetchJson("/api/products"),
  });

  const ordersQuery = useQuery<any[]>({
    queryKey: ["admin-orders"],
    enabled: !!me?.isAdmin,
    queryFn: () => fetchJson("/api/admin/orders"),
  });

  const usersQuery = useQuery<any[]>({
    queryKey: ["admin-users"],
    enabled: !!me?.isAdmin,
    queryFn: () => fetchJson("/api/admin/users"),
  });

  const { data: analytics, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics"],
    enabled: !!me?.isAdmin,
    retry: false,
    queryFn: async () => {
      const res = await fetch("/api/analytics", { credentials: "include" });
      if (!res.ok) {
        throw new Error("Failed to fetch analytics");
      }
      return res.json();
    },
  });

  const products = productsQuery.data || [];
  const orders = ordersQuery.data || [];
  const users = usersQuery.data || [];

  const isProductsLoading = productsQuery.isLoading || productsQuery.isFetching;
  const isOrdersLoading = ordersQuery.isLoading || ordersQuery.isFetching;
  const isUsersLoading = usersQuery.isLoading || usersQuery.isFetching;

  const handleProductInputChange = (field: keyof ProductFormState, value: string) => {
    // Prevent negative values for number fields
    if ((field === 'price' || field === 'stockQuantity' || field === 'deliveryPrice' || field === 'discount') && value !== '') {
      const numValue = parseFloat(value);
      if (numValue < 0) return; // Don't update if negative
    }
    
    // Update image preview when image URL changes
    if (field === 'image') {
      setImagePreview(value || null);
    }
    
    setProductForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetProductForm = () => {
    setProductForm(initialProductForm);
    setEditingProductId(null);
    setImagePreview(null);
  };

  // Helper function to safely convert product data to form state
  const productToFormState = (product: any): ProductFormState => ({
    name: product.name || "",
    description: product.description || "",
    price: product.price != null ? String(product.price) : "0",
    image: product.image || "",
    category: product.category || "",
    size: product.size || "",
    stockQuantity: product.stockQuantity != null ? String(product.stockQuantity) : "0",
    deliveryPrice: product.deliveryPrice != null ? String(product.deliveryPrice) : "0",
    discount: product.discount != null ? String(product.discount) : "0"
  });

  const handleEditProduct = (product: any) => {
    setEditingProductId(product.id);
    setProductForm(productToFormState(product));
    setImagePreview(product.image || null);
    
    // Scroll to form after a small delay to allow state to update
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleProductSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProductSubmitting(true);
    try {
      const payload = {
        name: productForm.name.trim(),
        description: productForm.description.trim(),
        price: parseFloat(productForm.price) || 0,
        image: productForm.image.trim(),
        category: productForm.category.trim(),
        size: productForm.size.trim(),
        stockQuantity: parseInt(productForm.stockQuantity, 10) || 0,
        deliveryPrice: parseFloat(productForm.deliveryPrice) || 0,
        discount: parseFloat(productForm.discount) || 0,
      };

      if (!payload.name || !payload.price || !payload.image || !payload.category) {
        throw new Error("Name, price, image, and category are required");
      }

      if (editingProductId) {
        await fetchJson(`/api/admin/products/${editingProductId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast({ title: "Product updated" });
      } else {
        await fetchJson("/api/admin/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast({ title: "Product created" });
      }
      resetProductForm();
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    } catch (err: any) {
      toast({
        title: "Product save failed",
        description: err.message || "Unable to save product",
        variant: "destructive",
      });
    } finally {
      setProductSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    const confirmDelete = window.confirm("Delete this product? This cannot be undone.");
    if (!confirmDelete) return;
    try {
      await fetchJson(`/api/admin/products/${productId}`, { method: "DELETE" });
      toast({ title: "Product deleted" });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    } catch (err: any) {
      toast({
        title: "Delete failed",
        description: err.message || "Unable to delete product",
        variant: "destructive",
      });
    }
  };

  const handleRestockProduct = async (productId: number) => {
    const value = window.prompt("Enter quantity to add", "10");
    if (!value) return;
    const quantity = Number(value);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      toast({
        title: "Invalid quantity",
        description: "Please enter a positive number",
        variant: "destructive",
      });
      return;
    }
    
    setRestockingProduct(productId);
    try {
      const response = await fetchJson(`/api/admin/products/${productId}/restock`, {
        method: "POST",
        body: JSON.stringify({ quantity }),
      });
      
      // Update the product in the cache with all fields from the response
      queryClient.setQueryData(['admin-products'], (oldData: any[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(product => 
          product.id === productId 
            ? { 
                ...product,
                ...response, // Spread all fields from the response
                // Ensure we have all required fields with defaults
                stockQuantity: response.stockQuantity || 0,
                inStock: response.inStock || false,
                deliveryPrice: response.deliveryPrice || 0,
                discount: response.discount || 0,
                price: response.price || 0,
                name: response.name || product.name,
                description: response.description || product.description,
                image: response.image || product.image,
                category: response.category || product.category,
                size: response.size || product.size
              }
            : product
        );
      });
      
      // If we're currently editing this product, update the form
      if (editingProductId === productId) {
        setProductForm(productToFormState(response));
      }
      
      toast({ 
        title: "Stock updated",
        description: `Successfully added ${quantity} items to stock. New stock level: ${response.stockQuantity}`,
        variant: "success"
      });
    } catch (err: any) {
      console.error("Restock error:", err);
      toast({
        title: "Restock failed",
        description: err.message || "Unable to restock product",
        variant: "destructive",
      });
    } finally {
      setRestockingProduct(null);
    }
  };

  const toggleOrderExpansion = (orderId: number) => {
    setExpandedOrders((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const handleToggleLoyalty = async (userId: number, current: boolean) => {
    setLoyaltyUpdating(userId);
    try {
      await fetchJson(`/api/admin/users/${userId}/loyalty`, {
        method: "PUT",
        body: JSON.stringify({ loyaltyEligible: !current }),
      });
      toast({ title: "Loyalty updated" });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (err: any) {
      toast({
        title: "Update failed",
        description: err.message || "Unable to update loyalty",
        variant: "destructive",
      });
    } finally {
      setLoyaltyUpdating(null);
    }
  };

  const handleSetPoints = async (userId: number, currentPoints: number) => {
    const value = window.prompt("Enter loyalty points", String(currentPoints ?? 0));
    if (value === null) return;
    const points = Number(value);
    if (!Number.isFinite(points) || points < 0) {
      toast({
        title: "Invalid points",
        description: "Enter a non-negative number",
        variant: "destructive",
      });
      return;
    }
    setLoyaltyUpdating(userId);
    try {
      await fetchJson(`/api/admin/users/${userId}/loyalty`, {
        method: "PUT",
        body: JSON.stringify({ loyaltyPoints: points }),
      });
      toast({ title: "Points updated" });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (err: any) {
      toast({
        title: "Update failed",
        description: err.message || "Unable to update points",
        variant: "destructive",
      });
    } finally {
      setLoyaltyUpdating(null);
    }
  };

  const handleViewUserOrders = async (userId: number) => {
    if (selectedUserId === userId) {
      setSelectedUserId(null);
      setUserOrders([]);
      return;
    }
    
    try {
      const orders = await fetchJson(`/api/admin/users/${userId}/orders`);
      setSelectedUserId(userId);
      setUserOrders(orders);
    } catch (err: any) {
      toast({
        title: "Failed to load orders",
        description: err.message || "Unable to fetch user orders",
        variant: "destructive",
      });
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, field: "orderStatus" | "paymentStatus", value: string) => {
    setUpdatingOrderId(orderId);
    try {
      const payload = { [field]: value };
      await fetchJson(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      toast({ title: "Order updated" });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    } catch (err: any) {
      toast({
        title: "Update failed",
        description: err.message || "Unable to update order",
        variant: "destructive",
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleSendNotification = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotificationSubmitting(true);
    try {
      const payload: any = {
        title: notificationForm.title.trim(),
        message: notificationForm.message.trim(),
        type: notificationForm.type,
      };
      if (notificationForm.userId) {
        payload.userId = Number(notificationForm.userId);
      }
      if (!payload.title || !payload.message) {
        throw new Error("Title and message are required");
      }
      await fetchJson("/api/notifications/admin/send", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      toast({ title: "Notification sent" });
      setNotificationForm({ title: "", message: "", type: "info", userId: "" });
    } catch (err: any) {
      toast({
        title: "Failed to send notification",
        description: err.message || "Unable to send notification",
        variant: "destructive",
      });
    } finally {
      setNotificationSubmitting(false);
    }
  };

  if (!me) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Checking access...</span>
      </div>
    );
  }

  if (!me.isAdmin) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg mb-4">Access Denied</p>
        <p className="text-gray-400 mb-4">Only administrators can access the dashboard.</p>
        <Link href="/">
          <Button>Go to Home</Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg mb-4">Failed to load analytics</p>
        <p className="text-gray-400 mb-4">You may not have permission to access this page.</p>
        <Link href="/">
          <Button>Go to Home</Button>
        </Link>
      </div>
    );
  }

  const getStatusColor = (status?: string | null) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    const statusLower = status.toLowerCase();
    
    switch (statusLower) {
      case 'completed':
      case 'delivered':
        return 'bg-success/10 text-success';
      case 'processing':
        return 'bg-accent/10 text-accent';
      case 'shipped':
        return 'bg-secondary/10 text-secondary';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Manager Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor your store performance and analytics</p>
        </div>
        <Link href="/">
          <Button variant="outline" data-testid="button-back-to-store">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Store
          </Button>
        </Link>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-primary" data-testid="text-total-revenue">
                  KSh {analytics.totalRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-success">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  12.5% from last month
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-total-orders">
                  {analytics.totalOrders.toLocaleString()}
                </p>
                <p className="text-sm text-success">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  8.3% from last month
                </p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Order Value</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-avg-order-value">
                  KSh {analytics.avgOrderValue.toFixed(2)}
                </p>
                <p className="text-sm text-success">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  3.7% from last month
                </p>
              </div>
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                <Calculator className="h-6 w-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Customers</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-active-customers">
                  {analytics.activeCustomers}
                </p>
                <p className="text-sm text-success">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  15.2% from last month
                </p>
              </div>
              <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Sales Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between space-x-2">
              {/* Simple bar chart visualization */}
              {[120, 140, 100, 180, 160, 200].map((height, index) => (
                <div key={index} className="flex flex-col items-center space-y-2">
                  <div 
                    className="w-8 bg-primary rounded-t"
                    style={{ height: `${height}px` }}
                  ></div>
                  <span className="text-xs text-gray-600">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][index]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center space-x-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded-lg"
                    data-testid={`img-top-product-${product.id}`}
                  />
                  <div className="flex-1">
                    <h4 className="font-medium" data-testid={`text-top-product-name-${product.id}`}>
                      {product.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Sales: <span data-testid={`text-top-product-sales-${product.id}`}>{product.sales} units</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary" data-testid={`text-top-product-revenue-${product.id}`}>
                      KSh {product.revenue.toLocaleString()}
                    </p>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${Math.max(20, (index + 1) * 15)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
    <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4">Order ID</th>
                  <th className="text-left py-3 px-4">Customer</th>
                  <th className="text-left py-3 px-4">Total</th>
                  <th className="text-left py-3 px-4">Payment Status</th>
                  <th className="text-left py-3 px-4">Order Status</th>
                  <th className="text-left py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border">
                    <td className="py-3 px-4 font-mono text-sm" data-testid={`text-order-id-${order.id}`}>
                      #{String(order.id).slice(0, 8)}
                    </td>
                    <td className="py-3 px-4" data-testid={`text-order-customer-${order.id}`}>
                      {order.customerName}
                    </td>
                    <td className="py-3 px-4 font-semibold" data-testid={`text-order-total-${order.id}`}>
                      KSh {parseFloat(order.total).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span 
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.paymentStatus)}`}
                        data-testid={`text-order-payment-status-${order.id}`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span 
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}
                        data-testid={`text-order-status-${order.id}`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600" data-testid={`text-order-date-${order.id}`}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-10 mt-12">
        <section id="inventory">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{editingProductId ? "Edit Product" : "Add New Product"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form ref={formRef} className="space-y-4" onSubmit={handleProductSubmit}>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="product-name">Name</Label>
                      <Input
                        id="product-name"
                        value={productForm.name}
                        onChange={(e) => handleProductInputChange("name", e.target.value)}
                        placeholder="Product name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="product-category">Category</Label>
                      <Input
                        id="product-category"
                        value={productForm.category}
                        onChange={(e) => handleProductInputChange("category", e.target.value)}
                        placeholder="Category"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="product-price">Price (KES)</Label>
                      <Input
                        id="product-price"
                        type="number"
                        step="0.01"
                        value={productForm.price}
                        onChange={(e) => handleProductInputChange("price", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="product-stock">Stock Quantity</Label>
                      <Input
                        id="product-stock"
                        type="number"
                        min="0"
                        value={productForm.stockQuantity}
                        onChange={(e) => handleProductInputChange("stockQuantity", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="product-delivery">Delivery Price (optional)</Label>
                      <Input
                        id="product-delivery"
                        type="number"
                        step="0.01"
                        value={productForm.deliveryPrice}
                        onChange={(e) => handleProductInputChange("deliveryPrice", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="product-discount">Discount (optional)</Label>
                      <Input
                        id="product-discount"
                        type="number"
                        step="0.01"
                        value={productForm.discount}
                        onChange={(e) => handleProductInputChange("discount", e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="product-image">Image URL</Label>
                    <Input
                      id="product-image"
                      value={productForm.image}
                      onChange={(e) => handleProductInputChange("image", e.target.value)}
                      placeholder="https://..."
                      required
                    />
                    {imagePreview && (
                      <div className="mt-2">
                        <div className="text-sm text-gray-500 mb-1">Preview:</div>
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="h-32 w-32 object-cover rounded-md border"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="product-size">Size / Variant</Label>
                    <Input
                      id="product-size"
                      value={productForm.size}
                      onChange={(e) => handleProductInputChange("size", e.target.value)}
                      placeholder="e.g. 1kg, Pack of 6"
                    />
                  </div>
                  <div>
                    <Label htmlFor="product-description">Description</Label>
                    <Textarea
                      id="product-description"
                      rows={3}
                      value={productForm.description}
                      onChange={(e) => handleProductInputChange("description", e.target.value)}
                      placeholder="Describe the product"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Button type="submit" disabled={productSubmitting}>
                      {productSubmitting
                        ? "Saving..."
                        : editingProductId
                          ? "Update Product"
                          : "Add Product"}
                    </Button>
                    {editingProductId && (
                      <Button type="button" variant="outline" onClick={resetProductForm}>
                        Cancel Edit
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Products</CardTitle>
              </CardHeader>
              <CardContent>
                {isProductsLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Loading products...
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-left">
                          <th className="py-2 px-3">Name</th>
                          <th className="py-2 px-3">Stock</th>
                          <th className="py-2 px-3">Price</th>
                          <th className="py-2 px-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product: any) => (
                          <tr key={product.id} className="border-b border-border">
                            <td className="py-2 px-3">
                              <div className="font-medium">{product.name}</div>
                              <div className="text-xs text-gray-500">{product.category}</div>
                            </td>
                            <td className="py-2 px-3">
                              {product.inStock && product.stockQuantity > 0 ? (
                                <span className="text-green-600 font-medium">
                                  {product.stockQuantity} available
                                </span>
                              ) : (
                                <span className="text-red-600 font-medium">Out of stock</span>
                              )}
                            </td>
                            <td className="py-2 px-3">KSh {product.price}</td>
                            <td className="py-2 px-3">
                              <div className="flex flex-wrap gap-2">
                                <Button size="xs" variant="outline" onClick={() => handleEditProduct(product)}>
                                  <Edit className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                                <Button 
                                  size="xs" 
                                  variant="secondary" 
                                  onClick={() => handleRestockProduct(product.id)}
                                  disabled={restockingProduct === product.id}
                                >
                                  {restockingProduct === product.id ? (
                                    <>
                                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                      Updating...
                                    </>
                                  ) : (
                                    <>
                                      <RefreshCw className="h-3 w-3 mr-1" />
                                      Restock
                                    </>
                                  )}
                                </Button>
                                <Button size="xs" variant="destructive" onClick={() => handleDeleteProduct(product.id)}>
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {products.length === 0 && (
                          <tr>
                            <td colSpan={4} className="py-4 text-center text-gray-500">
                              No products found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="orders">
          <Card>
            <CardHeader>
              <CardTitle>Orders Management</CardTitle>
            </CardHeader>
            <CardContent>
              {isOrdersLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  Loading orders...
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order: any) => (
                    <div key={order.id} className="border border-border rounded-lg p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div className="flex-1">
                          <div className="font-semibold">Order #{order.id}</div>
                          <div className="text-sm text-gray-500 space-y-1">
                            <div>
                              <span className="font-medium">Customer:</span> {order.customerName}
                              {order.user && (
                                <span className="text-xs text-gray-400 ml-2">
                                  (User: {order.user.username})
                                </span>
                              )}
                            </div>
                            <div>
                              <span className="font-medium">Phone:</span> {order.customerPhone}
                            </div>
                            <div>
                              <span className="font-medium">Email:</span> {order.customerEmail || "N/A"}
                            </div>
                            <div>
                              <span className="font-medium">Address:</span> {order.deliveryAddress}
                            </div>
                            <div>
                              <span className="font-medium">Payment Method:</span> {order.paymentMethod}
                            </div>
                            <div>
                              <span className="font-medium">Date:</span> {new Date(order.createdAt).toLocaleString()}
                            </div>
                            {order.user && (
                              <div className="text-xs text-blue-600 mt-2">
                                <span className="font-medium">User ID:</span> {order.user.id} • 
                                <span className="font-medium ml-2">Loyalty Points:</span> {order.user.loyaltyPoints || 0}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 items-center">
                          <span className="text-sm font-medium">
                            Total: KSh {Number(order.total).toFixed(2)}
                          </span>
                          <select
                            className="text-xs px-2 py-1 rounded-full border border-border bg-white"
                            value={order.paymentStatus}
                            onChange={(e) => handleUpdateOrderStatus(order.id, "paymentStatus", e.target.value)}
                            disabled={updatingOrderId === order.id}
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="failed">Failed</option>
                          </select>
                          <select
                            className="text-xs px-2 py-1 rounded-full border border-border bg-white"
                            value={order.orderStatus}
                            onChange={(e) => handleUpdateOrderStatus(order.id, "orderStatus", e.target.value)}
                            disabled={updatingOrderId === order.id}
                          >
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <Button size="sm" variant="outline" onClick={() => toggleOrderExpansion(order.id)}>
                            {expandedOrders[order.id] ? "Hide Items" : "View Items"}
                          </Button>
                        </div>
                      </div>
                      {expandedOrders[order.id] && (
                        <div className="mt-4 bg-muted/30 rounded-lg p-4 space-y-3">
                          <div className="border-b border-border pb-3">
                            <h4 className="font-semibold text-sm mb-2">Order Items</h4>
                            {order.items?.map((item: any) => (
                              <div key={`${order.id}-${item.id}`} className="flex items-center justify-between text-sm py-1">
                                <div className="flex-1">
                                  <span className="font-medium">{item.name}</span>
                                  {item.size && <span className="text-xs text-gray-500 ml-2">({item.size})</span>}
                                </div>
                                <div className="text-right">
                                  <div>Qty: {item.quantity}</div>
                                  <div>Price: KSh {Number(item.price).toFixed(2)}</div>
                                  {item.discount > 0 && (
                                    <div className="text-xs text-green-600">Discount: -KSh {Number(item.discount).toFixed(2)}</div>
                                  )}
                                </div>
                              </div>
                            ))}
                            {(!order.items || order.items.length === 0) && (
                              <div className="text-sm text-gray-500">No items recorded</div>
                            )}
                          </div>
                          
                          <div className="border-t border-border pt-3">
                            <h4 className="font-semibold text-sm mb-2">Order Summary</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span>KSh {Number(order.subtotal).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Delivery Fee:</span>
                                <span>KSh {Number(order.deliveryFee).toFixed(2)}</span>
                              </div>
                              {Number(order.discount) > 0 && (
                                <div className="flex justify-between text-green-600">
                                  <span>Discount:</span>
                                  <span>-KSh {Number(order.discount).toFixed(2)}</span>
                                </div>
                              )}
                              <div className="flex justify-between font-semibold border-t border-border pt-1 mt-1">
                                <span>Total:</span>
                                <span>KSh {Number(order.total).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {orders.length === 0 && (
                    <div className="text-center text-gray-500 py-6">No orders yet.</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section id="users">
          <Card>
            <CardHeader>
              <CardTitle>Users & Loyalty</CardTitle>
            </CardHeader>
            <CardContent>
              {isUsersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  Loading users...
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left">
                        <th className="py-2 px-3">User</th>
                        <th className="py-2 px-3">Loyalty</th>
                        <th className="py-2 px-3">Total Spent</th>
                        <th className="py-2 px-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user: any) => (
                        <tr key={user.id} className="border-b border-border">
                          <td className="py-2 px-3">
                            <div className="font-medium">{user.name || user.username}</div>
                            <div className="text-xs text-gray-500">{user.email || "No email"}</div>
                          </td>
                          <td className="py-2 px-3">
                            <div className="font-semibold">{user.loyaltyPoints ?? 0} pts</div>
                            <div className="text-xs text-gray-500">
                              Eligible: {user.loyaltyEligible ? "Yes" : "No"}
                            </div>
                          </td>
                          <td className="py-2 px-3">KSh {Number(user.totalSpent || 0).toFixed(2)}</td>
                          <td className="py-2 px-3">
                            <div className="flex flex-wrap gap-2">
                              <Button
                                size="xs"
                                variant={user.loyaltyEligible ? "secondary" : "outline"}
                                onClick={() => handleToggleLoyalty(user.id, user.loyaltyEligible)}
                                disabled={loyaltyUpdating === user.id}
                              >
                                {user.loyaltyEligible ? "Disable" : "Enable"}
                              </Button>
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() => handleSetPoints(user.id, user.loyaltyPoints ?? 0)}
                                disabled={loyaltyUpdating === user.id}
                              >
                                Set Points
                              </Button>
                              <Button
                                size="xs"
                                variant={selectedUserId === user.id ? "secondary" : "outline"}
                                onClick={() => handleViewUserOrders(user.id)}
                              >
                                {selectedUserId === user.id ? "Hide Orders" : "View Orders"}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-gray-500">
                            No users found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {selectedUserId && userOrders.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Orders for Selected User</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userOrders.map((order: any) => (
                    <div key={order.id} className="border border-border rounded-lg p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                          <div className="font-semibold">Order #{order.id}</div>
                          <div className="text-sm text-gray-500">
                            {order.customerName} • {new Date(order.createdAt).toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.deliveryAddress}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 items-center">
                          <span className="text-sm font-medium">
                            Total: KSh {Number(order.total).toFixed(2)}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.paymentStatus)}`}>
                            {order.paymentStatus}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.orderStatus)}`}>
                            {order.orderStatus}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 bg-muted/30 rounded-lg p-3 space-y-2">
                        {order.items?.map((item: any) => (
                          <div key={`${order.id}-${item.id}`} className="flex items-center justify-between text-sm">
                            <span>{item.name}</span>
                            <span>
                              Qty: {item.quantity} • KSh {Number(item.price).toFixed(2)}
                            </span>
                          </div>
                        ))}
                        {(!order.items || order.items.length === 0) && (
                          <div className="text-sm text-gray-500">No items recorded</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </section>

        <section id="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Send Notification</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSendNotification}>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="notification-title">Title</Label>
                    <Input
                      id="notification-title"
                      value={notificationForm.title}
                      onChange={(e) => setNotificationForm((prev) => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="notification-type">Type</Label>
                    <select
                      id="notification-type"
                      className="w-full border border-border rounded-md px-3 py-2 text-sm"
                      value={notificationForm.type}
                      onChange={(e) => setNotificationForm((prev) => ({ ...prev, type: e.target.value }))}
                    >
                      <option value="info">Info</option>
                      <option value="success">Success</option>
                      <option value="warning">Warning</option>
                      <option value="error">Error</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="notification-user">Target User (optional)</Label>
                  <select
                    id="notification-user"
                    className="w-full border border-border rounded-md px-3 py-2 text-sm"
                    value={notificationForm.userId}
                    onChange={(e) => setNotificationForm((prev) => ({ ...prev, userId: e.target.value }))}
                  >
                    <option value="">All users</option>
                    {users.map((user: any) => (
                      <option key={user.id} value={user.id}>
                        {user.name || user.username} ({user.email || "no email"})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="notification-message">Message</Label>
                  <Textarea
                    id="notification-message"
                    rows={4}
                    value={notificationForm.message}
                    onChange={(e) => setNotificationForm((prev) => ({ ...prev, message: e.target.value }))}
                    required
                  />
                </div>
                <Button type="submit" disabled={notificationSubmitting}>
                  {notificationSubmitting ? "Sending..." : (
                    <span className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Send Notification
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
