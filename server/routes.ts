import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema } from "@shared/schema";
import { z } from "zod";
import axios from "axios";

export async function registerRoutes(app: Express): Promise<Server> {
  // Products routes
  app.get("/api/products", async (req, res) => {
    try {
      const category = req.query.category as string;
      const search = req.query.search as string;
      
      let products = await storage.getProducts();
      
      if (category && category !== 'all') {
        products = await storage.getProductsByCategory(category);
      }
      
      if (search) {
        products = products.filter(product => 
          product.name.toLowerCase().includes(search.toLowerCase()) ||
          product.description?.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Categories routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Orders routes
  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      
      // If payment method is M-Pesa, initiate STK Push
      if (orderData.paymentMethod === 'mpesa') {
        try {
          await initiateSTKPush(order.id, orderData.customerPhone, parseFloat(orderData.total));
        } catch (mpesaError) {
          console.error("M-Pesa STK Push failed:", mpesaError);
          // Don't fail the order creation, just log the error
        }
      }
      
      res.json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid order data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create order" });
      }
    }
  });

  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // M-Pesa callback route
  app.post("/api/mpesa/callback", async (req, res) => {
    try {
      const { Body } = req.body;
      const { stkCallback } = Body;
      
      if (stkCallback.ResultCode === 0) {
        // Payment successful
        const checkoutRequestID = stkCallback.CheckoutRequestID;
        const mpesaTransactionId = stkCallback.CallbackMetadata?.Item?.find(
          (item: any) => item.Name === 'MpesaReceiptNumber'
        )?.Value;
        
        // Find order by checkout request ID (you might need to store this mapping)
        // For now, we'll update the most recent pending order
        const orders = await storage.getOrders();
        const pendingOrder = orders
          .filter(order => order.paymentStatus === 'pending' && order.paymentMethod === 'mpesa')
          .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())[0];
        
        if (pendingOrder) {
          await storage.updateOrderPaymentStatus(pendingOrder.id, 'completed', mpesaTransactionId);
        }
      }
      
      res.status(200).json({ message: "Callback received" });
    } catch (error) {
      console.error("M-Pesa callback error:", error);
      res.status(500).json({ message: "Callback processing failed" });
    }
  });

  // Analytics routes
  app.get("/api/analytics", async (req, res) => {
    try {
      const orders = await storage.getOrders();
      const products = await storage.getProducts();
      
      // Calculate metrics
      const totalRevenue = orders
        .filter(order => order.paymentStatus === 'completed')
        .reduce((sum, order) => sum + parseFloat(order.total), 0);
      
      const totalOrders = orders.length;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      // Get unique customers (by phone number)
      const uniqueCustomers = new Set(orders.map(order => order.customerPhone));
      const activeCustomers = uniqueCustomers.size;
      
      // Top products by sales
      const productSales = new Map<string, { count: number, revenue: number, product: any }>();
      
      orders.forEach(order => {
        if (order.paymentStatus === 'completed') {
          const items = JSON.parse(order.items);
          items.forEach((item: any) => {
            const current = productSales.get(item.id) || { count: 0, revenue: 0, product: null };
            current.count += item.quantity;
            current.revenue += item.quantity * parseFloat(item.price);
            current.product = item;
            productSales.set(item.id, current);
          });
        }
      });
      
      const topProducts = Array.from(productSales.entries())
        .map(([id, data]) => ({
          id,
          name: data.product.name,
          image: data.product.image,
          sales: data.count,
          revenue: data.revenue
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
      
      res.json({
        totalRevenue,
        totalOrders,
        avgOrderValue,
        activeCustomers,
        topProducts,
        recentOrders: orders
          .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
          .slice(0, 10)
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// M-Pesa STK Push implementation
async function getAccessToken(): Promise<string> {
  const consumerKey = process.env.MPESA_CONSUMER_KEY || 'your_consumer_key';
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET || 'your_consumer_secret';
  
  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  
  try {
    const response = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${credentials}`
        }
      }
    );
    
    return response.data.access_token;
  } catch (error) {
    console.error('Failed to get M-Pesa access token:', error);
    throw new Error('Failed to authenticate with M-Pesa');
  }
}

async function initiateSTKPush(orderId: string, phoneNumber: string, amount: number): Promise<void> {
  const accessToken = await getAccessToken();
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
  const shortcode = process.env.MPESA_SHORTCODE || '174379';
  const passkey = process.env.MPESA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
  
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
  
  const stkPushData = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.round(amount),
    PartyA: phoneNumber,
    PartyB: shortcode,
    PhoneNumber: phoneNumber,
    CallBackURL: `${process.env.BASE_URL || 'http://localhost:5000'}/api/mpesa/callback`,
    AccountReference: orderId,
    TransactionDesc: `Payment for order ${orderId}`
  };
  
  try {
    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      stkPushData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('STK Push initiated:', response.data);
  } catch (error) {
    console.error('STK Push failed:', error);
    throw new Error('Failed to initiate M-Pesa payment');
  }
}
