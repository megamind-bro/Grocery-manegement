import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, ShoppingBag, Calculator, Users } from "lucide-react";
import { Loader2 } from "lucide-react";

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

export default function Dashboard() {
  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics"],
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">Failed to load analytics</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'bg-success/10 text-success';
      case 'processing':
        return 'bg-accent/10 text-accent';
      case 'shipped':
        return 'bg-secondary/10 text-secondary';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
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
                      #{order.id.slice(0, 8)}
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
    </div>
  );
}
